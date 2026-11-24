"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { Download, Search, ShieldAlert } from "lucide-react";
import { toast } from "sonner";
import PageContainer from "@/components/ui/PageContainer";
import { Button } from "@/components/ui/Button";
import { LoadingState } from "@/components/ui/FeedbackState";
import { Card, CardContent } from "@/components/ui/Card";
import { transactionsApi } from "@/lib/api";

type LedgerTransaction = {
  id: string;
  transaction_date: string;
  description: string;
  amount: number;
  transaction_type: string;
  category: string;
  is_flagged: boolean;
};

const categories = ["Salary & Income", "Investments & Savings", "Food & Dining", "Shopping & Retail", "Utilities & Bills", "Housing & Rent", "Transportation & Travel", "Entertainment & Subscriptions", "Health & Medical", "Cash & ATM", "Other Income", "Other Expenses"];

export default function TransactionsExplorerPage() {
  const [transactions, setTransactions] = useState<LedgerTransaction[]>([]);
  const [transactionCount, setTransactionCount] = useState(0);
  const [query, setQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const summary = await transactionsApi.getSummary();
      setTransactionCount(summary.transaction_count);
      const pageCount = Math.ceil(summary.transaction_count / 500);
      const pages = await Promise.all(Array.from({ length: pageCount }, (_, page) => transactionsApi.list({ skip: page * 500, limit: 500 })));
      setTransactions(pages.flat() as LedgerTransaction[]);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Could not load the uploaded transaction ledger.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { void load(); }, [load]);

  const filtered = useMemo(() => transactions.filter((transaction) => {
    const matchesText = `${transaction.description} ${transaction.category} ${transaction.id}`.toLowerCase().includes(query.toLowerCase());
    const matchesType = typeFilter === "all" || transaction.transaction_type === typeFilter;
    const matchesCategory = categoryFilter === "all" || transaction.category === categoryFilter;
    return matchesText && matchesType && matchesCategory;
  }), [transactions, query, typeFilter, categoryFilter]);
  const categoryOptions = useMemo(() => Array.from(new Set([...categories, ...transactions.map((item) => item.category)])), [transactions]);

  const updateCategory = async (transaction: LedgerTransaction, category: string) => {
    try {
      await transactionsApi.update(transaction.id, { category });
      setTransactions((current) => current.map((item) => item.id === transaction.id ? { ...item, category } : item));
      toast.success("Transaction category saved.");
    } catch (cause) {
      toast.error(cause instanceof Error ? cause.message : "Could not save the category.");
    }
  };

  const exportCsv = () => {
    const escape = (value: unknown) => `"${String(value ?? "").replaceAll('"', '""')}"`;
    const rows = [["Date", "Description", "Type", "Category", "Amount", "Fraud flag"], ...filtered.map((item) => [item.transaction_date, item.description, item.transaction_type, item.category, item.amount, item.is_flagged ? "Flagged" : "Not flagged"])];
    const csv = rows.map((row) => row.map(escape).join(",")).join("\r\n");
    const url = URL.createObjectURL(new Blob([csv], { type: "text/csv;charset=utf-8" }));
    const link = document.createElement("a");
    link.href = url;
    link.download = "uploaded-transactions.csv";
    link.click();
    URL.revokeObjectURL(url);
  };

  return <PageContainer className="pb-20">
    <header className="flex flex-col gap-4 border-b border-border pb-6 sm:flex-row sm:items-end sm:justify-between"><div><h1 className="text-3xl font-heading font-bold text-foreground">Uploaded transactions</h1><p className="mt-2 text-sm text-foreground-secondary">{transactionCount.toLocaleString()} records saved from your statements. Fraud flags come from the backend scan.</p></div><Button variant="outline" onClick={exportCsv} disabled={!filtered.length}><Download className="mr-2 h-4 w-4"/>Export filtered CSV</Button></header>
    <Card className="mt-6"><CardContent className="p-4"><div className="grid gap-3 md:grid-cols-[1fr_180px_180px]"><label className="relative"><Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-foreground-muted"/><input aria-label="Search transactions" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search description, category, or ID" className="h-10 w-full rounded-sm border border-border bg-surface pl-9 pr-3 text-sm text-foreground outline-none focus:border-primary"/></label><select aria-label="Filter transaction type" value={typeFilter} onChange={(event) => setTypeFilter(event.target.value)} className="h-10 rounded-sm border border-border bg-surface px-3 text-sm text-foreground"><option value="all">All types</option><option value="credit">Credits</option><option value="debit">Debits</option></select><select aria-label="Filter category" value={categoryFilter} onChange={(event) => setCategoryFilter(event.target.value)} className="h-10 rounded-sm border border-border bg-surface px-3 text-sm text-foreground"><option value="all">All categories</option>{categoryOptions.map((category) => <option key={category} value={category}>{category}</option>)}</select></div></CardContent></Card>
    {error && <div role="alert" className="mt-5 rounded-md border border-critical/30 bg-critical/5 p-4 text-sm text-critical">{error}<Button variant="outline" className="ml-3" onClick={() => void load()}>Retry</Button></div>}
    <div className="mt-5 overflow-x-auto rounded-md border border-border bg-surface">
      <table className="w-full min-w-[760px] text-left text-sm"><thead className="border-b border-border bg-surface-elevated/50 text-[11px] uppercase tracking-wider text-foreground-muted"><tr><th className="px-4 py-3">Date</th><th className="px-4 py-3">Description</th><th className="px-4 py-3">Type</th><th className="px-4 py-3">Category</th><th className="px-4 py-3 text-right">Amount</th><th className="px-4 py-3">Scan status</th></tr></thead>
        <tbody className="divide-y divide-border/70">{filtered.map((transaction) => <tr key={transaction.id} className="hover:bg-surface-elevated/30"><td className="whitespace-nowrap px-4 py-3 text-xs text-foreground-secondary">{new Date(transaction.transaction_date).toLocaleDateString("en-IN")}</td><td className="max-w-[280px] truncate px-4 py-3 font-medium text-foreground" title={transaction.description}>{transaction.description || "(No description)"}<span className="mt-1 block truncate font-mono text-[10px] text-foreground-muted">{transaction.id}</span></td><td className={`px-4 py-3 text-xs font-semibold ${transaction.transaction_type === "credit" ? "text-positive" : "text-foreground-secondary"}`}>{transaction.transaction_type}</td><td className="px-4 py-3"><select aria-label={`Category for ${transaction.description}`} value={transaction.category} onChange={(event) => void updateCategory(transaction, event.target.value)} className="max-w-40 rounded-sm border border-border bg-surface px-2 py-1 text-xs text-foreground">{categoryOptions.map((category) => <option key={category} value={category}>{category}</option>)}</select></td><td className="whitespace-nowrap px-4 py-3 text-right font-semibold tabular-nums text-foreground">₹{Math.abs(Number(transaction.amount) || 0).toLocaleString("en-IN", { maximumFractionDigits: 2 })}</td><td className="px-4 py-3">{transaction.is_flagged ? <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-critical"><ShieldAlert className="h-3.5 w-3.5"/>Flagged</span> : <span className="text-xs text-foreground-muted">No flag</span>}</td></tr>)}</tbody>
      </table>
      {!loading && !error && !filtered.length && <p className="p-10 text-center text-sm text-foreground-secondary">{transactions.length ? "No uploaded transactions match these filters." : "No transactions have been uploaded to this account."}</p>}
      {loading && <LoadingState message="Loading transactions..." />}
    </div>
    <p className="mt-3 text-xs text-foreground-muted">Showing {filtered.length.toLocaleString()} of {transactionCount.toLocaleString()} uploaded records. Category edits are saved to the backend. “No flag” means the record is not currently marked by the fraud scan; it is not a guarantee of safety.</p>
  </PageContainer>;
}
