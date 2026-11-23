"use client";

import { useRouter } from "next/navigation";
import PageContainer from "@/components/ui/PageContainer";
import { Button } from "@/components/ui/Button";
import { useUploadedAnalysis } from "@/hooks/useUploadedAnalysis";
import { UploadedHealthReport } from "@/components/customer/UploadedHealthReport";

export default function FinancialHealthPage() {
  const router = useRouter();
  const { data, isLoading, error } = useUploadedAnalysis();

  if (isLoading) return <PageContainer><p className="py-12 text-sm text-foreground-secondary">Loading uploaded transaction data…</p></PageContainer>;
  if (error) return <PageContainer><div role="alert" className="mt-6 rounded-md border border-critical/30 bg-critical/5 p-4 text-sm text-critical">{error}</div></PageContainer>;
  if (!data) return <PageContainer><div className="mx-auto max-w-xl py-16 text-center"><h1 className="text-2xl font-heading font-bold text-foreground">No uploaded financial data yet</h1><p className="mt-3 text-sm text-foreground-secondary">Upload a statement and finish analysis to see a score calculated from your transactions.</p><Button variant="primary" className="mt-4" onClick={() => router.push("/onboarding/upload")}>Upload a statement</Button></div></PageContainer>;

  return <UploadedHealthReport data={data} />;
}
