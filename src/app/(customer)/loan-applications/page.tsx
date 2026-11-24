"use client";

import { useCallback, useEffect, useState, type FormEvent } from "react";
import Link from "next/link";
import { ArrowUpRight, CheckCircle2, Clock3, FileText, HandCoins, XCircle } from "lucide-react";
import { toast } from "sonner";
import PageContainer from "@/components/ui/PageContainer";
import { Button } from "@/components/ui/Button";
import { LoadingState } from "@/components/ui/FeedbackState";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { loansApi, type LoanRecord } from "@/lib/api";

const fieldClass = "mt-1.5 h-10 w-full rounded-md border border-border bg-surface px-3 text-sm text-foreground outline-none focus-visible:ring-2 focus-visible:ring-primary/40";

export default function CustomerLoanApplicationsPage() {
  const [loans, setLoans] = useState<LoanRecord[]>([]);
  const [amount, setAmount] = useState("");
  const [purpose, setPurpose] = useState("");
  const [termMonths, setTermMonths] = useState("12");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const loadLoans = useCallback(async () => {
    setError("");
    try {
      setLoans(await loansApi.listLoans());
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Could not load your applications.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { void loadLoans(); }, [loadLoans]);

  const submitApplication = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSubmitting(true);
    setError("");
    try {
      const created = await loansApi.apply({ amount: Number(amount), purpose: purpose.trim(), term_months: Number(termMonths) });
      setLoans((current) => [created, ...current]);
      setAmount("");
      setPurpose("");
      toast.success("Your application was submitted for officer review.");
    } catch (cause) {
      const message = cause instanceof Error ? cause.message : "Could not submit your application.";
      setError(message);
      toast.error(message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <PageContainer className="pb-20">
      <header className="border-b border-border pb-6">
        <h1 className="flex items-center gap-2 text-3xl font-heading font-bold text-foreground"><HandCoins className="h-7 w-7 text-primary" />Loan applications</h1>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-foreground-secondary">Apply for a loan and track the decision. Your selected statement transactions are scored when you submit, then the application is sent to the officer review queue.</p>
      </header>

      {error && <div role="alert" className="mt-5 rounded-md border border-critical/30 bg-critical/5 p-4 text-sm text-critical">{error}</div>}

      <div className="mt-6 grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(280px,0.8fr)]">
        <Card>
          <CardHeader><CardTitle className="text-base">Start an application</CardTitle></CardHeader>
          <CardContent>
            <form onSubmit={(event) => void submitApplication(event)} className="space-y-4">
              <label className="block text-sm font-medium text-foreground">Requested amount (INR)
                <input required min="1" step="0.01" type="number" inputMode="decimal" value={amount} onChange={(event) => setAmount(event.target.value)} className={fieldClass} placeholder="e.g. 250000" />
              </label>
              <label className="block text-sm font-medium text-foreground">Purpose
                <input required minLength={3} maxLength={255} value={purpose} onChange={(event) => setPurpose(event.target.value)} className={fieldClass} placeholder="What will the loan be used for?" />
              </label>
              <label className="block text-sm font-medium text-foreground">Repayment term
                <select value={termMonths} onChange={(event) => setTermMonths(event.target.value)} className={fieldClass}>
                  {[6, 12, 18, 24, 36, 48, 60, 84, 120].map((months) => <option value={months} key={months}>{months} months</option>)}
                </select>
              </label>
              <Button type="submit" variant="primary" disabled={submitting}>{submitting ? "Submitting…" : "Submit application"}<ArrowUpRight className="ml-2 h-4 w-4" /></Button>
            </form>
            <p className="mt-4 border-t border-border pt-3 text-xs leading-5 text-foreground-secondary">Applications require parsed transactions. If you selected a source in Data Sources, the score uses that source; otherwise it uses all your parsed statements. <Link className="font-medium text-primary underline underline-offset-4" href="/data-sources">Check your data sources</Link>.</p>
          </CardContent>
        </Card>

        <section aria-labelledby="my-applications-heading">
          <h2 id="my-applications-heading" className="mb-3 text-lg font-semibold text-foreground">Your applications</h2>
          <Card>
            <CardContent className="p-0">
              {loading ? <LoadingState message="Loading applications..." /> : loans.length ? (
                <ul className="divide-y divide-border/70">
                  {loans.map((loan) => <li key={loan.id} className="p-4">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <p className="truncate text-sm font-semibold text-foreground">{loan.purpose}</p>
                        <p className="mt-1 text-xs text-foreground-secondary">INR {Number(loan.amount).toLocaleString("en-IN")} | {loan.term_months} months</p>
                      </div>
                      <StatusBadge status={loan.status} />
                    </div>
                    <p className="mt-2 text-xs text-foreground-muted">Submitted {formatDate(loan.created_at)} · {loan.risk_tier} risk tier</p>
                  </li>)}
                </ul>
              ) : (
                <div className="px-5 py-10 text-center">
                  <FileText className="mx-auto h-7 w-7 text-foreground-muted" />
                  <p className="mt-3 text-sm font-semibold text-foreground">No applications yet</p>
                  <p className="mt-1 text-xs leading-5 text-foreground-secondary">After you submit, its status and risk tier will appear here.</p>
                </div>
              )}
            </CardContent>
          </Card>
        </section>
      </div>
    </PageContainer>
  );
}

function StatusBadge({ status }: { status: string }) {
  const normalized = status.toLowerCase();
  const approved = normalized === "approved";
  const rejected = normalized === "rejected";
  const Icon = approved ? CheckCircle2 : rejected ? XCircle : Clock3;
  const tone = approved ? "text-positive bg-positive/10" : rejected ? "text-critical bg-critical/10" : "text-warning bg-warning/10";
  return <span className={`inline-flex shrink-0 items-center gap-1 rounded-full px-2 py-1 text-[11px] font-semibold capitalize ${tone}`}><Icon className="h-3.5 w-3.5" />{normalized}</span>;
}

function formatDate(value: string) {
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? "date unavailable" : date.toLocaleDateString("en-IN", { dateStyle: "medium" });
}
