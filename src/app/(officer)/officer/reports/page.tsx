"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { Download, FileText, RefreshCw } from "lucide-react";
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

export default function OfficerReportsPage() {
  const [reports, setReports] = useState<ReportRecord[]>([]);
  const [filter, setFilter] = useState("all");
  const [reportType, setReportType] = useState<ReportType>("comprehensive");
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [downloadingId, setDownloadingId] = useState("");
  const [error, setError] = useState("");

  const loadReports = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      setReports(await reportsApi.listReports());
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Could not load generated reports.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { void loadReports(); }, [loadReports]);

  const filteredReports = useMemo(
    () => filter === "all" ? reports : reports.filter((report) => report.report_type === filter),
    [filter, reports],
  );

  const generateReport = async () => {
    setGenerating(true);
    setError("");
    try {
      const created = await reportsApi.generate(reportType);
      setReports((current) => [created, ...current.filter((report) => report.id !== created.id)]);
      toast.success("Report generated from the selected statement data.");
    } catch (cause) {
      const message = cause instanceof Error ? cause.message : "Could not generate a report.";
      setError(message);
      toast.error(message);
    } finally {
      setGenerating(false);
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
    <PageContainer className="pb-16">
      <header className="flex flex-col gap-5 border-b border-border pb-6 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-3xl font-heading font-bold text-foreground">Reports</h1>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-foreground-secondary">
            Generate and retrieve PDF reports based on parsed statement transactions for this signed-in account.
          </p>
        </div>
        <Button variant="outline" onClick={() => void loadReports()} disabled={loading}>
          <RefreshCw className={`mr-2 h-4 w-4 ${loading ? "animate-spin" : ""}`} />Refresh
        </Button>
      </header>

      {error && <div role="alert" className="mt-5 rounded-md border border-critical/30 bg-critical/5 p-4 text-sm text-critical">{error}</div>}

      <Card className="mt-6">
        <CardHeader><CardTitle className="text-sm">Generate a report</CardTitle></CardHeader>
        <CardContent className="flex flex-col gap-3 sm:flex-row sm:items-end">
          <label className="flex-1 space-y-1.5 text-xs font-medium text-foreground-secondary">
            Report type
            <select
              value={reportType}
              onChange={(event) => setReportType(event.target.value as ReportType)}
              className="block h-10 w-full rounded-md border border-border bg-surface px-3 text-sm text-foreground outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
            >
              {reportTypes.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
            </select>
          </label>
          <Button variant="primary" onClick={() => void generateReport()} disabled={generating}>
            <FileText className="mr-2 h-4 w-4" />{generating ? "Generating…" : "Generate PDF"}
          </Button>
        </CardContent>
        <div className="border-t border-border px-5 py-3 text-xs leading-5 text-foreground-muted">
          Reports use the currently selected statement when one is active. A report can only be generated when parsed transactions are available.
        </div>
      </Card>

      <section className="mt-8" aria-labelledby="generated-reports-heading">
        <div className="mb-3 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h2 id="generated-reports-heading" className="text-lg font-semibold text-foreground">Generated reports</h2>
            <p className="mt-1 text-xs text-foreground-secondary">Saved report records returned by the backend for this account.</p>
          </div>
          <label className="text-xs text-foreground-secondary">
            Filter
            <select value={filter} onChange={(event) => setFilter(event.target.value)} className="ml-2 h-9 rounded-md border border-border bg-surface px-2 text-foreground">
              <option value="all">All types</option>
              {reportTypes.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
            </select>
          </label>
        </div>

        <Card>
          <CardContent className="p-0">
            {loading ? (
              <p className="p-6 text-sm text-foreground-secondary">Loading saved reports…</p>
            ) : filteredReports.length ? (
              <div className="overflow-x-auto">
                <table className="w-full min-w-[600px] text-left text-sm">
                  <thead className="border-b border-border bg-surface-elevated/40 text-[11px] uppercase tracking-wide text-foreground-muted">
                    <tr><th className="px-5 py-3 font-semibold">Report</th><th className="px-5 py-3 font-semibold">Generated</th><th className="px-5 py-3 font-semibold">Status</th><th className="px-5 py-3 text-right font-semibold">File</th></tr>
                  </thead>
                  <tbody className="divide-y divide-border/70">
                    {filteredReports.map((report) => (
                      <tr key={report.id}>
                        <td className="px-5 py-4">
                          <p className="font-semibold text-foreground">{reportTitle(report.report_type)}</p>
                          <p className="mt-1 font-mono text-[10px] text-foreground-muted">{report.id}</p>
                        </td>
                        <td className="px-5 py-4 text-foreground-secondary">{formatDate(report.created_at)}</td>
                        <td className="px-5 py-4"><span className="rounded border border-positive/20 bg-positive/10 px-2 py-1 text-[10px] font-bold uppercase tracking-wide text-positive">{report.status}</span></td>
                        <td className="px-5 py-4 text-right">
                          <Button size="sm" variant="outline" disabled={downloadingId === report.id} onClick={() => void downloadReport(report)}>
                            <Download className="mr-1.5 h-3.5 w-3.5" />{downloadingId === report.id ? "Downloading…" : "Download PDF"}
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="px-6 py-12 text-center">
                <FileText className="mx-auto h-8 w-8 text-foreground-muted" />
                <h3 className="mt-3 text-sm font-semibold text-foreground">No generated reports</h3>
                <p className="mx-auto mt-1 max-w-md text-xs leading-5 text-foreground-secondary">
                  Reports will appear here after one is generated from parsed statement transactions. Sample report entries are not shown.
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </section>
    </PageContainer>
  );
}

function reportTitle(reportType: string) {
  return `${reportType.replaceAll("_", " ").replace(/\b\w/g, (letter) => letter.toUpperCase())} Report`;
}

function formatDate(value: string) {
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? "Date unavailable" : date.toLocaleString("en-IN", { dateStyle: "medium", timeStyle: "short" });
}
