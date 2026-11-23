"use client";

import { useRouter } from "next/navigation";
import { ArrowDownRight, ArrowUpRight, HeartPulse, ShieldCheck } from "lucide-react";
import PageContainer from "@/components/ui/PageContainer";
import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { useUploadedAnalysis } from "@/hooks/useUploadedAnalysis";

export default function CustomerCommandCenter() {
  const router = useRouter();
  const { data, isLoading, error, refresh } = useUploadedAnalysis();

  if (isLoading) return <PageContainer><p className="py-12 text-sm text-foreground-secondary">Loading your uploaded financial profile…</p></PageContainer>;
  if (error) return <PageContainer><div role="alert" className="mt-6 rounded-md border border-critical/30 bg-critical/5 p-4 text-sm text-critical">{error}<Button variant="outline" className="ml-3" onClick={() => void refresh()}>Retry</Button></div></PageContainer>;
  if (!data) return <PageContainer><div className="mx-auto max-w-xl py-20 text-center"><h1 className="text-3xl font-heading font-bold text-foreground">Your financial overview</h1><p className="mt-3 text-sm text-foreground-secondary">Upload a bank statement to populate this dashboard with your actual transactions and analysis.</p><Button variant="primary" className="mt-5" onClick={() => router.push("/onboarding/upload")}>Upload a statement</Button></div></PageContainer>;

  const { summary, features, risk } = data;
  const metrics = [
    { label: "Financial health score", value: `${Number(features.financial_health_score || 0).toFixed(0)} / 100`, icon: HeartPulse },
    { label: "Credit-risk band", value: risk?.risk_band || "Not available", icon: ShieldCheck },
    { label: "Income parsed", value: money(summary.total_income), icon: ArrowUpRight },
    { label: "Expenses parsed", value: money(summary.total_expenses), icon: ArrowDownRight },
  ];

  return <PageContainer className="pb-20"><header className="flex flex-col gap-4 border-b border-border pb-6 sm:flex-row sm:items-end sm:justify-between"><div><h1 className="text-3xl font-heading font-bold text-foreground">Your financial overview</h1><p className="mt-2 text-sm text-foreground-secondary">Calculated from {summary.transaction_count.toLocaleString()} transactions parsed from your uploaded statements.</p></div><Button variant="outline" onClick={() => router.push("/transactions")}>Review transactions</Button></header>
    <section className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">{metrics.map(({ label, value, icon: Icon }) => <Card key={label}><CardContent className="p-5"><Icon className="h-4 w-4 text-primary"/><p className="mt-3 text-xs text-foreground-secondary">{label}</p><p className="mt-1 text-xl font-bold tabular-nums text-foreground">{value}</p></CardContent></Card>)}</section>
    <div className="mt-6 grid gap-5 lg:grid-cols-[1fr_1fr]"><Card><CardHeader><CardTitle className="text-sm">Monthly totals from your upload</CardTitle></CardHeader><CardContent>{summary.monthly_trend.length ? <div className="space-y-3">{summary.monthly_trend.map((month: any) => <div key={month.month} className="grid grid-cols-[1fr_auto_auto] gap-3 border-b border-border/60 pb-3 text-xs"><span className="font-semibold text-foreground">{month.month}</span><span className="text-positive">+{money(month.income)}</span><span className="text-critical">−{money(month.expenses)}</span></div>)}</div> : <p className="text-sm text-foreground-secondary">No dated monthly totals were returned for this upload.</p>}</CardContent></Card>
      <Card><CardHeader><CardTitle className="text-sm">Available analysis</CardTitle></CardHeader><CardContent className="grid gap-2 sm:grid-cols-2">{[["Financial health", "/financial-health"], ["Credit risk", "/credit-risk"], ["Fraud alerts", "/fraud"], ["Spending", "/spending"], ["Cash flow", "/cash-flow"], ["Customer segment", "/segments"]].map(([label, path]) => <Button key={path} variant="outline" className="justify-start" onClick={() => router.push(path)}>{label}</Button>)}</CardContent></Card></div>
    <p className="mt-5 text-xs leading-5 text-foreground-muted">Financial metrics are derived from the parsed ledger. Credit-risk and fraud models evaluate this data using pre-trained models; the upload does not retrain them.</p>
  </PageContainer>;
}

function money(value: number) { return `₹${Number(value || 0).toLocaleString("en-IN", { maximumFractionDigits: 0 })}`; }
