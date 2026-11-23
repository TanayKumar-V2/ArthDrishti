"use client";

import { useRouter } from "next/navigation";
import { Brain, ReceiptText } from "lucide-react";
import PageContainer from "@/components/ui/PageContainer";
import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";

export function UploadedSegmentReport({ segment, transactionCount }: { segment: any; transactionCount: number }) {
  const router = useRouter();
  const characteristics = segment?.characteristics && typeof segment.characteristics === "object" ? Object.entries(segment.characteristics) : [];
  return <PageContainer className="pb-20">
    <header className="flex flex-col gap-4 border-b border-border pb-6 sm:flex-row sm:items-end sm:justify-between"><div><p className="text-xs font-bold uppercase tracking-[0.14em] text-positive">Classified using your uploaded profile</p><h1 className="mt-2 text-3xl font-heading font-bold text-foreground">Customer segment</h1><p className="mt-2 text-sm text-foreground-secondary">The segment model assigned a cluster from financial features calculated over your statement.</p></div><Button variant="outline" onClick={() => router.push("/transactions")}>Review {transactionCount.toLocaleString()} transactions</Button></header>
    <section className="mt-7 grid gap-4 md:grid-cols-[1fr_2fr]"><Card><CardContent className="p-6"><Brain className="h-5 w-5 text-primary"/><p className="mt-5 text-xs text-foreground-muted">Assigned segment</p><h2 className="mt-1 text-2xl font-bold text-foreground">{segment?.segment_name || segment?.cluster_id || "Segment unavailable"}</h2><p className="mt-3 text-xs text-foreground-secondary">Cluster ID: {segment?.cluster_id || "—"}</p></CardContent></Card>
      <Card><CardHeader><CardTitle className="text-sm">Model characteristics</CardTitle></CardHeader><CardContent>{characteristics.length ? <dl className="grid gap-3 sm:grid-cols-2">{characteristics.map(([key, value]) => <div key={key} className="rounded-sm border border-border p-3"><dt className="text-[11px] capitalize text-foreground-muted">{key.replaceAll("_", " ")}</dt><dd className="mt-1 break-words text-sm font-semibold text-foreground">{typeof value === "object" ? JSON.stringify(value) : String(value)}</dd></div>)}</dl> : <p className="text-sm text-foreground-secondary">The model did not return descriptive characteristics for this cluster.</p>}</CardContent></Card></section>
    <Card className="mt-5"><CardContent className="flex gap-3 p-4"><ReceiptText className="mt-0.5 h-4 w-4 shrink-0 text-foreground-muted"/><p className="text-xs leading-5 text-foreground-secondary">This is a model classification based on the uploaded transaction features. It does not show peer averages or individual customer positions; those require a real cohort dataset. Model version: {segment?.model_version || "not reported"}.</p></CardContent></Card>
  </PageContainer>;
}
