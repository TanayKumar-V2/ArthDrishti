"use client";

import { useCallback, useEffect, useState } from "react";
import { Database, FileUp, RefreshCw, Trash2 } from "lucide-react";
import PageContainer from "@/components/ui/PageContainer";
import { Button } from "@/components/ui/Button";
import { LoadingState } from "@/components/ui/FeedbackState";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { documentsApi, type UploadedDocument } from "@/lib/api";

const ACTIVE_DOCUMENTS_KEY = "arthdrishti_active_documents";

export default function DataSourcesPage() {
  const [documents, setDocuments] = useState<UploadedDocument[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [activeDocumentId, setActiveDocumentId] = useState("");
  const [deletingDocumentId, setDeletingDocumentId] = useState("");
  const [recategorizingDocumentId, setRecategorizingDocumentId] = useState("");
  const [success, setSuccess] = useState("");

  const loadDocuments = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      setDocuments(await documentsApi.list());
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Could not load uploaded document status.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { void loadDocuments(); }, [loadDocuments]);

  useEffect(() => {
    const ids = JSON.parse(localStorage.getItem(ACTIVE_DOCUMENTS_KEY) || "[]") as string[];
    setActiveDocumentId(ids[0] || "");
  }, []);

  const activateDocument = (id: string) => {
    localStorage.setItem(ACTIVE_DOCUMENTS_KEY, JSON.stringify([id]));
    setActiveDocumentId(id);
  };

  const deleteDocument = async (document: UploadedDocument) => {
    const id = document.id || document.document_id;
    if (!id || !window.confirm(`Delete “${document.file_name || "this statement"}” and its imported transactions? This cannot be undone.`)) return;

    setDeletingDocumentId(id);
    setError("");
    try {
      await documentsApi.delete(id);
      const remaining = documents.filter((item) => (item.id || item.document_id) !== id);
      setDocuments(remaining);

      const selectedIds = JSON.parse(localStorage.getItem(ACTIVE_DOCUMENTS_KEY) || "[]") as string[];
      const remainingSelectedIds = selectedIds.filter((selectedId) => selectedId !== id);
      if (remainingSelectedIds.length) {
        localStorage.setItem(ACTIVE_DOCUMENTS_KEY, JSON.stringify(remainingSelectedIds));
        setActiveDocumentId(remainingSelectedIds[0]);
      } else if (activeDocumentId === id || selectedIds.includes(id)) {
        const next = remaining.find((item) => item.status === "completed" && !item.error_message && (item.id || item.document_id));
        const nextId = next?.id || next?.document_id;
        if (nextId) {
          localStorage.setItem(ACTIVE_DOCUMENTS_KEY, JSON.stringify([nextId]));
          setActiveDocumentId(nextId);
        } else {
          localStorage.removeItem(ACTIVE_DOCUMENTS_KEY);
          setActiveDocumentId("");
        }
      }
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Could not delete this uploaded statement.");
    } finally {
      setDeletingDocumentId("");
    }
  };

  const recategorizeDocument = async (document: UploadedDocument) => {
    const id = document.id || document.document_id;
    if (!id) return;
    setRecategorizingDocumentId(id);
    setError("");
    setSuccess("");
    try {
      const result = await documentsApi.recategorize(id);
      setSuccess(`Categorized ${result.categorized_transactions.toLocaleString()} transactions. Refresh analytics to see the updated categories.`);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Could not categorize this statement.");
    } finally {
      setRecategorizingDocumentId("");
    }
  };

  return (
    <PageContainer className="pb-20">
      <header className="flex flex-col gap-4 border-b border-border pb-6 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-3xl font-heading font-bold text-foreground">Uploaded data sources</h1>
          <p className="mt-2 max-w-2xl text-sm text-foreground-secondary">This account has no live bank integrations. Statements uploaded here are parsed and saved as transaction records for analysis.</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => void loadDocuments()} disabled={loading}><RefreshCw className="mr-2 h-4 w-4" />Refresh status</Button>
          <Button variant="primary" onClick={() => window.location.assign("/onboarding/upload")}><FileUp className="mr-2 h-4 w-4" />Upload statement</Button>
        </div>
      </header>

      {error && <div role="alert" className="mt-5 rounded-md border border-critical/30 bg-critical/5 p-4 text-sm text-critical">{error}</div>}
      {success && <div role="status" className="mt-5 rounded-md border border-positive/30 bg-positive/5 p-4 text-sm text-positive">{success}</div>}

      <Card className="mt-6">
        <CardHeader><CardTitle className="flex items-center gap-2 text-sm"><Database className="h-4 w-4 text-primary" />Uploaded statements</CardTitle></CardHeader>
        <CardContent>
          {documents.some((document) => document.status === "completed" && !document.error_message) && (
            <div className="mb-4 rounded border border-border p-3">
              <p className="mb-2 text-xs text-foreground-secondary">Choose which statement drives the analytics pages. Older uploads remain saved.</p>
              <div className="flex flex-wrap gap-2">
                {documents.filter((document) => document.status === "completed" && !document.error_message).map((document) => {
                  const id = document.id || document.document_id || "";
                  const active = id === activeDocumentId;
                  return id ? <Button key={id} size="sm" variant={active ? "primary" : "outline"} onClick={() => activateDocument(id)}>{active ? "Selected · " : "Analyze · "}{document.file_name || id.slice(0, 8)}</Button> : null;
                })}
              </div>
            </div>
          )}

          {loading ? <LoadingState message="Loading document records..." /> : documents.length ? (
            <div className="divide-y divide-border/70">
              {documents.map((document) => {
                const id = document.id || document.document_id || "";
                const isDeleting = deletingDocumentId === id;
                const cannotDeleteWhileProcessing = document.status === "pending" || document.status === "processing";
                return (
                  <div key={id} className="flex flex-col gap-3 py-4 sm:flex-row sm:items-center sm:justify-between">
                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold text-foreground">{document.file_name || "Uploaded statement"}</p>
                      <p className="mt-1 break-all font-mono text-[10px] text-foreground-muted">ID: {id}</p>
                      {document.error_message && <p className="mt-1 text-xs text-critical">{document.error_message}</p>}
                    </div>
                    <div className="flex flex-wrap items-center gap-2">
                      <span className={`w-fit rounded-sm border px-2 py-1 text-[10px] font-bold uppercase tracking-wide ${document.status === "completed" ? "border-positive/20 bg-positive/10 text-positive" : document.status === "failed" ? "border-critical/20 bg-critical/10 text-critical" : "border-warning/20 bg-warning/10 text-warning"}`}>{document.status}</span>
                      <Button size="sm" variant="outline" disabled={document.status !== "completed" || !id || recategorizingDocumentId === id} onClick={() => void recategorizeDocument(document)}>
                        <RefreshCw className={`mr-1.5 h-3.5 w-3.5 ${recategorizingDocumentId === id ? "animate-spin" : ""}`} />{recategorizingDocumentId === id ? "Categorizing" : "Recategorize"}
                      </Button>
                      <Button size="sm" variant="destructive" disabled={!id || cannotDeleteWhileProcessing || isDeleting} onClick={() => void deleteDocument(document)}>
                        <Trash2 className="mr-1.5 h-3.5 w-3.5" />{isDeleting ? "Deleting" : "Delete"}
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : <p className="text-sm text-foreground-secondary">No statements have been uploaded to this account yet.</p>}
        </CardContent>
      </Card>

      <p className="mt-4 text-xs leading-5 text-foreground-muted">Supported formats: CSV, Excel, and PDF. CSV parsing works best with Date, Description, Credit, and Debit columns. Transaction descriptions are classified automatically to generate financial analytics. Only upload statements you are authorized to use.</p>
    </PageContainer>
  );
}
