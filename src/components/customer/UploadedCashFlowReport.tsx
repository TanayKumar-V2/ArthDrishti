"use client";

import { useCallback, useEffect, useState } from "react";
import type { ComponentType, ReactNode } from "react";
import { ArrowDownRight, ArrowUpRight, RefreshCw, Wallet } from "lucide-react";
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Legend, Tooltip as ChartTooltip } from "recharts";
import PageContainer from "@/components/ui/PageContainer";
import { Button } from "@/components/ui/Button";
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

  return (
    <PageContainer className="gap-9 pb-20 sm:gap-11">
      <header className="flex flex-col gap-5 border-b border-border/70 pb-7 sm:flex-row sm:items-end sm:justify-between">
        <div><p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-primary">Cash flow · {data.summary.transaction_count.toLocaleString()} transactions</p><h1 className="mt-3 text-4xl font-semibold text-foreground sm:text-[2.65rem]">30-day outlook</h1><p className="mt-3 max-w-2xl text-[14px] leading-6 text-foreground-secondary">A model-generated projection based on parsed transaction activity.</p></div>
        <Button variant="outline" className="rounded-full px-5" onClick={() => void loadForecast()} disabled={loading}><RefreshCw className={`mr-2 h-4 w-4 ${loading ? "animate-spin" : ""}`} />{loading ? "Updating…" : "Refresh forecast"}</Button>
      </header>

      {error && <div role="alert" className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-critical/20 bg-critical/5 p-5 text-[13px] text-critical">{error}<Button variant="outline" onClick={() => void loadForecast()}>Try again</Button></div>}

      <section aria-label="Uploaded totals" className="grid overflow-hidden rounded-[1.75rem] border border-border/70 bg-surface shadow-[0_8px_28px_rgba(24,39,31,0.035)] sm:grid-cols-3">
        <Summary label="Recorded income" value={data.summary.total_income} icon={ArrowUpRight} index={0} />
        <Summary label="Recorded expenses" value={data.summary.total_expenses} icon={ArrowDownRight} index={1} />
        <Summary label="Estimated net flow · 30 days" value={last?.projected_balance ?? data.summary.net_cash_flow} icon={Wallet} index={2} />
      </section>

      <Bezel>
        <div className="p-5 sm:p-7">
          <div className="mb-6 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between"><div><p className="text-[11px] font-semibold uppercase tracking-[0.15em] text-foreground-muted">Projected transaction pattern</p><h2 className="mt-2 text-xl font-semibold text-foreground">Daily cash flow</h2></div><p className="text-[11px] text-foreground-muted">Amounts shown in INR</p></div>
          {points.length ? <div className="h-[300px] w-full sm:h-[360px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={points} margin={{ top: 8, right: 12, left: 4, bottom: 2 }}>
                <CartesianGrid vertical={false} stroke="var(--border)" strokeDasharray="2 6" />
                <XAxis dataKey="date" tickLine={false} axisLine={false} tick={{ fill: "var(--foreground-muted)", fontSize: 10 }} minTickGap={24} />
                <YAxis tickLine={false} axisLine={false} width={68} tick={{ fill: "var(--foreground-muted)", fontSize: 10 }} tickFormatter={compactMoney} />
                <ChartTooltip contentStyle={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 14, color: "var(--foreground)", fontSize: 12 }} formatter={(value) => [currency(Number(value)), ""]} />
                <Legend verticalAlign="bottom" height={30} wrapperStyle={{ color: "var(--foreground-secondary)", fontSize: 11 }} />
                <Line type="monotone" dataKey="projected_income" name="Income" stroke="var(--chart-1)" strokeWidth={2.25} dot={false} activeDot={{ r: 4, fill: "var(--chart-1)", stroke: "var(--surface)", strokeWidth: 2 }} />
                <Line type="monotone" dataKey="projected_expense" name="Expenses" stroke="var(--chart-3)" strokeWidth={2} dot={false} activeDot={{ r: 4, fill: "var(--chart-3)", stroke: "var(--surface)", strokeWidth: 2 }} />
                <Line type="monotone" dataKey="projected_balance" name="Net flow" stroke="var(--chart-2)" strokeWidth={2} strokeDasharray="5 4" dot={false} activeDot={{ r: 4, fill: "var(--chart-2)", stroke: "var(--surface)", strokeWidth: 2 }} />
              </LineChart>
            </ResponsiveContainer>
          </div> : <div className="grid min-h-52 place-items-center text-center"><p className="max-w-sm text-[13px] leading-6 text-foreground-secondary">{loading ? "Building your estimate…" : "A forecast will appear when the backend has enough parsed data."}</p></div>}
        </div>
      </Bezel>

      {points.length > 0 && <Bezel>
        <div className="p-5 sm:p-7">
          <div className="mb-5 flex items-center justify-between gap-4"><div><p className="text-[11px] font-semibold uppercase tracking-[0.15em] text-foreground-muted">Forecast detail</p><h2 className="mt-2 text-xl font-semibold text-foreground">Daily estimates</h2></div><span className="text-[11px] text-foreground-muted">{points.length} days</span></div>
          <div className="max-h-[360px] overflow-auto">
            <div className="grid grid-cols-[minmax(5rem,1fr)_repeat(3,minmax(5.5rem,1fr))] gap-3 border-b border-border/70 pb-2 text-[10px] font-semibold uppercase tracking-[0.1em] text-foreground-muted sm:gap-5"><span>Date</span><span className="text-right">Income</span><span className="text-right">Expenses</span><span className="text-right">Net flow</span></div>
            <div className="divide-y divide-border/70">{points.map((point: any, index: number) => <div key={`${point.date}-${index}`} className="grid grid-cols-[minmax(5rem,1fr)_repeat(3,minmax(5.5rem,1fr))] gap-3 py-3.5 text-[11px] sm:gap-5"><span className="text-foreground-secondary">{point.date}</span><span className="text-right font-medium tabular-nums text-positive">{currency(point.projected_income)}</span><span className="text-right font-medium tabular-nums text-foreground">{currency(point.projected_expense)}</span><span className="text-right font-semibold tabular-nums text-foreground">{currency(point.projected_balance)}</span></div>)}</div>
          </div>
        </div>
      </Bezel>}

      <div className="flex items-start gap-3 text-[12px] leading-5 text-foreground-muted"><span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-surface-elevated text-[10px] font-semibold">i</span><p>Projected balance is a modeled net-flow reference, not your bank balance. The statement parser does not read an opening account balance; estimates may be inaccurate.</p></div>
    </PageContainer>
  );
}

function Summary({ label, value, icon: Icon, index }: { label: string; value: number; icon: ComponentType<{ className?: string }>; index: number }) {
  return <div className={`flex min-h-28 items-center justify-between gap-4 border-b border-border/70 p-5 sm:p-6 sm:border-b-0 ${index < 2 ? "sm:border-r" : "sm:border-r-0"}`}>
    <div><p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-foreground-muted">{label}</p><p className="mt-3 text-[1.45rem] font-semibold tracking-[-0.04em] tabular-nums text-foreground">{currency(value)}</p></div><Icon className="h-4 w-4 shrink-0 text-primary" />
  </div>;
}

function Bezel({ children }: { children: ReactNode }) {
  return <div className="rounded-[1.8rem] bg-surface-elevated p-1.5 ring-1 ring-border/70"><div className="h-full rounded-[calc(1.8rem-0.375rem)] bg-surface ring-1 ring-inset ring-black/[0.025] dark:ring-white/[0.04]">{children}</div></div>;
}

function compactMoney(value: number) { return `₹${(Number(value) / 1000).toFixed(0)}k`; }
function currency(value: number) { return `₹${Number(value || 0).toLocaleString("en-IN", { maximumFractionDigits: 0 })}`; }
