"use client";

import { useCallback, useEffect, useState } from "react";
import { documentsApi, riskApi, transactionsApi } from "@/lib/api";

export interface UploadedAnalysis {
  summary: any;
  features: Record<string, number>;
  risk: any | null;
}

export function useUploadedAnalysis() {
  const [data, setData] = useState<UploadedAnalysis | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  const refresh = useCallback(async () => {
    setIsLoading(true);
    setError("");
    try {
      let documentIds: string[] | undefined;
      const storedIds = localStorage.getItem("arthdrishti_active_documents");
      if (storedIds) documentIds = JSON.parse(storedIds) as string[];
      else {
        const docs = await documentsApi.list();
        const latest = docs.find((doc) => doc.status === "completed" && !doc.error_message);
        if (latest?.id) {
          documentIds = [latest.id];
          localStorage.setItem("arthdrishti_active_documents", JSON.stringify(documentIds));
        }
      }
      const summary = await transactionsApi.getSummary(documentIds);
      if (!summary.transaction_count) {
        setData(null);
        return;
      }

      const [featureResult, riskResult] = await Promise.allSettled([
        transactionsApi.getFeatures(documentIds),
        documentIds?.length ? riskApi.evaluateCreditRisk(documentIds) : riskApi.getLatestRiskScore(),
      ]);
      if (featureResult.status !== "fulfilled") throw featureResult.reason;
      setData({
        summary,
        features: featureResult.value.features || {},
        risk: riskResult.status === "fulfilled" ? riskResult.value : null,
      });
    } catch (cause) {
      setData(null);
      setError(cause instanceof Error ? cause.message : "Could not load uploaded financial data.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => { void refresh(); }, [refresh]);
  return { data, isLoading, error, refresh };
}
