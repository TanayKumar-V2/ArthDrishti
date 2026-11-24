"use client";

import React, { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { AlertCircle, ArrowRight, CheckCircle2, Circle, Database, FileCheck2, LoaderCircle, RefreshCw, ShieldAlert, TrendingUp } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { documentsApi, fraudApi, forecastApi, riskApi, transactionsApi } from "@/lib/api";
import { toast } from "sonner";

const PENDING_DOCUMENTS_KEY = "arthdrishti_pending_documents";
const DEMO_RESULTS_KEY = "arthdrishti_last_analysis";

type TaskStatus = "waiting" | "running" | "done" | "error";
interface AnalysisTask {
  id: string;
  label: string;
  status: TaskStatus;
  detail: string;
}

const initialTasks: AnalysisTask[] = [
  { id: "risk", label: "Credit risk & financial health", status: "waiting", detail: "Uses features calculated from your uploaded transactions." },
  { id: "fraud", label: "Fraud scan", status: "waiting", detail: "Scans the uploaded transaction history for anomalies." },
  { id: "forecast", label: "Cash-flow forecast", status: "waiting", detail: "Groq estimates future cash flow from parsed transaction metrics." },
];

const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export default function AIProcessingPage() {
  const router = useRouter();
  const [phase, setPhase] = useState<"loading" | "processing" | "ready" | "error">("loading");
  const [tasks, setTasks] = useState(initialTasks);
  const [documentNames, setDocumentNames] = useState<string[]>([]);
  const [transactionCount, setTransactionCount] = useState<number | null>(null);
  const [summary, setSummary] = useState<any>(null);
  const [riskResult, setRiskResult] = useState<any>(null);
  const [fraudResult, setFraudResult] = useState<any>(null);
  const [forecastResult, setForecastResult] = useState<any>(null);
  const [error, setError] = useState("");

  const runModelAnalysis = useCallback(async (currentSummary: any, currentTransactionCount: number | null, documentIds: string[]) => {
    setPhase("processing");
    setError("");
    setTasks(initialTasks.map((task) => ({ ...task, status: "running" })));

    const results = await Promise.allSettled([
      riskApi.evaluateCreditRisk(documentIds),
      fraudApi.triggerScan(documentIds),
      forecastApi.generateForecast("30d", documentIds),
    ]);

    const nextTasks = initialTasks.map((task, index) => {
      const result = results[index];
      return result.status === "fulfilled"
        ? { ...task, status: "done" as const, detail: "Completed using the uploaded transaction records." }
        : { ...task, status: "error" as const, detail: result.reason instanceof Error ? result.reason.message : "The backend could not complete this analysis." };
    });
    setTasks(nextTasks);
    if (results[0].status === "fulfilled") setRiskResult(results[0].value);
    if (results[1].status === "fulfilled") setFraudResult(results[1].value);
    if (results[2].status === "fulfilled") setForecastResult(results[2].value);

    const data = {
      analyzedAt: new Date().toISOString(),
      transactionCount: currentTransactionCount,
      summary: currentSummary,
      risk: results[0].status === "fulfilled" ? results[0].value : null,
      fraud: results[1].status === "fulfilled" ? results[1].value : null,
      forecast: results[2].status === "fulfilled" ? results[2].value : null,
    };
    sessionStorage.setItem(DEMO_RESULTS_KEY, JSON.stringify(data));
    setPhase("ready");
  }, []);

  useEffect(() => {
    let cancelled = false;

    const processUploads = async () => {
      const ids = JSON.parse(sessionStorage.getItem(PENDING_DOCUMENTS_KEY) || "[]") as string[];
      if (!ids.length) throw new Error("No uploaded statements were found. Return to the upload step and select a file.");

      setDocumentNames(ids.map((id) => `Statement ${id.slice(0, 8)}`));
      setPhase("processing");

      const deadline = Date.now() + 300_000;
      let allCompleted = false;
      while (!allCompleted && Date.now() < deadline) {
        if (cancelled) return;
        const statuses = await Promise.all(ids.map((id) => documentsApi.getStatus(id)));
        const failedDoc = statuses.find((doc) => doc.status === "failed" || (doc.status === "completed" && doc.error_message));
        if (failedDoc) throw new Error(failedDoc.error_message || "The statement could not be parsed. Check that it contains recognizable transaction columns.");
        allCompleted = statuses.every((doc) => doc.status === "completed");
        if (!allCompleted) await wait(1200);
      }
      if (!allCompleted) throw new Error("Statement processing is taking longer than expected. You can retry the status check.");

      localStorage.setItem("arthdrishti_active_documents", JSON.stringify(ids));
      const transactionSummary = await transactionsApi.getSummary(ids);
      if (!transactionSummary.transaction_count) {
        throw new Error("The file was received, but no transactions were parsed. Use a CSV with Date, Description, Credit, and Debit columns.");
      }
      if (cancelled) return;

      setSummary(transactionSummary);
      setTransactionCount(transactionSummary.transaction_count);
      await runModelAnalysis(transactionSummary, transactionSummary.transaction_count, ids);
    };

    processUploads().catch((cause: unknown) => {
      if (cancelled) return;
      setError(cause instanceof Error ? cause.message : "The upload could not be processed.");
      setPhase("error");
    });

    return () => { cancelled = true; };
  }, [runModelAnalysis]);

  const retryAnalysis = async () => {
    try {
      const ids = JSON.parse(sessionStorage.getItem(PENDING_DOCUMENTS_KEY) || "[]") as string[];
      await runModelAnalysis(summary, transactionCount, ids);
      toast.success("Analysis run finished.");
    } catch {
      toast.error("The analysis request failed. Check that the backend is running and try again.");
    }
  };

  const StatusIcon = ({ status }: { status: TaskStatus }) => {
    if (status === "done") return <CheckCircle2 className="h-5 w-5 text-positive" />;
    if (status === "error") return <AlertCircle className="h-5 w-5 text-critical" />;
    if (status === "running") return <LoaderCircle className="h-5 w-5 animate-spin text-primary" />;
    return <Circle className="h-5 w-5 text-foreground-muted" />;
  };

  return (
    <div className="mx-auto w-full max-w-4xl space-y-7 py-6">
      <header className="space-y-2">
        <p className="text-xs font-bold uppercase tracking-[0.16em] text-primary">Live analysis</p>
        <h1 className="text-2xl font-heading font-bold text-foreground sm:text-3xl">
          {phase === "ready" ? "Analysis results are ready" : phase === "error" ? "We couldn’t finish processing" : "Analyzing your uploaded transactions"}
        </h1>
        <p className="text-sm leading-6 text-foreground-secondary">
          Status and results below come from the backend processing your uploaded documents.
        </p>
      </header>

      {error && (
        <div role="alert" className="flex items-start gap-3 rounded-md border border-critical/30 bg-critical/5 p-4 text-sm text-critical">
          <AlertCircle className="mt-0.5 h-5 w-5 shrink-0" />
          <div className="min-w-0 flex-1"><p className="font-semibold">Processing stopped</p><p className="mt-1 break-words">{error}</p></div>
          <Button variant="outline" size="sm" onClick={() => router.push("/onboarding/upload")}>Back to upload</Button>
        </div>
      )}

      <Card>
        <CardHeader><CardTitle className="flex items-center gap-2 text-sm"><Database className="h-4 w-4 text-primary" /> Uploaded statements</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          {documentNames.length ? documentNames.map((name) => (
            <div key={name} className="flex items-center gap-3 rounded border border-border/70 bg-surface-elevated/30 px-3 py-2.5 text-sm">
              <FileCheck2 className="h-4 w-4 text-positive" /> <span className="min-w-0 flex-1 truncate">{name}</span>
              <span className="text-xs text-positive">Received by backend</span>
            </div>
          )) : <p className="text-sm text-foreground-secondary">Waiting for uploaded document IDs…</p>}
          {transactionCount !== null && <p className="border-t border-border pt-3 text-sm text-foreground-secondary"><strong className="font-semibold text-foreground">{transactionCount.toLocaleString()} transactions</strong> parsed for this upload.</p>}
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle className="text-sm">Analysis jobs</CardTitle></CardHeader>
        <CardContent className="divide-y divide-border/70">
          {tasks.map((task) => (
            <div key={task.id} className="flex items-start gap-3 py-3 first:pt-0 last:pb-0">
              <StatusIcon status={task.status} />
              <div className="min-w-0 flex-1"><p className="text-sm font-semibold text-foreground">{task.label}</p><p className="mt-1 break-words text-xs text-foreground-secondary">{task.detail}</p></div>
              <span className={`text-[10px] font-bold uppercase tracking-wider ${task.status === "done" ? "text-positive" : task.status === "error" ? "text-critical" : "text-foreground-muted"}`}>{task.status}</span>
            </div>
          ))}
        </CardContent>
      </Card>

      {phase === "ready" && (
        <Card className="border-primary/20 bg-surface-elevated/30">
          <CardHeader><CardTitle className="text-sm">Results from this upload</CardTitle></CardHeader>
          <CardContent className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <Result label="Transactions" value={transactionCount?.toLocaleString() || "—"} />
            <Result label="Income parsed" value={currency(summary?.total_income)} />
            <Result label="Expenses parsed" value={currency(summary?.total_expenses)} />
            <Result label="Credit risk" value={riskResult ? `${riskResult.risk_band} · ${(Number(riskResult.default_probability) * 100).toFixed(1)}%` : "Unavailable"} />
            <Result label="Fraud alerts" value={fraudResult ? String(fraudResult.alerts_detected ?? fraudResult.alerts?.length ?? 0) : "Unavailable"} />
            <Result label="Forecast points" value={forecastResult ? String(forecastResult.data?.length ?? 0) : "Unavailable"} />
          </CardContent>
        </Card>
      )}

      <div className="flex flex-col justify-between gap-3 border-t border-border pt-5 sm:flex-row sm:items-center">
        <p className="text-xs text-foreground-secondary">A failed analysis stays marked as failed; it won’t be replaced with demo figures here.</p>
        <div className="flex flex-wrap gap-2">
          {phase === "ready" && tasks.some((task) => task.status === "error") && <Button variant="outline" onClick={retryAnalysis}><RefreshCw className="mr-2 h-4 w-4" />Retry analysis</Button>}
          {phase === "ready" && <Button variant="primary" onClick={() => router.push("/dashboard")}>Open customer dashboard <ArrowRight className="ml-2 h-4 w-4" /></Button>}
        </div>
      </div>
      {phase === "ready" && <p className="flex items-center gap-2 text-xs text-foreground-muted"><TrendingUp className="h-4 w-4" />Metrics are calculated from this ledger. Credit-risk and fraud models are pre-trained; this upload is scored and scanned, not used to retrain them.</p>}
    </div>
  );
}

function currency(value?: number) {
  if (typeof value !== "number" || !Number.isFinite(value)) return "—";
  return `₹${value.toLocaleString("en-IN", { maximumFractionDigits: 0 })}`;
}

function Result({ label, value }: { label: string; value: string }) {
  return <div className="min-w-0"><p className="text-xs text-foreground-secondary">{label}</p><p className="mt-1 break-words text-base font-bold tabular-nums text-foreground">{value}</p></div>;
}
