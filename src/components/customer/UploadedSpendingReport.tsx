"use client";

import { useRouter } from "next/navigation";
import { ArrowDownRight, ArrowUpRight, ReceiptText, Wallet } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import PageContainer from "@/components/ui/PageContainer";
import type { UploadedAnalysis } from "@/hooks/useUploadedAnalysis";

export function UploadedSpendingReport({ data }: { data: UploadedAnalysis }) {
  const router = useRouter();
  const categories = data.summary.category_breakdown || [];
  const months = data.summary.monthly_trend || [];

  return (
    <PageContainer className="pb-20">
      <header className="flex flex-col gap-4 border-b border-border pb-6 sm:flex-row sm:items-end sm:justify-between">
        <div><p className="text-xs font-bold uppercase tracking-[0.14em] text-positive">Uploaded data · {data.summary.transaction_count.toLocaleString()} transactions</p><h1 className="mt-2 text-3xl font-heading font-bold text-foreground">Spending analysis</h1><p className="mt-2 text-sm text-foreground-secondary">Actual totals and categories calculated from transactions parsed from your statement.</p></div>
        <Button variant="outline" onClick={() => router.push("/transactions")}>Review transactions</Button>
      </header>

      <section className="mt-7 grid gap-4 sm:grid-cols-3">
        <Summary label="Income parsed" amount={data.summary.total_income} icon={ArrowUpRight} />
        <Summary label="Expenses parsed" amount={data.summary.total_expenses} icon={ArrowDownRight} />
        <Summary label="Transaction count" amount={data.summary.transaction_count} icon={ReceiptText} plain />
      </section>

      <section className="mt-8 grid gap-5 lg:grid-cols-[1.2fr_0.8fr]">
        <Card>
          <CardHeader><CardTitle className="text-sm">Expense categories from your upload</CardTitle></CardHeader>
          <CardContent>
            {categories.length ? <div className="space-y-4">{categories.map((item: any) => <div key={item.category}>
              <div className="flex items-baseline justify-between gap-3"><span className="text-sm font-medium text-foreground">{item.category}</span><span className="text-sm font-bold tabular-nums text-foreground">{currency(item.amount)}</span></div>
              <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-surface-elevated"><div className="h-full rounded-full bg-primary" style={{ width: `${Math.max(0, Math.min(100, Number(item.percentage) || 0))}%` }} /></div>
              <p className="mt-1 text-[11px] text-foreground-muted">{item.count} transactions · {Number(item.percentage || 0).toFixed(1)}% of recorded expenses</p>
            </div>)}</div> : <p className="text-sm text-foreground-secondary">No expense categories were parsed.</p>}
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle className="flex items-center gap-2 text-sm"><Wallet className="h-4 w-4 text-primary" /> Monthly totals</CardTitle></CardHeader>
          <CardContent>
            {months.length ? <div className="space-y-3">{months.map((month: any) => <div key={month.month} className="grid grid-cols-[1fr_auto_auto] gap-3 border-b border-border/60 pb-3 text-xs"><span className="font-semibold text-foreground">{month.month}</span><span className="text-positive">+{currency(month.income)}</span><span className="text-critical">−{currency(month.expenses)}</span></div>)}</div> : <p className="text-sm text-foreground-secondary">The uploaded statement does not contain enough dates to show monthly totals.</p>}
            <p className="mt-4 text-[11px] leading-5 text-foreground-muted">Category labels are assigned by the backend’s description rules. Review the transaction list if a merchant was categorized incorrectly.</p>
          </CardContent>
        </Card>
      </section>
    </PageContainer>
  );
}

function Summary({ label, amount, icon: Icon, plain = false }: { label: string; amount: number; icon: LucideIcon; plain?: boolean }) {
  return <Card><CardContent className="p-5"><Icon className="h-4 w-4 text-primary" /><p className="mt-3 text-xs text-foreground-secondary">{label}</p><p className="mt-1 text-2xl font-bold tabular-nums text-foreground">{plain ? amount.toLocaleString() : currency(amount)}</p></CardContent></Card>;
}

function currency(value: number) {
  return `₹${Number(value || 0).toLocaleString("en-IN", { maximumFractionDigits: 0 })}`;
}
