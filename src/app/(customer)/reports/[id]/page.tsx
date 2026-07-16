"use client";

import React, { useState, useMemo, useRef, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  FileText,
  ArrowLeft,
  Download,
  Share2,
  MessageSquare,
  Printer,
  ChevronRight,
  ClipboardList,
  Activity,
  ShieldCheck,
  Target,
  HeartPulse,
  Fingerprint,
  TrendingUp,
  Brain,
  SlidersHorizontal
} from "lucide-react";
import { toast } from "sonner";

import PageContainer from "@/components/ui/PageContainer";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils";
import { MOCK_REPORTS, ReportItem } from "@/lib/reports_data";

export default function ReportViewerPage() {
  const params = useParams();
  const router = useRouter();
  const reportId = params?.id as string;

  // Find matching report item from mock database
  const report = useMemo<ReportItem | undefined>(() => {
    return MOCK_REPORTS.find((r) => r.id === reportId);
  }, [reportId]);

  // Tracking active scroll section on Table of Contents
  const [activeSection, setActiveSection] = useState<string>("executive-summary");

  const executiveSummaryRef = useRef<HTMLDivElement>(null);
  const keyRisksRef = useRef<HTMLDivElement>(null);
  const financialHealthRef = useRef<HTMLDivElement>(null);
  const creditAnalysisRef = useRef<HTMLDivElement>(null);
  const fraudAnalysisRef = useRef<HTMLDivElement>(null);
  const cashFlowForecastRef = useRef<HTMLDivElement>(null);
  const aiExplanationsRef = useRef<HTMLDivElement>(null);
  const recommendationsRef = useRef<HTMLDivElement>(null);
  const methodologyRef = useRef<HTMLDivElement>(null);

  // Jump to specific section using scrollIntoView
  const handleScrollToSection = useCallback((sectionId: string) => {
    setActiveSection(sectionId);
    let targetRef: React.RefObject<HTMLDivElement | null> | null = null;
    
    switch (sectionId) {
      case "executive-summary": targetRef = executiveSummaryRef; break;
      case "key-risks": targetRef = keyRisksRef; break;
      case "financial-health": targetRef = financialHealthRef; break;
      case "credit-analysis": targetRef = creditAnalysisRef; break;
      case "fraud-analysis": targetRef = fraudAnalysisRef; break;
      case "cash-flow-forecast": targetRef = cashFlowForecastRef; break;
      case "ai-explanations": targetRef = aiExplanationsRef; break;
      case "recommendations": targetRef = recommendationsRef; break;
      case "methodology": targetRef = methodologyRef; break;
    }

    if (targetRef?.current) {
      targetRef.current.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }, []);

  // Top action buttons handlers
  const handleDownload = useCallback(() => {
    if (!report) return;
    toast.success(`Downloading PDF: "${report.name}.pdf"`);
  }, [report]);

  const handleShare = useCallback(() => {
    if (!report) return;
    toast.success(`Shareable document link for "${report.name}" copied!`);
  }, [report]);

  const handlePrint = useCallback(() => {
    window.print();
  }, []);

  const handleAskAi = useCallback(() => {
    if (!report) return;
    toast.info("Opening AI Advisor with report context...");
    // Prefill conversational query inside routing path parameters
    router.push(`/ai-advisor?query=${encodeURIComponent(`Explain the findings of my ${report.name}`)}`);
  }, [report, router]);

  // If report ID is invalid or not found in data
  if (!report) {
    return (
      <PageContainer className="pb-24 select-none">
        <div className="flex flex-col items-center justify-center min-h-[400px] border border-border border-dashed p-8 rounded-sm bg-surface">
          <FileText className="h-10 w-10 text-foreground-muted mb-3" />
          <h3 className="text-sm font-bold text-foreground">Report Not Found</h3>
          <p className="text-xs text-foreground-secondary mt-1 mb-4 max-w-xs text-center font-sans">
            The requested intelligence report ID does not exist in local registries.
          </p>
          <Button
            onClick={() => router.push("/reports")}
            size="sm"
            className="text-[10px] uppercase font-sans font-bold cursor-pointer"
          >
            Back to Reports Center
          </Button>
        </div>
      </PageContainer>
    );
  }

  // Table of contents configuration
  const tableOfContents = [
    { id: "executive-summary", label: "Executive Summary" },
    { id: "key-risks", label: "Key Risks" },
    { id: "financial-health", label: "Financial Health" },
    { id: "credit-analysis", label: "Credit Analysis" },
    { id: "fraud-analysis", label: "Fraud Analysis" },
    { id: "cash-flow-forecast", label: "Cash Flow Forecast" },
    { id: "ai-explanations", label: "AI Explanations" },
    { id: "recommendations", label: "Recommendations" },
    { id: "methodology", label: "Methodology" }
  ];

  return (
    <PageContainer className="pb-24">
      
      {/* HEADER SECTION (HIDDEN ON PRINT) */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between pb-3 border-b border-border/60 select-none print:hidden">
        <div className="space-y-1">
          <button
            onClick={() => router.push("/reports")}
            className="text-[10px] font-sans font-bold uppercase tracking-wider text-primary hover:underline flex items-center gap-1 cursor-pointer mb-1"
          >
            <ArrowLeft className="h-3 w-3" /> Reports Center
          </button>
          <h1 className="text-2xl font-bold font-sans tracking-tight text-foreground flex items-center gap-2.5">
            {report.name}
          </h1>
          <p className="text-xs text-foreground-secondary font-sans">
            Period: <span className="font-semibold text-foreground font-mono">{report.analysisPeriod}</span> • Compiled: <span className="font-semibold text-foreground font-mono">{report.generatedDate}</span>
          </p>
        </div>

        {/* Top actions block */}
        <div className="flex flex-wrap gap-2.5 self-start md:self-center">
          <Button
            onClick={handleAskAi}
            size="sm"
            className="text-[10px] uppercase font-sans font-bold gap-1.5 cursor-pointer"
          >
            <MessageSquare className="h-3.5 w-3.5" /> Ask AI About Report
          </Button>
          <Button
            variant="outline"
            onClick={handleDownload}
            size="sm"
            className="text-[10px] uppercase font-sans font-bold gap-1.5 hover:bg-surface-elevated border-border/80 cursor-pointer"
          >
            <Download className="h-3.5 w-3.5" /> PDF
          </Button>
          <Button
            variant="outline"
            onClick={handlePrint}
            size="sm"
            className="text-[10px] uppercase font-sans font-bold gap-1.5 hover:bg-surface-elevated border-border/80 cursor-pointer"
          >
            <Printer className="h-3.5 w-3.5" /> Print
          </Button>
          <Button
            variant="outline"
            onClick={handleShare}
            size="sm"
            className="text-[10px] uppercase font-sans font-bold gap-1.5 hover:bg-surface-elevated border-border/80 cursor-pointer"
          >
            <Share2 className="h-3.5 w-3.5" /> Share
          </Button>
        </div>
      </div>

      {/* CORE WORKSPACE GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mt-6">
        
        {/* COLUMN 1: TABLE OF CONTENTS (DESKTOP - 3 COLS - HIDDEN ON PRINT) */}
        <div className="hidden lg:block lg:col-span-3 bg-surface border border-border/80 rounded-sm p-4 select-none print:hidden h-fit sticky top-24">
          <div className="space-y-4 font-sans text-xs">
            <div className="border-b border-border/60 pb-3">
              <span className="text-[10px] font-sans font-extrabold uppercase tracking-widest text-foreground-muted">
                Table of Contents
              </span>
            </div>
            
            <div className="space-y-1.5">
              {tableOfContents.map((sec) => {
                const isActive = activeSection === sec.id;
                return (
                  <button
                    key={sec.id}
                    onClick={() => handleScrollToSection(sec.id)}
                    className={cn(
                      "w-full text-left p-2 rounded-xs transition-colors flex items-center justify-between cursor-pointer",
                      isActive
                        ? "bg-primary/5 text-primary font-bold"
                        : "text-foreground-secondary hover:text-foreground hover:bg-surface-elevated/45"
                    )}
                  >
                    <span>{sec.label}</span>
                    {isActive && <ChevronRight className="h-3.5 w-3.5" />}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* COLUMN 2: REPORT DOCUMENT VIEW (CENTER - 6 COLS / 50% - FULL WIDTH ON PRINT) */}
        <div className="col-span-12 lg:col-span-6 space-y-8 bg-surface border border-border/80 rounded-sm p-6 md:p-8 font-sans text-sm leading-relaxed text-foreground-secondary select-none print:border-none print:bg-white print:p-0 print:text-black print:col-span-12">
          
          {/* Executive Summary Section */}
          <div ref={executiveSummaryRef} className="space-y-2 border-b border-border/20 pb-6 scroll-mt-24">
            <h2 className="text-base font-extrabold text-foreground uppercase tracking-wider flex items-center gap-2">
              <ClipboardList className="h-5 w-5 text-primary print:text-black" /> Executive Summary
            </h2>
            <p>{report.content.executiveSummary}</p>
          </div>

          {/* Key Risks Section */}
          <div ref={keyRisksRef} className="space-y-2 border-b border-border/20 pb-6 scroll-mt-24">
            <h2 className="text-base font-extrabold text-foreground uppercase tracking-wider flex items-center gap-2">
              <Activity className="h-5 w-5 text-primary print:text-black" /> Key Risks
            </h2>
            <p>{report.content.keyRisks}</p>
          </div>

          {/* Financial Health Section */}
          <div ref={financialHealthRef} className="space-y-2 border-b border-border/20 pb-6 scroll-mt-24">
            <h2 className="text-base font-extrabold text-foreground uppercase tracking-wider flex items-center gap-2">
              <HeartPulse className="h-5 w-5 text-primary print:text-black" /> Financial Health
            </h2>
            <p>{report.content.financialHealth}</p>
          </div>

          {/* Credit Analysis Section */}
          <div ref={creditAnalysisRef} className="space-y-2 border-b border-border/20 pb-6 scroll-mt-24">
            <h2 className="text-base font-extrabold text-foreground uppercase tracking-wider flex items-center gap-2">
              <ShieldCheck className="h-5 w-5 text-primary print:text-black" /> Credit Analysis
            </h2>
            <p>{report.content.creditAnalysis}</p>
          </div>

          {/* Fraud Analysis Section */}
          <div ref={fraudAnalysisRef} className="space-y-2 border-b border-border/20 pb-6 scroll-mt-24">
            <h2 className="text-base font-extrabold text-foreground uppercase tracking-wider flex items-center gap-2">
              <Fingerprint className="h-5 w-5 text-primary print:text-black" /> Fraud Analysis
            </h2>
            <p>{report.content.fraudAnalysis}</p>
          </div>

          {/* Cash Flow Forecast Section */}
          <div ref={cashFlowForecastRef} className="space-y-2 border-b border-border/20 pb-6 scroll-mt-24">
            <h2 className="text-base font-extrabold text-foreground uppercase tracking-wider flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-primary print:text-black" /> Cash Flow Forecast
            </h2>
            <p>{report.content.cashFlowForecast}</p>
          </div>

          {/* AI Explanations Section */}
          <div ref={aiExplanationsRef} className="space-y-2 border-b border-border/20 pb-6 scroll-mt-24">
            <h2 className="text-base font-extrabold text-foreground uppercase tracking-wider flex items-center gap-2">
              <Brain className="h-5 w-5 text-primary print:text-black" /> AI Explanations
            </h2>
            <p>{report.content.aiExplanations}</p>
          </div>

          {/* Recommendations Section */}
          <div ref={recommendationsRef} className="space-y-2 border-b border-border/20 pb-6 scroll-mt-24">
            <h2 className="text-base font-extrabold text-foreground uppercase tracking-wider flex items-center gap-2">
              <Target className="h-5 w-5 text-primary print:text-black" /> Recommendations
            </h2>
            <p className="whitespace-pre-line">{report.content.recommendations}</p>
          </div>

          {/* Methodology Section */}
          <div ref={methodologyRef} className="space-y-2 scroll-mt-24">
            <h2 className="text-base font-extrabold text-foreground uppercase tracking-wider flex items-center gap-2">
              <SlidersHorizontal className="h-5 w-5 text-primary print:text-black" /> Methodology
            </h2>
            <p>{report.content.methodology}</p>
          </div>

        </div>

        {/* COLUMN 3: AI SUMMARY PANEL (RIGHT - 3 COLS - HIDDEN ON PRINT) */}
        <div className="hidden lg:block lg:col-span-3 bg-surface border border-border/80 rounded-sm p-4.5 select-none print:hidden h-fit sticky top-24 space-y-4">
          
          <div className="border-b border-border/60 pb-3 flex items-center gap-1.5">
            <Brain className="h-4.5 w-4.5 text-primary" />
            <span className="text-[10px] font-sans font-extrabold uppercase tracking-widest text-foreground-muted">
              AI Summary Insight
            </span>
          </div>

          <div className="space-y-4 font-sans text-xs">
            
            {/* Status indicator */}
            <div className="space-y-1 bg-surface-elevated/45 border border-border p-3 rounded-xs">
              <span className="text-[9px] font-bold text-foreground-muted block uppercase tracking-wider">Overall Status</span>
              <span className="font-extrabold text-foreground text-[10.5px] font-mono">{report.summary.status}</span>
            </div>

            {/* Top risk */}
            <div className="space-y-1 bg-surface-elevated/45 border border-border p-3 rounded-xs">
              <span className="text-[9px] font-bold text-foreground-muted block uppercase tracking-wider">Top Risk Factor</span>
              <p className="text-foreground-secondary leading-relaxed mt-0.5">{report.summary.topRisk}</p>
            </div>

            {/* Strongest Factor */}
            <div className="space-y-1 bg-surface-elevated/45 border border-border p-3 rounded-xs">
              <span className="text-[9px] font-bold text-foreground-muted block uppercase tracking-wider">Strongest Factor</span>
              <p className="text-foreground-secondary leading-relaxed mt-0.5">{report.summary.strongestFactor}</p>
            </div>

            {/* Top Recommendation */}
            <div className="space-y-1 bg-surface-elevated/45 border border-border p-3 rounded-xs">
              <span className="text-[9px] font-bold text-foreground-muted block uppercase tracking-wider">Key Recommendation</span>
              <p className="text-foreground-secondary leading-relaxed mt-0.5">{report.summary.topRecommendation}</p>
            </div>

            {/* Model Confidence */}
            <div className="space-y-1 bg-surface-elevated/45 border border-border p-3 rounded-xs">
              <span className="text-[9px] font-bold text-foreground-muted block uppercase tracking-wider">Model Confidence</span>
              <span className="font-extrabold text-foreground text-[10.5px] font-mono block mt-0.5">{report.summary.confidence}</span>
            </div>

          </div>
        </div>

      </div>

    </PageContainer>
  );
}
