"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";

interface ResumeUploadProps {
  candidateId: string;
  hasExisting: boolean;
}

export function ResumeUpload({ candidateId, hasExisting }: ResumeUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  async function handleUpload(file: File) {
    setUploading(true);
    setError(null);
    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("candidateId", candidateId);

      const res = await fetch("/api/resume/parse", { method: "POST", body: formData });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Upload failed");
      }
      setDone(true);
      router.refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Upload failed");
    } finally {
      setUploading(false);
    }
  }

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) handleUpload(file);
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file && file.name.toLowerCase().endsWith(".pdf")) {
      handleUpload(file);
    } else {
      setError("Only PDF files are supported");
    }
  }

  if (done) {
    return (
      <div className="rounded-md border border-emerald-200 bg-emerald-50 p-3 dark:border-emerald-900 dark:bg-emerald-950/30">
        <div className="flex items-center gap-2">
          <svg className="h-4 w-4 text-emerald-600 dark:text-emerald-400" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <polyline points="2.5 6 5 8.5 9.5 3.5" />
          </svg>
          <span className="text-xs font-semibold text-emerald-700 dark:text-emerald-400">Resume uploaded & parsed</span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <div
        className={`relative rounded-md border-2 border-dashed p-4 text-center transition-colors ${
          uploading ? "border-blue-300 bg-blue-50/50 dark:border-blue-800 dark:bg-blue-950/20" : "border-border hover:border-foreground/30 hover:bg-muted/30"
        }`}
        onDragOver={(e) => e.preventDefault()}
        onDrop={handleDrop}
      >
        {uploading ? (
          <div className="flex items-center justify-center gap-2">
            <svg className="h-4 w-4 animate-spin text-blue-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10" strokeDasharray="60" strokeDashoffset="15" />
            </svg>
            <span className="text-xs font-medium text-blue-700 dark:text-blue-400">Parsing resume...</span>
          </div>
        ) : (
          <>
            <svg className="mx-auto h-6 w-6 text-muted-foreground" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
              <polyline points="17 8 12 3 7 8" />
              <line x1="12" y1="3" x2="12" y2="15" />
            </svg>
            <p className="mt-1.5 text-xs text-muted-foreground">
              Drop a PDF here or{" "}
              <button
                onClick={() => inputRef.current?.click()}
                className="font-medium text-foreground underline underline-offset-2"
              >
                browse
              </button>
            </p>
            <p className="mt-0.5 text-[10px] text-muted-foreground">
              {hasExisting ? "Replaces existing resume" : "PDF only"}
            </p>
          </>
        )}
        <input
          ref={inputRef}
          type="file"
          accept=".pdf"
          className="hidden"
          onChange={handleChange}
        />
      </div>
      {error && (
        <p className="text-[11px] font-medium text-red-600 dark:text-red-400">{error}</p>
      )}
    </div>
  );
}
