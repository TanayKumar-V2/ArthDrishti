"use client";

import { useCallback, useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, Download, FileText } from "lucide-react";
import { toast } from "sonner";
import PageContainer from "@/components/ui/PageContainer";
import { Button } from "@/components/ui/Button";
import { LoadingState } from "@/components/ui/FeedbackState";
import { Card, CardContent } from "@/components/ui/Card";
import { reportsApi } from "@/lib/api";

type ReportRecord = Awaited<ReturnType<typeof reportsApi.listReports>>[number];

export default function ReportViewerPage() {
  const params = useParams();
  const router = useRouter();
  const reportId = params?.id as string;
  const [report, setReport] = useState<ReportRecord | null>(null);
  const [loading, setLoading] = useState(true);
  const [downloading, setDownloading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;
    reportsApi.listReports().then((items) => {
      if (active) setReport(items.find((item) => item.id === reportId) ?? null);
    }).catch((cause) => {
      if (active) setError(cause instanceof Error ? cause.message : "Could not load this saved report.");
    }).finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [reportId]);

  const download = useCallback(async () => {
    if (!report) return;
    setDownloading(true);
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
      setDownloading(false);
    }
  }, [report]);

  return (
    <PageContainer className="pb-20">
      <Button variant="outline" onClick={() => router.push("/reports")}><ArrowLeft className="mr-2 h-4 w-4" />All reports</Button>
      {loading ? <LoadingState message="Loading saved report..." /> : error ? (
        <div role="alert" className="mt-6 rounded-md border border-critical/30 bg-critical/5 p-4 text-sm text-critical">{error}</div>
      ) : !report ? (
        <Card className="mt-6"><CardContent className="py-12 text-center">
          <FileText className="mx-auto h-8 w-8 text-foreground-muted" />
          <h1 className="mt-3 text-lg font-semibold text-foreground">Report not found</h1>
          <p className="mt-1 text-sm text-foreground-secondary">This report is not saved to your account.</p>
        </CardContent></Card>
      ) : (
        <>
          <header className="mt-6 border-b border-border pb-5">
            <p className="text-xs font-bold uppercase tracking-wide text-primary">Saved PDF report</p>
            <h1 className="mt-2 text-3xl font-heading font-bold text-foreground">{formatType(report.report_type)} report</h1>
            <p className="mt-2 text-sm text-foreground-secondary">Generated {formatDate(report.created_at)} · {report.status}</p>
          </header>
          <Card className="mt-6"><CardContent className="flex flex-col items-start gap-4 py-8 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="font-semibold text-foreground">Your report is ready</h2>
              <p className="mt-1 max-w-xl text-sm leading-6 text-foreground-secondary">The downloadable PDF contains the analysis generated from your parsed statement transactions. Download it to view the complete report.</p>
            </div>
            <Button variant="primary" disabled={downloading} onClick={() => void download()}><Download className="mr-2 h-4 w-4" />{downloading ? "Downloading…" : "Download PDF"}</Button>
          </CardContent></Card>
        </>
      )}
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
