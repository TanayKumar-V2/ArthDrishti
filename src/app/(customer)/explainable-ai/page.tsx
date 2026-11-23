"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight, Brain } from "lucide-react";
import PageContainer from "@/components/ui/PageContainer";
import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { useUploadedAnalysis } from "@/hooks/useUploadedAnalysis";
import { xaiApi } from "@/lib/api";

type Explanation = {
  prediction_id: string;
  default_probability: number;
  risk_band: string;
  explanation: Array<{ feature: string; contribution: number; description: string }>;
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
  if (uploaded.error) return <PageContainer><div role="alert" className="mt-6 rounded-md border border-critical/30 bg-critical/5 p-4 text-sm text-critical">{uploaded.error}</div></PageContainer>;
  if (!uploaded.data) return <PageContainer><EmptyState onUpload={() => router.push("/onboarding/upload")} /></PageContainer>;
  if (loading) return <PageContainer><p className="py-12 text-sm text-foreground-secondary">Calculating feature contribution estimates…</p></PageContainer>;
  if (error) return <PageContainer><div role="alert" className="mt-6 rounded-md border border-critical/30 bg-critical/5 p-4 text-sm text-critical">{error}</div></PageContainer>;

  const score = explanation?.default_probability ?? uploaded.data.risk?.default_probability;
  const factors = explanation?.explanation || [];

  return <PageContainer className="pb-20">
    <header className="flex flex-col gap-4 border-b border-border pb-6 sm:flex-row sm:items-end sm:justify-between"><div><h1 className="text-3xl font-heading font-bold text-foreground">Credit-risk explanation</h1><p className="mt-2 max-w-2xl text-sm text-foreground-secondary">The score is from the backend model. The indicators below are transparent rule-based estimates calculated from features derived from your uploaded transactions; they are not SHAP values.</p></div><Button variant="outline" onClick={() => router.push("/credit-risk")}>View full risk report <ArrowRight className="ml-2 h-4 w-4"/></Button></header>
    <section className="mt-6 grid gap-4 sm:grid-cols-3"><Metric label="Model default probability" value={score == null ? "Unavailable" : `${(Number(score) * 100).toFixed(1)}%`}/><Metric label="Model risk band" value={explanation?.risk_band || uploaded.data.risk?.risk_band || "Unavailable"}/><Metric label="Model version" value={explanation?.model_version || uploaded.data.risk?.model_version || "Unavailable"}/></section>
    <Card className="mt-6"><CardHeader><CardTitle className="flex items-center gap-2 text-sm"><Brain className="h-4 w-4 text-primary"/>Uploaded feature values and rule estimates</CardTitle></CardHeader><CardContent>
      {factors.length ? <div className="divide-y divide-border/70">{factors.map((factor) => <div key={factor.feature} className="grid gap-2 py-4 sm:grid-cols-[1fr_auto] sm:items-center"><div><p className="text-sm font-semibold text-foreground">{featureLabels[factor.feature] || factor.feature.replaceAll("_", " ")}</p><p className="mt-1 text-xs leading-5 text-foreground-secondary">{factor.description}</p><p className="mt-1 text-[11px] text-foreground-muted">Value from upload: {formatFeature(factor.feature, uploaded.data?.features[factor.feature])}</p></div><span className={`whitespace-nowrap text-xs font-bold tabular-nums ${factor.contribution < 0 ? "text-positive" : "text-critical"}`}>{factor.contribution > 0 ? "+" : ""}{factor.contribution.toFixed(3)} rule estimate</span></div>)}</div> : <p className="text-sm text-foreground-secondary">The backend returned no feature contribution estimates for this score.</p>}
      <p className="mt-4 border-t border-border pt-4 text-xs leading-5 text-foreground-muted">These rule estimates indicate direction only. They are not generated by the risk model, are not additive to its probability, and do not represent bureau data or verified debt history. Analyzed records: {uploaded.data.summary.transaction_count.toLocaleString()}.</p>
    </CardContent></Card>
  </PageContainer>;
}

function Metric({ label, value }: { label: string; value: string }) {
  return <Card><CardContent className="p-5"><p className="text-xs text-foreground-secondary">{label}</p><p className="mt-2 break-words text-xl font-bold text-foreground">{value}</p></CardContent></Card>;
}

function EmptyState({ onUpload }: { onUpload: () => void }) {
  return <div className="mx-auto max-w-xl py-16 text-center"><h1 className="text-2xl font-heading font-bold text-foreground">No uploaded financial data yet</h1><p className="mt-3 text-sm text-foreground-secondary">Upload a statement before requesting a feature explanation.</p><Button variant="primary" className="mt-4" onClick={onUpload}>Upload a statement</Button></div>;
}

function formatFeature(key: string, value: number | undefined) {
  if (typeof value !== "number" || !Number.isFinite(value)) return "Unavailable";
  if (key.endsWith("_rate") || key.endsWith("_ratio") || key === "income_stability_score") return `${(value * 100).toFixed(1)}%`;
  if (key === "emergency_fund_months") return `${value.toFixed(1)} months`;
  return value.toLocaleString("en-IN", { maximumFractionDigits: 2 });
}
