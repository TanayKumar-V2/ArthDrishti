"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { CheckCircle2, Clock3, RefreshCw, Search, ShieldCheck, XCircle } from "lucide-react";
import PageContainer from "@/components/ui/PageContainer";
import { Button } from "@/components/ui/Button";
import { loanOfficerApi, type LoanReviewRecord } from "@/lib/api";

type StatusFilter = "all" | "pending" | "approved" | "rejected";

export default function OfficerApplicationsPage() {
  const [applications, setApplications] = useState<LoanReviewRecord[]>([]);
  const [status, setStatus] = useState<StatusFilter>("all");
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadApplications = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      setApplications(await loanOfficerApi.listApplications());
    } catch (cause) {
      const message = cause instanceof Error ? cause.message : "Could not load loan applications.";
      setError(message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { void loadApplications(); }, [loadApplications]);

  const visibleApplications = useMemo(() => {
    const query = search.trim().toLowerCase();
    return applications.filter((application) => {
      if (status !== "all" && application.status.toLowerCase() !== status) return false;
      return !query || [application.applicant_name, application.applicant_email, application.id, application.purpose]
        .some((value) => value.toLowerCase().includes(query));
    });
  }, [applications, search, status]);

  const counts = useMemo(() => ({
    pending: applications.filter((item) => item.status.toLowerCase() === "pending").length,
    approved: applications.filter((item) => item.status.toLowerCase() === "approved").length,
    rejected: applications.filter((item) => item.status.toLowerCase() === "rejected").length,
  }), [applications]);

  return (
    <PageContainer className="pb-20">
      <header className="flex flex-col gap-4 border-b border-border pb-6 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="flex items-center gap-2 text-3xl font-heading font-bold text-foreground"><ShieldCheck className="h-7 w-7 text-primary" />Loan applications</h1>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-foreground-secondary">Review applications submitted by customers, compare their current statement based financial health and risk, then record an officer decision.</p>
        </div>
        <Button variant="outline" onClick={() => void loadApplications()} disabled={loading}><RefreshCw className={`mr-2 h-4 w-4 ${loading ? "animate-spin" : ""}`} />Refresh</Button>
      </header>

      <div className="mt-5 flex flex-wrap gap-x-6 gap-y-2 border-b border-border pb-4 text-sm" aria-label="Application counts">
        <span className="text-foreground-secondary">Loaded: <strong className="text-foreground">{applications.length}</strong></span>
        <span className="text-warning">Pending: <strong>{counts.pending}</strong></span>
        <span className="text-positive">Approved: <strong>{counts.approved}</strong></span>
        <span className="text-critical">Rejected: <strong>{counts.rejected}</strong></span>
      </div>

      {error && <div role="alert" className="mt-5 rounded-md border border-critical/30 bg-critical/5 p-4 text-sm text-critical">{error}<button className="ml-2 font-semibold underline underline-offset-4" onClick={() => void loadApplications()}>Retry</button></div>}

      <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <label className="relative block w-full sm:max-w-sm">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-foreground-muted" />
          <input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search applicant, purpose or ID" className="h-10 w-full rounded-md border border-border bg-surface pl-9 pr-3 text-sm text-foreground outline-none focus-visible:ring-2 focus-visible:ring-primary/40" />
        </label>
        <label className="text-sm text-foreground-secondary">Status
          <select value={status} onChange={(event) => setStatus(event.target.value as StatusFilter)} className="ml-2 h-10 rounded-md border border-border bg-surface px-3 text-sm text-foreground outline-none focus-visible:ring-2 focus-visible:ring-primary/40">
            <option value="all">All statuses</option><option value="pending">Pending</option><option value="approved">Approved</option><option value="rejected">Rejected</option>
          </select>
        </label>
      </div>

      <div className="mt-4 overflow-hidden rounded-lg border border-border bg-surface">
        {loading ? <p className="p-8 text-center text-sm text-foreground-secondary">Loading applications…</p> : visibleApplications.length ? (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[950px] text-left text-sm">
              <thead className="border-b border-border bg-surface-elevated/60 text-[11px] uppercase tracking-wide text-foreground-secondary">
                <tr><th className="px-4 py-3 font-semibold">Applicant</th><th className="px-4 py-3 font-semibold">Request</th><th className="px-4 py-3 font-semibold">Financial health</th><th className="px-4 py-3 font-semibold">Model risk</th><th className="px-4 py-3 font-semibold">Status</th><th className="px-4 py-3 font-semibold">Review</th></tr>
              </thead>
              <tbody className="divide-y divide-border/70">
                {visibleApplications.map((application) => <tr key={application.id} className="align-top hover:bg-surface-hover/50">
                  <td className="px-4 py-4">
                    <p className="font-semibold text-foreground">{application.applicant_name}</p>
                    <p className="mt-1 text-xs text-foreground-secondary">{application.applicant_email}</p>
                    <p className="mt-1 font-mono text-[10px] text-foreground-muted">{application.id.slice(0, 8)} · {formatDate(application.created_at)}</p>
                  </td>
                  <td className="px-4 py-4"><p className="font-semibold text-foreground">₹{Number(application.amount).toLocaleString("en-IN")}</p><p className="mt-1 max-w-52 text-xs text-foreground-secondary">{application.purpose}</p><p className="mt-1 text-xs text-foreground-muted">{application.term_months} months</p></td>
                  <td className="px-4 py-4">{application.financial_health_score == null ? <span className="text-xs text-foreground-muted">No score available</span> : <><p className="font-semibold tabular-nums text-foreground">{application.financial_health_score.toFixed(1)}<span className="font-normal text-foreground-muted"> / 100</span></p><p className="mt-1 text-[11px] text-foreground-secondary">Captured at application time</p></>}</td>
                  <td className="px-4 py-4"><p className="capitalize text-foreground">{application.risk_tier}</p>{application.default_probability != null && <p className="mt-1 text-xs text-foreground-secondary">{(application.default_probability * 100).toFixed(1)}% default probability</p>}</td>
                  <td className="px-4 py-4"><StatusLabel status={application.status} /></td>
                  <td className="px-4 py-4"><Button asChild size="sm" variant="outline"><Link href={`/officer/applications/${encodeURIComponent(application.id)}`}>Full report</Link></Button></td>
                </tr>)}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="px-6 py-14 text-center">
            <Clock3 className="mx-auto h-8 w-8 text-foreground-muted" />
            <h2 className="mt-3 text-sm font-semibold text-foreground">{applications.length ? "No applications match" : "No customer applications yet"}</h2>
            <p className="mx-auto mt-1 max-w-md text-xs leading-5 text-foreground-secondary">{applications.length ? "Clear the search or choose another status." : "When a customer submits an application from their Loan Applications page, it will appear here with the financial score calculated from their statement."}</p>
          </div>
        )}
      </div>
    </PageContainer>
  );
}

function StatusLabel({ status }: { status: string }) {
  const normalized = status.toLowerCase();
  const approved = normalized === "approved";
  const rejected = normalized === "rejected";
  const Icon = approved ? CheckCircle2 : rejected ? XCircle : Clock3;
  const color = approved ? "text-positive" : rejected ? "text-critical" : "text-warning";
  return <span className={`inline-flex items-center gap-1.5 capitalize ${color}`}><Icon className="h-4 w-4" />{normalized}</span>;
}

function formatDate(value: string) {
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? "date unavailable" : date.toLocaleDateString("en-IN", { dateStyle: "medium" });
}
