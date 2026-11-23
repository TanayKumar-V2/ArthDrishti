"use client";

import { useCallback, useEffect, useState } from "react";
import { ArrowDownRight, ArrowUpRight, RefreshCw, Wallet, type LucideIcon } from "lucide-react";
import PageContainer from "@/components/ui/PageContainer";
import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { forecastApi } from "@/lib/api";
import type { UploadedAnalysis } from "@/hooks/useUploadedAnalysis";

export function UploadedCashFlowReport({ data }: { data: UploadedAnalysis }) {
  const [forecast, setForecast] = useState<any>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const loadForecast = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      setForecast(await forecastApi.generateForecast("30d"));
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Could not build a forecast from this upload.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { void loadForecast(); }, [loadForecast]);
  const points = Array.isArray(forecast?.data) ? forecast.data : [];
  const last = points.at(-1);

  return <PageContainer className="pb-20">
    <header className="flex flex-col gap-4 border-b border-border pb-6 sm:flex-row sm:items-end sm:justify-between">
      <div><p className="text-xs font-bold uppercase tracking-[0.14em] text-positive">Based on {data.summary.transaction_count.toLocaleString()} uploaded transactions</p><h1 className="mt-2 text-3xl font-heading font-bold text-foreground">Cash flow estimate</h1><p className="mt-2 max-w-2xl text-sm text-foreground-secondary">The projection uses your parsed monthly income and expense averages. The statement parser does not read an opening account balance, so this is cumulative net flow, not a bank balance.</p></div>
      <Button variant="outline" onClick={() => void loadForecast()} disabled={loading}><RefreshCw className="mr-2 h-4 w-4" />{loading ? "Calculating…" : "Refresh forecast"}</Button>
    </header>
    {error && <div role="alert" className="mt-5 rounded-md border border-critical/30 bg-critical/5 p-3 text-sm text-critical">{error}</div>}
    <section className="mt-7 grid gap-4 sm:grid-cols-3">
      <Metric label="Recorded income" value={data.summary.total_income} icon={ArrowUpRight} />
      <Metric label="Recorded expenses" value={data.summary.total_expenses} icon={ArrowDownRight} />
      <Metric label="Estimated net flow after 30 days" value={last?.projected_balance ?? data.summary.net_cash_flow} icon={Wallet} />
    </section>
    <Card className="mt-6"><CardHeader><CardTitle className="text-sm">30-day estimate</CardTitle></CardHeader><CardContent>
      {points.length ? <div className="max-h-[430px] space-y-2 overflow-auto">{points.map((point: any, index: number) => <div key={`${point.date}-${index}`} className="grid grid-cols-[1fr_repeat(3,auto)] gap-3 border-b border-border/60 py-2 text-xs"><span className="text-foreground-secondary">{point.date}</span><span className="text-positive">+{money(point.projected_income)}</span><span className="text-critical">−{money(point.projected_expense)}</span><span className="font-semibold text-foreground">{money(point.projected_balance)}</span></div>)}</div> : <p className="text-sm text-foreground-secondary">{loading ? "Building the estimate…" : "A forecast will appear when the backend has enough parsed data."}</p>}
      <p className="mt-4 text-[11px] leading-5 text-foreground-muted">This is a simple average-based estimate. Income timing is inferred on the first day of each month; it is not a trained time-series forecast and does not include known future bills.</p>
    </CardContent></Card>
  </PageContainer>;
}

function Metric({ label, value, icon: Icon }: { label: string; value: number; icon: LucideIcon }) {
  return <Card><CardContent className="p-5"><Icon className="h-4 w-4 text-primary"/><p className="mt-3 text-xs text-foreground-secondary">{label}</p><p className="mt-1 text-2xl font-bold tabular-nums text-foreground">{money(value)}</p></CardContent></Card>;
}

function money(value: number) { return `₹${Number(value || 0).toLocaleString("en-IN", { maximumFractionDigits: 0 })}`; }
