"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { CheckCircle2, RefreshCw } from "lucide-react";
import { toast } from "sonner";
import PageContainer from "@/components/ui/PageContainer";
import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
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

  if (uploaded.isLoading) return <PageContainer><p className="py-12 text-sm text-foreground-secondary">Loading uploaded transaction data…</p></PageContainer>;
  if (uploaded.error) return <PageContainer><div role="alert" className="mt-6 rounded-md border border-critical/30 bg-critical/5 p-4 text-sm text-critical">{uploaded.error}</div></PageContainer>;
  if (!uploaded.data) return <PageContainer><div className="mx-auto max-w-xl py-16 text-center"><h1 className="text-2xl font-heading font-bold text-foreground">No uploaded financial data yet</h1><p className="mt-3 text-sm text-foreground-secondary">Upload a statement to calculate transaction features and check which recommendation rules apply.</p><Button variant="primary" className="mt-4" onClick={() => router.push("/onboarding/upload")}>Upload a statement</Button></div></PageContainer>;

  return <PageContainer className="pb-20"><header className="flex flex-col gap-4 border-b border-border pb-6 sm:flex-row sm:items-end sm:justify-between"><div><h1 className="text-3xl font-heading font-bold text-foreground">Recommendations</h1><p className="mt-2 max-w-2xl text-sm text-foreground-secondary">These are rule-based suggestions triggered by features calculated from your uploaded transactions. Potential benefits and completion progress are not estimated.</p></div><Button variant="outline" onClick={() => void loadRecommendations()} disabled={loading}><RefreshCw className="mr-2 h-4 w-4"/>{loading ? "Refreshing…" : "Refresh"}</Button></header>
    <p className="mt-4 text-xs text-foreground-muted">Source: {uploaded.data.summary.transaction_count.toLocaleString()} uploaded transactions · {items.length} active suggestion{items.length === 1 ? "" : "s"}</p>
    {error && <div role="alert" className="mt-5 rounded-md border border-critical/30 bg-critical/5 p-4 text-sm text-critical">{error}</div>}
    {loading && !items.length ? <p className="py-12 text-center text-sm text-foreground-secondary">Checking recommendation rules…</p> : items.length ? <section className="mt-5 space-y-3">{items.map((item) => <Card key={item.id}><CardHeader className="flex flex-row items-start justify-between gap-4 space-y-0"><div><p className="text-[10px] font-bold uppercase tracking-wider text-primary">{item.category} · {item.impact_level} priority</p><CardTitle className="mt-2 text-base">{item.title}</CardTitle></div><Button variant="outline" size="sm" disabled={updatingId === item.id} onClick={() => void dismiss(item.id)}><CheckCircle2 className="mr-2 h-4 w-4"/>Dismiss</Button></CardHeader><CardContent><p className="text-sm leading-6 text-foreground-secondary">{item.description}</p><p className="mt-3 text-[11px] text-foreground-muted">Generated {new Date(item.created_at).toLocaleString()}</p></CardContent></Card>)}</section> : !error && <div className="mt-8 rounded-md border border-border p-8 text-center"><h2 className="text-base font-semibold text-foreground">No recommendation rules were triggered</h2><p className="mt-2 text-sm text-foreground-secondary">The current rule checks found no suggestions for the uploaded transaction features.</p></div>}
  </PageContainer>;
}
