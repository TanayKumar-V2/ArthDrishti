"use client";

import React, { useState, useMemo, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
  Scale,
  ArrowLeft,
  CheckCircle2
} from "lucide-react";
import { toast } from "sonner";

import PageContainer from "@/components/ui/PageContainer";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils";
import { OFFICER_APPLICANTS } from "@/lib/officer_data";

export default function ApplicantComparisonPage() {
  const router = useRouter();

  // Selected applicants IDs for comparison (default: app1 and app2)
  const [selectedIds, setSelectedIds] = useState<string[]>(["app1", "app2"]);

  // Toggle selection
  const handleToggleSelect = useCallback((id: string) => {
    setSelectedIds((prev) => {
      if (prev.includes(id)) {
        // Minimum comparison check not strictly enforced on selection, but UI warning shown
        return prev.filter((item) => item !== id);
      } else {
        if (prev.length >= 4) {
          toast.warning("You can compare a maximum of 4 applicants simultaneously.");
          return prev;
        }
        return [...prev, id];
      }
    });
  }, []);

  // Filter selected applicant data structures
  const comparisonApplicants = useMemo(() => {
    return OFFICER_APPLICANTS.filter((a) => selectedIds.includes(a.id));
  }, [selectedIds]);

  return (
    <PageContainer className="pb-24 text-xs">
      
      {/* HEADER SECTION */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between pb-3.5 border-b border-border/60 select-none">
        <div className="space-y-1">
          <button
            onClick={() => router.push("/officer")}
            className="text-[10px] font-sans font-bold uppercase tracking-wider text-primary hover:underline flex items-center gap-1 cursor-pointer mb-1"
          >
            <ArrowLeft className="h-3 w-3" /> Command Center
          </button>
          
          <h1 className="text-2xl font-bold font-sans tracking-tight text-foreground flex items-center gap-2.5">
            <Scale className="h-6.5 w-6.5 text-primary" /> Applicant Comparison Console
          </h1>
          <p className="text-xs text-foreground-secondary font-sans">
            Select and align up to 4 credit applicants to compare debt liabilities service weights side-by-side.
          </p>
        </div>
      </div>

      {/* SELECTION BAR CHIPS */}
      <div className="mt-6 border border-border bg-surface p-4.5 rounded-sm select-none space-y-3">
        <span className="text-[10px] font-bold text-foreground-muted uppercase tracking-widest block">
          Select Candidates for Evaluation (Max 4)
        </span>
        
        <div className="flex flex-wrap gap-2.5">
          {OFFICER_APPLICANTS.map((app) => {
            const isChecked = selectedIds.includes(app.id);
            return (
              <div
                key={app.id}
                onClick={() => handleToggleSelect(app.id)}
                className={cn(
                  "flex items-center gap-2.5 px-3.5 py-2 border rounded-xs transition-all cursor-pointer",
                  isChecked
                    ? "bg-primary/5 border-primary/25 text-primary"
                    : "bg-surface-elevated/35 border-border hover:bg-surface-elevated text-foreground-secondary"
                )}
              >
                <button
                  type="button"
                  className={cn(
                    "h-4 w-4 rounded-xs border flex items-center justify-center shrink-0 transition-all cursor-pointer",
                    isChecked ? "bg-primary border-primary text-white" : "border-border bg-surface"
                  )}
                >
                  {isChecked && <CheckCircle2 className="h-2.5 w-2.5 stroke-[3]" />}
                </button>
                <div className="text-[10.5px]">
                  <span className="font-bold block leading-tight">{app.name}</span>
                  <span className="text-[9px] text-foreground-muted block">₹{(app.amount / 100000).toFixed(1)}L • DTI {Math.round((app.expenses / app.income) * 100)}%</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* COMPARATIVE MATRIX TABLE */}
      {selectedIds.length < 2 ? (
        <div className="mt-6 text-center border border-border border-dashed p-12 rounded-sm bg-surface select-none">
          <Scale className="h-8 w-8 text-foreground-muted mx-auto mb-2" />
          <h3 className="text-xs font-bold text-foreground">Select at least 2 candidates</h3>
          <p className="text-[10px] text-foreground-secondary mt-1">Please select applicant checkboxes above to mount comparison matrices.</p>
        </div>
      ) : (
        <Card className="border border-border/80 bg-surface p-5 select-none mt-6 overflow-x-auto">
          <table className="w-full text-xs text-left border-collapse">
            <thead>
              <tr className="bg-surface-elevated/45 text-[9px] font-bold text-foreground-muted uppercase tracking-wider border-b border-border/40">
                <th className="py-3 px-3">Metric Parameter</th>
                {comparisonApplicants.map((app) => (
                  <th key={app.id} className="py-3 px-4 border-l border-border/40">
                    <div className="flex items-center gap-2">
                      <div className="h-7 w-7 rounded-full bg-primary/10 border border-primary/25 text-primary flex items-center justify-center font-extrabold text-[10px]">
                        {app.avatar}
                      </div>
                      <div>
                        <span className="font-extrabold text-foreground block">{app.name}</span>
                        <span className="text-[9px] text-foreground-muted block">Age {app.age}</span>
                      </div>
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              
              {/* 1. Loan Amount */}
              <tr className="border-b border-border/30 hover:bg-surface-elevated/10">
                <td className="py-3 px-3 font-bold text-foreground">Requested Loan Size</td>
                {comparisonApplicants.map((app) => (
                  <td key={app.id} className="py-3 px-4 border-l border-border/40 font-mono font-bold text-foreground">
                    ₹{app.amount.toLocaleString("en-IN")}
                  </td>
                ))}
              </tr>

              {/* 2. Purpose */}
              <tr className="border-b border-border/30 hover:bg-surface-elevated/10">
                <td className="py-3 px-3 font-bold text-foreground">Usage Purpose</td>
                {comparisonApplicants.map((app) => (
                  <td key={app.id} className="py-3 px-4 border-l border-border/40 text-foreground-secondary font-semibold">
                    {app.purpose}
                  </td>
                ))}
              </tr>

              {/* 3. Monthly Income */}
              <tr className="border-b border-border/30 hover:bg-surface-elevated/10">
                <td className="py-3 px-3 font-bold text-foreground">Monthly Inflow</td>
                {comparisonApplicants.map((app) => (
                  <td key={app.id} className="py-3 px-4 border-l border-border/40 font-mono font-semibold text-foreground">
                    ₹{app.income.toLocaleString("en-IN")}
                  </td>
                ))}
              </tr>

              {/* 4. DTI */}
              <tr className="border-b border-border/30 hover:bg-surface-elevated/10">
                <td className="py-3 px-3 font-bold text-foreground">Debt-to-Income (DTI)</td>
                {comparisonApplicants.map((app) => {
                  const dti = Math.round((app.expenses / app.income) * 100);
                  return (
                    <td key={app.id} className={cn(
                      "py-3 px-4 border-l border-border/40 font-mono font-bold",
                      dti >= 40 ? "text-critical" : "text-foreground"
                    )}>
                      {dti}%
                    </td>
                  );
                })}
              </tr>

              {/* 5. Default Probability */}
              <tr className="border-b border-border/30 hover:bg-surface-elevated/10">
                <td className="py-3 px-3 font-bold text-foreground">Default Probability</td>
                {comparisonApplicants.map((app) => (
                  <td key={app.id} className={cn(
                    "py-3 px-4 border-l border-border/40 font-mono font-bold",
                    app.defaultProb >= 50 ? "text-critical" : app.defaultProb >= 25 ? "text-warning" : "text-positive"
                  )}>
                    {app.defaultProb}%
                  </td>
                ))}
              </tr>

              {/* 6. Financial Health */}
              <tr className="border-b border-border/30 hover:bg-surface-elevated/10">
                <td className="py-3 px-3 font-bold text-foreground">Financial Health Score</td>
                {comparisonApplicants.map((app) => (
                  <td key={app.id} className="py-3 px-4 border-l border-border/40 font-mono font-extrabold text-foreground">
                    {app.healthScore} / 100
                  </td>
                ))}
              </tr>

              {/* 7. Fraud Risk */}
              <tr className="border-b border-border/30 hover:bg-surface-elevated/10">
                <td className="py-3 px-3 font-bold text-foreground">Fraud Telemetry Risk</td>
                {comparisonApplicants.map((app) => (
                  <td key={app.id} className="py-3 px-4 border-l border-border/40">
                    <span className={cn(
                      "text-[8.5px] font-sans font-bold px-1.5 py-0.25 rounded-xs uppercase border",
                      app.fraudRisk === "High" ? "text-critical bg-critical/10 border-critical/20" : app.fraudRisk === "Medium" ? "text-warning bg-warning/10 border-warning/20" : "text-positive bg-positive/10 border-positive/20"
                    )}>
                      {app.fraudRisk}
                    </span>
                  </td>
                ))}
              </tr>

              {/* 8. Model Confidence */}
              <tr className="border-b border-border/30 hover:bg-surface-elevated/10">
                <td className="py-3 px-3 font-bold text-foreground">Model Certainty</td>
                {comparisonApplicants.map((app) => (
                  <td key={app.id} className="py-3 px-4 border-l border-border/40 font-mono text-foreground-secondary">
                    {app.confidence}%
                  </td>
                ))}
              </tr>

              {/* 9. AI Recommendation */}
              <tr className="border-b border-border/30 hover:bg-surface-elevated/10">
                <td className="py-3 px-3 font-bold text-foreground">Ensemble Recommendation</td>
                {comparisonApplicants.map((app) => (
                  <td key={app.id} className="py-3 px-4 border-l border-border/40">
                    <span className={cn(
                      "text-[8.5px] font-sans font-bold px-1.5 py-0.25 rounded-xs uppercase border",
                      app.aiRec === "Approve" ? "text-positive bg-positive/15 border-positive/20" : app.aiRec === "Deny" ? "text-critical bg-critical/15 border-critical/20" : "text-warning bg-warning/15 border-warning/20"
                    )}>
                      {app.aiRec}
                    </span>
                  </td>
                ))}
              </tr>

              {/* 10. Actions row */}
              <tr className="hover:bg-surface-elevated/5">
                <td className="py-4 px-3 font-bold text-foreground">Officer Actions</td>
                {comparisonApplicants.map((app) => (
                  <td key={app.id} className="py-4 px-4 border-l border-border/40">
                    <div className="flex gap-1.5">
                      <Button
                        onClick={() => router.push(`/officer/underwriting/${app.id}`)}
                        size="sm"
                        className="text-[9px] uppercase font-sans font-extrabold py-1 px-2.5 cursor-pointer"
                      >
                        Underwrite
                      </Button>
                      <Button
                        variant="outline"
                        onClick={() => router.push(`/officer/applicants/${app.id}`)}
                        size="sm"
                        className="text-[9px] uppercase font-sans font-bold py-1 px-2.5 border-border/80 hover:bg-surface-hover cursor-pointer"
                      >
                        Profile
                      </Button>
                    </div>
                  </td>
                ))}
              </tr>

            </tbody>
          </table>
        </Card>
      )}

    </PageContainer>
  );
}
