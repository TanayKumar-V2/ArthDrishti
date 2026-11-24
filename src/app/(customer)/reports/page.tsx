"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Download, FileText, Plus, RefreshCw } from "lucide-react";
import { toast } from "sonner";
import PageContainer from "@/components/ui/PageContainer";
import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { reportsApi } from "@/lib/api";

type ReportRecord = Awaited<ReturnType<typeof reportsApi.listReports>>[number];
type ReportType = "comprehensive" | "credit_risk" | "financial_health";

const reportTypes: Array<{ value: ReportType; label: string }> = [
  { value: "comprehensive", label: "Comprehensive financial report" },
  { value: "credit_risk", label: "Credit risk report" },
  { value: "financial_health", label: "Financial health report" },
];

export default function ReportsCenterPage() {
  const router = useRouter();
  const [reports, setReports] = useState<ReportRecord[]>([]);
  const [activeFilter, setActiveFilter] = useState("all");
  const [reportType, setReportType] = useState<ReportType>("comprehensive");
  const [isLoading, setIsLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  const [downloadingId, setDownloadingId] = useState("");
  const [error, setError] = useState("");

  const loadReports = useCallback(async () => {
    setIsLoading(true);
    setError("");
    try {
      setReports(await reportsApi.listReports());
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Could not load saved reports.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => { void loadReports(); }, [loadReports]);

  const filteredReports = useMemo(
    () => activeFilter === "all" ? reports : reports.filter((report) => report.report_type === activeFilter),
    [activeFilter, reports],
  );

  const generateReport = async (event: React.FormEvent) => {
    event.preventDefault();
    setIsProcessing(true);
    setError("");
    try {
      const created = await reportsApi.generate(reportType);
      setReports((current) => [created, ...current.filter((report) => report.id !== created.id)]);
      toast.success("PDF generated from your selected statement data.");
    } catch (cause) {
      const message = cause instanceof Error ? cause.message : "Could not generate a report.";
      setError(message);
      toast.error(message);
    } finally {
      setIsProcessing(false);
    }
  };

  const downloadReport = async (report: ReportRecord) => {
    setDownloadingId(report.id);
    try {
      const blob = await reportsApi.download(report.id);
      const objectUrl = URL.createObjectURL(blob);
      const anchor = document.createElement("a");
      anchor.href = objectUrl;
      anchor.download = `arthdrishti-report-${report.id.slice(0, 8)}.pdf`;
      document.body.appendChild(anchor);
      anchor.click();
      anchor.remove();
      URL.revokeObjectURL(objectUrl);
    } catch (cause) {
      toast.error(cause instanceof Error ? cause.message : "Could not download this report.");
    } finally {
      setDownloadingId("");
    }
  };

  return (
    <PageContainer className="pb-20">
      <header className="flex flex-col gap-4 border-b border-border pb-6 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="flex items-center gap-2 text-3xl font-heading font-bold text-foreground"><FileText className="h-7 w-7 text-primary" />Reports</h1>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-foreground-secondary">Generate and download PDF reports based on parsed transactions from your selected statement.</p>
        </div>
        <Button variant="outline" onClick={() => void loadReports()} disabled={isLoading}><RefreshCw className={`mr-2 h-4 w-4 ${isLoading ? "animate-spin" : ""}`} />Refresh</Button>
      </header>

      {error && <div role="alert" className="mt-5 rounded-md border border-critical/30 bg-critical/5 p-4 text-sm text-critical">{error}</div>}

      <Card className="mt-6">
        <CardHeader><CardTitle className="text-sm">Create a report</CardTitle></CardHeader>
        <CardContent>
          <form onSubmit={(event) => void generateReport(event)} className="flex flex-col gap-3 sm:flex-row sm:items-end">
            <label className="flex-1 space-y-1.5 text-xs font-medium text-foreground-secondary">
              Report type
              <select value={reportType} onChange={(event) => setReportType(event.target.value as ReportType)} className="block h-10 w-full rounded-md border border-border bg-surface px-3 text-sm text-foreground outline-none focus-visible:ring-2 focus-visible:ring-primary/40">
                {reportTypes.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
              </select>
            </label>
            <Button type="submit" variant="primary" disabled={isProcessing}><Plus className="mr-2 h-4 w-4" />{isProcessing ? "Generating…" : "Generate PDF"}</Button>
          </form>
          <p className="mt-3 border-t border-border pt-3 text-xs leading-5 text-foreground-muted">The PDF includes transaction totals, financial features, and a model risk score. Generation requires successfully parsed statement transactions.</p>
        </CardContent>
      </Card>

      <section className="mt-8" aria-labelledby="reports-history-heading">
        <div className="mb-3 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h2 id="reports-history-heading" className="text-lg font-semibold text-foreground">Saved reports</h2>
            <p className="mt-1 text-xs text-foreground-secondary">Only reports saved by the backend for this account appear here.</p>
          </div>
          <label className="text-xs text-foreground-secondary">Filter
            <select value={activeFilter} onChange={(event) => setActiveFilter(event.target.value)} className="ml-2 h-9 rounded-md border border-border bg-surface px-2 text-foreground">
              <option value="all">All types</option>
              {reportTypes.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
            </select>
          </label>
        </div>

        <Card>
          <CardContent className="p-0">
            {isLoading ? <p className="p-6 text-sm text-foreground-secondary">Loading saved reports…</p> : filteredReports.length ? (
              <div className="divide-y divide-border/70">
                {filteredReports.map((report) => (
                  <div key={report.id} className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between sm:px-5">
                    <button className="min-w-0 text-left" onClick={() => router.push(`/reports/${encodeURIComponent(report.id)}`)}>
                      <span className="text-[10px] font-bold uppercase tracking-wide text-primary">{formatType(report.report_type)}</span>
                      <span className="mt-1 block truncate text-sm font-semibold text-foreground">{formatType(report.report_type)} report</span>
                      <span className="mt-1 block text-xs text-foreground-secondary">Generated {formatDate(report.created_at)} · {report.status}</span>
                    </button>
                    <div className="flex shrink-0 gap-2">
                      <Button size="sm" variant="outline" onClick={() => router.push(`/reports/${encodeURIComponent(report.id)}`)}>View details</Button>
                      <Button size="sm" variant="primary" disabled={downloadingId === report.id} onClick={() => void downloadReport(report)}><Download className="mr-1.5 h-3.5 w-3.5" />{downloadingId === report.id ? "Downloading…" : "PDF"}</Button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="px-6 py-12 text-center">
                <FileText className="mx-auto h-8 w-8 text-foreground-muted" />
                <h3 className="mt-3 text-sm font-semibold text-foreground">{reports.length ? "No reports match this filter" : "No reports generated yet"}</h3>
                <p className="mx-auto mt-1 max-w-md text-xs leading-5 text-foreground-secondary">
                  {reports.length ? "Choose another report type to see saved reports." : "Upload and process a statement, then generate a report. Sample report cards are no longer used."}
                </p>
                {!reports.length && <Button className="mt-4" variant="outline" onClick={() => router.push("/onboarding/upload")}>Upload a statement</Button>}
              </div>
            )}
          </CardContent>
        </Card>
      </section>
    </PageContainer>
  );
}

function formatType(value: string) {
  return value.replaceAll("_", " ").replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function formatDate(value: string) {
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? "date unavailable" : date.toLocaleString("en-IN", { dateStyle: "medium", timeStyle: "short" });
}
