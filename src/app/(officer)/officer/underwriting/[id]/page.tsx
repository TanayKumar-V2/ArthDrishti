"use client";

import React, { useState, useEffect, useMemo, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import * as echarts from "echarts";
import {
  ArrowLeft,
  User,
  CheckCircle2,
  FileText,
  Clock,
  Download,
  RefreshCw,
  Check,
  Sparkles,
  AlertCircle,
  Eye,
  ChevronRight,
  ChevronDown
} from "lucide-react";
import { toast } from "sonner";

import PageContainer from "@/components/ui/PageContainer";
import { Card, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Overlays";
import { StatusBadge } from "@/components/ui/Badge";
import { cn } from "@/lib/utils";
import { OFFICER_APPLICANTS, ApplicantDetail } from "@/lib/officer_data";

export default function AIUnderwritingWorkspacePage() {
  const params = useParams();
  const router = useRouter();
  const applicantId = params?.id as string;

  // Retrieve applicant detail from registry
  const applicant = useMemo<ApplicantDetail | undefined>(() => {
    return OFFICER_APPLICANTS.find((a) => a.id === applicantId);
  }, [applicantId]);

  // Loading & Error states
  const [isLoading, setIsLoading] = useState(false);
  const [isError, setIsError] = useState(false);
  const [lastAnalysisTime, setLastAnalysisTime] = useState("");

  // Sticky Decision panel states
  const [decisionNotes, setDecisionNotes] = useState({
    reason: "",
    specialConditions: "",
    additionalComments: "",
    customerFollowUp: ""
  });

  // Modal active state
  const [activeModal, setActiveModal] = useState<
    null | "approve" | "reject" | "manual" | "request_docs" | "doc_preview"
  >(null);

  // Document modal preview state
  const [selectedDocName, setSelectedDocName] = useState("");

  // Rejection Form states
  const [rejectForm, setRejectForm] = useState({
    reason: "",
    category: "DTI Too High",
    notes: ""
  });

  // Manual Review Form states
  const [manualForm, setManualForm] = useState({
    reason: "",
    reviewer: "Senior Credit Officer (Priya)",
    expectedCompletion: "24 Hours"
  });

  // Request Documents Checklist states
  const [requestDocsChecklist, setRequestDocsChecklist] = useState<Record<string, boolean>>({
    "Bank Statement (Last 6 Months)": false,
    "Salary Slip (June 2026)": false,
    "PAN Card": false,
    "Aadhaar Card": false,
    "Income Tax Return (ITR-V)": false,
    "Employment Letter": false,
    "Property Valuation Certificate": false
  });
  const [requestDocMessage, setRequestDocMessage] = useState("");

  // Set initial last analysis timestamp on load
  useEffect(() => {
    const now = new Date();
    const timer = setTimeout(() => {
      setLastAnalysisTime(
        now.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" })
      );
    }, 0);
    return () => clearTimeout(timer);
  }, []);

  // Enrich applicant record with high-fidelity attributes
  const detailedApplicant = useMemo(() => {
    if (!applicant) return null;

    const isApp1 = applicant.id === "app1";
    const isApp2 = applicant.id === "app2";
    const isApp3 = applicant.id === "app3";

    return {
      ...applicant,
      occupation: isApp1 ? "Senior Software Engineer" : isApp2 ? "Lead Product Designer" : isApp3 ? "Supermarket Owner" : "Financial Analyst",
      employer: isApp1 ? "Tata Consultancy Services" : isApp2 ? "Razorpay India" : isApp3 ? "Sen Enterprises Ltd." : "HDFC Bank Ltd.",
      city: isApp1 ? "Kolkata, WB" : isApp2 ? "Bangalore, KA" : isApp3 ? "Delhi NCR" : "Mumbai, MH",
      customerSince: isApp1 ? "2018-04-12" : isApp2 ? "2020-11-05" : isApp3 ? "2016-08-22" : "2021-03-14",
      creditScore: isApp1 ? 712 : isApp2 ? 840 : isApp3 ? 589 : 765,
      quickSummary: isApp1
        ? "AI model predicts a default probability of 42%, triggering a manual review routing. Risk exposure is primarily driven by high credit card utilization (64%) and debt-to-income limits. These factors are balanced by consistent payroll checks and a 4-month liquid savings safety buffer."
        : isApp2
        ? "AI-approved profile with low default probability (18%) and high confidence. Exhibits excellent financial health (84/100) with zero outstanding debt and a liquid savings buffer covering the entire requested amount."
        : isApp3
        ? "AI recommends Deny. High credit leverage (₹18L outstanding debt) and low savings margins relative to monthly income create severe debt service stress. Experian bureau score stands at 589 with multiple recent inquiries."
        : "Underwriter review flagged due to document telemetry warnings. Financial indices are positive (DTI at 22%), but security coordinates mismatch alerts require manual signature checks.",

      // Document list
      documentFiles: [
        { id: "doc1", name: "Bank Statement (Last 6 Months)", status: "Verified" as const, date: "2026-07-01", type: "PDF/CSV" },
        { id: "doc2", name: "Salary Slip (June 2026)", status: "Verified" as const, date: "2026-07-01", type: "PDF" },
        { id: "doc3", name: "PAN Card", status: "Verified" as const, date: "2026-06-30", type: "Image/PDF" },
        { id: "doc4", name: "Aadhaar Card", status: "Verified" as const, date: "2026-06-30", type: "PDF" },
        { id: "doc5", name: "Income Tax Return (ITR-V FY25)", status: "Verified" as const, date: "2026-07-02", type: "PDF" },
        { id: "doc6", name: "Employment Verification Letter", status: "Verified" as const, date: "2026-07-01", type: "PDF" }
      ],

      // Timeline audit trail
      timelineEvents: [
        { date: "2026-07-03 04:30 PM", action: "Decision Draft Saved", user: "Officer Rahul", notes: "Decision draft pending document e-sign validation." },
        { date: "2026-07-02 03:00 PM", action: "AI Insights Generated", user: "Ensemble Models", notes: "Identified high payroll consistency and DTI margins." },
        { date: "2026-07-02 10:15 AM", action: "Credit Risk Profile Analysis", user: "Bureau System", notes: "Experian Credit Score parsed: 712. Active DTI: 42%." },
        { date: "2026-07-01 11:00 AM", action: "Fraud Analysis Verification", user: "AI Engine", notes: "Fraud score evaluated at Low. Device fingerprint matched." },
        { date: "2026-07-01 10:45 AM", action: "Documents Uploaded", user: "Applicant", notes: "Aadhaar, PAN, ITR and Bank Statement uploaded successfully." },
        { date: "2026-07-01 10:30 AM", action: "Application Created", user: "System Ingest", notes: "Application ingested successfully via gateway API." }
      ],

      // Related Applications
      relatedApplications: [
        { applicantName: "Vikram Malhotra", id: "app4", loanType: "Personal Loan", amount: 450000, risk: "High", decision: "Manual Review", similarity: "84%" },
        { applicantName: "Priyanka Roy", id: "app2", loanType: "Home Loan", amount: 820000, risk: "Low", decision: "Approved", similarity: "79%" },
        { applicantName: "Amit Sharma", id: "app3", loanType: "Commercial Loan", amount: 1200000, risk: "Critical", decision: "Rejected", similarity: "75%" }
      ],

      // Expandable Risk Factors details
      riskFactorsDetail: [
        { title: "High Debt-to-Income (DTI) Ratio", current: `${Math.round((applicant.expenses / applicant.income) * 100)}%`, healthy: "< 40%", impact: "High Risk Impact", confidence: 91, suggestion: "Apply a longer tenure or lower coupon rate to reduce EMI contribution." },
        { title: "Late EMI Repayment History", current: isApp1 ? "1 delay (12 Days)" : "0 delays", healthy: "0 delays", impact: "Medium Risk Impact", confidence: 85, suggestion: "Request payment logs clarification or credit card bills history." },
        { title: "High Revolving Credit Utilization", current: isApp1 ? "64%" : "12%", healthy: "< 30%", impact: "Medium Risk Impact", confidence: 88, suggestion: "Ensure card outstandings are settled before releasing funds." },
        { title: "Limited Liquid Reserves", current: `₹${applicant.savings.toLocaleString("en-IN")}`, healthy: "> ₹5,00,000", impact: "Low Risk Impact", confidence: 78, suggestion: "Add a financial co-signer or verify other assets." }
      ],

      // Positive Protective Factors details
      protectiveFactorsDetail: [
        { title: "Stable Income Pipeline", desc: "Verified monthly payroll deposit logs match employer records for 12 consecutive cycles.", confidence: 94 },
        { title: "Clean Default History", desc: "Zero defaults or structural charge-offs logged in the bureau file for the last 5 years.", confidence: 96 },
        { title: "Substantial Emergency Reserves", desc: "Liquid balances are sufficient to service up to 4 complete monthly debt payments.", confidence: 78 }
      ]
    };
  }, [applicant]);

  // ECharts refs
  const cashFlowChartRef = useRef<HTMLDivElement>(null);
  const shapChartRef = useRef<HTMLDivElement>(null);
  const healthGaugeRef = useRef<HTMLDivElement>(null);
  const defaultGaugeRef = useRef<HTMLDivElement>(null);
  const fraudGaugeRef = useRef<HTMLDivElement>(null);

  // Initialize ECharts with Theme listeners
  useEffect(() => {
    if (!detailedApplicant || isLoading || isError) return;

    const chartInstances: echarts.ECharts[] = [];
    const isDark = document.documentElement.classList.contains("dark");
    const labelColor = isDark ? "#94A3B8" : "#64748B";
    const gridLineColor = isDark ? "rgba(255, 255, 255, 0.08)" : "rgba(0, 0, 0, 0.06)";

    const initChart = (ref: React.RefObject<HTMLDivElement | null>, option: echarts.EChartsOption) => {
      if (!ref.current) return;
      const chart = echarts.init(ref.current);
      chart.setOption(option);
      chartInstances.push(chart);
    };

    // 1. Cash Flow Area Line Chart
    initChart(cashFlowChartRef, {
      tooltip: { trigger: "axis" },
      legend: { data: ["Income Forecast", "Expense Forecast", "Net Liquidity"], textStyle: { color: labelColor, fontSize: 8.5 } },
      grid: { top: 35, bottom: 25, left: 55, right: 15 },
      xAxis: { type: "category", data: ["Jul", "Aug", "Sep", "Oct", "Nov", "Dec"], axisLabel: { color: labelColor, fontSize: 8.5 } },
      yAxis: { type: "value", splitLine: { lineStyle: { color: gridLineColor } }, axisLabel: { color: labelColor, fontSize: 8.5 } },
      series: [
        { name: "Income Forecast", type: "line", smooth: true, data: [detailedApplicant.income, detailedApplicant.income, detailedApplicant.income * 1.02, detailedApplicant.income * 1.02, detailedApplicant.income * 1.02, detailedApplicant.income * 1.05], itemStyle: { color: "#3b82f6" } },
        { name: "Expense Forecast", type: "line", smooth: true, data: [detailedApplicant.expenses, detailedApplicant.expenses, detailedApplicant.expenses * 0.98, detailedApplicant.expenses, detailedApplicant.expenses, detailedApplicant.expenses], itemStyle: { color: "#ef4444" } },
        {
          name: "Net Liquidity",
          type: "line",
          smooth: true,
          data: [detailedApplicant.savings, detailedApplicant.savings + 20000, detailedApplicant.savings + 45000, detailedApplicant.savings + 65000, detailedApplicant.savings + 90000, detailedApplicant.savings + 120000],
          itemStyle: { color: "#22c55e" },
          areaStyle: { color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [{ offset: 0, color: "rgba(34, 197, 94, 0.2)" }, { offset: 1, color: "rgba(34, 197, 94, 0)" }]) }
        }
      ]
    });

    // 2. Explainable AI SHAP horizontal bars
    const categories = detailedApplicant.shapAttributions.map((i) => i.feature);
    const values = detailedApplicant.shapAttributions.map((i) => i.impact);
    initChart(shapChartRef, {
      tooltip: { trigger: "axis", axisPointer: { type: "shadow" } },
      grid: { top: 10, right: 20, bottom: 20, left: 110 },
      xAxis: { type: "value", splitLine: { lineStyle: { color: gridLineColor } }, axisLabel: { color: labelColor, fontSize: 8 } },
      yAxis: {
        type: "category",
        data: categories,
        axisLine: { show: false },
        axisTick: { show: false },
        axisLabel: { color: labelColor, fontSize: 8.5, fontWeight: "bold" }
      },
      series: [
        {
          type: "bar",
          data: values.map((val) => ({
            value: val,
            itemStyle: { color: val >= 0 ? "#ef4444" : "#22c55e", borderRadius: 2 }
          })),
          label: {
            show: true,
            position: "right",
            fontSize: 8.5,
            formatter: (p: unknown) => {
              const param = p as { value: number };
              return (param.value >= 0 ? "+" : "") + param.value + "%";
            }
          }
        }
      ]
    });

    // 3. Health radial gauge
    initChart(healthGaugeRef, {
      series: [
        {
          type: "gauge",
          startAngle: 180,
          endAngle: 0,
          min: 0,
          max: 100,
          radius: "100%",
          center: ["50%", "85%"],
          axisLine: { lineStyle: { width: 5, color: [[0.4, "#ef4444"], [0.7, "#f59e0b"], [1, "#22c55e"]] } },
          pointer: { width: 2, length: "60%", itemStyle: { color: labelColor } },
          axisTick: { show: false },
          splitLine: { show: false },
          axisLabel: { show: false },
          detail: { show: false },
          data: [{ value: detailedApplicant.healthScore }]
        }
      ]
    });

    // 4. Default gauge
    initChart(defaultGaugeRef, {
      series: [
        {
          type: "gauge",
          startAngle: 180,
          endAngle: 0,
          min: 0,
          max: 100,
          radius: "100%",
          center: ["50%", "85%"],
          axisLine: { lineStyle: { width: 5, color: [[0.3, "#22c55e"], [0.6, "#f59e0b"], [1, "#ef4444"]] } },
          pointer: { width: 2, length: "60%", itemStyle: { color: labelColor } },
          axisTick: { show: false },
          splitLine: { show: false },
          axisLabel: { show: false },
          detail: { show: false },
          data: [{ value: detailedApplicant.defaultProb }]
        }
      ]
    });

    // 5. Fraud gauge
    initChart(fraudGaugeRef, {
      series: [
        {
          type: "gauge",
          startAngle: 180,
          endAngle: 0,
          min: 0,
          max: 100,
          radius: "100%",
          center: ["50%", "85%"],
          axisLine: { lineStyle: { width: 5, color: [[0.3, "#22c55e"], [0.6, "#f59e0b"], [1, "#ef4444"]] } },
          pointer: { width: 2, length: "60%", itemStyle: { color: labelColor } },
          axisTick: { show: false },
          splitLine: { show: false },
          axisLabel: { show: false },
          detail: { show: false },
          data: [{ value: detailedApplicant.fraudRisk === "High" ? 88 : detailedApplicant.fraudRisk === "Medium" ? 42 : 12 }]
        }
      ]
    });

    const handleResize = () => chartInstances.forEach((c) => c.resize());
    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
      chartInstances.forEach((c) => c.dispose());
    };
  }, [isLoading, isError, detailedApplicant]);

  // Expandable risk card state tracking
  const [expandedRiskIdx, setExpandedRiskIdx] = useState<number | null>(null);

  const toggleRiskCard = (idx: number) => {
    setExpandedRiskIdx(expandedRiskIdx === idx ? null : idx);
  };

  // Document Request handler
  const handleDocCheckboxChange = (name: string) => {
    setRequestDocsChecklist((prev) => ({ ...prev, [name]: !prev[name] }));
  };

  // Simulated analysis triggers
  const handleRefreshAnalysis = () => {
    setIsLoading(true);
    toast.loading("Re-running predictive credit indicators...");
    setTimeout(() => {
      setIsLoading(false);
      const now = new Date();
      setLastAnalysisTime(
        now.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" })
      );
      toast.dismiss();
      toast.success("AI diagnostics recalculated and matched with Experian records.");
    }, 900);
  };

  const handleDownloadSummary = () => {
    toast.success("Downloading decision clearance summary report.");
  };

  const handleGenerateReport = () => {
    toast.success("Generating comprehensive credit underwriting audit files.");
  };

  // Submit trigger validation checks
  const handleTriggerAction = (type: "approve" | "reject" | "manual" | "request_docs") => {
    if (!decisionNotes.reason.trim()) {
      toast.error("Please supply a Decision Justification Reason in the notes editor first.");
      return;
    }
    setActiveModal(type);
  };

  const handleConfirmAction = () => {
    if (!detailedApplicant) return;

    if (activeModal === "approve") {
      toast.success(`Underwriting Approved: Loan cleared for ${detailedApplicant.name} (${detailedApplicant.id}).`);
    } else if (activeModal === "reject") {
      toast.success(`Underwriting Rejected: Case closed for ${detailedApplicant.name}. Reason: ${rejectForm.reason || rejectForm.category}`);
    } else if (activeModal === "manual") {
      toast.success(`Underwriting Escalated: Case routed to ${manualForm.reviewer}. Expected completion: ${manualForm.expectedCompletion}`);
    } else if (activeModal === "request_docs") {
      const selectedList = Object.keys(requestDocsChecklist).filter((k) => requestDocsChecklist[k]);
      toast.success(`Document request dispatched: ${selectedList.join(", ")} requested from applicant.`);
    }

    setActiveModal(null);
    setDecisionNotes({ reason: "", specialConditions: "", additionalComments: "", customerFollowUp: "" });

    // Routing redirects back to Console
    setTimeout(() => {
      router.push("/officer/applications");
    }, 600);
  };

  if (!detailedApplicant) {
    return (
      <PageContainer className="pb-24">
        <div className="flex flex-col items-center justify-center min-h-[400px] border border-border border-dashed p-8 rounded bg-surface select-none">
          <User className="h-10 w-10 text-foreground-muted mb-3" />
          <h3 className="text-sm font-bold text-foreground">Applicant Dossier Not Found</h3>
          <p className="text-xs text-foreground-secondary mt-1 mb-4 font-sans text-center max-w-xs">
            The requested customer profile reference does not exist in databases.
          </p>
          <Button
            onClick={() => router.push("/officer/applications")}
            size="sm"
            className="text-[10px] uppercase font-sans font-bold cursor-pointer"
          >
            Back to Console
          </Button>
        </div>
      </PageContainer>
    );
  }

  return (
    <PageContainer className="pb-36 text-xs font-sans">
      
      {/* 1. TOP HEADER SECTION */}
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between pb-4 border-b border-border/70 select-none">
        <div className="space-y-1.5">
          <button
            onClick={() => router.push(`/officer/applicants/${detailedApplicant.id}`)}
            className="text-[10px] font-sans font-bold uppercase tracking-wider text-primary hover:underline flex items-center gap-1 cursor-pointer mb-1"
          >
            <ArrowLeft className="h-3.5 w-3.5" /> Back to Profile
          </button>
          
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="text-xl font-bold font-sans tracking-tight text-foreground">
              AI Underwriting Workspace
            </h1>
            <span className="text-[9px] font-mono text-foreground-muted border border-border px-2 py-0.5 rounded bg-surface-elevated font-bold uppercase">
              ID: {detailedApplicant.id}
            </span>
          </div>

          <p className="text-[10.5px] text-foreground-secondary font-sans leading-relaxed max-w-2xl">
            Review AI-generated financial intelligence, credit analysis, fraud analysis and supporting evidence before making the final underwriting decision.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Metadata indicators */}
          <div className="flex flex-wrap items-center gap-3 mr-3 text-[10px] border-r border-border/50 pr-4">
            <div className="text-right">
              <span className="text-[8px] text-foreground-muted uppercase block font-bold">Analysis Clock</span>
              <span className="font-mono font-bold text-foreground flex items-center gap-1 justify-end">
                <Clock className="h-3 w-3 text-primary" /> {lastAnalysisTime}
              </span>
            </div>
            <div className="text-right">
              <span className="text-[8px] text-foreground-muted uppercase block font-bold">Confidence</span>
              <span className="font-mono font-bold text-foreground">{detailedApplicant.confidence}%</span>
            </div>
          </div>

          <Button
            onClick={() => router.push(`/officer/applicants/${detailedApplicant.id}`)}
            size="sm"
            variant="outline"
            className="text-[9.5px] uppercase font-bold gap-1.5 cursor-pointer"
          >
            <Eye className="h-3 w-3" /> View Applicant
          </Button>

          <Button
            onClick={handleRefreshAnalysis}
            variant="outline"
            size="sm"
            className="text-[9.5px] uppercase font-bold gap-1 cursor-pointer"
          >
            <RefreshCw className={cn("h-3 w-3", isLoading && "animate-spin")} /> Refresh Analysis
          </Button>

          <Button
            onClick={handleDownloadSummary}
            variant="outline"
            size="sm"
            className="text-[9.5px] uppercase font-bold gap-1 cursor-pointer"
          >
            <Download className="h-3 w-3" /> Download Summary
          </Button>

          <Button
            onClick={handleGenerateReport}
            variant="outline"
            size="sm"
            className="text-[9.5px] uppercase font-bold gap-1 cursor-pointer"
          >
            <FileText className="h-3 w-3" /> Generate Report
          </Button>

          {/* Simulated connection toggle error button */}
          <button
            onClick={() => {
              setIsError(true);
              toast.error("Telemetry Pipeline Connection Lost.");
            }}
            className="text-[8.5px] bg-critical/5 text-critical border border-critical/20 rounded px-2 py-1 uppercase font-bold hover:bg-critical/10"
          >
            Trigger Connection Error
          </button>
        </div>
      </div>

      {isError ? (
        // SIMULATED ERROR STATE & RETRY BOX
        <div className="mt-6 select-none max-w-md mx-auto">
          <Card className="border border-critical border-dashed bg-critical/5 text-center p-8 rounded">
            <AlertCircle className="h-10 w-10 text-critical mx-auto mb-3" />
            <h3 className="text-sm font-bold text-foreground">AI Predictive Pipeline Offline</h3>
            <p className="text-xs text-foreground-secondary mt-1.5 mb-5 font-sans leading-relaxed">
              We couldn&apos;t establish a secure connection to the credit decision engine servers. Verify your client credentials and try again.
            </p>
            <Button
              onClick={() => {
                setIsError(false);
                setIsLoading(true);
                setTimeout(() => {
                  setIsLoading(false);
                  toast.success("AI Predictive Pipeline Reconnected successfully.");
                }, 800);
              }}
              size="sm"
              className="text-[10px] uppercase font-sans font-bold cursor-pointer bg-primary text-white"
            >
              Retry Connection
            </Button>
          </Card>
        </div>
      ) : isLoading ? (
        // ANIMATED SKELETON LOADER STATES
        <div className="space-y-6 mt-6 select-none animate-pulse">
          <div className="h-20 bg-surface-elevated border border-border rounded" />
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            <div className="lg:col-span-4 h-96 bg-surface-elevated border border-border rounded" />
            <div className="lg:col-span-5 h-96 bg-surface-elevated border border-border rounded" />
            <div className="lg:col-span-3 h-96 bg-surface-elevated border border-border rounded" />
          </div>
        </div>
      ) : (
        <>
          {/* 2. APPLICATION SUMMARY CARD */}
          <div className="mt-6">
            <Card className="border border-border/80 bg-surface select-none">
              <CardContent className="p-4 grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-x-5 gap-y-3.5 text-xs font-sans">
                <div>
                  <span className="text-[8.5px] text-foreground-muted block uppercase font-bold">Applicant</span>
                  <span className="font-bold text-foreground mt-0.5 block">{detailedApplicant.name}</span>
                </div>
                <div>
                  <span className="text-[8.5px] text-foreground-muted block uppercase font-bold">Loan Class</span>
                  <span className="font-bold text-foreground mt-0.5 block">{detailedApplicant.loanType}</span>
                </div>
                <div>
                  <span className="text-[8.5px] text-foreground-muted block uppercase font-bold">Requested Size</span>
                  <span className="font-extrabold text-foreground font-mono mt-0.5 block">₹{detailedApplicant.amount.toLocaleString("en-IN")}</span>
                </div>
                <div>
                  <span className="text-[8.5px] text-foreground-muted block uppercase font-bold">Application Purpose</span>
                  <span className="font-bold text-foreground-secondary mt-0.5 block truncate">{detailedApplicant.purpose}</span>
                </div>
                <div>
                  <span className="text-[8.5px] text-foreground-muted block uppercase font-bold">Current Status</span>
                  <StatusBadge status={detailedApplicant.status === "Pending" ? "pending" : "under_review"} className="mt-0.5" />
                </div>
                <div>
                  <span className="text-[8.5px] text-foreground-muted block uppercase font-bold">Officer Assigned</span>
                  <span className="font-bold text-foreground mt-0.5 block">{detailedApplicant.officer}</span>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* 3. WORKSPACE LAYOUT (3-COLUMN RESPONSIVE LAYOUT) */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mt-6 items-start">
            
            {/* LEFT PANEL (30% WIDTH - 3.6 COLS IN 12 COLS GRID) */}
            <div className="lg:col-span-4 space-y-6">
              <Card className="border border-border/80 bg-surface">
                <CardContent className="p-5 space-y-5">
                  <span className="text-[10px] font-bold text-foreground-muted uppercase tracking-widest block border-b border-border/40 pb-2.5 select-none">
                    Verified Customer Dossier
                  </span>

                  {/* Personal & Employment Info */}
                  <div className="space-y-3 font-sans text-xs">
                    <div className="flex justify-between">
                      <span className="text-foreground-secondary">Age Class:</span>
                      <span className="font-semibold text-foreground">{detailedApplicant.age} Years</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-foreground-secondary">Occupation:</span>
                      <span className="font-semibold text-foreground">{detailedApplicant.occupation}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-foreground-secondary">Corporate Employer:</span>
                      <span className="font-semibold text-foreground truncate max-w-[150px]">{detailedApplicant.employer}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-foreground-secondary">Customer Ingest Date:</span>
                      <span className="font-semibold text-foreground font-mono">{detailedApplicant.date}</span>
                    </div>
                  </div>

                  {/* Financial Snapshots */}
                  <div className="pt-4 border-t border-border/40 space-y-3">
                    <span className="text-[9.5px] font-bold text-foreground-muted uppercase tracking-wider block select-none">Quick Ledger Snapshots</span>
                    <div className="space-y-2 font-sans text-xs">
                      <div className="flex justify-between">
                        <span className="text-foreground-secondary font-medium">Monthly Inflow:</span>
                        <span className="font-bold text-foreground font-mono">₹{detailedApplicant.income.toLocaleString("en-IN")}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-foreground-secondary font-medium">Monthly Outflow:</span>
                        <span className="font-bold text-foreground font-mono text-foreground-secondary">₹{detailedApplicant.expenses.toLocaleString("en-IN")}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-foreground-secondary font-medium">Surplus Savings:</span>
                        <span className="font-bold text-positive font-mono">₹{(detailedApplicant.income - detailedApplicant.expenses).toLocaleString("en-IN")}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-foreground-secondary font-medium">Emergency Reserves:</span>
                        <span className="font-bold text-foreground font-mono">₹{detailedApplicant.savings.toLocaleString("en-IN")}</span>
                      </div>
                    </div>
                  </div>

                  {/* Liabilities Registry */}
                  <div className="pt-4 border-t border-border/40 space-y-2.5">
                    <span className="text-[9.5px] font-bold text-foreground-muted uppercase tracking-wider block select-none">Existing Debt register</span>
                    {detailedApplicant.existingLoans.length === 0 ? (
                      <div className="bg-surface-elevated border border-border p-3 text-center text-foreground-secondary font-sans rounded select-none">
                        No outstanding debt balances detected.
                      </div>
                    ) : (
                      <div className="border border-border rounded overflow-hidden select-none">
                        <table className="w-full text-[10.5px] text-left border-collapse">
                          <thead>
                            <tr className="bg-surface-elevated text-[8.5px] font-bold text-foreground-secondary uppercase border-b border-border">
                              <th className="py-2 px-2.5">Borrower</th>
                              <th className="py-2 px-2.5 text-right">Balance</th>
                              <th className="py-2 px-2.5 text-right">EMI</th>
                            </tr>
                          </thead>
                          <tbody>
                            {detailedApplicant.existingLoans.map((loan, idx) => (
                              <tr key={idx} className="border-b border-border/30 last:border-0 hover:bg-surface-hover/30">
                                <td className="py-2 px-2.5 font-bold text-foreground">{loan.bank}</td>
                                <td className="py-2 px-2.5 text-right font-mono font-bold text-foreground">₹{loan.amount.toLocaleString("en-IN")}</td>
                                <td className="py-2 px-2.5 text-right font-mono text-foreground-secondary">₹{loan.emi.toLocaleString("en-IN")}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>

                  {/* Ratios & checklist */}
                  <div className="pt-4 border-t border-border/40 space-y-2 text-[10.5px] font-sans">
                    <div className="flex justify-between">
                      <span className="text-foreground-secondary">Debt-to-Income (DTI) Ratio:</span>
                      <span className="font-extrabold text-foreground font-mono">
                        {Math.round((detailedApplicant.expenses / detailedApplicant.income) * 100)}%
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-foreground-secondary">Credit Card Utilization:</span>
                      <span className="font-extrabold text-warning font-mono">
                        {detailedApplicant.id === "app1" ? "64%" : "12%"}
                      </span>
                    </div>
                  </div>

                </CardContent>
              </Card>
            </div>

            {/* CENTER PANEL (45% WIDTH - 5.4 COLS IN 12 COLS GRID) */}
            <div className="lg:col-span-5 space-y-6">
              
              {/* AI INTELLIGENCE GAUGES */}
              <Card className="border border-border/80 bg-surface">
                <CardContent className="p-5 space-y-4">
                  <span className="text-[10px] font-bold text-foreground-muted uppercase tracking-widest block border-b border-border/40 pb-2.5 select-none">
                    AI Decision Telemetry Diagnostics
                  </span>

                  {/* Dials row */}
                  <div className="grid grid-cols-3 gap-3.5 select-none">
                    <div className="flex flex-col items-center text-center">
                      <span className="text-[8px] font-bold text-foreground-secondary uppercase tracking-wider block mb-1">
                        Financial Health
                      </span>
                      <div ref={healthGaugeRef} className="w-24 h-14" />
                      <span className="text-xs font-mono font-extrabold text-foreground mt-1">
                        {detailedApplicant.healthScore} <span className="text-[9px] text-foreground-muted">/100</span>
                      </span>
                    </div>

                    <div className="flex flex-col items-center text-center">
                      <span className="text-[8px] font-bold text-foreground-secondary uppercase tracking-wider block mb-1">
                        Default Prob.
                      </span>
                      <div ref={defaultGaugeRef} className="w-24 h-14" />
                      <span className={cn("text-xs font-mono font-extrabold mt-1",
                        detailedApplicant.defaultProb >= 50 ? "text-critical" : "text-positive"
                      )}>
                        {detailedApplicant.defaultProb}%
                      </span>
                    </div>

                    <div className="flex flex-col items-center text-center">
                      <span className="text-[8px] font-bold text-foreground-secondary uppercase tracking-wider block mb-1">
                        Fraud Rating
                      </span>
                      <div ref={fraudGaugeRef} className="w-24 h-14" />
                      <span className={cn("text-xs font-mono font-extrabold mt-1",
                        detailedApplicant.fraudRisk === "High" ? "text-critical" : "text-positive"
                      )}>
                        {detailedApplicant.fraudRisk === "High" ? "88" : "12"} <span className="text-[9px] text-foreground-muted">/100</span>
                      </span>
                    </div>
                  </div>

                  {/* Line Chart Cash Flow Forecasts */}
                  <div className="pt-4 border-t border-border/40 space-y-2 select-none">
                    <span className="text-[9.5px] font-bold text-foreground-secondary uppercase tracking-wider block">
                      Projected Monthly Cash Flow (6-Month AI Forecast)
                    </span>
                    <div ref={cashFlowChartRef} className="w-full h-44" />
                  </div>

                  {/* SHAP Chart Horizontal bars */}
                  <div className="pt-4 border-t border-border/40 space-y-2 select-none">
                    <span className="text-[9.5px] font-bold text-foreground-secondary uppercase tracking-wider block">
                      Local SHAP Feature Risk Attributions
                    </span>
                    <div ref={shapChartRef} className="w-full h-36" />
                    <p className="text-[9px] text-foreground-muted leading-relaxed font-sans text-center max-w-sm mx-auto">
                      Bars indicate feature contribution to default probability. Positive shifts push default estimation higher.
                    </p>
                  </div>
                </CardContent>
              </Card>

              {/* RISK FACTORS EXPANDABLE CARDS */}
              <div className="space-y-3.5 select-none">
                <span className="text-[10px] font-bold text-foreground-muted uppercase tracking-widest block">
                  Decision Indicators Risk Matrix
                </span>

                <div className="space-y-2.5">
                  {detailedApplicant.riskFactorsDetail.map((factor, idx) => {
                    const isExpanded = expandedRiskIdx === idx;
                    return (
                      <div
                        key={idx}
                        className="border border-border rounded bg-surface hover:border-primary/30 transition-all overflow-hidden"
                      >
                        {/* Header click */}
                        <div
                          onClick={() => toggleRiskCard(idx)}
                          className="p-3.5 flex items-center justify-between cursor-pointer hover:bg-surface-hover/30"
                        >
                          <div className="flex items-center gap-2">
                            <AlertCircle className="h-4 w-4 text-critical shrink-0" />
                            <span className="font-bold text-foreground">{factor.title}</span>
                          </div>

                          <div className="flex items-center gap-3">
                            <span className="text-[9px] bg-critical/10 text-critical border border-critical/20 rounded px-2 py-0.5 font-mono font-bold">
                              {factor.impact}
                            </span>
                            {isExpanded ? <ChevronDown className="h-4 w-4 text-foreground-secondary" /> : <ChevronRight className="h-4 w-4 text-foreground-secondary" />}
                          </div>
                        </div>

                        {/* Collapsed content */}
                        {isExpanded && (
                          <div className="px-3.5 pb-4 pt-1 border-t border-border/30 bg-surface-elevated/10 font-sans text-xs space-y-3">
                            <div className="grid grid-cols-3 gap-4 border-b border-border/30 pb-2.5">
                              <div>
                                <span className="text-[8.5px] text-foreground-muted block uppercase">Current Index</span>
                                <span className="font-mono font-bold text-foreground">{factor.current}</span>
                              </div>
                              <div>
                                <span className="text-[8.5px] text-foreground-muted block uppercase">Healthy target</span>
                                <span className="font-mono font-bold text-foreground">{factor.healthy}</span>
                              </div>
                              <div>
                                <span className="text-[8.5px] text-foreground-muted block uppercase">Confidence</span>
                                <span className="font-mono font-bold text-foreground-secondary">{factor.confidence}%</span>
                              </div>
                            </div>

                            <div className="space-y-1">
                              <span className="text-[9px] font-bold text-primary uppercase block">Suggested Underwriter Correction</span>
                              <p className="text-[10.5px] text-foreground-secondary leading-relaxed">{factor.suggestion}</p>
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* POSITIVE PROTECTIVE FACTORS */}
              <Card className="border border-border/80 bg-surface select-none">
                <CardContent className="p-5 space-y-3.5">
                  <span className="text-[10px] font-bold text-foreground-muted uppercase tracking-widest block border-b border-border/40 pb-2.5">
                    Bureau Protective Offsets
                  </span>

                  <div className="space-y-3">
                    {detailedApplicant.protectiveFactorsDetail.map((factor, idx) => (
                      <div key={idx} className="flex gap-3 items-start bg-positive/5 border border-positive/10 p-3 rounded font-sans text-xs">
                        <CheckCircle2 className="h-4.5 w-4.5 text-positive shrink-0 mt-0.5" />
                        <div className="space-y-0.5">
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-foreground block">{factor.title}</span>
                            <span className="text-[8px] bg-positive/10 text-positive border border-positive/20 rounded px-1.5 py-0.25 font-mono font-bold uppercase">
                              Confidence: {factor.confidence}%
                            </span>
                          </div>
                          <p className="text-[10.5px] text-foreground-secondary leading-relaxed">{factor.desc}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* DOCUMENT REVIEW WORKSPACE */}
              <Card className="border border-border/80 bg-surface select-none">
                <CardContent className="p-5 space-y-3.5">
                  <span className="text-[10px] font-bold text-foreground-muted uppercase tracking-widest block border-b border-border/40 pb-2.5">
                    Document Verification Logs
                  </span>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                    {detailedApplicant.documentFiles.map((doc) => (
                      <div key={doc.id} className="border border-border p-3 rounded bg-surface hover:border-primary/20 flex flex-col justify-between h-28 relative">
                        <div className="flex gap-2.5 items-start">
                          <FileText className="h-4.5 w-4.5 text-foreground-muted shrink-0 mt-0.5" />
                          <div className="space-y-0.5">
                            <span className="font-bold text-foreground block truncate max-w-[120px]">{doc.name}</span>
                            <span className="text-[8px] text-foreground-muted font-mono block">Uploaded: {doc.date}</span>
                          </div>
                        </div>

                        <div className="flex items-center justify-between border-t border-border/30 pt-2 mt-2">
                          <span className="text-[8px] font-bold px-1.5 py-0.25 rounded uppercase border bg-positive/5 text-positive border-positive/20 flex items-center gap-0.5">
                            <Check className="h-2 w-2" /> OK
                          </span>

                          <div className="flex items-center gap-2 font-mono text-[9px]">
                            <button
                              onClick={() => {
                                setSelectedDocName(doc.name);
                                setActiveModal("doc_preview");
                              }}
                              className="text-primary font-bold uppercase hover:underline cursor-pointer"
                            >
                              Preview
                            </button>
                            <button
                              onClick={() => toast.success(`Downloading file "${doc.name}"...`)}
                              className="text-foreground-secondary font-bold uppercase hover:underline cursor-pointer"
                            >
                              Get
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

            </div>

            {/* RIGHT PANEL (25% WIDTH - 3 COLS IN 12 COLS GRID) - STICKY STYLES */}
            <div className="lg:col-span-3 space-y-6 lg:sticky lg:top-6">
              
              {/* LARGE AI RECOMMENDATION WORKSPACE CARD */}
              <Card className="border border-border/80 bg-surface select-none">
                <CardContent className="p-5 space-y-4 font-sans text-xs">
                  <span className="text-[10px] font-bold text-foreground-muted uppercase tracking-widest block pb-2 border-b border-border/40">
                    AI Decision Recommendation
                  </span>

                  <div className={cn("border p-4 rounded text-center relative overflow-hidden",
                    detailedApplicant.aiRec === "Approve" ? "bg-positive/5 border-positive/20 text-positive" :
                    detailedApplicant.aiRec === "Deny" ? "bg-critical/5 border-critical/20 text-critical" : "bg-warning/5 border-warning/20 text-warning"
                  )}>
                    <Sparkles className="absolute -right-2 -bottom-2 h-12 w-12 opacity-15 rotate-12" />
                    <span className="text-[8px] font-bold uppercase tracking-wider block">Decision Proposal</span>
                    <span className="text-base font-extrabold uppercase tracking-widest block mt-1">
                      {detailedApplicant.aiRec === "Approve" ? "APPROVE" : detailedApplicant.aiRec === "Deny" ? "REJECT" : "MANUAL REVIEW"}
                    </span>
                    <span className="text-[9.5px] block mt-0.5 opacity-90 font-mono">
                      Model Confidence: {detailedApplicant.confidence}%
                    </span>
                  </div>

                  <div className="space-y-1.5">
                    <span className="text-[9px] font-bold text-foreground uppercase block">Risk Summary</span>
                    <p className="text-[10.5px] text-foreground-secondary leading-relaxed font-sans">
                      {detailedApplicant.id === "app1" 
                        ? "DTI limit and utilization represent high risk points. High payroll stability acts as mitigation." 
                        : "Low risk scores across all bureau registers with verified high liquidity balances."}
                    </p>
                  </div>

                  <div className="bg-surface-elevated/40 border border-border p-3 rounded">
                    <span className="text-[8.5px] font-bold text-foreground-muted block uppercase">Portfolio Yield Impact</span>
                    <p className="text-[10.5px] text-foreground-secondary leading-relaxed font-sans mt-0.5">
                      Estimated default yields impact stays within the bank target boundaries of &lt;1.8%.
                    </p>
                  </div>
                </CardContent>
              </Card>

              {/* DECISION NOTES EDITOR */}
              <Card className="border border-border/80 bg-surface">
                <CardContent className="p-5 space-y-4">
                  <span className="text-[10px] font-bold text-foreground-muted uppercase tracking-widest block pb-2 border-b border-border/40 select-none">
                    Underwriter Comments
                  </span>

                  <div className="space-y-3 font-sans text-xs">
                    
                    <div className="space-y-1">
                      <label className="text-[9px] font-bold text-foreground-secondary uppercase block">Decision Justification Reason *</label>
                      <input
                        type="text"
                        placeholder="Required decision justification notes..."
                        value={decisionNotes.reason}
                        onChange={(e) => setDecisionNotes(prev => ({ ...prev, reason: e.target.value }))}
                        className="w-full border border-border bg-surface-elevated/45 rounded p-2 text-xs font-semibold text-foreground focus:outline-none focus:border-primary"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-[9px] font-bold text-foreground-secondary uppercase block">Special Conditions</label>
                      <input
                        type="text"
                        placeholder="EMI auto-debit triggers, interest buffers..."
                        value={decisionNotes.specialConditions}
                        onChange={(e) => setDecisionNotes(prev => ({ ...prev, specialConditions: e.target.value }))}
                        className="w-full border border-border bg-surface-elevated/45 rounded p-2 text-xs text-foreground focus:outline-none focus:border-primary"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-[9px] font-bold text-foreground-secondary uppercase block">Additional Comments</label>
                      <textarea
                        placeholder="Internal underwriter logs..."
                        value={decisionNotes.additionalComments}
                        onChange={(e) => setDecisionNotes(prev => ({ ...prev, additionalComments: e.target.value }))}
                        className="w-full border border-border bg-surface-elevated/45 rounded p-2 text-xs text-foreground min-h-[50px] resize-none focus:outline-none focus:border-primary"
                      />
                    </div>

                    <div className="flex items-center gap-2 select-none">
                      <input
                        type="checkbox"
                        id="followupCheck"
                        checked={decisionNotes.customerFollowUp === "Yes"}
                        onChange={(e) => setDecisionNotes(prev => ({ ...prev, customerFollowUp: e.target.checked ? "Yes" : "" }))}
                        className="rounded border-border text-primary focus:ring-primary w-3.5 h-3.5"
                      />
                      <label htmlFor="followupCheck" className="text-[9.5px] font-bold text-foreground-secondary uppercase cursor-pointer">
                        Customer Follow-Up Required
                      </label>
                    </div>

                  </div>
                </CardContent>
              </Card>

              {/* ACTION BUTTONS PANEL */}
              <Card className="border border-border/80 bg-surface">
                <CardContent className="p-5 space-y-3.5 select-none">
                  <span className="text-[10px] font-bold text-foreground-muted uppercase tracking-widest block pb-2 border-b border-border/40">
                    Decision Action Center
                  </span>

                  <div className="grid grid-cols-1 gap-2.5">
                    <Button
                      onClick={() => handleTriggerAction("approve")}
                      className="w-full text-[9.5px] font-extrabold uppercase justify-center bg-positive hover:bg-positive/90 text-positive-foreground cursor-pointer py-2.5"
                    >
                      Approve Application
                    </Button>

                    <div className="grid grid-cols-2 gap-2">
                      <Button
                        onClick={() => handleTriggerAction("reject")}
                        className="text-[9.5px] font-extrabold uppercase justify-center bg-critical hover:bg-critical/95 text-white cursor-pointer py-2.5"
                      >
                        Reject App
                      </Button>
                      <Button
                        onClick={() => handleTriggerAction("manual")}
                        variant="outline"
                        className="text-[9.5px] font-bold uppercase justify-center border-border/80 hover:bg-surface-hover cursor-pointer py-2.5"
                      >
                        Escalate Review
                      </Button>
                    </div>

                    <Button
                      onClick={() => handleTriggerAction("request_docs")}
                      variant="outline"
                      className="w-full text-[9.5px] font-bold uppercase justify-center border-border/80 hover:bg-surface-hover cursor-pointer py-2.5"
                    >
                      Request Additional Documents
                    </Button>

                    <div className="grid grid-cols-2 gap-2">
                      <Button
                        onClick={() => toast.success("Draft saved successfully.")}
                        variant="outline"
                        className="text-[9px] font-bold uppercase justify-center border-border/80 hover:bg-surface-hover cursor-pointer"
                      >
                        Save Draft
                      </Button>
                      <Button
                        onClick={handleGenerateReport}
                        variant="outline"
                        className="text-[9px] font-bold uppercase justify-center border-border/80 hover:bg-surface-hover cursor-pointer"
                      >
                        Generate Report
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>

            </div>

          </div>

          {/* 4. RELATED APPLICATIONS BOTTOM TABLE */}
          <div className="mt-8 select-none">
            <Card className="border border-border/80 bg-surface">
              <CardContent className="p-5 space-y-4">
                <span className="text-[10px] font-bold text-foreground-muted uppercase tracking-widest block border-b border-border/40 pb-2.5">
                  Similar Application Benchmarking
                </span>

                <div className="border border-border rounded overflow-hidden">
                  <table className="w-full text-xs text-left border-collapse">
                    <thead>
                      <tr className="bg-surface-elevated text-[9px] font-bold text-foreground-secondary uppercase border-b border-border">
                        <th className="py-2.5 px-3">Applicant Name</th>
                        <th className="py-2.5 px-3">Loan Class</th>
                        <th className="py-2.5 px-3">Loan Size</th>
                        <th className="py-2.5 px-3">AI Recommendation</th>
                        <th className="py-2.5 px-3 text-right">Similarity Match</th>
                        <th className="py-2.5 px-3">Final Decision</th>
                      </tr>
                    </thead>
                    <tbody>
                      {detailedApplicant.relatedApplications.map((app, idx) => (
                        <tr key={idx} className="border-b border-border/30 last:border-0 hover:bg-surface-hover/30">
                          <td className="py-3 px-3 font-bold text-foreground">{app.applicantName}</td>
                          <td className="py-3 px-3 text-foreground-secondary">{app.loanType}</td>
                          <td className="py-3 px-3 font-mono font-bold text-foreground">₹{app.amount.toLocaleString("en-IN")}</td>
                          <td className="py-3 px-3">
                            <span className={cn("text-[8px] font-bold px-1.5 py-0.25 rounded uppercase border",
                              app.risk === "Low" ? "text-positive bg-positive/10 border-positive/20" : app.risk === "High" ? "text-warning bg-warning/10 border-warning/20" : "text-critical bg-critical/10 border-critical/20"
                            )}>
                              {app.risk} Risk
                            </span>
                          </td>
                          <td className="py-3 px-3 text-right font-mono font-bold text-primary">{app.similarity}</td>
                          <td className="py-3 px-3 font-semibold text-foreground-secondary">{app.decision}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* 5. CHRONOLOGICAL ACTIVITY TIMELINE */}
          <div className="mt-8 select-none">
            <Card className="border border-border/80 bg-surface">
              <CardContent className="p-5 space-y-4">
                <span className="text-[10px] font-bold text-foreground-muted uppercase tracking-widest block border-b border-border/40 pb-2.5">
                  Operations Activity Trail Logs
                </span>

                <div className="relative pl-6 border-l border-border space-y-5 ml-3">
                  {detailedApplicant.timelineEvents.map((item, idx) => (
                    <div key={idx} className="relative">
                      <div className="absolute -left-[30px] top-1 h-2.5 w-2.5 rounded-full bg-primary border-2 border-surface" />
                      
                      <div className="space-y-1">
                        <div className="flex items-center gap-2 text-[9.5px] font-mono text-foreground-muted">
                          <Clock className="h-3 w-3 text-primary" />
                          <span>{item.date}</span>
                          <span>•</span>
                          <span className="font-bold text-foreground-secondary">{item.user}</span>
                        </div>
                        <span className="font-bold text-foreground block text-xs">{item.action}</span>
                        <p className="text-foreground-secondary font-sans leading-relaxed text-[11px]">{item.notes}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </>
      )}

      {/* ==========================================
          MODALS OVERLAYS
         ========================================== */}

      {/* 1. APPROVAL MODAL */}
      <Modal
        isOpen={activeModal === "approve"}
        onClose={() => setActiveModal(null)}
        title="Confirm Underwriting Approval"
      >
        <div className="space-y-4 font-sans text-xs select-none">
          <p className="text-foreground-secondary leading-relaxed">
            Are you sure you want to approve credit clearance for applicant <b className="text-foreground">{detailedApplicant.name}</b>?
            This will log an approved clearance to the central registry files.
          </p>

          <div className="grid grid-cols-2 gap-4 border-y border-border/40 py-3 text-xs">
            <div>
              <span className="text-[9px] text-foreground-muted block uppercase">Loan Size</span>
              <span className="font-mono font-extrabold text-foreground">₹{detailedApplicant.amount.toLocaleString("en-IN")}</span>
            </div>
            <div>
              <span className="text-[9px] text-foreground-muted block uppercase">AI recommendation</span>
              <span className="font-bold text-positive uppercase">{detailedApplicant.aiRec}</span>
            </div>
          </div>

          <div className="bg-surface-elevated border border-border p-3.5 rounded">
            <span className="text-[9px] font-bold text-foreground-secondary uppercase tracking-wider block mb-1">Decision Justification Notes</span>
            <p className="text-foreground font-semibold italic">&quot;{decisionNotes.reason}&quot;</p>
          </div>

          <div className="flex justify-end gap-2.5 pt-2 border-t border-border/40">
            <Button
              variant="outline"
              onClick={() => setActiveModal(null)}
              size="sm"
              className="text-[9.5px] uppercase font-bold cursor-pointer"
            >
              Cancel
            </Button>
            <Button
              onClick={handleConfirmAction}
              size="sm"
              className="text-[9.5px] uppercase font-extrabold cursor-pointer bg-positive text-positive-foreground"
            >
              Confirm approval
            </Button>
          </div>
        </div>
      </Modal>

      {/* 2. REJECTION MODAL */}
      <Modal
        isOpen={activeModal === "reject"}
        onClose={() => setActiveModal(null)}
        title="Confirm Underwriting Rejection"
      >
        <div className="space-y-4 font-sans text-xs">
          <p className="text-foreground-secondary leading-relaxed select-none">
            Please select the primary reason category and outline audit logs details for rejecting <b className="text-foreground">{detailedApplicant.name}</b>.
          </p>

          <div className="space-y-3">
            <div className="space-y-1">
              <label className="text-[9px] font-bold text-foreground-secondary uppercase block select-none">Rejection Category *</label>
              <select
                value={rejectForm.category}
                onChange={(e) => setRejectForm(prev => ({ ...prev, category: e.target.value }))}
                className="w-full border border-border bg-surface rounded p-2 text-xs focus:outline-none"
              >
                <option value="DTI Too High">DTI Limits Exceeded (&gt;45%)</option>
                <option value="Credit Score Low">Experian Bureau Score Low (&lt;600)</option>
                <option value="Fraud Coordinates Anomaly">Device Telemetry Fraud Flags</option>
                <option value="Insufficient Liquidity">Insufficient Liquid Reserves</option>
                <option value="Inconsistent Income">Inconsistent Payroll Deposits</option>
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-[9px] font-bold text-foreground-secondary uppercase block select-none">Specific Rejection Reason *</label>
              <input
                type="text"
                placeholder="Required detailed rejection reason..."
                value={rejectForm.reason}
                onChange={(e) => setRejectForm(prev => ({ ...prev, reason: e.target.value }))}
                className="w-full border border-border bg-surface rounded p-2 text-xs font-semibold text-foreground focus:outline-none"
              />
            </div>

            <div className="space-y-1">
              <label className="text-[9px] font-bold text-foreground-secondary uppercase block select-none">Internal Underwriter Notes</label>
              <textarea
                placeholder="Optional notes for registry audit logs..."
                value={rejectForm.notes}
                onChange={(e) => setRejectForm(prev => ({ ...prev, notes: e.target.value }))}
                className="w-full border border-border bg-surface rounded p-2 text-xs min-h-[50px] resize-none focus:outline-none"
              />
            </div>
          </div>

          <div className="flex justify-end gap-2.5 pt-2 border-t border-border/40 select-none">
            <Button
              variant="outline"
              onClick={() => setActiveModal(null)}
              size="sm"
              className="text-[9.5px] uppercase font-bold cursor-pointer"
            >
              Cancel
            </Button>
            <Button
              onClick={() => {
                if (!rejectForm.reason.trim()) {
                  toast.error("Please provide a specific rejection reason.");
                  return;
                }
                handleConfirmAction();
              }}
              size="sm"
              className="text-[9.5px] uppercase font-extrabold cursor-pointer bg-critical text-white font-sans"
            >
              Confirm Rejection
            </Button>
          </div>
        </div>
      </Modal>

      {/* 3. MANUAL REVIEW MODAL */}
      <Modal
        isOpen={activeModal === "manual"}
        onClose={() => setActiveModal(null)}
        title="Escalate manual audit"
      >
        <div className="space-y-4 font-sans text-xs">
          <p className="text-foreground-secondary leading-relaxed select-none">
            Select the senior manager and expected timeline target for escalating <b className="text-foreground">{detailedApplicant.name}</b>.
          </p>

          <div className="space-y-3">
            <div className="space-y-1">
              <label className="text-[9px] font-bold text-foreground-secondary uppercase block select-none">Assigned Senior Auditor *</label>
              <select
                value={manualForm.reviewer}
                onChange={(e) => setManualForm(prev => ({ ...prev, reviewer: e.target.value }))}
                className="w-full border border-border bg-surface rounded p-2 text-xs focus:outline-none"
              >
                <option value="Senior Credit Officer (Priya)">Senior Credit Officer (Priya)</option>
                <option value="Risk Director (Sen)">Risk Management Director (Sen)</option>
                <option value="Branch Manager (Malhotra)">Branch Manager (Malhotra)</option>
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-[9px] font-bold text-foreground-secondary uppercase block select-none">Timeline Target *</label>
              <select
                value={manualForm.expectedCompletion}
                onChange={(e) => setManualForm(prev => ({ ...prev, expectedCompletion: e.target.value }))}
                className="w-full border border-border bg-surface rounded p-2 text-xs focus:outline-none"
              >
                <option value="12 Hours">Immediate (12 Hours)</option>
                <option value="24 Hours">Routine (24 Hours)</option>
                <option value="48 Hours">Deferred (48 Hours)</option>
                <option value="5 Days">Long Review (5 Days)</option>
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-[9px] font-bold text-foreground-secondary uppercase block select-none">Escalation Reason details *</label>
              <input
                type="text"
                placeholder="Specify details for escalation review..."
                value={manualForm.reason}
                onChange={(e) => setManualForm(prev => ({ ...prev, reason: e.target.value }))}
                className="w-full border border-border bg-surface rounded p-2 text-xs font-semibold text-foreground focus:outline-none"
              />
            </div>
          </div>

          <div className="flex justify-end gap-2.5 pt-2 border-t border-border/40 select-none">
            <Button
              variant="outline"
              onClick={() => setActiveModal(null)}
              size="sm"
              className="text-[9.5px] uppercase font-bold cursor-pointer"
            >
              Cancel
            </Button>
            <Button
              onClick={() => {
                if (!manualForm.reason.trim()) {
                  toast.error("Please specify an escalation reason.");
                  return;
                }
                handleConfirmAction();
              }}
              size="sm"
              className="text-[9.5px] uppercase font-extrabold cursor-pointer bg-primary text-white"
            >
              Escalate Case
            </Button>
          </div>
        </div>
      </Modal>

      {/* 4. REQUEST DOCUMENTS MODAL */}
      <Modal
        isOpen={activeModal === "request_docs"}
        onClose={() => setActiveModal(null)}
        title="Request Updated Documents"
      >
        <div className="space-y-4 font-sans text-xs">
          <p className="text-foreground-secondary leading-relaxed select-none">
            Check the documents list that the client needs to re-submit or update:
          </p>

          <div className="space-y-2 max-h-48 overflow-y-auto border border-border p-3 rounded bg-surface-elevated/10">
            {Object.keys(requestDocsChecklist).map((name) => (
              <div key={name} className="flex items-center gap-2 select-none">
                <input
                  type="checkbox"
                  id={`req-${name}`}
                  checked={requestDocsChecklist[name]}
                  onChange={() => handleDocCheckboxChange(name)}
                  className="rounded border-border text-primary focus:ring-primary h-3.5 w-3.5 cursor-pointer"
                />
                <label htmlFor={`req-${name}`} className="text-xs text-foreground cursor-pointer hover:text-primary">
                  {name}
                </label>
              </div>
            ))}
          </div>

          <div className="space-y-1">
            <label className="text-[9px] font-bold text-foreground-secondary uppercase block select-none">Message to Applicant</label>
            <textarea
              placeholder="Provide a clarification message (e.g. Please upload latest bank ledger detailing TDS filings)..."
              value={requestDocMessage}
              onChange={(e) => setRequestDocMessage(e.target.value)}
              className="w-full border border-border bg-surface rounded p-2 text-xs min-h-[60px] resize-none focus:outline-none"
            />
          </div>

          <div className="flex justify-end gap-2.5 pt-2 border-t border-border/40 select-none">
            <Button
              variant="outline"
              onClick={() => setActiveModal(null)}
              size="sm"
              className="text-[9.5px] uppercase font-bold cursor-pointer"
            >
              Cancel
            </Button>
            <Button
              onClick={() => {
                const selectedCount = Object.keys(requestDocsChecklist).filter(k => requestDocsChecklist[k]).length;
                if (selectedCount === 0) {
                  toast.error("Please select at least one document to request.");
                  return;
                }
                handleConfirmAction();
              }}
              size="sm"
              className="text-[9.5px] uppercase font-extrabold cursor-pointer bg-primary text-white"
            >
              Send Request
            </Button>
          </div>
        </div>
      </Modal>

      {/* 5. DOCUMENT PREVIEW MODAL */}
      <Modal
        isOpen={activeModal === "doc_preview"}
        onClose={() => setActiveModal(null)}
        title="Document Ledger Check"
      >
        <div className="space-y-4 font-sans text-xs text-center select-none">
          <div className="w-full h-44 border border-border border-dashed rounded bg-surface-elevated/45 flex flex-col items-center justify-center text-foreground-secondary">
            <FileText className="h-10 w-10 text-foreground-muted mb-2 animate-bounce" />
            <span className="text-xs font-bold text-foreground">{selectedDocName}</span>
            <span className="text-[9px] text-foreground-muted mt-1 font-mono">Format: PDF • Verification: Verified</span>
          </div>

          <div className="text-left space-y-2">
            <span className="text-[10px] font-bold text-foreground-secondary uppercase block">Integrity Scan Logs</span>
            <p className="text-xs text-foreground-secondary leading-relaxed bg-surface border border-border p-3.5 rounded">
              Document parsed successfully. Checked security factors:
              <br />
              <span className="font-mono text-[9.5px] text-foreground-muted block mt-1.5 leading-normal">
                - PDF digital cryptographic tag: Authenticated
                <br />
                - Direct employer corporate logo scan: Verified Match
                <br />
                - Financial transaction date matching: Verified
              </span>
            </p>
          </div>

          <div className="flex justify-end pt-2 border-t border-border/40">
            <Button
              onClick={() => setActiveModal(null)}
              size="sm"
              className="text-[9.5px] uppercase font-bold cursor-pointer font-sans"
            >
              Close Preview
            </Button>
          </div>
        </div>
      </Modal>

    </PageContainer>
  );
}
