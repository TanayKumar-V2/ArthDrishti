"use client";

import React, { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { FileSpreadsheet, FileText, File as FileIcon, Trash2, Upload, X, AlertCircle, CheckCircle2, LoaderCircle } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { documentsApi, type UploadedDocument } from "@/lib/api";
import { toast } from "sonner";

type FileStatus = "ready" | "uploading" | "uploaded" | "error";

interface UploadItem {
  id: string;
  file: File;
  status: FileStatus;
  documentId?: string;
  error?: string;
  retryable?: boolean;
}

const MAX_FILE_SIZE = 25 * 1024 * 1024;
const SUPPORTED_EXTENSIONS = ["csv", "xlsx", "xls", "pdf"];
const PENDING_DOCUMENTS_KEY = "arthdrishti_pending_documents";

const formatSize = (bytes: number) => {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
};

export default function FileIngestionPage() {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const [items, setItems] = useState<UploadItem[]>([]);
  const [dragging, setDragging] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const addFiles = (files: FileList | File[]) => {
    const additions = Array.from(files).map((file): UploadItem => {
      const extension = file.name.split(".").pop()?.toLowerCase() || "";
      if (!SUPPORTED_EXTENSIONS.includes(extension)) {
        return { id: crypto.randomUUID(), file, status: "error", error: "Choose a CSV, Excel, or PDF statement.", retryable: false };
      }
      if (file.size > MAX_FILE_SIZE) {
        return { id: crypto.randomUUID(), file, status: "error", error: "This demo upload is limited to 25 MB per file.", retryable: false };
      }
      return { id: crypto.randomUUID(), file, status: "ready" };
    });
    setItems((current) => {
      const existingNames = new Set(current.map((item) => item.file.name));
      const unique = additions.map((item) => existingNames.has(item.file.name)
        ? { ...item, status: "error" as const, error: "This file is already on the list.", retryable: false }
        : item);
      return [...current, ...unique];
    });
  };

  const uploadAndAnalyze = async () => {
    if (!items.length || submitting || items.some((item) => item.status === "error" && !item.retryable)) return;
    setSubmitting(true);
    const uploadedIds = new Set(items.flatMap((item) => item.documentId ? [item.documentId] : []));
    let failed = false;

    for (const item of items) {
      if (item.documentId || (item.status === "error" && !item.retryable)) continue;
      setItems((current) => current.map((candidate) => candidate.id === item.id
        ? { ...candidate, status: "uploading", error: undefined }
        : candidate));
      try {
        const result: UploadedDocument = await documentsApi.upload(item.file);
        const documentId = result.document_id || result.id;
        if (!documentId) throw new Error("The server accepted the request but did not return a document ID.");
        uploadedIds.add(documentId);
        setItems((current) => current.map((candidate) => candidate.id === item.id
          ? { ...candidate, status: "uploaded", documentId, error: undefined }
          : candidate));
      } catch (error) {
        failed = true;
        setItems((current) => current.map((candidate) => candidate.id === item.id
          ? { ...candidate, status: "error", error: error instanceof Error ? error.message : "Upload failed. Check the backend and try again.", retryable: true }
          : candidate));
      }
    }

    const ids = Array.from(uploadedIds);
    sessionStorage.setItem(PENDING_DOCUMENTS_KEY, JSON.stringify(ids));
    setSubmitting(false);

    if (failed) {
      toast.error("Some files could not be uploaded. Retry them or remove them to continue.");
      return;
    }
    if (!ids.length) {
      toast.error("No statement was uploaded. Select a supported file and try again.");
      return;
    }

    toast.success("Statements sent to the analysis pipeline.");
    router.push("/onboarding/processing");
  };

  const removeFile = (id: string) => setItems((current) => current.filter((item) => item.id !== id));

  const canSubmit = items.length > 0 && !submitting && items.every((item) =>
    item.status !== "error" || item.retryable
  );

  return (
    <div className="mx-auto flex w-full max-w-4xl flex-col gap-8 py-6">
      <header className="space-y-2">
        <p className="text-xs font-bold uppercase tracking-[0.16em] text-primary">Statement upload</p>
        <h1 className="text-2xl font-heading font-bold text-foreground sm:text-3xl">Analyze your own financial activity</h1>
        <p className="max-w-2xl text-sm leading-6 text-foreground-secondary">
          Upload a statement to save its transactions to your account and run the available analysis against those records.
          CSV works best; use columns for Date, Description, Credit, and Debit.
        </p>
      </header>

      <div
        role="button"
        tabIndex={0}
        onClick={() => inputRef.current?.click()}
        onKeyDown={(event) => { if (event.key === "Enter" || event.key === " ") inputRef.current?.click(); }}
        onDragOver={(event) => { event.preventDefault(); setDragging(true); }}
        onDragLeave={() => setDragging(false)}
        onDrop={(event) => { event.preventDefault(); setDragging(false); addFiles(event.dataTransfer.files); }}
        className={`cursor-pointer rounded-lg border-2 border-dashed p-8 text-center transition-colors sm:p-12 ${dragging ? "border-primary bg-primary/5" : "border-border hover:border-primary/60 hover:bg-surface-elevated/40"}`}
      >
        <input
          ref={inputRef}
          type="file"
          accept=".csv,.xlsx,.xls,.pdf"
          multiple
          className="hidden"
          onChange={(event) => { if (event.target.files) addFiles(event.target.files); event.target.value = ""; }}
        />
        <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full border border-primary/20 bg-primary/10 text-primary">
          <Upload className="h-5 w-5" />
        </div>
        <p className="font-semibold text-foreground">Drop statements here or browse files</p>
        <p className="mt-2 text-xs text-foreground-secondary">CSV, Excel, or PDF · up to 25 MB per file</p>
      </div>

      {items.length > 0 && (
        <section className="space-y-3" aria-label="Selected statements">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold text-foreground">Selected statements</h2>
            <span className="text-xs text-foreground-secondary">{items.length} file{items.length === 1 ? "" : "s"}</span>
          </div>
          {items.map((item) => {
            const extension = item.file.name.split(".").pop()?.toLowerCase();
            const Icon = extension === "pdf" ? FileText : ["csv", "xlsx", "xls"].includes(extension || "") ? FileSpreadsheet : FileIcon;
            return (
              <div key={item.id} className="flex min-w-0 items-center gap-3 rounded-md border border-border bg-surface p-3 sm:p-4">
                <Icon className="h-5 w-5 shrink-0 text-primary" />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-foreground">{item.file.name}</p>
                  <p className="text-xs text-foreground-secondary">{formatSize(item.file.size)}</p>
                  {item.error && <p className="mt-1 flex items-center gap-1 text-xs text-critical"><AlertCircle className="h-3.5 w-3.5" />{item.error}</p>}
                </div>
                <div className="flex shrink-0 items-center gap-2 text-xs">
                  {item.status === "ready" && <span className="text-foreground-secondary">Ready</span>}
                  {item.status === "uploading" && <span className="flex items-center gap-1.5 text-primary"><LoaderCircle className="h-4 w-4 animate-spin" />Uploading</span>}
                  {item.status === "uploaded" && <span className="flex items-center gap-1 text-positive"><CheckCircle2 className="h-4 w-4" />Received</span>}
                  {item.status === "error" && <span className="text-critical">Needs attention</span>}
                </div>
                {item.status !== "uploading" && (
                  <button type="button" onClick={() => removeFile(item.id)} aria-label={`Remove ${item.file.name}`} className="rounded p-1.5 text-foreground-secondary hover:bg-surface-elevated hover:text-critical">
                    {item.status === "error" ? <X className="h-4 w-4" /> : <Trash2 className="h-4 w-4" />}
                  </button>
                )}
              </div>
            );
          })}
        </section>
      )}

      <div className="flex flex-col-reverse justify-between gap-3 border-t border-border pt-5 sm:flex-row sm:items-center">
        <p className="max-w-xl text-xs leading-5 text-foreground-secondary">
          Your statement is uploaded to the local backend for this demo. Review the parsed transaction list after processing.
        </p>
        <Button variant="primary" disabled={!canSubmit} onClick={uploadAndAnalyze} className="gap-2">
          {submitting ? <><LoaderCircle className="h-4 w-4 animate-spin" />Uploading statements…</> : <>Upload &amp; analyze <Upload className="h-4 w-4" /></>}
        </Button>
      </div>
    </div>
  );
}
