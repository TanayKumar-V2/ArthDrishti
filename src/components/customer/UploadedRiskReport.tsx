"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { AlertTriangle, ArrowRight, BadgeCheck, LoaderCircle, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import PageContainer from "@/components/ui/PageContainer";
import { riskApi } from "@/lib/api";
import type { UploadedAnalysis } from "@/hooks/useUploadedAnalysis";

export function UploadedRiskReport({ data, refresh }: { data: UploadedAnalysis; refresh: () => Promise<void> }) {
  const router = useRouter();
  const [running, setRunning] = useState(false);
  const [error, setError] = useState("");
  const probability = typeof data.risk?.default_probability === "number" ? data.risk.default_probability * 100 : null;
  const riskBand = data.risk?.risk_band || "Not scored";
  const features = data.features;

  const runScoring = async () => {
    setRunning(true);
    setError("");
    try {
      await riskApi.evaluateCreditRisk();
      await refresh();
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Credit scoring failed. Check the backend and retry.");
    } finally {
      setRunning(false);
    }
  };

  const observed = [
    ["Average monthly income", currency(features.monthly_income_avg)],
    ["Average monthly expenses", currency(features.monthly_expense_avg)],
    ["Net monthly cash flow", currency(features.net_monthly_cash_flow)],
    ["Savings rate", `${(Number(features.savings_rate || 0) * 100).toFixed(1)}%`],
    ["Income stability estimate", `${(Number(features.income_stability_score || 0) * 100).toFixed(0)}%`],
    ["Recorded outlier transactions", String(features.outlier_transaction_count || 0)],
  ];

  return (
    <PageContainer className="pb-20">
      <header className="flex flex-col gap-4 border-b border-border pb-6 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.14em] text-positive">Uploaded data · {data.summary.transaction_count.toLocaleString()} transactions</p>
          <h1 className="mt-2 text-3xl font-heading font-bold text-foreground">Credit risk</h1>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-foreground-secondary">The backend model scores features derived from this ledger. It is not a bureau report and the upload does not contain verified loans or credit limits.</p>
        </div>
        <Button variant="outline" onClick={() => router.push("/transactions")}>Review transactions</Button>
      </header>

      {error && <div role="alert" className="mt-5 rounded-md border border-critical/30 bg-critical/5 p-3 text-sm text-critical">{error}</div>}

      <section className="mt-7 grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader><CardTitle className="flex items-center gap-2 text-sm"><ShieldCheck className="h-4 w-4 text-primary" /> Default probability</CardTitle></CardHeader>
          <CardContent>
            {probability === null ? <><p className="text-sm text-foreground-secondary">No score has been generated for this upload yet.</p><Button className="mt-4" variant="primary" disabled={running} onClick={runScoring}>{running && <LoaderCircle className="mr-2 h-4 w-4 animate-spin" />}Run credit scoring</Button></> : <>
              <p className="text-5xl font-heading font-bold tabular-nums text-foreground">{probability.toFixed(1)}<span className="ml-1 text-base font-medium text-foreground-secondary">%</span></p>
              <p className={`mt-2 text-sm font-semibold ${riskColor(riskBand)}`}>{riskBand} risk band</p>
              <p className="mt-3 text-xs text-foreground-secondary">Model: {data.risk.model_version || "version unavailable"}</p>
              <Button className="mt-4" variant="outline" disabled={running} onClick={runScoring}>{running && <LoaderCircle className="mr-2 h-4 w-4 animate-spin" />}Re-run scoring</Button>
            </>}
          </CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle className="flex items-center gap-2 text-sm"><BadgeCheck className="h-4 w-4 text-positive" /> Financial health</CardTitle></CardHeader>
          <CardContent>
            <p className="text-5xl font-heading font-bold tabular-nums text-foreground">{Number(features.financial_health_score || 0).toFixed(0)}<span className="ml-1 text-base font-medium text-foreground-secondary">/100</span></p>
            <p className="mt-2 text-sm text-foreground-secondary">Backend feature score calculated from uploaded transactions.</p>
            <p className="mt-3 flex items-center gap-2 text-xs text-foreground-muted"><AlertTriangle className="h-4 w-4" />No bureau history or repayment records were included in the upload.</p>
          </CardContent>
        </Card>
      </section>

      <section className="mt-8">
        <Card>
          <CardHeader><CardTitle className="text-sm">Model input features from this upload</CardTitle></CardHeader>
          <CardContent className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {observed.map(([label, value]) => <div key={label} className="border-b border-border/60 pb-3"><p className="text-xs text-foreground-secondary">{label}</p><p className="mt-1 text-lg font-bold tabular-nums text-foreground">{value}</p></div>)}
          </CardContent>
        </Card>
      </section>

      <section className="mt-8 grid gap-3 sm:grid-cols-3">
        <Button variant="outline" onClick={() => router.push("/fraud")}>Fraud scan results <ArrowRight className="ml-2 h-4 w-4" /></Button>
        <Button variant="outline" onClick={() => router.push("/cash-flow")}>Cash-flow forecast <ArrowRight className="ml-2 h-4 w-4" /></Button>
        <Button variant="outline" onClick={() => router.push("/segments")}>Customer segment <ArrowRight className="ml-2 h-4 w-4" /></Button>
      </section>
    </PageContainer>
  );
}

function currency(value: number | undefined) {
  return typeof value === "number" && Number.isFinite(value) ? `₹${value.toLocaleString("en-IN", { maximumFractionDigits: 0 })}` : "—";
}

function riskColor(value: string) {
  const band = value.toLowerCase();
  return band === "low" ? "text-positive" : band === "medium" ? "text-warning" : band === "not scored" ? "text-foreground-secondary" : "text-critical";
}
