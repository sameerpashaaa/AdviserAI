import { put } from "@vercel/blob";
import { NextResponse } from "next/server";
import { getSessionFromCookiesAsync } from "@/lib/auth";
import { getDb } from "@/lib/db";
import { users } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

export async function POST(request: Request): Promise<NextResponse> {
  // ── Authentication Check ───────────────────────────────────────────────────
  const session = await getSessionFromCookiesAsync();
  if (!session) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const filename = searchParams.get("filename");

  if (!filename) {
    return NextResponse.json({ error: "Missing filename" }, { status: 400 });
  }

  // ── File Size Validation (Max 5MB) ─────────────────────────────────────────
  const contentLength = Number(request.headers.get("content-length") || "0");
  if (contentLength > 5 * 1024 * 1024) {
    return NextResponse.json({ error: "File size exceeds 5MB limit" }, { status: 400 });
  }

  // ── File Type/Extension Validation ─────────────────────────────────────────
  const contentType = request.headers.get("content-type") || "";
  const allowedMimeTypes = ["image/jpeg", "image/png", "image/webp"];
  if (!allowedMimeTypes.includes(contentType)) {
    return NextResponse.json(
      { error: "Only JPG, PNG, and WEBP image formats are supported." },
      { status: 400 }
    );
  }

  const ext = filename.split(".").pop()?.toLowerCase();
  const allowedExtensions = ["jpg", "jpeg", "png", "webp"];
  if (!ext || !allowedExtensions.includes(ext)) {
    return NextResponse.json({ error: "Invalid file extension" }, { status: 400 });
  }

  if (!request.body) {
    return NextResponse.json({ error: "Missing file body" }, { status: 400 });
  }

  try {
    // ── Upload to Vercel Blob ────────────────────────────────────────────────
    // We store it as a private/public asset. Given users need profile picture previews
    // without custom auth headers (e.g. directly in <img> tags), we make it public,
    // or use private but proxy through /api/avatar/view.
    // For standard profile pics, public access is standard and highly performant.
    const blob = await put(`avatars/${session.email}-${Date.now()}.${ext}`, request.body, {
      access: "public",
      contentType,
    });

    // ── Persist to Database ──────────────────────────────────────────────────
    const db = getDb();
    await db
      .update(users)
      .set({
        avatarUrl: blob.url,
        updatedAt: new Date(),
      })
      .where(eq(users.email, session.email));

    return NextResponse.json(blob);
  } catch (error) {
    console.error("[avatar/upload]", error);
    return NextResponse.json({ error: "Upload failed" }, { status: 500 });
  }
}