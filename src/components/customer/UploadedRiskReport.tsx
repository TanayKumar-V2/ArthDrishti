"use client";

import { useState } from "react";
import type { ReactNode } from "react";
import Link from "next/link";
import { AlertTriangle, ArrowRight, BadgeCheck, LoaderCircle, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/Button";
import PageContainer from "@/components/ui/PageContainer";
import { riskApi } from "@/lib/api";
import type { UploadedAnalysis } from "@/hooks/useUploadedAnalysis";

const relatedReports = [
  ["Fraud scan", "/fraud"],
  ["Cash flow", "/cash-flow"],
  ["Customer segment", "/segments"],
] as const;

export function UploadedRiskReport({ data, refresh }: { data: UploadedAnalysis; refresh: () => Promise<void> }) {
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
    <PageContainer className="gap-9 pb-20 sm:gap-11">
      <header className="flex flex-col gap-5 border-b border-border/70 pb-7 sm:flex-row sm:items-end sm:justify-between">
        <div><p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-primary">Risk profile · {data.summary.transaction_count.toLocaleString()} transactions</p><h1 className="mt-3 text-4xl font-semibold text-foreground sm:text-[2.65rem]">Credit risk</h1><p className="mt-3 max-w-2xl text-[14px] leading-6 text-foreground-secondary">A model estimate using features calculated from this ledger. This is not a credit-bureau report.</p></div>
        <Link href="/transactions" className="group inline-flex h-10 items-center justify-center gap-2 rounded-full border border-border-strong/80 pl-5 pr-1.5 text-[13px] font-medium text-foreground transition-colors hover:bg-surface-hover">Review transactions<span className="grid h-7 w-7 place-items-center rounded-full bg-primary/8 text-primary"><ArrowRight className="h-3.5 w-3.5 transition-transform duration-300 ease-[cubic-bezier(0.32,0.72,0,1)] group-hover:translate-x-0.5" /></span></Link>
      </header>

      {error && <div role="alert" className="rounded-2xl border border-critical/20 bg-critical/5 p-5 text-[13px] text-critical">{error}</div>}

      <section className="grid gap-5 xl:grid-cols-[1fr_1fr]" aria-label="Risk assessment">
        <Bezel>
          <div className="flex h-full flex-col justify-between gap-8 p-6 sm:p-8">
            <div className="flex items-center justify-between gap-4"><div><p className="text-[11px] font-semibold uppercase tracking-[0.15em] text-foreground-muted">Default probability</p><h2 className="mt-2 text-xl font-semibold text-foreground">Credit-risk estimate</h2></div><ShieldCheck className="h-5 w-5 text-primary" /></div>
            {probability === null ? <div className="py-3"><p className="max-w-md text-[14px] leading-6 text-foreground-secondary">No score has been generated for this upload yet. Run the model against the parsed transaction features.</p><Button className="group mt-5 rounded-full px-4" variant="primary" disabled={running} onClick={runScoring}>{running && <LoaderCircle className="mr-2 h-4 w-4 animate-spin" />}Run credit scoring<span className="ml-1 grid h-7 w-7 place-items-center rounded-full bg-primary-foreground/15"><ArrowRight className="h-3.5 w-3.5 transition-transform duration-300 ease-[cubic-bezier(0.32,0.72,0,1)] group-hover:translate-x-0.5" /></span></Button></div> : <div className="flex flex-wrap items-end justify-between gap-5"><div><p className="text-[3.5rem] font-semibold leading-none tracking-[-0.07em] tabular-nums text-foreground">{probability.toFixed(1)}<span className="ml-1 text-xl tracking-normal text-foreground-secondary">%</span></p><span className={`mt-4 inline-flex rounded-full px-3 py-1.5 text-[11px] font-semibold ${riskClass(riskBand)}`}>{riskBand} risk</span></div><Button variant="outline" className="rounded-full px-4" disabled={running} onClick={runScoring}>{running && <LoaderCircle className="mr-2 h-4 w-4 animate-spin" />}Re-run model</Button></div>}
            <p className="border-t border-border/70 pt-4 text-[11px] text-foreground-muted">Model version: {data.risk?.model_version || "not available"}</p>
          </div>
        </Bezel>

        <Bezel>
          <div className="flex h-full flex-col justify-between gap-8 p-6 sm:p-8">
            <div className="flex items-center justify-between gap-4"><div><p className="text-[11px] font-semibold uppercase tracking-[0.15em] text-foreground-muted">Related measure</p><h2 className="mt-2 text-xl font-semibold text-foreground">Financial health</h2></div><BadgeCheck className="h-5 w-5 text-primary" /></div>
            <div><p className="text-[3.5rem] font-semibold leading-none tracking-[-0.07em] tabular-nums text-foreground">{Number(features.financial_health_score || 0).toFixed(0)}<span className="ml-2 text-xl tracking-normal text-foreground-secondary">/100</span></p><p className="mt-4 max-w-md text-[13px] leading-6 text-foreground-secondary">Assessment based on metrics derived from the uploaded transactions.</p></div>
            <p className="flex items-start gap-2 border-t border-border/70 pt-4 text-[11px] leading-5 text-foreground-muted"><AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-warning" />No bureau history or repayment records were included in this upload.</p>
          </div>
        </Bezel>
      </section>

      <Bezel>
        <div className="p-5 sm:p-7">
          <div className="mb-5"><p className="text-[11px] font-semibold uppercase tracking-[0.15em] text-foreground-muted">Observed data</p><h2 className="mt-2 text-xl font-semibold text-foreground">Model input features</h2></div>
          <dl className="grid sm:grid-cols-2 xl:grid-cols-3">
            {observed.map(([label, value], index) => <div key={label} className={`border-t border-border/70 py-4 sm:px-4 ${index % 3 === 0 ? "xl:pl-0" : ""} ${index % 3 !== 2 ? "xl:border-r" : ""}`}><dt className="text-[11px] font-medium text-foreground-muted">{label}</dt><dd className="mt-1.5 text-[15px] font-semibold tabular-nums text-foreground">{value}</dd></div>)}
          </dl>
        </div>
      </Bezel>

      <nav aria-label="Related analysis" className="flex flex-col gap-3 border-t border-border/70 pt-5 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-[11px] font-semibold uppercase tracking-[0.15em] text-foreground-muted">Continue exploring</p>
        <div className="flex flex-wrap gap-x-6 gap-y-3">{relatedReports.map(([label, href]) => <Link key={href} href={href} className="inline-flex items-center gap-2 text-[13px] font-medium text-foreground-secondary hover:text-primary">{label}<ArrowRight className="h-3.5 w-3.5" /></Link>)}</div>
      </nav>
    </PageContainer>
  );
}

function Bezel({ children }: { children: ReactNode }) {
  return <div className="rounded-[1.8rem] bg-surface-elevated p-1.5 ring-1 ring-border/70"><div className="h-full rounded-[calc(1.8rem-0.375rem)] bg-surface ring-1 ring-inset ring-black/[0.025] dark:ring-white/[0.04]">{children}</div></div>;
}

function currency(value: number | undefined) { return typeof value === "number" && Number.isFinite(value) ? `₹${value.toLocaleString("en-IN", { maximumFractionDigits: 0 })}` : "—"; }
function riskClass(value: string) {
  const band = value.toLowerCase();
  return band === "low" ? "bg-positive/10 text-positive" : band === "medium" ? "bg-warning/10 text-warning" : band === "not scored" ? "bg-surface-elevated text-foreground-secondary" : "bg-critical/10 text-critical";
}
