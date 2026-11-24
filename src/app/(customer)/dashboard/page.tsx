"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import type { ComponentType, ReactNode } from "react";
import { ArrowDownRight, ArrowRight, ArrowUpRight, HeartPulse, ShieldCheck } from "lucide-react";
import PageContainer from "@/components/ui/PageContainer";
import { Button } from "@/components/ui/Button";
import { useUploadedAnalysis } from "@/hooks/useUploadedAnalysis";

const analysisLinks = [
  ["Financial health", "/financial-health"],
  ["Credit risk", "/credit-risk"],
  ["Fraud alerts", "/fraud"],
  ["Spending", "/spending"],
  ["Cash flow", "/cash-flow"],
  ["Customer segment", "/segments"],
] as const;

export default function CustomerCommandCenter() {
  const router = useRouter();
  const { data, isLoading, error, refresh } = useUploadedAnalysis();

  if (isLoading) return <PageContainer><p className="py-12 text-sm text-foreground-secondary">Loading your uploaded financial profile…</p></PageContainer>;
  if (error) return <PageContainer><div role="alert" className="mt-6 flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-critical/20 bg-critical/5 p-5 text-sm text-critical">{error}<Button variant="outline" onClick={() => void refresh()}>Retry</Button></div></PageContainer>;
  if (!data) return <PageContainer><div className="mx-auto max-w-xl py-20 text-center"><p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-primary">Your workspace</p><h1 className="mt-4 text-4xl font-semibold text-foreground">Your financial overview</h1><p className="mt-4 text-[15px] leading-7 text-foreground-secondary">Upload a bank statement to populate this dashboard with your transactions and analysis.</p><Button variant="primary" className="group mt-7 rounded-full px-5" onClick={() => router.push("/onboarding/upload")}>Upload a statement<span className="ml-1 grid h-7 w-7 place-items-center rounded-full bg-primary-foreground/15"><ArrowRight className="h-3.5 w-3.5 transition-transform duration-300 ease-[cubic-bezier(0.32,0.72,0,1)] group-hover:translate-x-0.5" /></span></Button></div></PageContainer>;

  const { summary, features, risk } = data;
  const score = Number(features.financial_health_score || 0);
  const monthlyRows = summary.monthly_trend.slice(-6).reverse();

  return (
    <PageContainer className="gap-8 pb-20 sm:gap-10">
      <header className="flex flex-col gap-5 border-b border-border/70 pb-7 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-primary">Overview · account snapshot</p>
          <h1 className="mt-3 text-4xl font-semibold text-foreground sm:text-[2.65rem]">Your financial overview</h1>
          <p className="mt-3 max-w-2xl text-[14px] leading-6 text-foreground-secondary">A clear view of the activity parsed from {summary.transaction_count.toLocaleString()} transactions.</p>
        </div>
        <Button variant="outline" className="group rounded-full px-4" onClick={() => router.push("/transactions")}>Review transactions<span className="ml-1 grid h-7 w-7 place-items-center rounded-full bg-primary/8 text-primary"><ArrowRight className="h-3.5 w-3.5 transition-transform duration-300 ease-[cubic-bezier(0.32,0.72,0,1)] group-hover:translate-x-0.5" /></span></Button>
      </header>

      <section aria-label="Financial summary" className="grid overflow-hidden rounded-[1.75rem] border border-border/70 bg-surface shadow-[0_8px_28px_rgba(24,39,31,0.035)] sm:grid-cols-2 xl:grid-cols-4">
        <SummaryMetric index={0} label="Financial health" value={`${score.toFixed(0)} / 100`} icon={HeartPulse} detail={String(features.financial_health_rating || "Current assessment")} />
        <SummaryMetric index={1} label="Credit risk" value={risk?.risk_band || "Not available"} icon={ShieldCheck} detail="Model assessment from this upload" />
        <SummaryMetric index={2} label="Income parsed" value={money(summary.total_income)} icon={ArrowUpRight} detail="Across the uploaded period" />
        <SummaryMetric index={3} label="Expenses parsed" value={money(summary.total_expenses)} icon={ArrowDownRight} detail="Across the uploaded period" />
      </section>

      <section className="grid gap-5 xl:grid-cols-[1.35fr_0.85fr]">
        <Bezel>
          <div className="flex flex-col gap-5 p-5 sm:p-7">
            <div className="flex items-end justify-between gap-4">
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-foreground-muted">Monthly activity</p>
                <h2 className="mt-2 text-xl font-semibold text-foreground">Income &amp; expenses</h2>
              </div>
              <Link href="/transactions" className="shrink-0 text-[13px] font-semibold text-primary hover:text-primary/80">All transactions <span aria-hidden="true">↗</span></Link>
            </div>
            {monthlyRows.length ? (
              <div>
                <div className="grid grid-cols-[minmax(5rem,1fr)_minmax(6rem,1fr)_minmax(6rem,1fr)] gap-3 border-b border-border/70 pb-2 text-[10px] font-semibold uppercase tracking-[0.12em] text-foreground-muted sm:gap-5"><span>Month</span><span className="text-right">Income</span><span className="text-right">Expenses</span></div>
                <div className="divide-y divide-border/70">
                {monthlyRows.map((month: any) => (
                  <div key={month.month} className="grid grid-cols-[minmax(5rem,1fr)_minmax(6rem,1fr)_minmax(6rem,1fr)] items-center gap-3 py-4 first:pt-2 last:pb-1 sm:gap-5">
                    <span className="text-[13px] font-medium text-foreground-secondary">{month.month}</span>
                    <Amount amount={month.income} tone="positive" />
                    <Amount amount={month.expenses} tone="neutral" />
                  </div>
                ))}
                </div>
              </div>
            ) : <p className="py-8 text-sm text-foreground-secondary">Monthly totals will appear when dated transactions are available.</p>}
          </div>
        </Bezel>

        <Bezel>
          <div className="p-5 sm:p-7">
            <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-foreground-muted">Explore your data</p>
            <h2 className="mt-2 text-xl font-semibold text-foreground">Analysis</h2>
            <nav aria-label="Financial analysis" className="mt-5 divide-y divide-border/70">
              {analysisLinks.map(([label, href], index) => (
                <Link key={href} href={href} className="group flex items-center justify-between gap-4 py-3.5 text-[13px] font-medium text-foreground-secondary first:pt-1 hover:text-primary">
                  <span className="flex items-center gap-3"><span className="font-mono text-[10px] tabular-nums text-foreground-muted">0{index + 1}</span>{label}</span>
                  <ArrowRight className="h-4 w-4 -translate-x-1 opacity-0 transition-all duration-300 ease-[cubic-bezier(0.32,0.72,0,1)] group-hover:translate-x-0 group-hover:opacity-100" />
                </Link>
              ))}
            </nav>
          </div>
        </Bezel>
      </section>

      <p className="max-w-4xl text-[12px] leading-5 text-foreground-muted">Financial metrics come from the parsed ledger. Credit-risk and fraud models evaluate the uploaded data using pre-trained models; your upload does not retrain them.</p>
    </PageContainer>
  );
}

function SummaryMetric({ index, label, value, detail, icon: Icon }: { index: number; label: string; value: string; detail: string; icon: ComponentType<{ className?: string }> }) {
  const position = index % 2 === 0 ? "sm:border-r" : "sm:border-r-0";
  const rowEnd = index > 1 ? "sm:border-b-0" : "";
  const desktopEdge = index === 3 ? "xl:border-r-0" : "xl:border-r";
  return <div className={`relative flex min-h-32 flex-col justify-between gap-4 border-b border-border/70 p-5 sm:p-6 xl:border-b-0 ${position} ${rowEnd} ${desktopEdge}`}>
    <div className="flex items-center justify-between gap-3"><span className="text-[11px] font-semibold uppercase tracking-[0.12em] text-foreground-muted">{label}</span><Icon className="h-4 w-4 shrink-0 text-primary" /></div>
    <div><p className="truncate text-[1.35rem] font-semibold tracking-[-0.04em] tabular-nums text-foreground">{value}</p><p className="mt-1.5 text-[11px] leading-4 text-foreground-muted">{detail}</p></div>
  </div>;
}

function Amount({ amount, tone }: { amount: number; tone: "positive" | "neutral" }) {
  return <div className="text-right"><span className={`text-[13px] font-semibold tabular-nums ${tone === "positive" ? "text-positive" : "text-foreground"}`}>{money(amount)}</span></div>;
}

function Bezel({ children }: { children: ReactNode }) {
  return <div className="rounded-[1.8rem] bg-surface-elevated p-1.5 ring-1 ring-border/70"><div className="h-full rounded-[calc(1.8rem-0.375rem)] bg-surface ring-1 ring-inset ring-black/[0.025] dark:ring-white/[0.04]">{children}</div></div>;
}

function money(value: number) { return `₹${Number(value || 0).toLocaleString("en-IN", { maximumFractionDigits: 0 })}`; }
