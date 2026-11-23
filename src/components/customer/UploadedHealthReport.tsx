"use client";

import { useEffect, useState } from "react";
import { ArrowUpRight, HeartPulse, ReceiptText, ShieldCheck, Wallet } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import PageContainer from "@/components/ui/PageContainer";
import { recommendationsApi } from "@/lib/api";
import type { UploadedAnalysis } from "@/hooks/useUploadedAnalysis";

export function UploadedHealthReport({ data }: { data: UploadedAnalysis }) {
  const [recommendations, setRecommendations] = useState<Array<{ id: string; title: string; description: string; impact_level: string }>>([]);
  const features = data.features;
  const score = Number(features.financial_health_score || 0);

  useEffect(() => {
    recommendationsApi.list().then(setRecommendations).catch(() => setRecommendations([]));
  }, []);

  const metrics = [
    { label: "Average monthly income", value: currency(features.monthly_income_avg), note: "Credits parsed from the uploaded period", icon: Wallet },
    { label: "Average monthly expenses", value: currency(features.monthly_expense_avg), note: "Debits parsed from the uploaded period", icon: ReceiptText },
    { label: "Net monthly cash flow", value: currency(features.net_monthly_cash_flow), note: "Income less expenses in the analyzed period", icon: ArrowUpRight },
    { label: "Savings rate", value: `${(Number(features.savings_rate || 0) * 100).toFixed(1)}%`, note: "Derived from recorded credits and debits", icon: ShieldCheck },
  ];

  return (
    <PageContainer className="pb-20">
      <header className="flex flex-col gap-4 border-b border-border pb-6 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.14em] text-positive">Uploaded data · {data.summary.transaction_count.toLocaleString()} transactions</p>
          <h1 className="mt-2 text-3xl font-heading font-bold text-foreground">Financial health</h1>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-foreground-secondary">Calculated from transaction records uploaded to this account. No credit-bureau or account-balance data was supplied.</p>
        </div>
        <Button variant="outline" onClick={() => window.location.assign("/transactions")}>Review transactions</Button>
      </header>

      <section className="mt-7 grid gap-4 lg:grid-cols-[1.05fr_2fr]">
        <Card className="flex min-h-52 flex-col justify-between">
          <CardHeader><CardTitle className="flex items-center gap-2 text-sm"><HeartPulse className="h-4 w-4 text-primary" /> Financial health score</CardTitle></CardHeader>
          <CardContent className="pb-5">
            <p className="text-5xl font-heading font-bold tabular-nums text-foreground">{score.toFixed(0)}<span className="ml-1 text-base font-medium text-foreground-secondary">/100</span></p>
            <p className="mt-2 text-sm font-semibold text-primary">{healthRating(score)}</p>
            <p className="mt-3 text-xs text-foreground-secondary">Computed by the backend feature formula from this uploaded ledger.</p>
          </CardContent>
        </Card>

        <div className="grid gap-4 sm:grid-cols-2">
          {metrics.map(({ label, value, note, icon: Icon }) => (
            <Card key={label}>
              <CardContent className="p-5">
                <Icon className="h-4 w-4 text-primary" />
                <p className="mt-3 text-xs font-medium text-foreground-secondary">{label}</p>
                <p className="mt-1 text-xl font-bold tabular-nums text-foreground">{value}</p>
                <p className="mt-1 text-[11px] leading-4 text-foreground-muted">{note}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      <section className="mt-8 grid gap-4 md:grid-cols-3">
        <Metric title="Income stability" value={`${(Number(features.income_stability_score || 0) * 100).toFixed(0)}%`} detail="Backend estimate from month-to-month income variation." />
        <Metric title="Discretionary spending share" value={`${(Number(features.discretionary_spending_ratio || 0) * 100).toFixed(1)}%`} detail="Share of recorded expenses classified as discretionary." />
        <Metric title="Surplus coverage estimate" value={`${Number(features.emergency_fund_months || 0).toFixed(1)} months`} detail="Estimated from recorded surplus; this is not an observed account balance." />
      </section>

      <section className="mt-9">
        <div className="mb-4 border-b border-border pb-3">
          <h2 className="text-lg font-heading font-semibold text-foreground">Recommendations from this upload</h2>
          <p className="mt-1 text-xs text-foreground-secondary">Rule-based recommendations generated from the backend’s calculated transaction features.</p>
        </div>
        {recommendations.length ? <div className="grid gap-4 md:grid-cols-2">
          {recommendations.map((recommendation) => <Card key={recommendation.id}><CardContent className="p-5">
            <div className="flex items-start justify-between gap-3"><h3 className="text-sm font-semibold text-foreground">{recommendation.title}</h3><span className="shrink-0 text-[10px] font-bold uppercase text-primary">{recommendation.impact_level} impact</span></div>
            <p className="mt-2 text-sm leading-5 text-foreground-secondary">{recommendation.description}</p>
          </CardContent></Card>)}
        </div> : <p className="rounded-md border border-border p-4 text-sm text-foreground-secondary">No recommendations were returned for this upload.</p>}
      </section>
    </PageContainer>
  );
}

function Metric({ title, value, detail }: { title: string; value: string; detail: string }) {
  return <Card><CardContent className="p-5"><p className="text-xs text-foreground-secondary">{title}</p><p className="mt-2 text-xl font-bold tabular-nums text-foreground">{value}</p><p className="mt-2 text-xs leading-5 text-foreground-muted">{detail}</p></CardContent></Card>;
}

function currency(value: number | undefined) {
  return typeof value === "number" && Number.isFinite(value) ? `₹${value.toLocaleString("en-IN", { maximumFractionDigits: 0 })}` : "—";
}

function healthRating(score: number) {
  if (score >= 80) return "Excellent";
  if (score >= 65) return "Good";
  if (score >= 50) return "Fair";
  return "Needs attention";
}
