"use client";

import type { PutBlobResult } from "@vercel/blob";
import { useRef, useState } from "react";

export default function AvatarUploadPage() {
  const inputFileRef = useRef<HTMLInputElement>(null);
  const [blob, setBlob] = useState<PutBlobResult | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState("");

  return (
    <div style={{ minHeight: "100vh", padding: 32, background: "var(--bg-base)", color: "var(--text-primary)" }}>
      <div style={{ maxWidth: 720, margin: "0 auto" }}>
        <h1 style={{ fontFamily: "var(--font-display)", fontSize: "clamp(2rem, 5vw, 3.5rem)", marginBottom: 12 }}>
          Upload Your Avatar
        </h1>
        <p style={{ color: "var(--text-secondary)", marginBottom: 28, maxWidth: 560, lineHeight: 1.6 }}>
          This example sends the file through your server first, then stores it in Vercel Blob as a private asset.
        </p>

        <form
          onSubmit={async (event) => {
            event.preventDefault();
            setError("");
            setBlob(null);

            if (!inputFileRef.current?.files?.length) {
              setError("No file selected.");
              return;
            }

            const file = inputFileRef.current.files[0];
            setIsUploading(true);

            try {
              const response = await fetch(`/api/avatar/upload?filename=${encodeURIComponent(file.name)}`, {
                method: "POST",
                body: file,
              });

              if (!response.ok) {
                const payload = (await response.json().catch(() => null)) as { error?: string } | null;
                throw new Error(payload?.error ?? "Upload failed");
              }

              const newBlob = (await response.json()) as PutBlobResult;
              setBlob(newBlob);
            } catch (uploadError) {
              setError(uploadError instanceof Error ? uploadError.message : "Upload failed");
            } finally {
              setIsUploading(false);
            }
          }}
          style={{
            display: "grid",
            gap: 16,
            padding: 24,
            border: "1px solid var(--border-subtle)",
            borderRadius: 20,
            background: "var(--bg-card)",
            boxShadow: "0 20px 60px rgba(0,0,0,0.08)",
          }}
        >
          <input
            name="file"
            ref={inputFileRef}
            type="file"
            accept="image/jpeg, image/png, image/webp"
            required
            className="input"
            style={{ paddingTop: 12, paddingBottom: 12 }}
          />

          <button type="submit" className="btn btn-primary" disabled={isUploading}>
            {isUploading ? "Uploading..." : "Upload"}
          </button>
        </form>

        {error && (
          <div
            style={{
              marginTop: 16,
              padding: "12px 16px",
              borderRadius: 12,
              background: "rgba(239,68,68,0.12)",
              color: "#ef4444",
            }}
          >
            {error}
          </div>
        )}

        {blob && (
          <div
            style={{
              marginTop: 20,
              padding: 20,
              border: "1px solid var(--border-subtle)",
              borderRadius: 20,
              background: "var(--bg-card)",
              display: "grid",
              gap: 12,
            }}
          >
            <div style={{ fontWeight: 600 }}>Upload complete</div>
            <a href={`/api/avatar/view?pathname=${encodeURIComponent(blob.pathname)}`} target="_blank" rel="noreferrer" className="btn btn-ghost" style={{ width: "fit-content" }}>
              View file
            </a>
          </div>
        )}
      </div>
    </div>
  );
}