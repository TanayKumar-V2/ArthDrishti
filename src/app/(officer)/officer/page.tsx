"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { ArrowRight, ClipboardList, RefreshCw, ShieldCheck } from "lucide-react";
import PageContainer from "@/components/ui/PageContainer";
import { Button } from "@/components/ui/Button";
import { Card, CardContent } from "@/components/ui/Card";
import { loanOfficerApi, type LoanReviewRecord } from "@/lib/api";

export default function LoanOfficerCommandCenterPage() {
  const [applications, setApplications] = useState<LoanReviewRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      setApplications(await loanOfficerApi.listApplications());
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Could not load the application queue.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { void load(); }, [load]);

  const summary = useMemo(() => ({
    pending: applications.filter((application) => application.status.toLowerCase() === "pending").length,
    approved: applications.filter((application) => application.status.toLowerCase() === "approved").length,
    rejected: applications.filter((application) => application.status.toLowerCase() === "rejected").length,
  }), [applications]);

  const recent = useMemo(() => applications.slice(0, 6), [applications]);

  return (
    <PageContainer className="pb-20">
      <header className="flex flex-col gap-4 border-b border-border pb-6 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="flex items-center gap-2 text-3xl font-heading font-bold text-foreground"><ShieldCheck className="h-7 w-7 text-primary" />Officer command center</h1>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-foreground-secondary">A live view of customer-submitted loan applications and their statement-based risk assessments.</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => void load()} disabled={loading}><RefreshCw className={`mr-2 h-4 w-4 ${loading ? "animate-spin" : ""}`} />Refresh</Button>
          <Button asChild variant="primary"><Link href="/officer/applications">Review queue<ArrowRight className="ml-2 h-4 w-4" /></Link></Button>
        </div>
      </header>

      {error && <div role="alert" className="mt-5 rounded-md border border-critical/30 bg-critical/5 p-4 text-sm text-critical">{error}</div>}

      <section className="mt-6 flex flex-wrap gap-x-8 gap-y-4 border-b border-border pb-5" aria-label="Live application totals">
        <Summary label="Applications" value={loading ? "..." : String(applications.length)} />
        <Summary label="Pending review" value={loading ? "..." : String(summary.pending)} tone="warning" />
        <Summary label="Approved" value={loading ? "..." : String(summary.approved)} tone="positive" />
        <Summary label="Rejected" value={loading ? "..." : String(summary.rejected)} tone="critical" />
      </section>

      <section className="mt-8" aria-labelledby="recent-applications-heading">
        <div className="mb-3 flex items-end justify-between gap-3">
          <div>
            <h2 id="recent-applications-heading" className="text-lg font-semibold text-foreground">Recent applications</h2>
            <p className="mt-1 text-xs text-foreground-secondary">Names, requested amounts, scores, and statuses come from saved customer applications.</p>
          </div>
          <Link href="/officer/applications" className="shrink-0 text-xs font-semibold text-primary underline underline-offset-4">View all</Link>
        </div>

        <Card>
          <CardContent className="p-0">
            {loading ? <p className="p-6 text-sm text-foreground-secondary">Loading live application queue...</p> : recent.length ? (
              <div className="divide-y divide-border/70">
                {recent.map((application) => <div key={application.id} className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between sm:px-5">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold text-foreground">{application.applicant_name}</p>
                    <p className="mt-1 truncate text-xs text-foreground-secondary">{application.purpose} | INR {Number(application.amount).toLocaleString("en-IN")} | {application.term_months} months</p>
                    <p className="mt-1 text-[11px] text-foreground-muted">Health {application.financial_health_score == null ? "unavailable" : `${application.financial_health_score.toFixed(1)} / 100`} | {application.risk_tier} risk</p>
                  </div>
                  <div className="flex shrink-0 items-center gap-3">
                    <Status status={application.status} />
                    {application.status.toLowerCase() === "pending" && <Link href="/officer/applications" className="inline-flex items-center gap-1 text-xs font-semibold text-primary">Review<ArrowRight className="h-3.5 w-3.5" /></Link>}
                  </div>
                </div>)}
              </div>
            ) : (
              <div className="px-6 py-12 text-center">
                <ClipboardList className="mx-auto h-8 w-8 text-foreground-muted" />
                <h3 className="mt-3 text-sm font-semibold text-foreground">No customer applications</h3>
                <p className="mx-auto mt-1 max-w-md text-xs leading-5 text-foreground-secondary">The queue will show applications after customers submit loan requests.</p>
              </div>
            )}
          </CardContent>
        </Card>
      </section>
    </PageContainer>
  );
}

function Summary({ label, value, tone = "neutral" }: { label: string; value: string; tone?: "neutral" | "warning" | "positive" | "critical" }) {
  const valueColor = tone === "warning" ? "text-warning" : tone === "positive" ? "text-positive" : tone === "critical" ? "text-critical" : "text-foreground";
  return <div className="min-w-28">
    <p className="text-xs text-foreground-secondary">{label}</p>
    <p className={`mt-1 text-xl font-semibold tabular-nums ${valueColor}`}>{value}</p>
  </div>;
}

function Status({ status }: { status: string }) {
  const normalized = status.toLowerCase();
  const color = normalized === "approved" ? "text-positive bg-positive/10" : normalized === "rejected" ? "text-critical bg-critical/10" : "text-warning bg-warning/10";
  return <span className={`rounded-full px-2 py-1 text-[11px] font-semibold capitalize ${color}`}>{normalized}</span>;
}
