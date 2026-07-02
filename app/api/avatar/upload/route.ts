import { put } from "@vercel/blob";
import { NextResponse } from "next/server";

export async function POST(request: Request): Promise<NextResponse> {
  const { searchParams } = new URL(request.url);
  const filename = searchParams.get("filename");

  if (!filename) {
    return NextResponse.json({ error: "Missing filename" }, { status: 400 });
  }

  if (!request.body) {
    return NextResponse.json({ error: "Missing file body" }, { status: 400 });
  }

  try {
    const blob = await put(filename, request.body, {
      access: "private",
    });

    return NextResponse.json(blob);
  } catch (error) {
    console.error("[avatar/upload]", error);
    return NextResponse.json({ error: "Upload failed" }, { status: 500 });
  }
}