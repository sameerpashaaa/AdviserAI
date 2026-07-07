import { put } from "@vercel/blob";
import { NextResponse } from "next/server";
import { getSessionFromCookiesAsync } from "@/lib/auth";
import { getDb } from "@/lib/db";
import { knowledgeItems, workspaces } from "@/lib/db/schema";
import { eq, and, isNull } from "drizzle-orm";

export async function POST(request: Request): Promise<NextResponse> {
  // ── Authentication Check ───────────────────────────────────────────────────
  const session = await getSessionFromCookiesAsync();
  if (!session) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const filename = searchParams.get("filename");
  const workspaceId = searchParams.get("workspaceId");

  if (!filename || !workspaceId) {
    return NextResponse.json({ error: "Missing filename or workspaceId" }, { status: 400 });
  }

  const db = getDb();

  // ── Verify Workspace Ownership/Access ─────────────────────────────────────
  try {
    const userWorkspace = await db
      .select()
      .from(workspaces)
      .where(
        and(
          eq(workspaces.id, workspaceId),
          eq(workspaces.userId, session.userId),
          isNull(workspaces.deletedAt)
        )
      )
      .limit(1);

    if (!userWorkspace[0]) {
      return NextResponse.json({ error: "Workspace not found or access denied" }, { status: 404 });
    }
  } catch (err) {
    console.error("[knowledge/upload] Workspace check error:", err);
    return NextResponse.json({ error: "Failed to verify workspace access" }, { status: 500 });
  }

  // ── File Size Validation (Max 10MB) ────────────────────────────────────────
  const contentLength = Number(request.headers.get("content-length") || "0");
  if (contentLength > 10 * 1024 * 1024) {
    return NextResponse.json({ error: "File size exceeds 10MB limit" }, { status: 400 });
  }

  // ── File Type/Extension Mapping ────────────────────────────────────────────
  const contentType = request.headers.get("content-type") || "";
  const ext = filename.split(".").pop()?.toLowerCase();

  let type: "pdf" | "text" | "spreadsheet";
  const pdfExtensions = ["pdf"];
  const textExtensions = ["txt", "md", "rtf"];
  const spreadsheetExtensions = ["csv", "xlsx", "xls"];

  if (ext && pdfExtensions.includes(ext)) {
    type = "pdf";
  } else if (ext && textExtensions.includes(ext)) {
    type = "text";
  } else if (ext && spreadsheetExtensions.includes(ext)) {
    type = "spreadsheet";
  } else {
    return NextResponse.json(
      { error: "Unsupported file type. Supported formats are: PDF, TXT, MD, CSV, XLSX, XLS." },
      { status: 400 }
    );
  }

  if (!request.body) {
    return NextResponse.json({ error: "Missing file body" }, { status: 400 });
  }

  try {
    // ── Upload to Vercel Blob ────────────────────────────────────────────────
    const blob = await put(`knowledge/${session.userId}/${workspaceId}/${Date.now()}-${filename}`, request.body, {
      access: "public",
      contentType,
    });

    // ── Persist to Database ──────────────────────────────────────────────────
    const inserted = await db
      .insert(knowledgeItems)
      .values({
        workspaceId,
        userId: session.userId,
        title: filename,
        type,
        fileUrl: blob.url,
        processingStatus: "complete", // Complete immediately for the demo
        chunkCount: 1, // Mock processing chunk
        metadata: {
          size: contentLength,
          contentType,
          uploadedAt: new Date().toISOString(),
        },
      })
      .returning();

    return NextResponse.json({ success: true, knowledgeItem: inserted[0] });
  } catch (error) {
    console.error("[knowledge/upload] Error uploading:", error);
    return NextResponse.json({ error: "Upload failed" }, { status: 500 });
  }
}
