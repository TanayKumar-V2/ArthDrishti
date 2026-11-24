"use client";

import { useEffect, useState } from "react";
import { Activity, ArrowRight, ReceiptText, ShieldCheck, Wallet } from "lucide-react";
import type { ComponentType, ReactNode } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import PageContainer from "@/components/ui/PageContainer";
import { recommendationsApi } from "@/lib/api";
import type { UploadedAnalysis } from "@/hooks/useUploadedAnalysis";

type Recommendation = { id: string; title: string; description: string; impact_level: string };

export function UploadedHealthReport({ data }: { data: UploadedAnalysis }) {
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const features = data.features;
  const score = Number(features.financial_health_score ?? data.risk?.financial_health_score ?? 0);
  const rating = String(features.financial_health_rating || "AI assessment");
  const healthExplanation = String(features.financial_health_explanation || "Assessment based on the transaction metrics parsed from your upload.");
  const normalizedScore = Math.max(0, Math.min(100, score));

  useEffect(() => {
    recommendationsApi.list().then(setRecommendations).catch(() => setRecommendations([]));
  }, []);

  const metrics = [
    { label: "Average monthly income", value: currency(features.monthly_income_avg), note: "Credits parsed from the uploaded period", icon: Wallet },
    { label: "Average monthly expenses", value: currency(features.monthly_expense_avg), note: "Debits parsed from the uploaded period", icon: ReceiptText },
    { label: "Net monthly cash flow", value: currency(features.net_monthly_cash_flow), note: "Income less expenses in the analyzed period", icon: Activity },
    { label: "Savings rate", value: `${(Number(features.savings_rate || 0) * 100).toFixed(1)}%`, note: "Share of recorded income remaining", icon: ShieldCheck },
  ];

  const indicators = [
    { title: "Income stability", value: `${(Number(features.income_stability_score || 0) * 100).toFixed(0)}%`, detail: "Estimated from month-to-month income variation." },
    { title: "Discretionary spending", value: `${(Number(features.discretionary_spending_ratio || 0) * 100).toFixed(1)}%`, detail: "Share of expenses classified as discretionary." },
    { title: "Surplus coverage", value: `${Number(features.emergency_fund_months || 0).toFixed(1)} months`, detail: "Estimated from recorded surplus, not an observed balance." },
  ];

  return (
    <PageContainer className="gap-9 pb-20 sm:gap-11">
      <header className="flex flex-col gap-5 border-b border-border/70 pb-7 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-primary">Financial profile · {data.summary.transaction_count.toLocaleString()} transactions</p>
          <h1 className="mt-3 text-4xl font-semibold text-foreground sm:text-[2.65rem]">Financial health</h1>
          <p className="mt-3 max-w-2xl text-[14px] leading-6 text-foreground-secondary">A concise read on income, outflow, and savings behavior from the transactions you shared.</p>
        </div>
        <Button variant="outline" className="group rounded-full px-4" onClick={() => window.location.assign("/transactions")}>Review transactions<span className="ml-1 grid h-7 w-7 place-items-center rounded-full bg-primary/8 text-primary"><ArrowRight className="h-3.5 w-3.5 transition-transform duration-300 ease-[cubic-bezier(0.32,0.72,0,1)] group-hover:translate-x-0.5" /></span></Button>
      </header>

      <section className="grid gap-5 xl:grid-cols-[1.04fr_1fr]" aria-label="Financial health summary">
        <Bezel>
          <div className="flex h-full flex-col justify-between gap-8 p-6 sm:p-8">
            <div className="flex items-center justify-between gap-4">
              <div><p className="text-[11px] font-semibold uppercase tracking-[0.15em] text-foreground-muted">Overall assessment</p><h2 className="mt-2 text-xl font-semibold text-foreground">Financial health score</h2></div>
              <span className="rounded-full bg-primary/8 px-3 py-1.5 text-[11px] font-semibold text-primary">{rating}</span>
            </div>
            <div className="flex flex-col items-center gap-6 sm:flex-row sm:items-center sm:gap-8">
              <ScoreRing score={normalizedScore} />
              <p className="max-w-sm text-[14px] leading-7 text-foreground-secondary">{healthExplanation}</p>
            </div>
            <p className="border-t border-border/70 pt-4 text-[11px] leading-5 text-foreground-muted">Based only on transaction records in this upload. No credit-bureau or account-balance data was supplied.</p>
          </div>
        </Bezel>

        <Bezel>
          <div className="p-5 sm:p-7">
            <div className="mb-2"><p className="text-[11px] font-semibold uppercase tracking-[0.15em] text-foreground-muted">Cash flow fundamentals</p><h2 className="mt-2 text-xl font-semibold text-foreground">Monthly averages</h2></div>
            <div className="grid sm:grid-cols-2">
              {metrics.map(({ label, value, note, icon: Icon }, index) => <MetricCell key={label} label={label} value={value} note={note} icon={Icon} index={index} />)}
            </div>
          </div>
        </Bezel>
      </section>

      <Bezel>
        <div className="p-5 sm:p-7">
          <div className="mb-5"><p className="text-[11px] font-semibold uppercase tracking-[0.15em] text-foreground-muted">Additional signals</p><h2 className="mt-2 text-xl font-semibold text-foreground">Patterns in your activity</h2></div>
          <div className="grid gap-6 sm:grid-cols-3 sm:divide-x sm:divide-border/70 sm:gap-0">
            {indicators.map((indicator, index) => <div key={indicator.title} className={`sm:px-6 ${index === 0 ? "sm:pl-0" : ""} ${index === 2 ? "sm:pr-0" : ""}`}>
              <p className="text-[12px] font-medium text-foreground-secondary">{indicator.title}</p>
              <p className="mt-2 text-[1.7rem] font-semibold tracking-[-0.04em] tabular-nums text-foreground">{indicator.value}</p>
              <p className="mt-2 max-w-xs text-[12px] leading-5 text-foreground-muted">{indicator.detail}</p>
            </div>)}
          </div>
        </div>
      </Bezel>

      <section>
        <div className="mb-5 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div><p className="text-[11px] font-semibold uppercase tracking-[0.15em] text-foreground-muted">Next steps</p><h2 className="mt-2 text-2xl font-semibold text-foreground">Recommendations</h2></div>
          <p className="max-w-xl text-[12px] leading-5 text-foreground-secondary">Suggestions grounded in calculated transaction metrics.</p>
        </div>
        {recommendations.length ? <Bezel>
          <div className="divide-y divide-border/70 px-5 sm:px-7">
            {recommendations.map((recommendation) => <article key={recommendation.id} className="grid gap-2 py-5 first:pt-6 last:pb-6 sm:grid-cols-[minmax(12rem,0.7fr)_1.3fr] sm:gap-8">
              <div className="flex items-start justify-between gap-3 sm:block"><h3 className="text-[14px] font-semibold text-foreground">{recommendation.title}</h3><span className="shrink-0 rounded-full bg-surface-elevated px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.1em] text-primary">{recommendation.impact_level} impact</span></div>
              <p className="text-[13px] leading-6 text-foreground-secondary">{recommendation.description}</p>
            </article>)}
          </div>
        </Bezel> : <div className="rounded-2xl border border-border/70 bg-surface px-5 py-6 text-[13px] text-foreground-secondary">No recommendations were returned for this upload.</div>}
      </section>
    </PageContainer>
  );
}

function ScoreRing({ score }: { score: number }) {
  const circumference = 2 * Math.PI * 47;
  return <div className="relative grid h-40 w-40 shrink-0 place-items-center" role="img" aria-label={`Financial health score ${score.toFixed(0)} out of 100`}>
    <svg viewBox="0 0 112 112" className="h-full w-full -rotate-90" aria-hidden="true">
      <circle cx="56" cy="56" r="47" fill="none" stroke="var(--surface-hover)" strokeWidth="7" />
      <circle cx="56" cy="56" r="47" fill="none" stroke="var(--primary)" strokeWidth="7" strokeLinecap="round" strokeDasharray={`${(score / 100) * circumference} ${circumference}`} />
    </svg>
    <div className="absolute text-center"><p className="text-[2.65rem] font-semibold leading-none tracking-[-0.06em] tabular-nums text-foreground">{score.toFixed(0)}</p><p className="mt-1 text-[10px] font-semibold uppercase tracking-[0.14em] text-foreground-muted">of 100</p></div>
  </div>;
}

function MetricCell({ label, value, note, icon: Icon, index }: { label: string; value: string; note: string; icon: ComponentType<{ className?: string }>; index: number }) {
  return <div className={`flex min-h-36 flex-col justify-between gap-4 border-b border-border/70 py-5 sm:px-4 ${index % 2 === 0 ? "sm:border-r" : "sm:border-r-0"} ${index > 1 ? "sm:border-b-0" : ""} ${index % 2 === 0 ? "sm:pl-0" : ""} ${index % 2 === 1 ? "sm:pr-0" : ""}`}>
    <div className="flex items-center justify-between gap-3"><p className="text-[11px] font-semibold uppercase tracking-[0.09em] text-foreground-muted">{label}</p><Icon className="h-4 w-4 shrink-0 text-primary" /></div>
    <div><p className="text-[1.45rem] font-semibold tracking-[-0.04em] tabular-nums text-foreground">{value}</p><p className="mt-1.5 text-[11px] leading-4 text-foreground-muted">{note}</p></div>
  </div>;
}

function Bezel({ children }: { children: ReactNode }) {
  return <div className="rounded-[1.8rem] bg-surface-elevated p-1.5 ring-1 ring-border/70"><div className="h-full rounded-[calc(1.8rem-0.375rem)] bg-surface ring-1 ring-inset ring-black/[0.025] dark:ring-white/[0.04]">{children}</div></div>;
}

function currency(value: number | undefined) {
  return typeof value === "number" && Number.isFinite(value) ? `₹${value.toLocaleString("en-IN", { maximumFractionDigits: 0 })}` : "—";
}
