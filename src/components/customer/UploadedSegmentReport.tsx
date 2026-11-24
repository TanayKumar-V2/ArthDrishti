"use client";

import type { ReactNode } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight, Brain, ReceiptText } from "lucide-react";
import { Button } from "@/components/ui/Button";
import PageContainer from "@/components/ui/PageContainer";

export function UploadedSegmentReport({ segment, transactionCount }: { segment: any; transactionCount: number }) {
  const router = useRouter();
  const characteristics = segment?.characteristics && typeof segment.characteristics === "object" ? Object.entries(segment.characteristics) : [];

  return (
    <PageContainer className="gap-9 pb-20 sm:gap-11">
      <header className="flex flex-col gap-5 border-b border-border/70 pb-7 sm:flex-row sm:items-end sm:justify-between">
        <div><p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-primary">Customer profile · model classification</p><h1 className="mt-3 text-4xl font-semibold text-foreground sm:text-[2.65rem]">Your customer segment</h1><p className="mt-3 max-w-2xl text-[14px] leading-6 text-foreground-secondary">A cluster assigned from financial features calculated across your uploaded transactions.</p></div>
        <Button variant="outline" className="group rounded-full px-4" onClick={() => router.push("/transactions")}>Review {transactionCount.toLocaleString()} transactions<span className="ml-1 grid h-7 w-7 place-items-center rounded-full bg-primary/8 text-primary"><ArrowRight className="h-3.5 w-3.5 transition-transform duration-300 ease-[cubic-bezier(0.32,0.72,0,1)] group-hover:translate-x-0.5" /></span></Button>
      </header>

      <section className="grid gap-5 xl:grid-cols-[0.85fr_1.15fr]">
        <Bezel>
          <div className="flex h-full flex-col justify-between gap-12 p-6 sm:p-8">
            <div className="flex items-center justify-between"><span className="grid h-11 w-11 place-items-center rounded-2xl bg-primary/8 text-primary"><Brain className="h-5 w-5" /></span><span className="rounded-full bg-surface-elevated px-3 py-1.5 text-[10px] font-semibold uppercase tracking-[0.12em] text-foreground-muted">Assigned segment</span></div>
            <div><p className="text-[11px] font-semibold uppercase tracking-[0.15em] text-foreground-muted">Your profile cluster</p><h2 className="mt-3 break-words text-[2rem] font-semibold leading-tight tracking-[-0.045em] text-foreground">{segment?.segment_name || segment?.cluster_id || "Segment unavailable"}</h2><p className="mt-4 text-[12px] text-foreground-muted">Cluster ID <span className="ml-2 font-mono font-medium text-foreground-secondary">{segment?.cluster_id || "—"}</span></p></div>
          </div>
        </Bezel>

        <Bezel>
          <div className="p-6 sm:p-8">
            <div className="mb-5"><p className="text-[11px] font-semibold uppercase tracking-[0.15em] text-foreground-muted">How the model describes it</p><h2 className="mt-2 text-xl font-semibold text-foreground">Segment characteristics</h2></div>
            {characteristics.length ? <dl className="grid gap-x-8 sm:grid-cols-2">
              {characteristics.map(([key, value]) => <div key={key} className="border-t border-border/70 py-4"><dt className="text-[11px] font-medium capitalize text-foreground-muted">{key.replaceAll("_", " ")}</dt><dd className="mt-1.5 break-words text-[14px] font-semibold text-foreground">{typeof value === "object" ? JSON.stringify(value) : String(value)}</dd></div>)}
            </dl> : <p className="py-6 text-[13px] leading-6 text-foreground-secondary">The model did not return descriptive characteristics for this cluster.</p>}
          </div>
        </Bezel>
      </section>

      <div className="flex items-start gap-3 text-[12px] leading-5 text-foreground-muted"><span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-surface-elevated"><ReceiptText className="h-3 w-3" /></span><p>This classification uses features from your uploaded transactions. It does not show peer averages or individual customer positions because no cohort data is available. Model version: {segment?.model_version || "not reported"}.</p></div>
    </PageContainer>
  );
}

function Bezel({ children }: { children: ReactNode }) {
  return <div className="rounded-[1.8rem] bg-surface-elevated p-1.5 ring-1 ring-border/70"><div className="h-full rounded-[calc(1.8rem-0.375rem)] bg-surface ring-1 ring-inset ring-black/[0.025] dark:ring-white/[0.04]">{children}</div></div>;
}
