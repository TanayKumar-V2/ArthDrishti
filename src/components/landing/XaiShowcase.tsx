"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowDownRight, ArrowRight, ArrowUpRight, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils";

const factors = [
  {
    name: "Revolving credit use",
    direction: "May increase risk",
    detail: "High revolving balances can leave less room to absorb a change in income or expenses.",
    positive: false,
  },
  {
    name: "Payment history",
    direction: "May increase risk",
    detail: "Missed or irregular payments can indicate pressure on repayment capacity.",
    positive: false,
  },
  {
    name: "Income consistency",
    direction: "Can support stability",
    detail: "Regular income patterns can give reviewers useful context about repayment capacity.",
    positive: true,
  },
];

export function XaiShowcase() {
  const [activeIdx, setActiveIdx] = useState(0);
  const active = factors[activeIdx];

  return (
    <section id="intelligence" className="bg-background py-20 sm:py-24">
      <div className="mx-auto max-w-7xl px-5 sm:px-8 xl:px-10">
        <div className="max-w-2xl">
          <h2 className="text-3xl font-semibold tracking-[-0.04em] text-foreground sm:text-4xl">A score is more useful when you can explain it.</h2>
          <p className="mt-4 text-[14px] leading-6 text-foreground-secondary">Inspect the financial factors behind an assessment, then explore how a changed input could affect the result.</p>
        </div>

        <div className="mt-10 grid grid-cols-1 gap-8 rounded-[1.25rem] border border-border/70 bg-surface p-5 sm:p-7 lg:grid-cols-[0.9fr_1.1fr] lg:gap-12 lg:p-8">
          <div>
            <div className="flex items-center justify-between gap-4 border-b border-border/70 pb-4">
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.13em] text-foreground-muted">Illustrative example</p>
                <h3 className="mt-1.5 text-[17px] font-semibold text-foreground">Model factors</h3>
              </div>
              <span className="rounded-full border border-border px-3 py-1 text-[10px] font-medium text-foreground-muted">Sample output</span>
            </div>
            <div className="divide-y divide-border/70">
              {factors.map((factor, index) => (
                <button
                  key={factor.name}
                  type="button"
                  onClick={() => setActiveIdx(index)}
                  aria-pressed={activeIdx === index}
                  className={cn("flex w-full items-center gap-3 py-4 text-left transition-colors", activeIdx === index ? "text-foreground" : "text-foreground-secondary hover:text-foreground")}
                >
                  <span className={cn("grid h-8 w-8 shrink-0 place-items-center rounded-full border", factor.positive ? "border-primary/20 bg-primary/5 text-primary" : "border-border bg-surface-elevated text-foreground-muted")}>
                    {factor.positive ? <ArrowDownRight className="h-4 w-4" /> : <ArrowUpRight className="h-4 w-4" />}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block text-[13px] font-medium">{factor.name}</span>
                    <span className={cn("mt-1 block text-[11px]", factor.positive ? "text-primary" : "text-foreground-muted")}>{factor.direction}</span>
                  </span>
                  <ChevronRight className={cn("h-4 w-4 shrink-0", activeIdx === index ? "text-primary" : "text-foreground-muted")} />
                </button>
              ))}
            </div>
          </div>

          <div className="flex min-h-[240px] flex-col justify-between rounded-xl bg-surface-elevated/70 p-5 sm:p-6">
            <div>
              <span className="text-[11px] font-medium text-foreground-muted">Why this matters</span>
              <h3 className="mt-3 text-xl font-semibold tracking-[-0.025em] text-foreground">{active.name}</h3>
              <p className="mt-3 max-w-lg text-[14px] leading-6 text-foreground-secondary">{active.detail}</p>
            </div>
            <div className="mt-8 border-t border-border/70 pt-4">
              <p className="text-[11px] leading-5 text-foreground-muted">The example is illustrative. Actual outputs depend on the data available and the model in use.</p>
              <Button variant="outline" size="sm" asChild className="group mt-4 rounded-full px-4">
                <Link href="/simulator" className="gap-2">Try a scenario<ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" /></Link>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default XaiShowcase;
