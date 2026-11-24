"use client";

import { useEffect, useState } from "react";
import PageContainer from "@/components/ui/PageContainer";
import { Button } from "@/components/ui/Button";
import { WorkspaceSkeleton } from "@/components/ui/PageLoader";
import { riskApi } from "@/lib/api";
import { useUploadedAnalysis } from "@/hooks/useUploadedAnalysis";
import { UploadedSegmentReport } from "@/components/customer/UploadedSegmentReport";

export default function CustomerRiskSegmentsPage() {
  const uploaded = useUploadedAnalysis();
  const [segment, setSegment] = useState<any>(null);
  const [segmentError, setSegmentError] = useState("");

  useEffect(() => {
    if (!uploaded.data) return;
    let active = true;
    riskApi.getCustomerSegment().then((value) => {
      if (active) setSegment(value);
    }).catch((cause) => {
      if (active) setSegmentError(cause instanceof Error ? cause.message : "Could not load the segment assigned to this profile.");
    });
    return () => { active = false; };
  }, [uploaded.data]);

  if (uploaded.isLoading) return <WorkspaceSkeleton />;
  if (uploaded.error) return <PageContainer><div role="alert" className="mt-6 rounded-md border border-critical/30 bg-critical/5 p-4 text-sm text-critical">{uploaded.error}</div></PageContainer>;
  if (!uploaded.data) return <PageContainer><div className="mx-auto max-w-xl py-16 text-center"><h1 className="text-2xl font-heading font-bold text-foreground">No uploaded profile yet</h1><p className="mt-3 text-sm text-foreground-secondary">Upload a statement to calculate financial features and assign a customer segment.</p><Button variant="primary" className="mt-4" onClick={() => window.location.assign("/onboarding/upload")}>Upload a statement</Button></div></PageContainer>;
  if (segmentError) return <PageContainer><div role="alert" className="mt-6 rounded-md border border-critical/30 bg-critical/5 p-4 text-sm text-critical">{segmentError}</div></PageContainer>;
  if (!segment) return <WorkspaceSkeleton />;

  return <UploadedSegmentReport segment={segment} transactionCount={uploaded.data.summary.transaction_count} />;
}
