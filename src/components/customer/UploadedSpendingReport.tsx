"use client";

import type { ComponentType, ReactNode } from "react";
import { useRouter } from "next/navigation";
import { ArrowDownRight, ArrowRight, ArrowUpRight, ReceiptText } from "lucide-react";
import { Button } from "@/components/ui/Button";
import PageContainer from "@/components/ui/PageContainer";
import type { UploadedAnalysis } from "@/hooks/useUploadedAnalysis";

export function UploadedSpendingReport({ data }: { data: UploadedAnalysis }) {
  const router = useRouter();
  const categories = data.summary.category_breakdown || [];
  const months = data.summary.monthly_trend || [];

  return (
    <PageContainer className="gap-9 pb-20 sm:gap-11">
      <header className="flex flex-col gap-5 border-b border-border/70 pb-7 sm:flex-row sm:items-end sm:justify-between">
        <div><p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-primary">Spending · {data.summary.transaction_count.toLocaleString()} transactions</p><h1 className="mt-3 text-4xl font-semibold text-foreground sm:text-[2.65rem]">Spending analysis</h1><p className="mt-3 text-[14px] leading-6 text-foreground-secondary">Actual totals and categories calculated from transactions parsed from your statement.</p></div>
        <Button variant="outline" className="group rounded-full px-4" onClick={() => router.push("/transactions")}>Review transactions<span className="ml-1 grid h-7 w-7 place-items-center rounded-full bg-primary/8 text-primary"><ArrowRight className="h-3.5 w-3.5 transition-transform duration-300 ease-[cubic-bezier(0.32,0.72,0,1)] group-hover:translate-x-0.5" /></span></Button>
      </header>

      <section aria-label="Statement totals" className="grid overflow-hidden rounded-[1.75rem] border border-border/70 bg-surface shadow-[0_8px_28px_rgba(24,39,31,0.035)] sm:grid-cols-3">
        <Summary label="Income parsed" amount={data.summary.total_income} icon={ArrowUpRight} index={0} />
        <Summary label="Expenses parsed" amount={data.summary.total_expenses} icon={ArrowDownRight} index={1} />
        <Summary label="Transactions" amount={data.summary.transaction_count} icon={ReceiptText} index={2} plain />
      </section>

      <section className="grid gap-5 xl:grid-cols-[1.2fr_0.8fr]">
        <Bezel>
          <div className="p-5 sm:p-7">
            <div className="mb-6"><p className="text-[11px] font-semibold uppercase tracking-[0.15em] text-foreground-muted">Where your money went</p><h2 className="mt-2 text-xl font-semibold text-foreground">Expense categories</h2></div>
            {categories.length ? <div className="divide-y divide-border/70">
              {categories.map((item: any) => <div key={item.category} className="py-4 first:pt-1 last:pb-1">
                <div className="flex items-baseline justify-between gap-4"><span className="text-[13px] font-medium text-foreground">{item.category}</span><span className="text-[13px] font-semibold tabular-nums text-foreground">{currency(item.amount)}</span></div>
                <div className="mt-3 h-1 overflow-hidden rounded-full bg-surface-hover"><div className="h-full rounded-full bg-primary" style={{ width: `${Math.max(0, Math.min(100, Number(item.percentage) || 0))}%` }} /></div>
                <p className="mt-2 text-[11px] text-foreground-muted">{item.count} transactions <span className="px-1.5 text-border-strong">·</span> {Number(item.percentage || 0).toFixed(1)}% of recorded expenses</p>
              </div>)}
            </div> : <p className="py-6 text-[13px] text-foreground-secondary">No expense categories were parsed.</p>}
          </div>
        </Bezel>

        <Bezel>
          <div className="p-5 sm:p-7">
            <div className="mb-5"><p className="text-[11px] font-semibold uppercase tracking-[0.15em] text-foreground-muted">By month</p><h2 className="mt-2 text-xl font-semibold text-foreground">Income &amp; expenses</h2></div>
            {months.length ? <div>
              <div className="grid grid-cols-[minmax(4.5rem,1fr)_minmax(5.5rem,1fr)_minmax(5.5rem,1fr)] gap-2 border-b border-border/70 pb-2 text-[10px] font-semibold uppercase tracking-[0.1em] text-foreground-muted sm:gap-3"><span>Month</span><span className="text-right">Income</span><span className="text-right">Expenses</span></div>
              <div className="divide-y divide-border/70">{months.slice(-8).reverse().map((month: any) => <div key={month.month} className="grid grid-cols-[minmax(4.5rem,1fr)_minmax(5.5rem,1fr)_minmax(5.5rem,1fr)] gap-2 py-4 text-[11px] sm:gap-3"><span className="font-medium text-foreground-secondary">{month.month}</span><span className="text-right font-semibold tabular-nums text-positive">{currency(month.income)}</span><span className="text-right font-medium tabular-nums text-foreground">{currency(month.expenses)}</span></div>)}</div>
            </div> : <p className="py-6 text-[13px] text-foreground-secondary">The uploaded statement does not contain enough dates to show monthly totals.</p>}
          </div>
        </Bezel>
      </section>

      <p className="max-w-4xl text-[12px] leading-5 text-foreground-muted">Categories are assigned from merchant descriptions. Review the transaction list and correct any category that looks wrong.</p>
    </PageContainer>
  );
}

function Summary({ label, amount, icon: Icon, index, plain = false }: { label: string; amount: number; icon: ComponentType<{ className?: string }>; index: number; plain?: boolean }) {
  return <div className={`flex min-h-28 items-center justify-between gap-4 border-b border-border/70 p-5 sm:p-6 sm:border-b-0 ${index < 2 ? "sm:border-r" : "sm:border-r-0"}`}>
    <div><p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-foreground-muted">{label}</p><p className="mt-3 text-[1.55rem] font-semibold tracking-[-0.04em] tabular-nums text-foreground">{plain ? amount.toLocaleString() : currency(amount)}</p></div><Icon className="h-4 w-4 shrink-0 text-primary" />
  </div>;
}

function Bezel({ children }: { children: ReactNode }) {
  return <div className="rounded-[1.8rem] bg-surface-elevated p-1.5 ring-1 ring-border/70"><div className="h-full rounded-[calc(1.8rem-0.375rem)] bg-surface ring-1 ring-inset ring-black/[0.025] dark:ring-white/[0.04]">{children}</div></div>;
}

function currency(value: number) { return `₹${Number(value || 0).toLocaleString("en-IN", { maximumFractionDigits: 0 })}`; }
