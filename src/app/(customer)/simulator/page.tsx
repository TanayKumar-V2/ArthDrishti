"use client";

import { useEffect, useState } from "react";
import { ArrowRight, Loader2, RotateCcw, Sparkles } from "lucide-react";
import { toast } from "sonner";

import PageContainer from "@/components/ui/PageContainer";
import { Button } from "@/components/ui/Button";
import { WorkspaceSkeleton } from "@/components/ui/PageLoader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { transactionsApi, xaiApi } from "@/lib/api";

type WhatIfResult = {
  baseline_default_probability: number;
  simulated_default_probability: number;
  delta_probability: number;
  baseline_risk_band: string;
  simulated_risk_band: string;
  baseline_health_score: number;
  simulated_health_score: number;
  impact_summary: string;
  feature_shifts: {
    income_adjusted: number;
    expenses_adjusted: number;
    net_flow_adjusted: number;
    savings_rate_adjusted: number;
  };
};

const money = (value: number) => `₹${Math.round(value).toLocaleString("en-IN")}`;

export default function WhatIfSimulatorPage() {
  const [features, setFeatures] = useState<Record<string, number> | null>(null);
  const [incomeDelta, setIncomeDelta] = useState(0);
  const [expenseDelta, setExpenseDelta] = useState(0);
  const [result, setResult] = useState<WhatIfResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [simulating, setSimulating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    transactionsApi.getFeatures()
      .then((response) => { if (active) setFeatures(response.features); })
      .catch((cause) => { if (active) setError(cause instanceof Error ? cause.message : "Could not load uploaded transaction metrics."); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, []);

  const baselineIncome = Number(features?.monthly_income_avg ?? 0);
  const baselineExpenses = Number(features?.monthly_expense_avg ?? 0);

  const runSimulation = async () => {
    setSimulating(true);
    setError(null);
    try {
      const response = await xaiApi.simulateWhatIf({ income_delta: incomeDelta, expense_delta: expenseDelta });
      setResult(response as WhatIfResult);
    } catch (cause) {
      const message = cause instanceof Error ? cause.message : "Could not evaluate this scenario.";
      setError(message);
      toast.error(message);
    } finally {
      setSimulating(false);
    }
  };

  const reset = () => {
    setIncomeDelta(0);
    setExpenseDelta(0);
    setResult(null);
    setError(null);
  };

  if (loading) return <WorkspaceSkeleton />;
  if (!features) return <PageContainer><div className="mx-auto max-w-xl py-16 text-center"><h1 className="text-2xl font-heading font-bold text-foreground">No statement analytics available</h1><p className="mt-3 text-sm text-foreground-secondary">Upload and process a bank statement before simulating changes to your financial profile.</p>{error && <p className="mt-3 text-sm text-critical">{error}</p>}</div></PageContainer>;

  return (
    <PageContainer className="gap-7 pb-16">
      <header className="space-y-2 border-b border-border/70 pb-6">
        <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-primary">AI tools · scenario planning</p>
        <h1 className="text-3xl font-semibold tracking-tight text-foreground">What-if simulator</h1>
        <p className="max-w-3xl text-sm leading-6 text-foreground-secondary">Adjust monthly income or spending against the metrics from your uploaded statement. Our risk model estimates default probability and overall financial health impact.</p>
      </header>

      <div className="grid gap-5 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)]">
        <Card className="rounded-2xl border-border/70">
          <CardHeader><CardTitle>Scenario inputs</CardTitle></CardHeader>
          <CardContent className="space-y-6">
            <p className="text-xs text-foreground-secondary">Statement baseline: {money(baselineIncome)} monthly income · {money(baselineExpenses)} monthly expenses</p>
            <label className="block space-y-2"><span className="text-sm font-medium text-foreground">Monthly income change</span><input type="number" value={incomeDelta} onChange={(event) => setIncomeDelta(Number(event.target.value) || 0)} className="w-full rounded-lg border border-border bg-surface px-3 py-2.5 text-sm text-foreground"/><span className="block text-xs text-foreground-muted">Scenario income: {money(Math.max(0, baselineIncome + incomeDelta))}</span></label>
            <label className="block space-y-2"><span className="text-sm font-medium text-foreground">Monthly expense change</span><input type="number" value={expenseDelta} onChange={(event) => setExpenseDelta(Number(event.target.value) || 0)} className="w-full rounded-lg border border-border bg-surface px-3 py-2.5 text-sm text-foreground"/><span className="block text-xs text-foreground-muted">Use a negative amount to model reduced spending. Scenario expenses: {money(Math.max(0, baselineExpenses + expenseDelta))}</span></label>
            <div className="flex flex-wrap gap-2"><Button onClick={() => void runSimulation()} disabled={simulating}>{simulating ? <Loader2 className="mr-2 h-4 w-4 animate-spin"/> : <ArrowRight className="mr-2 h-4 w-4"/>}{simulating ? "Evaluating…" : "Evaluate scenario"}</Button><Button variant="outline" onClick={reset}><RotateCcw className="mr-2 h-4 w-4"/>Reset</Button></div>
            {error && <p role="alert" className="text-sm text-critical">{error}</p>}
          </CardContent>
        </Card>

        <Card className="rounded-2xl border-border/70">
          <CardHeader><CardTitle>Model comparison</CardTitle></CardHeader>
          <CardContent>
            {result ? <>
              <div className="grid gap-3 sm:grid-cols-2">
                <Metric label="Default probability" value={`${(result.baseline_default_probability * 100).toFixed(1)}% → ${(result.simulated_default_probability * 100).toFixed(1)}%`} detail={`${result.baseline_risk_band} → ${result.simulated_risk_band} risk band`}/>
                <Metric label="Financial health score" value={`${result.baseline_health_score.toFixed(1)} → ${result.simulated_health_score.toFixed(1)}`} detail="Assessment of baseline and scenario metrics"/>
                <Metric label="Scenario monthly income" value={money(result.feature_shifts.income_adjusted)} detail="Adjusted statement-derived metric"/>
                <Metric label="Scenario monthly expenses" value={money(result.feature_shifts.expenses_adjusted)} detail="Adjusted statement-derived metric"/>
              </div>
              <div className="mt-5 rounded-xl border border-primary/15 bg-primary/[0.035] p-4"><div className="mb-2 flex items-center gap-2 text-sm font-semibold text-foreground"><Sparkles className="h-4 w-4 text-primary"/>Scenario explanation</div><p className="text-sm leading-6 text-foreground-secondary">{result.impact_summary}</p></div>
              <p className="mt-4 text-xs leading-5 text-foreground-muted">This is a model estimate based on the selected statement data, not a lending decision. The statement parser does not provide all liabilities or bureau data.</p>
            </> : <p className="py-10 text-center text-sm text-foreground-secondary">Change an input and evaluate the scenario to see the simulated risk and health results.</p>}
          </CardContent>
        </Card>
      </div>
    </PageContainer>
  );
}

function Metric({ label, value, detail }: { label: string; value: string; detail: string }) {
  return <div className="rounded-xl border border-border/70 bg-surface-elevated/35 p-4"><p className="text-[11px] font-medium text-foreground-muted">{label}</p><p className="mt-2 text-lg font-semibold tabular-nums text-foreground">{value}</p><p className="mt-1 text-xs text-foreground-secondary">{detail}</p></div>;
}
