"use client";

import { useCallback, useEffect, useState } from "react";
import type { ReactNode } from "react";
import { useRouter } from "next/navigation";
import { CheckCircle2, RefreshCw } from "lucide-react";
import { toast } from "sonner";
import PageContainer from "@/components/ui/PageContainer";
import { Button } from "@/components/ui/Button";
import { LoadingState } from "@/components/ui/FeedbackState";
import { WorkspaceSkeleton } from "@/components/ui/PageLoader";
import { recommendationsApi } from "@/lib/api";
import { useUploadedAnalysis } from "@/hooks/useUploadedAnalysis";

type Recommendation = Awaited<ReturnType<typeof recommendationsApi.list>>[number];

export default function RecommendationsCenterPage() {
  const router = useRouter();
  const uploaded = useUploadedAnalysis();
  const [items, setItems] = useState<Recommendation[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const loadRecommendations = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      setItems(await recommendationsApi.list());
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Could not load recommendations for this upload.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (uploaded.data) void loadRecommendations();
  }, [uploaded.data, loadRecommendations]);

  const dismiss = async (id: string) => {
    setUpdatingId(id);
    try {
      await recommendationsApi.dismiss(id);
      setItems((current) => current.filter((item) => item.id !== id));
      toast.success("Recommendation dismissed.");
    } catch (cause) {
      toast.error(cause instanceof Error ? cause.message : "Could not dismiss this recommendation.");
    } finally {
      setUpdatingId(null);
    }
  };

  if (uploaded.isLoading) return <WorkspaceSkeleton />;
  if (uploaded.error) return <PageContainer><div role="alert" className="mt-6 rounded-2xl border border-critical/20 bg-critical/5 p-5 text-[13px] text-critical">{uploaded.error}</div></PageContainer>;
  if (!uploaded.data) return <PageContainer><div className="mx-auto max-w-xl py-20 text-center"><p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-primary">AI tools</p><h1 className="mt-4 text-4xl font-semibold text-foreground">Recommendations for your profile</h1><p className="mt-4 text-[15px] leading-7 text-foreground-secondary">Upload a statement to generate suggestions from your transaction metrics.</p><Button variant="primary" className="mt-7 rounded-full px-6" onClick={() => router.push("/onboarding/upload")}>Upload a statement</Button></div></PageContainer>;

  return (
    <PageContainer className="gap-8 pb-20 sm:gap-10">
      <header className="flex flex-col gap-5 border-b border-border/70 pb-7 sm:flex-row sm:items-end sm:justify-between">
        <div><p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-primary">AI tools · next steps</p><h1 className="mt-3 text-4xl font-semibold text-foreground sm:text-[2.65rem]">Recommendations</h1><p className="mt-3 max-w-2xl text-[14px] leading-6 text-foreground-secondary">Suggestions generated from metrics calculated from your uploaded transactions. Use them as guidance, not guaranteed outcomes.</p></div>
        <Button variant="outline" className="rounded-full px-5" onClick={() => void loadRecommendations()} disabled={loading}><RefreshCw className={`mr-2 h-4 w-4 ${loading ? "animate-spin" : ""}`} />{loading ? "Refreshing…" : "Refresh"}</Button>
      </header>

      <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[12px] text-foreground-muted"><span>{uploaded.data.summary.transaction_count.toLocaleString()} transactions analyzed</span><span className="text-border-strong">·</span><span>{items.length} active {items.length === 1 ? "suggestion" : "suggestions"}</span></div>
      {error && <div role="alert" className="rounded-2xl border border-critical/20 bg-critical/5 p-5 text-[13px] text-critical">{error}</div>}

      {loading && !items.length ? <LoadingState message="Preparing recommendations..." /> : items.length ? <Bezel>
        <div className="divide-y divide-border/70 px-5 sm:px-7">
          {items.map((item) => <article key={item.id} className="grid gap-4 py-6 first:pt-7 last:pb-7 lg:grid-cols-[minmax(14rem,0.72fr)_1.28fr_auto] lg:items-start lg:gap-8">
            <div><p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-primary">{item.category} <span className="px-1 text-border-strong">·</span> {item.impact_level} priority</p><h2 className="mt-2 text-[16px] font-semibold leading-snug text-foreground">{item.title}</h2></div>
            <div><p className="text-[13px] leading-6 text-foreground-secondary">{item.description}</p><p className="mt-3 text-[10px] text-foreground-muted">Created {new Date(item.created_at).toLocaleString()}</p></div>
            <Button variant="ghost" size="sm" className="justify-self-start rounded-full px-3 text-foreground-secondary lg:justify-self-end" disabled={updatingId === item.id} onClick={() => void dismiss(item.id)}><CheckCircle2 className="mr-2 h-4 w-4" />{updatingId === item.id ? "Dismissing…" : "Dismiss"}</Button>
          </article>)}
        </div>
      </Bezel> : !error && <Bezel><div className="grid min-h-64 content-center justify-items-center px-6 py-12 text-center"><span className="grid h-11 w-11 place-items-center rounded-2xl bg-surface-elevated text-primary"><CheckCircle2 className="h-5 w-5" /></span><h2 className="mt-4 text-xl font-semibold text-foreground">You’re all caught up</h2><p className="mt-2 max-w-md text-[13px] leading-6 text-foreground-secondary">No recommendations were returned for the metrics currently available.</p></div></Bezel>}
    </PageContainer>
  );
}

function Bezel({ children }: { children: ReactNode }) {
  return <div className="rounded-[1.8rem] bg-surface-elevated p-1.5 ring-1 ring-border/70"><div className="h-full rounded-[calc(1.8rem-0.375rem)] bg-surface ring-1 ring-inset ring-black/[0.025] dark:ring-white/[0.04]">{children}</div></div>;
}
