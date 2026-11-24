"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { ArrowLeft, Check, CircleAlert, ShieldCheck, X } from "lucide-react";
import { toast } from "sonner";
import PageContainer from "@/components/ui/PageContainer";
import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { loanOfficerApi, type LoanApplicantAnalysis } from "@/lib/api";

export default function LoanApplicantAnalysisPage() {
  const params = useParams();
  const applicationId = params?.id as string;
  const [analysis, setAnalysis] = useState<LoanApplicantAnalysis | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [decisionLoading, setDecisionLoading] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      setAnalysis(await loanOfficerApi.getApplicantAnalysis(applicationId));
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Could not load the applicant analysis.");
    } finally {
      setLoading(false);
    }
  }, [applicationId]);

  useEffect(() => { void load(); }, [load]);

  const decide = async (decision: "approved" | "rejected") => {
    const application = analysis?.application;
    if (!application) return;
    const action = decision === "approved" ? "Approve" : "Reject";
    if (!window.confirm(`${action} ${application.applicant_name}'s request for INR ${money(application.amount)}?`)) return;
    setDecisionLoading(true);
    try {
      await loanOfficerApi.decide(application.id, decision);
      setAnalysis((current) => current ? { ...current, application: { ...current.application, status: decision } } : current);
      toast.success(`Application ${decision}.`);
    } catch (cause) {
      toast.error(cause instanceof Error ? cause.message : `Could not ${action.toLowerCase()} this application.`);
    } finally {
      setDecisionLoading(false);
    }
  };

  if (loading) return <PageContainer><p className="mt-8 text-sm text-foreground-secondary">Loading full applicant report...</p></PageContainer>;
  if (error) return <PageContainer>
    <Button asChild variant="outline"><Link href="/officer/applications"><ArrowLeft className="mr-2 h-4 w-4" />Applications</Link></Button>
    <div role="alert" className="mt-5 rounded-md border border-critical/30 bg-critical/5 p-4 text-sm text-critical">{error}<Button className="ml-3" size="sm" variant="outline" onClick={() => void load()}>Retry</Button></div>
  </PageContainer>;
  if (!analysis) return null;

  const { application, features, credit_risk: risk } = analysis;
  const pending = application.status.toLowerCase() === "pending";
  const additionalFeatures = [
    { label: "Expense volatility", value: `INR ${money(features.expense_volatility)}` },
    { label: "Recurring expense share", value: percent(features.recurring_expense_ratio) },
    { label: "Discretionary spending share", value: percent(features.discretionary_spending_ratio) },
    { label: "Credit-to-debit ratio", value: `${numeric(features.credit_to_debit_ratio).toFixed(2)}x` },
    { label: "Average debit", value: `INR ${money(features.average_transaction_amount)}` },
    { label: "Largest debit", value: `INR ${money(features.max_single_debit_amount)}` },
    { label: "Transactions per month", value: numeric(features.transaction_frequency_monthly).toFixed(1) },
    { label: "Weekend spend share", value: percent(features.weekend_spending_percentage) },
    { label: "Cash withdrawal share", value: percent(features.cash_withdrawal_ratio) },
    { label: "Category diversity", value: numeric(features.category_diversity_entropy).toFixed(2) },
    { label: "Salary regularity", value: `${numeric(features.salary_regularity_days).toFixed(1)} days` },
    { label: "Outlier debit count", value: String(numeric(features.outlier_transaction_count)) },
    { label: "Outlier threshold", value: `INR ${money(features.outlier_threshold_amount)}` },
    { label: "Months analyzed", value: String(numeric(features.active_months_analyzed)) },
  ];

  return (
    <PageContainer className="pb-20">
      <Button asChild variant="outline"><Link href="/officer/applications"><ArrowLeft className="mr-2 h-4 w-4" />Applications</Link></Button>
      <header className="mt-5 flex flex-col gap-4 border-b border-border pb-6 md:flex-row md:items-end md:justify-between">
        <div className="min-w-0">
          <h1 className="truncate text-3xl font-heading font-bold text-foreground">{application.applicant_name}</h1>
          <p className="mt-1 text-sm text-foreground-secondary">{application.applicant_email}</p>
          <p className="mt-2 text-xs text-foreground-muted">Application {application.id} | Submitted {dateTime(application.created_at)}</p>
        </div>
        <Status status={application.status} />
      </header>

      {analysis.analysis_basis === "review_time_backfill" && <p className="mt-4 rounded-md border border-warning/30 bg-warning/5 p-3 text-xs leading-5 text-warning">This application predates saved analysis snapshots. Analytics below were generated from the applicant's currently available parsed statements at review time.</p>}

      <section className="mt-6 grid gap-4 lg:grid-cols-[1fr_1.4fr]">
        <Card>
          <CardHeader><CardTitle className="text-sm">Loan request</CardTitle></CardHeader>
          <CardContent className="space-y-3 text-sm">
            <DataRow label="Requested amount" value={`INR ${money(application.amount)}`} strong />
            <DataRow label="Purpose" value={application.purpose} />
            <DataRow label="Repayment term" value={`${application.term_months} months`} />
            <DataRow label="Rate" value={`${Number(application.interest_rate).toFixed(2)}% p.a.`} />
            <DataRow label="Application status" value={title(application.status)} />
          </CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle className="text-sm">Credit and financial health assessment</CardTitle></CardHeader>
          <CardContent>
            <div className="grid gap-5 sm:grid-cols-3">
              <Metric label="Financial health" value={`${risk.financial_health_score.toFixed(1)} / 100`} detail={String(features.financial_health_rating || "Health assessment")} />
              <Metric label="Predicted default probability" value={`${(risk.default_probability * 100).toFixed(1)}%`} detail={`Model risk: ${title(risk.risk_band)}`} />
              <Metric label="Model version" value={risk.model_version} detail="Score captured for this application" />
            </div>
            <p className="mt-4 border-t border-border pt-3 text-xs leading-5 text-foreground-secondary">These model outputs are decision support. The officer records the final loan decision.</p>
          </CardContent>
        </Card>
      </section>

      <section className="mt-8" aria-labelledby="statement-summary-heading">
        <div className="mb-3 flex flex-wrap items-end justify-between gap-2">
          <div>
            <h2 id="statement-summary-heading" className="text-lg font-semibold text-foreground">Statement analytics</h2>
            <p className="mt-1 text-xs text-foreground-secondary">Computed from {analysis.transaction_count.toLocaleString("en-IN")} parsed transactions | {dateOnly(analysis.period_start)} to {dateOnly(analysis.period_end)}</p>
          </div>
          <span className="text-xs text-foreground-muted">{analysis.source_document_names.length ? analysis.source_document_names.join(", ") : "Statement file names unavailable"}</span>
        </div>
        <div className="grid gap-x-6 gap-y-4 border-y border-border py-4 sm:grid-cols-2 lg:grid-cols-4">
          <Metric label="Total income" value={`INR ${money(features.total_income)}`} />
          <Metric label="Total expenses" value={`INR ${money(features.total_expenses)}`} />
          <Metric label="Monthly net cash flow" value={`INR ${money(features.net_monthly_cash_flow)}`} />
          <Metric label="Average monthly income" value={`INR ${money(features.monthly_income_avg)}`} />
          <Metric label="Average monthly expenses" value={`INR ${money(features.monthly_expense_avg)}`} />
          <Metric label="Savings rate" value={percent(features.savings_rate)} />
          <Metric label="Income stability" value={percent(features.income_stability_score)} />
          <Metric label="Emergency fund estimate" value={`${numeric(features.emergency_fund_months).toFixed(1)} months`} detail="Surplus-based estimate from this data" />
        </div>
        <div className="grid gap-x-6 gap-y-4 border-b border-border py-4 sm:grid-cols-2 lg:grid-cols-4">
          {additionalFeatures.map((item) => <Metric key={item.label} label={item.label} value={item.value} />)}
        </div>
        <p className="mt-2 text-[11px] leading-5 text-foreground-muted">Statement transactions do not establish account balances, liabilities, bureau scores, or verified salary. The emergency-fund figure is estimated from recorded inflows and outflows.</p>
      </section>

      <div className="mt-8 grid gap-6 xl:grid-cols-2">
        <Card>
          <CardHeader><CardTitle className="text-sm">Monthly cash flow</CardTitle></CardHeader>
          <CardContent className="p-0">
            {analysis.monthly_cash_flow.length ? <div className="overflow-x-auto"><table className="w-full min-w-[480px] text-left text-xs">
              <thead className="border-y border-border bg-surface-elevated/60 text-[10px] uppercase tracking-wide text-foreground-secondary"><tr><th className="px-4 py-2.5">Month</th><th className="px-4 py-2.5">Income</th><th className="px-4 py-2.5">Expenses</th><th className="px-4 py-2.5">Net</th></tr></thead>
              <tbody className="divide-y divide-border/70">{analysis.monthly_cash_flow.map((month) => <tr key={month.month}><td className="px-4 py-3 font-medium text-foreground">{month.month}</td><td className="px-4 py-3">INR {money(month.income)}</td><td className="px-4 py-3">INR {money(month.expenses)}</td><td className={`px-4 py-3 font-semibold ${month.net_savings >= 0 ? "text-positive" : "text-critical"}`}>INR {money(month.net_savings)}</td></tr>)}</tbody>
            </table></div> : <Empty text="No monthly cash-flow history is available." />}
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle className="text-sm">Spending by category</CardTitle></CardHeader>
          <CardContent className="p-0">
            {analysis.spending_breakdown.length ? <div className="overflow-x-auto"><table className="w-full min-w-[420px] text-left text-xs">
              <thead className="border-y border-border bg-surface-elevated/60 text-[10px] uppercase tracking-wide text-foreground-secondary"><tr><th className="px-4 py-2.5">Category</th><th className="px-4 py-2.5">Amount</th><th className="px-4 py-2.5">Share</th><th className="px-4 py-2.5">Transactions</th></tr></thead>
              <tbody className="divide-y divide-border/70">{analysis.spending_breakdown.map((item) => <tr key={item.category}><td className="px-4 py-3 font-medium text-foreground">{item.category}</td><td className="px-4 py-3">INR {money(item.amount)}</td><td className="px-4 py-3">{item.percentage.toFixed(1)}%</td><td className="px-4 py-3">{item.count}</td></tr>)}</tbody>
            </table></div> : <Empty text="No categorized debit transactions are available." />}
          </CardContent>
        </Card>
      </div>

      <section className="mt-8 grid gap-6 xl:grid-cols-2">
        <Card>
          <CardHeader><CardTitle className="text-sm">Explainable risk signals</CardTitle></CardHeader>
          <CardContent>
            <p className="mb-4 text-xs leading-5 text-foreground-secondary">Narrative summary based on the applicant's trained-model risk result and parsed transaction metrics.</p>
            {analysis.xai_contributions.length ? <ul className="divide-y divide-border/70">{analysis.xai_contributions.map((item) => <li key={item.feature} className="flex gap-4 py-3">
              <span className="mt-0.5 w-32 shrink-0 text-[11px] font-semibold text-primary">Risk insight</span>
              <div className="min-w-0"><p className="text-xs font-medium text-foreground">{humanize(item.feature)}</p><p className="mt-1 text-xs leading-5 text-foreground-secondary">{item.description}</p></div>
            </li>)}</ul> : <Empty text="No explainability signals are available." />}
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle className="text-sm">Fraud intelligence</CardTitle></CardHeader>
          <CardContent>
            <div className="mb-3 flex flex-wrap gap-x-6 gap-y-2 text-xs"><span>Saved alerts: <strong className="text-foreground">{analysis.fraud_summary.saved_alert_count ?? 0}</strong></span><span>Flagged transactions: <strong className="text-foreground">{analysis.fraud_summary.flagged_transaction_count ?? 0}</strong></span></div>
            <p className="mb-4 text-xs leading-5 text-foreground-secondary">Scan status: <strong className="font-semibold text-foreground">{title(analysis.fraud_summary.scan_status)}</strong>. {analysis.fraud_summary.basis_note}</p>
            {analysis.fraud_alerts.length ? <ul className="divide-y divide-border/70">{analysis.fraud_alerts.slice(0, 8).map((alert) => <li key={alert.transaction_id} className="py-3">
              <div className="flex flex-wrap justify-between gap-2"><p className="text-xs font-semibold text-foreground">{alert.description}</p><span className="text-xs font-semibold text-critical">{title(alert.risk_level)} | INR {money(alert.amount)}</span></div>
              <p className="mt-1 text-[11px] text-foreground-secondary">{dateOnly(alert.transaction_date)} | {alert.category} | {alert.status}</p>
              {alert.reasons.length > 0 && <p className="mt-1 text-[11px] text-foreground-muted">{alert.reasons.join("; ")}</p>}
            </li>)}</ul> : <Empty text="No saved fraud alerts for these statements. This does not mean a new fraud scan was run during this review." />}
          </CardContent>
        </Card>
      </section>

      <div className="mt-8 grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader><CardTitle className="text-sm">Customer segment</CardTitle></CardHeader>
          <CardContent>
            {analysis.segment ? <>
              <p className="text-lg font-semibold text-foreground">{analysis.segment.segment_name}</p>
              <p className="mt-1 text-xs text-foreground-secondary">Segment {analysis.segment.cluster_id}</p>
              {Object.entries(analysis.segment.characteristics).length > 0 && <dl className="mt-4 divide-y divide-border/70">{Object.entries(analysis.segment.characteristics).map(([key, value]) => <DataRow key={key} label={humanize(key)} value={displayValue(value)} />)}</dl>}
            </> : <Empty text="No customer segment was returned for this analysis." />}
          </CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle className="text-sm">Financial recommendations</CardTitle></CardHeader>
          <CardContent>
            <p className="mb-3 text-xs leading-5 text-foreground-secondary">Actionable guidance grounded in the applicant's observed transaction metrics.</p>
            {analysis.recommendations.length ? <ul className="space-y-3">{analysis.recommendations.map((item) => <li key={item.title} className="border-b border-border/70 pb-3 last:border-0"><p className="text-xs font-semibold text-foreground">{item.title}</p><p className="mt-1 text-xs leading-5 text-foreground-secondary">{item.reason}</p></li>)}</ul> : <Empty text="No recommendations available for these transaction metrics." />}
          </CardContent>
        </Card>
      </div>

      <footer className="mt-8 flex flex-col gap-3 border-t border-border pt-5 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-xs text-foreground-muted">Analysis saved {dateTime(analysis.generated_at)} | {analysis.analysis_basis === "application_time" ? "Captured when the customer applied" : "Generated at review time"}</p>
        {pending ? <div className="flex gap-2"><Button variant="outline" disabled={decisionLoading} onClick={() => void decide("rejected")}><X className="mr-2 h-4 w-4" />Reject</Button><Button variant="primary" disabled={decisionLoading} onClick={() => void decide("approved")}><Check className="mr-2 h-4 w-4" />Approve</Button></div> : <Status status={application.status} />}
      </footer>
    </PageContainer>
  );
}

function Metric({ label, value, detail }: { label: string; value: string; detail?: string }) {
  return <div><p className="text-[11px] text-foreground-secondary">{label}</p><p className="mt-1 break-words text-base font-semibold tabular-nums text-foreground">{value}</p>{detail && <p className="mt-1 text-[11px] text-foreground-muted">{detail}</p>}</div>;
}

function DataRow({ label, value, strong = false }: { label: string; value: string; strong?: boolean }) {
  return <div className="flex items-start justify-between gap-4 py-2"><span className="text-xs text-foreground-secondary">{label}</span><span className={`max-w-[65%] text-right text-xs ${strong ? "font-semibold text-foreground" : "text-foreground"}`}>{value}</span></div>;
}

function Empty({ text }: { text: string }) {
  return <div className="flex items-start gap-2 py-4 text-xs leading-5 text-foreground-secondary"><CircleAlert className="mt-0.5 h-4 w-4 shrink-0 text-foreground-muted" />{text}</div>;
}

function Status({ status }: { status: string }) {
  const normalized = status.toLowerCase();
  const tone = normalized === "approved" ? "text-positive bg-positive/10" : normalized === "rejected" ? "text-critical bg-critical/10" : "text-warning bg-warning/10";
  return <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold capitalize ${tone}`}><ShieldCheck className="h-3.5 w-3.5" />{normalized}</span>;
}

function money(value: number | string | null | undefined) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed.toLocaleString("en-IN", { maximumFractionDigits: 2 }) : "--";
}

function numeric(value: number | string | null | undefined) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
}

function percent(value: number | string | null | undefined) {
  return `${(numeric(value) * 100).toFixed(1)}%`;
}

function dateOnly(value: string | null | undefined) {
  if (!value) return "date unavailable";
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? "date unavailable" : date.toLocaleDateString("en-IN", { dateStyle: "medium" });
}

function dateTime(value: string | null | undefined) {
  if (!value) return "date unavailable";
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? "date unavailable" : date.toLocaleString("en-IN", { dateStyle: "medium", timeStyle: "short" });
}

function title(value: string) {
  return value.replaceAll("_", " ").replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function humanize(value: string) {
  return title(value.replaceAll("_", " "));
}

function displayValue(value: unknown): string {
  if (value == null) return "Not available";
  if (typeof value === "number") return value.toLocaleString("en-IN", { maximumFractionDigits: 2 });
  if (typeof value === "boolean") return value ? "Yes" : "No";
  if (typeof value === "string") return value;
  return JSON.stringify(value);
}
