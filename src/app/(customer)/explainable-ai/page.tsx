"use client";

import { useEffect, useState } from "react";
import type { ReactNode } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight, Brain } from "lucide-react";
import PageContainer from "@/components/ui/PageContainer";
import { Button } from "@/components/ui/Button";
import { useUploadedAnalysis } from "@/hooks/useUploadedAnalysis";
import { xaiApi } from "@/lib/api";

type Explanation = {
  prediction_id: string;
  default_probability: number;
  risk_band: string;
  explanation: Array<{ feature: string; description: string }>;
  model_version: string;
  created_at: string;
};

const featureLabels: Record<string, string> = {
  savings_rate: "Savings rate",
  income_stability_score: "Income stability",
  discretionary_spending_ratio: "Discretionary spending ratio",
  recurring_expense_ratio: "Recurring expense ratio",
  outlier_transaction_count: "Outlier transaction count",
  emergency_fund_months: "Surplus coverage estimate",
};

export default function ExplainableAIPage() {
  const router = useRouter();
  const uploaded = useUploadedAnalysis();
  const [explanation, setExplanation] = useState<Explanation | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!uploaded.data) return;
    let active = true;
    setLoading(true);
    setError("");
    xaiApi.getExplanation("latest").then((result: Explanation) => {
      if (active) setExplanation(result);
    }).catch((cause) => {
      if (active) setError(cause instanceof Error ? cause.message : "Could not load the explanation for this profile.");
    }).finally(() => {
      if (active) setLoading(false);
    });
    return () => { active = false; };
  }, [uploaded.data]);

  if (uploaded.isLoading) return <PageContainer><p className="py-12 text-sm text-foreground-secondary">Loading uploaded transaction data…</p></PageContainer>;
  if (uploaded.error) return <PageContainer><div role="alert" className="mt-6 rounded-2xl border border-critical/20 bg-critical/5 p-5 text-[13px] text-critical">{uploaded.error}</div></PageContainer>;
  if (!uploaded.data) return <PageContainer><EmptyState onUpload={() => router.push("/onboarding/upload")} /></PageContainer>;
  if (loading) return <PageContainer><p className="py-12 text-sm text-foreground-secondary">Preparing your explanation…</p></PageContainer>;
  if (error) return <PageContainer><div role="alert" className="mt-6 rounded-2xl border border-critical/20 bg-critical/5 p-5 text-[13px] text-critical">{error}</div></PageContainer>;

  const score = explanation?.default_probability ?? uploaded.data.risk?.default_probability;
  const factors = explanation?.explanation || [];

  return (
    <PageContainer className="gap-9 pb-20 sm:gap-11">
      <header className="flex flex-col gap-5 border-b border-border/70 pb-7 sm:flex-row sm:items-end sm:justify-between">
        <div><p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-primary">AI tools · model context</p><h1 className="mt-3 text-4xl font-semibold text-foreground sm:text-[2.65rem]">Credit-risk explanation</h1><p className="mt-3 max-w-3xl text-[14px] leading-6 text-foreground-secondary">A plain-language explanation of your model score, grounded in transaction metrics from this upload.</p></div>
        <Button variant="outline" className="group rounded-full px-4" onClick={() => router.push("/credit-risk")}>Full risk report<span className="ml-1 grid h-7 w-7 place-items-center rounded-full bg-primary/8 text-primary"><ArrowRight className="h-3.5 w-3.5 transition-transform duration-300 ease-[cubic-bezier(0.32,0.72,0,1)] group-hover:translate-x-0.5" /></span></Button>
      </header>

      <section aria-label="Model summary" className="grid overflow-hidden rounded-[1.75rem] border border-border/70 bg-surface shadow-[0_8px_28px_rgba(24,39,31,0.035)] sm:grid-cols-3">
        <Summary label="Default probability" value={score == null ? "Unavailable" : `${(Number(score) * 100).toFixed(1)}%`} index={0} />
        <Summary label="Risk band" value={explanation?.risk_band || uploaded.data.risk?.risk_band || "Unavailable"} index={1} />
        <Summary label="Model version" value={explanation?.model_version || uploaded.data.risk?.model_version || "Unavailable"} index={2} />
      </section>

      <Bezel>
        <div className="p-5 sm:p-7">
          <div className="mb-6 flex items-center gap-3"><span className="grid h-10 w-10 place-items-center rounded-2xl bg-primary/8 text-primary"><Brain className="h-5 w-5" /></span><div><p className="text-[11px] font-semibold uppercase tracking-[0.15em] text-foreground-muted">Generated narrative</p><h2 className="mt-1 text-xl font-semibold text-foreground">How your profile influenced the assessment</h2></div></div>
          {factors.length ? <div className="divide-y divide-border/70">
            {factors.map((factor) => <article key={factor.feature} className="grid gap-3 py-5 first:pt-2 sm:grid-cols-[minmax(11rem,0.65fr)_1.35fr] sm:gap-8">
              <div><h3 className="text-[14px] font-semibold text-foreground">{featureLabels[factor.feature] || factor.feature.replaceAll("_", " ")}</h3><p className="mt-2 text-[11px] text-foreground-muted">From upload <span className="ml-1 font-semibold tabular-nums text-foreground-secondary">{formatFeature(factor.feature, uploaded.data?.features[factor.feature])}</span></p></div>
              <p className="text-[13px] leading-6 text-foreground-secondary">{factor.description}</p>
            </article>)}
          </div> : <p className="py-8 text-[13px] text-foreground-secondary">No explanation was returned for the available metrics.</p>}
          <p className="mt-3 border-t border-border/70 pt-4 text-[11px] leading-5 text-foreground-muted">This is a generated narrative, not internal feature attribution, SHAP, or causal proof. It is based on {uploaded.data.summary.transaction_count.toLocaleString()} uploaded transactions.</p>
        </div>
      </Bezel>
    </PageContainer>
  );
}

function Summary({ label, value, index }: { label: string; value: string; index: number }) {
  return <div className={`flex min-h-28 items-center justify-between gap-4 border-b border-border/70 p-5 sm:p-6 sm:border-b-0 ${index < 2 ? "sm:border-r" : "sm:border-r-0"}`}><div><p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-foreground-muted">{label}</p><p className="mt-3 break-words text-[1.35rem] font-semibold tracking-[-0.04em] text-foreground">{value}</p></div></div>;
}

function EmptyState({ onUpload }: { onUpload: () => void }) {
  return <div className="mx-auto max-w-xl py-20 text-center"><p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-primary">AI tools</p><h1 className="mt-4 text-4xl font-semibold text-foreground">Start with your financial data</h1><p className="mt-4 text-[15px] leading-7 text-foreground-secondary">Upload a statement before requesting an explanation of your model score.</p><Button variant="primary" className="group mt-7 rounded-full px-5" onClick={onUpload}>Upload a statement<span className="ml-1 grid h-7 w-7 place-items-center rounded-full bg-primary-foreground/15"><ArrowRight className="h-3.5 w-3.5" /></span></Button></div>;
}

function Bezel({ children }: { children: ReactNode }) {
  return <div className="rounded-[1.8rem] bg-surface-elevated p-1.5 ring-1 ring-border/70"><div className="h-full rounded-[calc(1.8rem-0.375rem)] bg-surface ring-1 ring-inset ring-black/[0.025] dark:ring-white/[0.04]">{children}</div></div>;
}

function formatFeature(key: string, value: number | undefined) {
  if (typeof value !== "number" || !Number.isFinite(value)) return "Unavailable";
  if (key.endsWith("_rate") || key.endsWith("_ratio") || key === "income_stability_score") return `${(value * 100).toFixed(1)}%`;
  if (key === "emergency_fund_months") return `${value.toFixed(1)} months`;
  return value.toLocaleString("en-IN", { maximumFractionDigits: 2 });
}
