"use client";

import { useRouter } from "next/navigation";
import PageContainer from "@/components/ui/PageContainer";
import { Button } from "@/components/ui/Button";
import { WorkspaceSkeleton } from "@/components/ui/PageLoader";
import { useUploadedAnalysis } from "@/hooks/useUploadedAnalysis";
import { UploadedSpendingReport } from "@/components/customer/UploadedSpendingReport";

export default function SpendingAnalysisPage() {
  const router = useRouter();
  const { data, isLoading, error } = useUploadedAnalysis();

  if (isLoading) return <WorkspaceSkeleton />;
  if (error) return <PageContainer><div role="alert" className="mt-6 rounded-md border border-critical/30 bg-critical/5 p-4 text-sm text-critical">{error}</div></PageContainer>;
  if (!data) return <PageContainer><div className="mx-auto max-w-xl py-16 text-center"><h1 className="text-2xl font-heading font-bold text-foreground">No uploaded spending data</h1><p className="mt-3 text-sm text-foreground-secondary">Upload a statement and finish analysis to see real spending totals and categories.</p><Button variant="primary" className="mt-4" onClick={() => router.push("/onboarding/upload")}>Upload a statement</Button></div></PageContainer>;

  return <UploadedSpendingReport data={data} />;
}
