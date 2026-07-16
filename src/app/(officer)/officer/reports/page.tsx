"use client";

import React, { useState, useMemo, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useTheme } from "next-themes";
import * as echarts from "echarts";
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  getPaginationRowModel,
  ColumnDef,
  flexRender,
  SortingState,
  VisibilityState,
} from "@tanstack/react-table";
import {
  FileText,
  History,
  ArrowLeft,
  Search,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  SlidersHorizontal,
  Eye,
  Download,
  RefreshCw,
  Calendar,
  Clock,
  Timer,
  CheckCircle2,
  Sliders,
  TrendingUp,
  TrendingDown,
  User,
  Info,
  Scale,
  ShieldCheck,
  RotateCcw,
  Plus,
  Play,
  Pause,
  Trash2,
  Share2,
  Copy,
  AlertTriangle,
  FileSpreadsheet,
  Printer,
  Sparkles,
  ClipboardList
} from "lucide-react";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";

import PageContainer from "@/components/ui/PageContainer";
import { Card, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Modal, Popover } from "@/components/ui/Overlays";
import { StatusBadge } from "@/components/ui/Badge";
import { ModelConfidence } from "@/components/ui/ValueDisplay";
import { Skeleton, EmptyState, ErrorState } from "@/components/ui/FeedbackState";
import { cn } from "@/lib/utils";
import { OFFICER_APPLICANTS } from "@/lib/officer_data";
import { MOCK_REPORTS, ReportItem } from "@/lib/reports_data";

// ============================================================================
// TYPE DEFINITIONS
// ============================================================================
interface ScheduledReport {
  id: string;
  name: string;
  category: string;
  frequency: "Daily" | "Weekly" | "Monthly";
  recipients: string;
  nextRun: string;
  status: "Active" | "Paused";
}

interface ReportTemplate {
  id: string;
  name: string;
  category: string;
  description: string;
  includeAISummary: boolean;
  includeCharts: boolean;
  includeExplainability: boolean;
  outputFormat: "PDF" | "Excel" | "CSV";
}

// ============================================================================
// REPORT CATEGORIES DEFINITIONS
// ============================================================================
const REPORT_CATEGORIES = [
  { id: "loan-app", name: "Loan Application Report", desc: "Detailed breakdown of requested terms, applicant profile, and bureau scores.", time: "~10s", icon: ClipboardList },
  { id: "port-risk", name: "Portfolio Risk Report", desc: "Aggregated credit grades, sector exposures, and delinquency benchmarks.", time: "~25s", icon: Scale },
  { id: "cust-fin", name: "Customer Financial Report", desc: "Comprehensive audit of income streams, fixed outlays, and asset allocation.", time: "~15s", icon: User },
  { id: "credit-anal", name: "Credit Analysis Report", desc: "Deep-dive inquiry of repayment histories, revolving limits, and CIBIL queries.", time: "~12s", icon: ShieldCheck },
  { id: "fraud-invest", name: "Fraud Investigation Report", desc: "Logs transactional location velocity, VPN routing, and credential validation flags.", time: "~18s", icon: AlertTriangle },
  { id: "cash-flow", name: "Cash Flow Analysis", desc: "Time-series forecasts modeling net operational cash velocities and checking thresholds.", time: "~20s", icon: TrendingUp },
  { id: "officer-perf", name: "Officer Performance Report", desc: "Audits processing SLAs, approval metrics, and decision alignments vs AI recommendations.", time: "~30s", icon: Timer },
  { id: "month-summ", name: "Monthly Summary Report", desc: "Consolidated underwriting log metrics, clearance times, and portfolio additions.", time: "~22s", icon: Calendar },
  { id: "compliance", name: "Compliance Report", desc: "Verifies KYC checklists, anti-money laundering indicators, and auditor guidelines.", time: "~15s", icon: Info },
  { id: "ai-rec", name: "AI Recommendation Report", desc: "Explainable model parameters, SHAP attributions, and tree decision trees details.", time: "~12s", icon: Sparkles }
];

const mapCategoryToType = (category: string): "Complete Intelligence" | "Financial Health" | "Credit Risk" | "Fraud" | "Cash Flow" => {
  if (category.includes("Risk") || category.includes("Credit")) return "Credit Risk";
  if (category.includes("Financial")) return "Financial Health";
  if (category.includes("Fraud")) return "Fraud";
  if (category.includes("Cash")) return "Cash Flow";
  return "Complete Intelligence";
};

// ============================================================================
// INITIAL MOCK SCHEDULER DATA
// ============================================================================
const INITIAL_SCHEDULES: ScheduledReport[] = [
  {
    id: "SCH-001",
    name: "Weekly Portfolio Risk Summary",
    category: "Portfolio Risk Report",
    frequency: "Weekly",
    recipients: "risk-committee@arth.com, board@arth.com",
    nextRun: "2026-07-13 08:00 AM",
    status: "Active"
  },
  {
    id: "SCH-002",
    name: "Monthly Compliance Audit Report",
    category: "Compliance Report",
    frequency: "Monthly",
    recipients: "audit-desk@arth.com",
    nextRun: "2026-08-01 09:00 AM",
    status: "Active"
  },
  {
    id: "SCH-003",
    name: "Daily Queue Efficiency Logs",
    category: "Officer Performance Report",
    frequency: "Daily",
    recipients: "operations-lead@arth.com",
    nextRun: "Paused",
    status: "Paused"
  }
];

// ============================================================================
// INITIAL REUSABLE TEMPLATES DATA
// ============================================================================
const INITIAL_TEMPLATES: ReportTemplate[] = [
  { id: "temp-1", name: "Financial Health", category: "Customer Financial Report", description: "Audits assets, fixed monthly outlays, and checking cushion durations.", includeAISummary: true, includeCharts: true, includeExplainability: false, outputFormat: "PDF" },
  { id: "temp-2", name: "Credit Risk Assessment", category: "Credit Analysis Report", description: "Pulls credit profiles, leverage ratios, and outstanding EMI balances.", includeAISummary: true, includeCharts: true, includeExplainability: true, outputFormat: "PDF" },
  { id: "temp-3", name: "Fraud & Geolocation Analysis", category: "Fraud Investigation Report", description: "Anomalies, remote cellular routing VPN logs, and matching coordinates.", includeAISummary: false, includeCharts: true, includeExplainability: true, outputFormat: "CSV" },
  { id: "temp-4", name: "TFT Cash Flow Forecast", category: "Cash Flow Analysis", description: "Time-series forecasts, checking accounts balances, and vendor logs.", includeAISummary: true, includeCharts: true, includeExplainability: false, outputFormat: "Excel" },
  { id: "temp-5", name: "Executive Portfolio Grade", category: "Portfolio Risk Report", description: "Consolidated risk statistics and sector exposures for risk committees.", includeAISummary: true, includeCharts: true, includeExplainability: false, outputFormat: "PDF" },
  { id: "temp-6", name: "Monthly Summary Logs", category: "Monthly Summary Report", description: "SLA rates, queue additions, and credit approval histories.", includeAISummary: true, includeCharts: false, includeExplainability: false, outputFormat: "Excel" },
  { id: "temp-7", name: "KYC & AML Audit Checklist", category: "Compliance Report", description: "Auditor checklist, identity validations, and KYC confirmations.", includeAISummary: true, includeCharts: false, includeExplainability: false, outputFormat: "PDF" }
];

function MiniSparkline({ data, color }: { data: number[]; color: string }) {
  const max = Math.max(...data);
  const min = Math.min(...data);
  const range = max - min || 1;
  const width = 50;
  const height = 16;
  const points = data.map((val, index) => {
    const x = (index / (data.length - 1)) * width;
    const y = height - ((val - min) / range) * height;
    return `${x},${y}`;
  }).join(" ");

  return (
    <svg width={width} height={height} className="overflow-visible">
      <polyline
        fill="none"
        stroke={color}
        strokeWidth="1.5"
        points={points}
      />
    </svg>
  );
}

export default function OfficerReportsPage() {
  const router = useRouter();
  const { resolvedTheme } = useTheme();

  // Loading & Error States
  const [isLoading, setIsLoading] = useState(false);
  const [isError] = useState(false);

  // Core Mock States
  const [reports, setReports] = useState<ReportItem[]>(MOCK_REPORTS);
  const [schedules, setSchedules] = useState<ScheduledReport[]>(INITIAL_SCHEDULES);
  const [templates] = useState<ReportTemplate[]>(INITIAL_TEMPLATES);

  // Active generation inputs
  const [genReportType, setGenReportType] = useState("Loan Application Report");
  const [genApplicant, setGenApplicant] = useState("Rahul Sen");
  const [genPortfolio, setGenPortfolio] = useState("Retail Mortgages");
  const [genOfficer, setGenOfficer] = useState("Officer Rahul");
  const [genDateRange, setGenDateRange] = useState("Last 30 Days");
  const [genOutputFormat, setGenOutputFormat] = useState<"PDF" | "Excel" | "CSV">("PDF");
  const [genLanguage, setGenLanguage] = useState("English");
  
  const [optAISummary, setOptAISummary] = useState(true);
  const [optCharts, setOptCharts] = useState(true);
  const [optExplainability, setOptExplainability] = useState(true);
  const [optTransactions, setOptTransactions] = useState(true);
  const [optDocuments, setOptDocuments] = useState(true);

  // Progress state for report generation
  const [genProgress, setGenProgress] = useState(-1);

  // Simulated Export
  const handleExport = () => {
    toast.promise(
      new Promise((resolve) => setTimeout(resolve, 1000)),
      {
        loading: "Compiling reports audit history (CSV)...",
        success: "Success! Export file downloaded.",
        error: "Failed to export."
      }
    );
  };

  // Selection states
  const [activePreview, setActivePreview] = useState<ReportItem>(MOCK_REPORTS[0]);
  const [officerNotes, setOfficerNotes] = useState("Compliance parameters verified successfully. Low revolving card utilization offsets minor credit score warnings.");

  // Modals & popups
  const [shareOpen, setShareOpen] = useState(false);
  const [shareEmail, setShareEmail] = useState("");
  const [shareRecipient, setShareRecipient] = useState("");
  const [shareMessage, setShareMessage] = useState("");
  const [sharePermission, setSharePermission] = useState("Read-only");

  const [scheduleModalOpen, setScheduleModalOpen] = useState(false);
  const [schReportType, setSchReportType] = useState("Loan Application Report");
  const [schFrequency, setSchFrequency] = useState<"Daily" | "Weekly" | "Monthly">("Weekly");
  const [schRecipients, setSchRecipients] = useState("");
  const [schName, setSchName] = useState("");

  // Table filtering and visibility
  const [historySearch, setHistorySearch] = useState("");
  const [historyCategory, setHistoryCategory] = useState("All");
  const [historyFormat, setHistoryFormat] = useState("All");
  const [sorting, setSorting] = useState<SortingState>([{ id: "generatedDate", desc: true }]);
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
  const [pageIndex, setPageIndex] = useState(0);
  const [pageSize, setPageSize] = useState(5);
  const [density, setDensity] = useState<"default" | "compact">("default");

  // Chart refs
  const reportsGenRef = useRef<HTMLDivElement>(null);
  const downloadsRef = useRef<HTMLDivElement>(null);
  const categoriesRef = useRef<HTMLDivElement>(null);
  const speedsRef = useRef<HTMLDivElement>(null);
  const previewChartRef = useRef<HTMLDivElement>(null);

  // ============================================================================
  // DERIVED DATA LOGIC
  // ============================================================================
  const filteredHistory = useMemo(() => {
    return reports.filter((r) => {
      // 1. General search
      if (historySearch) {
        const term = historySearch.toLowerCase();
        const match = r.id.toLowerCase().includes(term) ||
                      r.name.toLowerCase().includes(term) ||
                      r.type.toLowerCase().includes(term);
        if (!match) return false;
      }
      // 2. Category
      if (historyCategory !== "All" && r.type !== historyCategory) {
        return false;
      }
      // 3. Format
      if (historyFormat !== "All") {
        const fmt = r.fileSize.includes("MB") ? "PDF" : r.fileSize.includes("KB") ? "CSV" : "Excel";
        if (historyFormat !== fmt) return false;
      }
      return true;
    });
  }, [reports, historySearch, historyCategory, historyFormat]);

  // ============================================================================
  // GENERATION SIMULATOR
  // ============================================================================
  const triggerGenerateReport = () => {
    if (genProgress >= 0) return;
    setGenProgress(0);
    toast.info(`Initializing AI Compilation engine for ${genReportType}...`);

    const interval = setInterval(() => {
      setGenProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          setTimeout(() => {
            // Generate report item
            const newId = `REP-2026-00${reports.length + 1}`;
            const formatStr = genOutputFormat;
            const sizeStr = formatStr === "PDF" ? "3.2 MB" : formatStr === "CSV" ? "420 KB" : "1.8 MB";
            
            const newReport: ReportItem = {
              id: newId,
              name: `${genReportType} - ${genApplicant}`,
              type: mapCategoryToType(genReportType),
              generatedDate: "July 12, 2026",
              analysisPeriod: genDateRange,
              status: "Ready",
              fileSize: sizeStr,
              summary: {
                status: "AI COMPILED & AUDITED",
                topRisk: "Debt-to-Income parameters within target limits",
                strongestFactor: "Verified liquid savings balances",
                topRecommendation: "Approve primary clearance tiers",
                confidence: "95.2% tree-ensemble index"
              },
              content: {
                executiveSummary: `This ${genReportType} compiles financial data metrics for applicant ${genApplicant}. Evaluated parameters conform to the ${genPortfolio} portfolio guidelines under the guidance of auditing officer ${genOfficer}. AI risk scoring indicates prime clearance flags with stable temporal parameters.`,
                keyRisks: optExplainability ? "Model SHAP parameters assign low risk weights to current debt balances, offset by minor length limits." : "Explainability parameters not requested in export template.",
                financialHealth: "Applicant assets demonstrate adequate coverage. Cash flows reflect positive overhead margins.",
                creditAnalysis: "Bureau pull indicates current standing with 100% billing history compliance.",
                fraudAnalysis: "Anomalies velocity scoring shows zero pending alert flags.",
                cashFlowForecast: "LSTM forecast modeling projects stable balances over the analysis bounds.",
                aiExplanations: "SHAP weights assign strong values to stability reserves.",
                recommendations: "Approve requested terms safely. Establish standard monthly sweeps.",
                methodology: "Calculated using tree-ensemble risk weights classifiers and LSTM forecasts."
              }
            };

            setReports((prev) => [newReport, ...prev]);
            setActivePreview(newReport);
            setGenProgress(-1);
            toast.success(`Success! ${genReportType} generated successfully.`);
          }, 400);
          return 100;
        }
        return prev + 20;
      });
    }, 250);
  };

  // Immediate preview trigger
  const handleImmediatePreview = () => {
    // Locate match or create a temporary mock item
    const match = reports.find(r => r.name.startsWith(genReportType));
    if (match) {
      setActivePreview(match);
      toast.success(`Previewing compiled template: ${match.name}`);
    } else {
      toast.info(`No compiled logs found for category "${genReportType}". Initializing visual draft...`);
      const draftReport: ReportItem = {
        id: "DRAFT-REP",
        name: `[DRAFT] ${genReportType} - ${genApplicant}`,
        type: mapCategoryToType(genReportType),
        generatedDate: "July 12, 2026",
        analysisPeriod: genDateRange,
        status: "Ready",
        fileSize: "Draft Preview",
        summary: {
          status: "DRAFT VIEW ONLY",
          topRisk: "Under evaluation...",
          strongestFactor: "Under evaluation...",
          topRecommendation: "Audit parameter settings",
          confidence: "Pending..."
        },
        content: {
          executiveSummary: `Visual preview draft of ${genReportType} for applicant ${genApplicant}. Configure output format properties in parameters panel before exporting files.`,
          keyRisks: "Draft data.",
          financialHealth: "Draft data.",
          creditAnalysis: "Draft data.",
          fraudAnalysis: "Draft data.",
          cashFlowForecast: "Draft data.",
          aiExplanations: "Draft data.",
          recommendations: "Draft data.",
          methodology: "Draft data."
        }
      };
      setActivePreview(draftReport);
    }
  };

  // Simulating Template usage
  const handleUseTemplate = (temp: ReportTemplate) => {
    setGenReportType(temp.category);
    setGenOutputFormat(temp.outputFormat);
    setOptAISummary(temp.includeAISummary);
    setOptCharts(temp.includeCharts);
    setOptExplainability(temp.includeExplainability);
    toast.success(`Template loaded: "${temp.name}". Parameters auto-populated.`);
  };

  // Scheduled Reports Actions
  const handleToggleSchedule = (id: string) => {
    setSchedules((prev) =>
      prev.map((sch) => {
        if (sch.id === id) {
          const nextStatus = sch.status === "Active" ? "Paused" : "Active";
          const nextRunDate = nextStatus === "Active" ? "2026-07-15 08:00 AM" : "Paused";
          toast.success(`Schedule "${sch.name}" ${nextStatus === "Active" ? "resumed" : "paused"}.`);
          return { ...sch, status: nextStatus, nextRun: nextRunDate };
        }
        return sch;
      })
    );
  };

  const handleDeleteSchedule = (id: string) => {
    setSchedules((prev) => prev.filter((sch) => sch.id !== id));
    toast.success("Scheduled report deleted.");
  };

  const handleSaveSchedule = (e: React.FormEvent) => {
    e.preventDefault();
    if (!schName || !schRecipients) {
      toast.error("Please fill in all scheduling fields.");
      return;
    }
    const newSch: ScheduledReport = {
      id: `SCH-00${schedules.length + 1}`,
      name: schName,
      category: schReportType,
      frequency: schFrequency,
      recipients: schRecipients,
      nextRun: "2026-07-14 08:00 AM",
      status: "Active"
    };
    setSchedules((prev) => [...prev, newSch]);
    setScheduleModalOpen(false);
    setSchName("");
    setSchRecipients("");
    toast.success(`Scheduled task "${schName}" configured successfully.`);
  };

  // Reusable templates actions
  const handleSaveTemplate = () => {
    toast.success("Parameters saved as custom template.");
  };

  // Simulated PDF download
  const handleDownload = (r: ReportItem, format: "PDF" | "Excel" | "CSV") => {
    toast.promise(
      new Promise((resolve) => setTimeout(resolve, 1000)),
      {
        loading: `Compressing audit data into ${format} metadata...`,
        success: `File downloaded: ${r.name}.${format.toLowerCase()}`,
        error: "Compression error."
      }
    );
  };

  // Simulated sharing action
  const handleShareReport = (e: React.FormEvent) => {
    e.preventDefault();
    if (!shareEmail || !shareRecipient) {
      toast.error("Please provide recipient information.");
      return;
    }
    toast.promise(
      new Promise((resolve) => setTimeout(resolve, 1000)),
      {
        loading: "Configuring secure data transfer spool...",
        success: `Report shared successfully with ${shareRecipient} (${sharePermission} access).`,
        error: "Transfer error."
      }
    );
    setShareOpen(false);
    setShareEmail("");
    setShareRecipient("");
    setShareMessage("");
  };

  // Simulated report duplicate
  const handleDuplicateReport = (r: ReportItem) => {
    const copy: ReportItem = {
      ...r,
      id: `REP-2026-00${reports.length + 1}`,
      name: `${r.name} (Copy)`,
      generatedDate: "July 12, 2026",
    };
    setReports((prev) => [copy, ...prev]);
    toast.success(`Report duplicated as: ${copy.name}`);
  };

  // Simulated report archive
  const handleArchiveReport = (id: string) => {
    setReports((prev) => prev.filter((r) => r.id !== id));
    toast.success("Report archived safely.");
  };

  // Simulated report delete
  const handleDeleteReport = (id: string) => {
    setReports((prev) => prev.filter((r) => r.id !== id));
    toast.success("Report deleted from ledger logs.");
  };

  // Refresh database
  const handleRefresh = () => {
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      toast.success("Reports database synchronized successfully.");
    }, 700);
  };

  // ECharts layout resizing
  useEffect(() => {
    if (isLoading || isError) return;

    const chartInstances: echarts.ECharts[] = [];
    const isDark = document.documentElement.classList.contains("dark");
    const labelColor = isDark ? "#94A3B8" : "#64748B";
    const gridLineColor = isDark ? "rgba(255, 255, 255, 0.08)" : "rgba(0, 0, 0, 0.06)";

    const initChart = (ref: React.RefObject<HTMLDivElement | null>, option: echarts.EChartsOption) => {
      if (!ref.current) return null;
      const existing = echarts.getInstanceByDom(ref.current);
      if (existing) {
        existing.dispose();
      }
      const chart = echarts.init(ref.current);
      chart.setOption(option);
      chartInstances.push(chart);
      return chart;
    };

    // 1. Reports Generated over time
    initChart(reportsGenRef, {
      tooltip: {
        trigger: "axis",
        backgroundColor: isDark ? "#0E1421" : "#FFFFFF",
        borderColor: isDark ? "#1E293B" : "#E2E8F0",
        textStyle: { color: isDark ? "#F8FAFC" : "#0F172A", fontSize: 9 }
      },
      grid: { top: 20, bottom: 25, left: 35, right: 15 },
      xAxis: { type: "category", data: ["Feb", "Mar", "Apr", "May", "Jun", "Jul"], axisLabel: { color: labelColor, fontSize: 8.5 } },
      yAxis: { type: "value", splitLine: { lineStyle: { color: gridLineColor } }, axisLabel: { color: labelColor, fontSize: 8.5 } },
      series: [
        {
          type: "bar",
          data: [120, 145, 185, 220, 235, 248],
          itemStyle: { color: "#4F7CFF", borderRadius: [2, 2, 0, 0] }
        }
      ]
    });

    // 2. Downloads volume
    initChart(downloadsRef, {
      tooltip: {
        trigger: "axis",
        backgroundColor: isDark ? "#0E1421" : "#FFFFFF",
        borderColor: isDark ? "#1E293B" : "#E2E8F0",
        textStyle: { color: isDark ? "#F8FAFC" : "#0F172A", fontSize: 9 }
      },
      grid: { top: 20, bottom: 25, left: 35, right: 15 },
      xAxis: { type: "category", data: ["Feb", "Mar", "Apr", "May", "Jun", "Jul"], axisLabel: { color: labelColor, fontSize: 8.5 } },
      yAxis: { type: "value", splitLine: { lineStyle: { color: gridLineColor } }, axisLabel: { color: labelColor, fontSize: 8.5 } },
      series: [
        {
          type: "line",
          smooth: true,
          data: [80, 110, 140, 175, 168, 195],
          itemStyle: { color: "#10B981" },
          lineStyle: { width: 2 },
          areaStyle: {
            color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
              { offset: 0, color: "rgba(16, 185, 129, 0.12)" },
              { offset: 1, color: "rgba(16, 185, 129, 0)" }
            ])
          }
        }
      ]
    });

    // 3. Most Used Report categories
    initChart(categoriesRef, {
      tooltip: {
        trigger: "item",
        backgroundColor: isDark ? "#0E1421" : "#FFFFFF",
        borderColor: isDark ? "#1E293B" : "#E2E8F0",
        textStyle: { color: isDark ? "#F8FAFC" : "#0F172A", fontSize: 9 }
      },
      series: [
        {
          type: "pie",
          radius: ["40%", "70%"],
          avoidLabelOverlap: false,
          label: { show: false },
          itemStyle: { borderRadius: 3, borderColor: isDark ? "#0E1421" : "#FFFFFF", borderWidth: 1.5 },
          data: [
            { value: 92, name: "Financial Health", itemStyle: { color: "#4F7CFF" } },
            { value: 65, name: "Credit Risk", itemStyle: { color: "#8B5CF6" } },
            { value: 45, name: "Fraud Analysis", itemStyle: { color: "#F59E0B" } },
            { value: 30, name: "Cash Flow", itemStyle: { color: "#06B6D4" } },
            { value: 16, name: "Compliance", itemStyle: { color: "#10B981" } }
          ]
        }
      ]
    });

    // 4. Speeds trend
    initChart(speedsRef, {
      tooltip: {
        trigger: "axis",
        backgroundColor: isDark ? "#0E1421" : "#FFFFFF",
        borderColor: isDark ? "#1E293B" : "#E2E8F0",
        textStyle: { color: isDark ? "#F8FAFC" : "#0F172A", fontSize: 9 }
      },
      grid: { top: 20, bottom: 25, left: 35, right: 15 },
      xAxis: { type: "category", data: ["Feb", "Mar", "Apr", "May", "Jun", "Jul"], axisLabel: { color: labelColor, fontSize: 8.5 } },
      yAxis: {
        type: "value",
        axisLabel: { formatter: "{value}s", color: labelColor, fontSize: 8.5 },
        splitLine: { lineStyle: { color: gridLineColor } }
      },
      series: [
        {
          type: "line",
          smooth: true,
          data: [24.5, 22.8, 20.1, 19.5, 18.8, 18.2],
          itemStyle: { color: "#EF4444" },
          lineStyle: { width: 2 }
        }
      ]
    });

    // 5. Active Preview Visual Gauge
    initChart(previewChartRef, {
      tooltip: {
        trigger: "axis",
        backgroundColor: isDark ? "#0E1421" : "#FFFFFF",
        borderColor: isDark ? "#1E293B" : "#E2E8F0",
        textStyle: { color: isDark ? "#F8FAFC" : "#0F172A", fontSize: 9 }
      },
      grid: { top: 15, bottom: 20, left: 30, right: 10 },
      xAxis: { type: "category", data: ["Inflow", "Outflow", "Reserves", "Borrowings"], axisLabel: { color: labelColor, fontSize: 8.5 } },
      yAxis: { type: "value", splitLine: { lineStyle: { color: gridLineColor } }, axisLabel: { color: labelColor, fontSize: 8.5 } },
      series: [
        {
          type: "bar",
          data: [120000, 78000, 320000, 100000],
          itemStyle: {
            color: (params) => {
              const colors = ["#10B981", "#EF4444", "#4F7CFF", "#F59E0B"];
              return colors[params.dataIndex];
            },
            borderRadius: [2, 2, 0, 0]
          }
        }
      ]
    });

    const handleResize = () => {
      chartInstances.forEach(c => c.resize());
    };
    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
      chartInstances.forEach(c => c.dispose());
    };
  }, [isLoading, isError, resolvedTheme, reports, activePreview]);

  // ============================================================================
  // TANSTACK TABLE HISTORY COLUMNS
  // ============================================================================
  const columns = useMemo<ColumnDef<ReportItem>[]>(() => [
    {
      accessorKey: "id",
      header: "Report ID",
      cell: ({ row }) => (
        <span className="font-mono font-bold text-foreground block tracking-wider">
          {row.original.id}
        </span>
      ),
    },
    {
      accessorKey: "name",
      header: "Report Name",
      cell: ({ row }) => (
        <div>
          <span className="font-bold text-foreground block truncate max-w-[200px]">{row.original.name}</span>
          <span className="text-[9px] text-foreground-muted font-mono block mt-0.5">{row.original.analysisPeriod}</span>
        </div>
      ),
    },
    {
      accessorKey: "type",
      header: "Category",
      cell: ({ row }) => (
        <span className="font-semibold text-foreground-secondary">
          {row.original.type}
        </span>
      ),
    },
    {
      accessorKey: "generatedBy",
      header: "Generated By",
      cell: () => (
        <span className="font-semibold text-foreground-secondary">
          Officer Rahul
        </span>
      ),
    },
    {
      accessorKey: "generatedDate",
      header: "Generated Date",
      cell: ({ row }) => (
        <span className="font-mono text-foreground-muted text-[10px]">
          {row.original.generatedDate}
        </span>
      ),
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => {
        const badgeStatus = row.original.status === "Ready" ? "completed" : row.original.status === "Generating" ? "pending" : "failed";
        return <StatusBadge status={badgeStatus} />;
      },
    },
    {
      accessorKey: "format",
      header: "Format",
      cell: ({ row }) => {
        const fmt = row.original.fileSize.includes("MB") ? "PDF" : row.original.fileSize.includes("KB") ? "CSV" : "Excel";
        return (
          <span className={cn(
            "text-[9px] font-sans font-bold px-1.5 py-0.5 rounded-sm border uppercase inline-block",
            fmt === "PDF" ? "text-critical bg-critical/10 border-critical/20" : fmt === "Excel" ? "text-positive bg-positive/10 border-positive/20" : "text-primary bg-primary/10 border-primary/20"
          )}>
            {fmt}
          </span>
        );
      },
    },
    {
      accessorKey: "fileSize",
      header: "Size",
      cell: ({ row }) => (
        <span className="font-mono text-foreground-muted text-[10px]">
          {row.original.fileSize}
        </span>
      ),
    },
    {
      id: "actions",
      header: "Actions",
      cell: ({ row }) => (
        <div className="flex items-center gap-1.5 select-none">
          <Button
            variant="outline"
            size="sm"
            className="h-7 w-7 p-0 cursor-pointer border-border hover:bg-surface-hover"
            onClick={() => {
              setActivePreview(row.original);
              toast.success(`Loaded "${row.original.name}" to Preview panel.`);
            }}
            title="Preview report"
          >
            <Eye className="h-3.5 w-3.5" />
          </Button>

          <Popover
            trigger={
              <Button variant="outline" size="sm" className="h-7 w-7 p-0 cursor-pointer border-border hover:bg-surface-hover">
                <Sliders className="h-3.5 w-3.5" />
              </Button>
            }
          >
            <div className="flex flex-col py-1 text-xs select-none">
              <button
                onClick={() => {
                  const fmt = row.original.fileSize.includes("MB") ? "PDF" : row.original.fileSize.includes("KB") ? "CSV" : "Excel";
                  handleDownload(row.original, fmt);
                }}
                className="w-full text-left px-3 py-1.5 hover:bg-surface-hover text-foreground-secondary hover:text-foreground font-semibold cursor-pointer"
              >
                Download File
              </button>
              <button
                onClick={() => {
                  setShareOpen(true);
                  setShareMessage(`Sharing Compliance Report Dossier: ${row.original.name}`);
                }}
                className="w-full text-left px-3 py-1.5 hover:bg-surface-hover text-foreground-secondary hover:text-foreground font-semibold cursor-pointer"
              >
                Share Dossier
              </button>
              <button
                onClick={() => handleDuplicateReport(row.original)}
                className="w-full text-left px-3 py-1.5 hover:bg-surface-hover text-foreground-secondary hover:text-foreground font-semibold cursor-pointer"
              >
                Duplicate Logs
              </button>
              <button
                onClick={() => handleArchiveReport(row.original.id)}
                className="w-full text-left px-3 py-1.5 hover:bg-surface-hover text-foreground-secondary hover:text-foreground font-semibold cursor-pointer"
              >
                Archive Report
              </button>
              <button
                onClick={() => handleDeleteReport(row.original.id)}
                className="w-full text-left px-3 py-1.5 hover:bg-surface-hover text-critical font-bold cursor-pointer border-t border-border/40 mt-1"
              >
                Delete File
              </button>
            </div>
          </Popover>
        </div>
      ),
    },
  ], [handleDownload, handleDuplicateReport, handleArchiveReport, handleDeleteReport]);

  const table = useReactTable({
    data: filteredHistory,
    columns,
    state: {
      sorting,
      columnVisibility,
      pagination: {
        pageIndex,
        pageSize,
      },
    },
    onSortingChange: setSorting,
    onColumnVisibilityChange: setColumnVisibility,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
  });

  return (
    <PageContainer className="pb-24">
      
      {/* ==========================================
          HEADER SECTION
          ========================================== */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between pb-4 border-b border-border select-none">
        <div className="space-y-1">
          <button
            onClick={() => router.push("/officer")}
            className="text-[10px] font-sans font-bold uppercase tracking-wider text-primary hover:underline flex items-center gap-1 cursor-pointer mb-1 focus-visible:outline-none"
            aria-label="Back to Command Center"
          >
            <ArrowLeft className="h-3 w-3" /> Command Center
          </button>
          
          <h1 className="text-2xl font-bold font-sans tracking-tight text-foreground flex items-center gap-2.5">
            <FileText className="h-6.5 w-6.5 text-primary" /> Officer Reports
          </h1>
          <p className="text-xs text-foreground-secondary font-sans">
            Generate AI-powered financial reports, underwriting reports, portfolio analytics, compliance reports, and customer intelligence reports.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <div className="hidden xl:flex items-center gap-4 text-[10px] border-r border-border pr-4 mr-2 text-foreground-secondary">
            <div>
              <span className="block text-[8px] text-foreground-muted font-bold uppercase">Last Generated</span>
              <span className="font-mono font-bold text-foreground">12 mins ago</span>
            </div>
            <div>
              <span className="block text-[8px] text-foreground-muted font-bold uppercase">Total Reports</span>
              <span className="font-mono font-bold text-foreground">248 logs</span>
            </div>
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={triggerGenerateReport}
            className="text-xs font-semibold gap-1.5 border-border hover:bg-surface-hover hover:text-foreground cursor-pointer"
            aria-label="Generate New Report"
          >
            <Plus className="h-3.5 w-3.5" />
            Generate New Report
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={() => setScheduleModalOpen(true)}
            className="text-xs font-semibold gap-1.5 border-border hover:bg-surface-hover hover:text-foreground cursor-pointer"
            aria-label="Schedule Automated Report"
          >
            <Calendar className="h-3.5 w-3.5" />
            Schedule Report
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={handleExport}
            className="text-xs font-semibold gap-1.5 border-border hover:bg-surface-hover hover:text-foreground cursor-pointer"
            aria-label="Export Reports history"
          >
            <Download className="h-3.5 w-3.5" />
            Export Reports
          </Button>

          <Button
            variant="secondary"
            size="sm"
            onClick={handleRefresh}
            className="text-xs font-semibold gap-1.5 cursor-pointer"
            aria-label="Refresh database"
          >
            <RefreshCw className="h-3.5 w-3.5" />
            Refresh
          </Button>
        </div>
      </div>

      <AnimatePresence mode="wait">
        {isError ? (
          <motion.div
            key="error-state"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
          >
            <ErrorState
              title="Reports Spool Delays"
              description="A temporal connection timeout was flagged on the cloud rendering node. Verify security tokens and retry compilation."
              onRetry={handleRefresh}
              retryLabel="Re-synchronize Spooler"
            />
          </motion.div>
        ) : isLoading ? (
          /* ==========================================
              LOADING STATE SKELETONS
              ========================================== */
          <motion.div
            key="loading-skeletons"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="space-y-8"
          >
            {/* KPI skeletons */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
              {Array.from({ length: 6 }).map((_, i) => (
                <Card key={i} className="border border-border/80 bg-surface p-4 space-y-3">
                  <Skeleton className="h-3 w-16" />
                  <Skeleton className="h-7 w-24" />
                  <div className="flex justify-between items-center pt-2">
                    <Skeleton className="h-3 w-10" />
                    <Skeleton className="h-4 w-12" />
                  </div>
                </Card>
              ))}
            </div>

            {/* Layout grid skeletons */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              <div className="lg:col-span-5 space-y-6">
                <Card className="border border-border/80 bg-surface p-5 space-y-4">
                  <Skeleton className="h-6 w-40" />
                  <Skeleton className="h-9 w-full" />
                  <Skeleton className="h-9 w-full" />
                  <Skeleton className="h-9 w-full" />
                </Card>
              </div>
              <div className="lg:col-span-7 space-y-6">
                <Card className="border border-border/80 bg-surface p-5 space-y-4">
                  <Skeleton className="h-6 w-full" />
                  <Skeleton className="h-32 w-full" />
                </Card>
              </div>
            </div>
          </motion.div>
        ) : (
          /* ==========================================
              MAIN CONTENT INTERFACE
              ========================================== */
          <motion.div
            key="main-workspace"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="space-y-8"
          >
            
            {/* ==========================================
                SUMMARY KPI CARDS
                ========================================== */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
              
              {/* Total Reports */}
              <Card className="border border-border/80 bg-surface hover:border-primary/45 hover:-translate-y-0.5 transition-all duration-200 cursor-pointer select-none">
                <CardContent className="p-4 space-y-1 relative">
                  <span className="text-[9px] text-foreground-muted block uppercase font-bold tracking-wider">Total Reports</span>
                  <div className="flex items-center justify-between">
                    <span className="text-xl font-extrabold font-mono text-foreground block">248</span>
                    <FileText className="h-4 w-4 text-foreground-muted" />
                  </div>
                  <div className="flex items-center justify-between mt-2 pt-1 border-t border-border/20">
                    <span className="text-[8.5px] text-positive font-bold flex items-center gap-0.5">
                      <TrendingUp className="h-3 w-3" /> +15.0%
                    </span>
                    <MiniSparkline data={[210, 222, 230, 228, 240, 248]} color="var(--primary)" />
                  </div>
                </CardContent>
              </Card>

              {/* Generated Today */}
              <Card className="border border-border/80 bg-surface hover:border-positive/45 hover:-translate-y-0.5 transition-all duration-200 cursor-pointer select-none">
                <CardContent className="p-4 space-y-1 relative">
                  <span className="text-[9px] text-foreground-muted block uppercase font-bold tracking-wider">Generated Today</span>
                  <div className="flex items-center justify-between">
                    <span className="text-xl font-extrabold font-mono text-positive block">14</span>
                    <CheckCircle2 className="h-4 w-4 text-positive" />
                  </div>
                  <div className="flex items-center justify-between mt-2 pt-1 border-t border-border/20">
                    <span className="text-[8.5px] text-positive font-bold flex items-center gap-0.5">
                      <TrendingUp className="h-3 w-3" /> +8.2%
                    </span>
                    <MiniSparkline data={[8, 12, 10, 11, 9, 14]} color="var(--positive)" />
                  </div>
                </CardContent>
              </Card>

              {/* Scheduled Reports */}
              <Card className="border border-border/80 bg-surface hover:border-primary/45 hover:-translate-y-0.5 transition-all duration-200 cursor-pointer select-none">
                <CardContent className="p-4 space-y-1 relative">
                  <span className="text-[9px] text-foreground-muted block uppercase font-bold tracking-wider">Scheduled Reports</span>
                  <div className="flex items-center justify-between">
                    <span className="text-xl font-extrabold font-mono text-foreground block">{schedules.length}</span>
                    <Calendar className="h-4 w-4 text-foreground-muted" />
                  </div>
                  <div className="flex items-center justify-between mt-2 pt-1 border-t border-border/20">
                    <span className="text-[8.5px] text-foreground-secondary font-bold">Active tasks</span>
                    <MiniSparkline data={[3, 3, 3, 3, 3, schedules.length]} color="var(--primary)" />
                  </div>
                </CardContent>
              </Card>

              {/* Pending Reports */}
              <Card className="border border-border/80 bg-surface hover:border-warning/45 hover:-translate-y-0.5 transition-all duration-200 cursor-pointer select-none">
                <CardContent className="p-4 space-y-1 relative">
                  <span className="text-[9px] text-foreground-muted block uppercase font-bold tracking-wider">Pending Reports</span>
                  <div className="flex items-center justify-between">
                    <span className="text-xl font-extrabold font-mono text-warning block">2</span>
                    <Clock className="h-4 w-4 text-warning" />
                  </div>
                  <div className="flex items-center justify-between mt-2 pt-1 border-t border-border/20">
                    <span className="text-[8.5px] text-positive font-bold flex items-center gap-0.5">
                      <TrendingDown className="h-3 w-3" /> -50.0%
                    </span>
                    <MiniSparkline data={[4, 5, 3, 4, 1, 2]} color="var(--warning)" />
                  </div>
                </CardContent>
              </Card>

              {/* Downloaded Reports */}
              <Card className="border border-border/80 bg-surface hover:border-forecast/45 hover:-translate-y-0.5 transition-all duration-200 cursor-pointer select-none">
                <CardContent className="p-4 space-y-1 relative">
                  <span className="text-[9px] text-foreground-muted block uppercase font-bold tracking-wider">Downloaded</span>
                  <div className="flex items-center justify-between">
                    <span className="text-xl font-extrabold font-mono text-foreground-secondary block">195</span>
                    <Download className="h-4 w-4 text-foreground-muted" />
                  </div>
                  <div className="flex items-center justify-between mt-2 pt-1 border-t border-border/20">
                    <span className="text-[8.5px] text-positive font-bold flex items-center gap-0.5">
                      <TrendingUp className="h-3 w-3" /> +20.5%
                    </span>
                    <MiniSparkline data={[150, 162, 178, 170, 185, 195]} color="var(--forecast)" />
                  </div>
                </CardContent>
              </Card>

              {/* Average Generation Time */}
              <Card className="border border-border/80 bg-surface hover:border-ai/45 hover:-translate-y-0.5 transition-all duration-200 cursor-pointer select-none">
                <CardContent className="p-4 space-y-1 relative">
                  <span className="text-[9px] text-foreground-muted block uppercase font-bold tracking-wider">Avg Gen Speed</span>
                  <div className="flex items-center justify-between">
                    <span className="text-xl font-extrabold font-mono text-ai block">18.2s</span>
                    <Timer className="h-4 w-4 text-ai animate-pulse" />
                  </div>
                  <div className="flex items-center justify-between mt-2 pt-1 border-t border-border/20">
                    <span className="text-[8.5px] text-positive font-bold flex items-center gap-0.5">
                      <TrendingDown className="h-3 w-3" /> -5.4%
                    </span>
                    <MiniSparkline data={[24.5, 22.8, 20.1, 19.5, 18.8, 18.2]} color="var(--ai)" />
                  </div>
                </CardContent>
              </Card>

            </div>

            {/* ==========================================
                TWO-COLUMN DESKTOP GRID LAYOUT
                ========================================== */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
              
              {/* LEFT COLUMN (CATEGORIES, FORM, SCHEDULING, TEMPLATES) */}
              <div className="lg:col-span-5 space-y-6">
                
                {/* Generation parameters panel Form */}
                <Card className="border border-border/80 bg-surface select-none">
                  <div className="p-4 border-b border-border/40">
                    <h3 className="font-heading font-semibold text-sm text-foreground tracking-wide flex items-center gap-1.5">
                      <Sliders className="h-4 w-4 text-primary" /> Generate Report Panel
                    </h3>
                    <p className="text-[10px] text-foreground-secondary mt-0.5">Run automated assessment and document generation logs.</p>
                  </div>
                  <CardContent className="p-4 space-y-4">
                    
                    {/* Progress indicator during gen */}
                    {genProgress >= 0 && (
                      <div className="bg-surface-elevated border border-border p-3.5 rounded-sm space-y-2 text-xs font-semibold text-foreground-secondary">
                        <div className="flex justify-between items-center text-[10px]">
                          <span>AI Assessment Pipeline</span>
                          <span className="font-mono text-primary font-bold">{genProgress}%</span>
                        </div>
                        <div className="h-1.5 w-full bg-border rounded-full overflow-hidden">
                          <div className="h-full bg-primary rounded-full transition-all duration-300" style={{ width: `${genProgress}%` }} />
                        </div>
                      </div>
                    )}

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 text-[11px]">
                      
                      {/* Report Type */}
                      <div className="space-y-1 sm:col-span-2">
                        <label className="text-foreground-secondary font-bold uppercase tracking-wider block">Report Model Category</label>
                        <select
                          value={genReportType}
                          onChange={(e) => setGenReportType(e.target.value)}
                          className="w-full bg-surface border border-border rounded-sm py-1.5 px-2 font-semibold text-foreground focus:ring-1 focus:ring-primary focus:outline-none cursor-pointer"
                        >
                          {REPORT_CATEGORIES.map(cat => (
                            <option key={cat.id} value={cat.name}>{cat.name}</option>
                          ))}
                        </select>
                      </div>

                      {/* Applicant selector */}
                      <div className="space-y-1">
                        <label className="text-foreground-secondary font-bold uppercase tracking-wider block">Target Applicant</label>
                        <select
                          value={genApplicant}
                          onChange={(e) => setGenApplicant(e.target.value)}
                          className="w-full bg-surface border border-border rounded-sm py-1.5 px-2 font-semibold text-foreground focus:ring-1 focus:ring-primary focus:outline-none cursor-pointer"
                        >
                          {OFFICER_APPLICANTS.map(app => (
                            <option key={app.id} value={app.name}>{app.name}</option>
                          ))}
                        </select>
                      </div>

                      {/* Portfolio selector */}
                      <div className="space-y-1">
                        <label className="text-foreground-secondary font-bold uppercase tracking-wider block">Portfolio Group</label>
                        <select
                          value={genPortfolio}
                          onChange={(e) => setGenPortfolio(e.target.value)}
                          className="w-full bg-surface border border-border rounded-sm py-1.5 px-2 font-semibold text-foreground focus:ring-1 focus:ring-primary focus:outline-none cursor-pointer"
                        >
                          <option value="All retail portfolios">All Retail Loans</option>
                          <option value="Prime Mortgages">Prime Mortgages</option>
                          <option value="Micro-credit Portfolio">Micro-credit Tiers</option>
                          <option value="Commercial exposures">High-Yield Corporate</option>
                        </select>
                      </div>

                      {/* Officer underwriter selector */}
                      <div className="space-y-1">
                        <label className="text-foreground-secondary font-bold uppercase tracking-wider block">Audit Officer</label>
                        <select
                          value={genOfficer}
                          onChange={(e) => setGenOfficer(e.target.value)}
                          className="w-full bg-surface border border-border rounded-sm py-1.5 px-2 font-semibold text-foreground focus:ring-1 focus:ring-primary focus:outline-none cursor-pointer"
                        >
                          <option value="Officer Rahul">Officer Rahul</option>
                          <option value="Officer Priya">Officer Priya</option>
                          <option value="Officer Sanjay">Officer Sanjay</option>
                        </select>
                      </div>

                      {/* Analysis Period */}
                      <div className="space-y-1">
                        <label className="text-foreground-secondary font-bold uppercase tracking-wider block">Analysis Period</label>
                        <select
                          value={genDateRange}
                          onChange={(e) => setGenDateRange(e.target.value)}
                          className="w-full bg-surface border border-border rounded-sm py-1.5 px-2 font-semibold text-foreground focus:ring-1 focus:ring-primary focus:outline-none cursor-pointer"
                        >
                          <option value="Last 30 Days">Last 30 Days</option>
                          <option value="Q2 2026">Q2 2026</option>
                          <option value="H1 2026">H1 2026</option>
                          <option value="Year-to-Date">Year-to-Date</option>
                        </select>
                      </div>

                      {/* Export Format */}
                      <div className="space-y-1">
                        <label className="text-foreground-secondary font-bold uppercase tracking-wider block">Output format</label>
                        <select
                          value={genOutputFormat}
                          onChange={(e) => setGenOutputFormat(e.target.value as "PDF" | "Excel" | "CSV")}
                          className="w-full bg-surface border border-border rounded-sm py-1.5 px-2 font-semibold text-foreground focus:ring-1 focus:ring-primary focus:outline-none cursor-pointer"
                        >
                          <option value="PDF">PDF Document</option>
                          <option value="Excel">Excel Spreadsheet</option>
                          <option value="CSV">CSV Flatfile</option>
                        </select>
                      </div>

                      {/* Language */}
                      <div className="space-y-1">
                        <label className="text-foreground-secondary font-bold uppercase tracking-wider block">Target Language</label>
                        <select
                          value={genLanguage}
                          onChange={(e) => setGenLanguage(e.target.value)}
                          className="w-full bg-surface border border-border rounded-sm py-1.5 px-2 font-semibold text-foreground focus:ring-1 focus:ring-primary focus:outline-none cursor-pointer"
                        >
                          <option value="English">English</option>
                          <option value="Hindi">Hindi (हिंदी)</option>
                          <option value="Spanish">Spanish (Español)</option>
                        </select>
                      </div>

                    </div>

                    {/* Checkbox Options Toggles */}
                    <div className="pt-2.5 border-t border-border/20 space-y-2 text-[11px] select-none">
                      <span className="text-foreground-secondary font-bold uppercase tracking-wider block mb-1.5">Template Parameters Checklist</span>
                      
                      <div className="grid grid-cols-2 gap-2 text-foreground-secondary font-semibold">
                        <label className="flex items-center gap-2 cursor-pointer hover:text-foreground">
                          <input type="checkbox" checked={optAISummary} onChange={(e) => setOptAISummary(e.target.checked)} className="rounded-xs border-border text-primary focus:ring-primary h-3.5 w-3.5" />
                          <span>Include AI Summary</span>
                        </label>
                        <label className="flex items-center gap-2 cursor-pointer hover:text-foreground">
                          <input type="checkbox" checked={optCharts} onChange={(e) => setOptCharts(e.target.checked)} className="rounded-xs border-border text-primary focus:ring-primary h-3.5 w-3.5" />
                          <span>Include Charts</span>
                        </label>
                        <label className="flex items-center gap-2 cursor-pointer hover:text-foreground">
                          <input type="checkbox" checked={optExplainability} onChange={(e) => setOptExplainability(e.target.checked)} className="rounded-xs border-border text-primary focus:ring-primary h-3.5 w-3.5" />
                          <span>Include Explainability</span>
                        </label>
                        <label className="flex items-center gap-2 cursor-pointer hover:text-foreground">
                          <input type="checkbox" checked={optTransactions} onChange={(e) => setOptTransactions(e.target.checked)} className="rounded-xs border-border text-primary focus:ring-primary h-3.5 w-3.5" />
                          <span>Include Transactions</span>
                        </label>
                        <label className="flex items-center gap-2 cursor-pointer hover:text-foreground sm:col-span-2">
                          <input type="checkbox" checked={optDocuments} onChange={(e) => setOptDocuments(e.target.checked)} className="rounded-xs border-border text-primary focus:ring-primary h-3.5 w-3.5" />
                          <span>Include Verification Documents</span>
                        </label>
                      </div>
                    </div>

                    {/* Action buttons */}
                    <div className="flex items-center gap-2.5 pt-3 select-none">
                      <Button
                        variant="primary"
                        size="sm"
                        onClick={triggerGenerateReport}
                        disabled={genProgress >= 0}
                        className="flex-1 text-xs gap-1 cursor-pointer font-bold"
                      >
                        {genProgress >= 0 ? "Compiling..." : "Generate"}
                      </Button>

                      <Button
                        variant="outline"
                        size="sm"
                        onClick={handleImmediatePreview}
                        className="flex-1 text-xs gap-1 border-border hover:bg-surface-hover hover:text-foreground cursor-pointer font-semibold"
                      >
                        Preview Draft
                      </Button>

                      <Button
                        variant="outline"
                        size="sm"
                        onClick={handleSaveTemplate}
                        className="text-xs p-2.5 h-10 border border-border flex items-center justify-center hover:bg-surface-hover cursor-pointer"
                        title="Save settings as template"
                      >
                        <Copy className="h-4 w-4" />
                      </Button>
                    </div>

                  </CardContent>
                </Card>

                {/* Scheduled reports section list */}
                <Card className="border border-border/80 bg-surface">
                  <div className="p-4 border-b border-border/40 flex justify-between items-center select-none">
                    <div>
                      <h3 className="font-heading font-semibold text-sm text-foreground tracking-wide flex items-center gap-1.5">
                        <Calendar className="h-4 w-4 text-primary" /> Scheduled Reports
                      </h3>
                      <p className="text-[10px] text-foreground-secondary">Manage automated recurrence deliveries.</p>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setScheduleModalOpen(true)}
                      className="text-[10px] h-7 px-2.5 font-bold gap-1 cursor-pointer"
                    >
                      <Plus className="h-3 w-3" />
                      Add Task
                    </Button>
                  </div>
                  <CardContent className="p-4 divide-y divide-border/20 font-sans text-xs">
                    {schedules.map((sch) => (
                      <div key={sch.id} className="py-3 first:pt-0 last:pb-0 flex items-start justify-between gap-3">
                        <div className="space-y-1">
                          <span className="font-bold text-foreground block leading-tight">{sch.name}</span>
                          <div className="flex flex-wrap gap-2 text-[9px] font-semibold select-none pt-0.5">
                            <span className="text-foreground-secondary bg-surface-elevated px-1.5 py-0.5 rounded-sm border border-border">
                              {sch.frequency}
                            </span>
                            <span className="text-foreground-muted truncate max-w-[160px]">
                              Next: {sch.nextRun}
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center gap-1.5 shrink-0 select-none">
                          <button
                            onClick={() => handleToggleSchedule(sch.id)}
                            className="p-1 hover:bg-surface-hover rounded-sm text-foreground-secondary hover:text-foreground cursor-pointer focus:outline-none"
                            title={sch.status === "Active" ? "Pause Schedule" : "Resume Schedule"}
                          >
                            {sch.status === "Active" ? <Pause className="h-3.5 w-3.5" /> : <Play className="h-3.5 w-3.5 text-positive" />}
                          </button>
                          <button
                            onClick={() => handleDeleteSchedule(sch.id)}
                            className="p-1 hover:bg-surface-hover rounded-sm text-foreground-secondary hover:text-critical cursor-pointer focus:outline-none"
                            title="Delete Schedule"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </CardContent>
                </Card>

                {/* Templates checklist */}
                <Card className="border border-border/80 bg-surface">
                  <div className="p-4 border-b border-border/40 select-none">
                    <h3 className="font-heading font-semibold text-sm text-foreground tracking-wide flex items-center gap-1.5">
                      <FileSpreadsheet className="h-4 w-4 text-primary" /> Reusable Report Templates
                    </h3>
                    <p className="text-[10px] text-foreground-secondary">Quick load pre-designed layout structures.</p>
                  </div>
                  <CardContent className="p-4 space-y-3 font-sans text-xs">
                    
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                      {templates.map((temp) => (
                        <div
                          key={temp.id}
                          className="border border-border/60 p-3 rounded-sm bg-surface-elevated/25 space-y-2 hover:border-border-strong hover:bg-surface-elevated/45 transition-colors flex flex-col justify-between"
                        >
                          <div className="space-y-1">
                            <span className="font-bold text-foreground block leading-tight">{temp.name}</span>
                            <p className="text-[10px] text-foreground-secondary leading-normal line-clamp-2">{temp.description}</p>
                          </div>
                          
                          <div className="flex items-center justify-between pt-1 select-none">
                            <span className="text-[9px] text-foreground-muted font-mono">{temp.outputFormat}</span>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleUseTemplate(temp)}
                              className="h-6 px-2 text-[9px] font-bold border-border cursor-pointer"
                            >
                              Use Template
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>

                  </CardContent>
                </Card>

                {/* Report categories grid list */}
                <Card className="border border-border/80 bg-surface">
                  <div className="p-4 border-b border-border/40 select-none">
                    <h3 className="font-heading font-semibold text-sm text-foreground tracking-wide flex items-center gap-1.5">
                      <SlidersHorizontal className="h-4 w-4 text-primary" /> Supported Analytical Models
                    </h3>
                    <p className="text-[10px] text-foreground-secondary">10 compliance-validated reporting pipelines.</p>
                  </div>
                  <CardContent className="p-4 space-y-3 font-sans text-xs divide-y divide-border/20">
                    {REPORT_CATEGORIES.map((cat) => {
                      const CatIcon = cat.icon;
                      return (
                        <div key={cat.id} className="py-2.5 first:pt-0 last:pb-0 flex items-start justify-between gap-3">
                          <div className="flex items-start gap-2.5">
                            <div className="p-1.5 rounded-sm bg-primary/10 border border-primary/20 text-primary mt-0.5">
                              <CatIcon className="h-3.5 w-3.5" />
                            </div>
                            <div className="space-y-0.5">
                              <span className="font-bold text-foreground block leading-tight">{cat.name}</span>
                              <p className="text-[10px] text-foreground-secondary leading-normal">{cat.desc}</p>
                            </div>
                          </div>

                          <div className="flex flex-col items-end gap-1.5 shrink-0 select-none">
                            <span className="text-[9px] text-foreground-muted font-mono">{cat.time}</span>
                            <button
                              onClick={() => {
                                setGenReportType(cat.name);
                                triggerGenerateReport();
                              }}
                              className="text-[9px] font-bold text-primary hover:underline cursor-pointer focus:outline-none"
                            >
                              Run Now
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </CardContent>
                </Card>

              </div>

              {/* RIGHT COLUMN (AI INSIGHTS, PREVIEW PANE, USAGE CHARTS) */}
              <div className="lg:col-span-7 space-y-6">
                
                {/* AI Summary Insights card */}
                <Card className="border border-border bg-surface relative overflow-hidden select-none">
                  <div className="absolute top-0 right-0 w-16 h-16 pointer-events-none overflow-hidden">
                    <div className="absolute top-[-8px] right-[-32px] w-20 h-6 bg-ai/20 border border-ai/30 rotate-45 flex items-center justify-center text-[8px] text-ai font-bold uppercase tracking-wider">
                      AI
                    </div>
                  </div>
                  <CardContent className="p-5 space-y-4">
                    <h3 className="font-heading font-semibold text-sm text-foreground tracking-wide flex items-center gap-1.5">
                      <Sparkles className="h-4.5 w-4.5 text-ai animate-pulse" /> AI Summary & Insights
                    </h3>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-sans">
                      <div className="space-y-1">
                        <span className="text-[9px] text-foreground-muted block uppercase font-bold tracking-wider">Executive Rating Outcome</span>
                        <span className="font-heading font-extrabold text-foreground text-sm block">COMPREHENSIVE AUDIT PASSED</span>
                      </div>
                      <div className="space-y-1">
                        <span className="text-[9px] text-foreground-muted block uppercase font-bold tracking-wider">Pipeline Confidence Score</span>
                        <div className="flex items-center gap-1.5">
                          <span className="font-mono text-ai font-extrabold text-sm">95.2%</span>
                          <span className="text-[9px] text-foreground-secondary">(ensemble accuracy)</span>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-2.5 text-xs text-foreground-secondary font-sans border-t border-border/20 pt-3">
                      <div className="space-y-0.5">
                        <span className="text-[9px] text-critical font-bold uppercase tracking-wider block">Top Flagged Risks</span>
                        <p className="leading-relaxed">Fixed EMI liabilities consume 35% of monthly net income; revolving balances require sweeps limits.</p>
                      </div>

                      <div className="space-y-0.5">
                        <span className="text-[9px] text-positive font-bold uppercase tracking-wider block">Key Analytical Strengths</span>
                        <p className="leading-relaxed">100% clean credit bureau billing logs, backed by ₹6,00,000 liquid savings reserves.</p>
                      </div>

                      <div className="space-y-0.5">
                        <span className="text-[9px] text-primary font-bold uppercase tracking-wider block">Recommended Actions</span>
                        <p className="leading-relaxed">Configure automatic sweep accounts for checkouts. Link guarantor profile values to secure prime rates.</p>
                      </div>
                    </div>

                  </CardContent>
                </Card>

                {/* ECharts Analytics Charts Panel */}
                <Card className="border border-border/80 bg-surface">
                  <div className="p-4 border-b border-border/40 select-none">
                    <h3 className="font-heading font-semibold text-sm text-foreground tracking-wide flex items-center gap-1.5">
                      <TrendingUp className="h-4 w-4 text-primary" /> Report Analytics & Usage
                    </h3>
                    <p className="text-[10px] text-foreground-secondary">Monitor report counts, downloads volume, and generation speeds.</p>
                  </div>
                  <CardContent className="p-4 grid grid-cols-1 sm:grid-cols-2 gap-5">
                    
                    {/* Generated counts */}
                    <div className="space-y-1">
                      <span className="text-[9px] text-foreground-muted block uppercase font-bold tracking-wider select-none">Cumulative Reports Generated</span>
                      <div ref={reportsGenRef} className="h-36 w-full" />
                    </div>

                    {/* Downloads volume */}
                    <div className="space-y-1">
                      <span className="text-[9px] text-foreground-muted block uppercase font-bold tracking-wider select-none">Dossier Downloads Volume</span>
                      <div ref={downloadsRef} className="h-36 w-full" />
                    </div>

                    {/* Most Used */}
                    <div className="space-y-1">
                      <span className="text-[9px] text-foreground-muted block uppercase font-bold tracking-wider select-none">Most Used Model Categories</span>
                      <div ref={categoriesRef} className="h-36 w-full" />
                    </div>

                    {/* Generation time speeds */}
                    <div className="space-y-1">
                      <span className="text-[9px] text-foreground-muted block uppercase font-bold tracking-wider select-none">Average Generation Speed</span>
                      <div ref={speedsRef} className="h-36 w-full" />
                    </div>

                  </CardContent>
                </Card>

                {/* Large visual PDF Preview Panel Container */}
                <Card className="border border-border/80 bg-surface overflow-hidden shadow-xs relative">
                  <div className="p-4 border-b border-border/40 flex justify-between items-center select-none">
                    <div>
                      <h3 className="font-heading font-semibold text-sm text-foreground tracking-wide flex items-center gap-1.5">
                        <Eye className="h-4 w-4 text-primary" /> Report Document Preview
                      </h3>
                      <p className="text-[10px] text-foreground-secondary">Interactive draft representation as outputted in PDF templates.</p>
                    </div>

                    {/* Quick export actions */}
                    <div className="flex items-center gap-1 border border-border p-0.5 rounded-sm">
                      <button
                        onClick={() => handleDownload(activePreview, "PDF")}
                        className="p-1 hover:bg-surface-hover rounded-xs text-foreground-secondary hover:text-foreground cursor-pointer focus:outline-none"
                        title="Print/Download PDF"
                      >
                        <Printer className="h-3.5 w-3.5" />
                      </button>
                      <button
                        onClick={() => handleDownload(activePreview, "Excel")}
                        className="p-1 hover:bg-surface-hover rounded-xs text-foreground-secondary hover:text-foreground cursor-pointer focus:outline-none"
                        title="Export Excel"
                      >
                        <FileSpreadsheet className="h-3.5 w-3.5" />
                      </button>
                      <button
                        onClick={() => {
                          setShareOpen(true);
                          setShareMessage(`Audited Dossier Document: ${activePreview.name}`);
                        }}
                        className="p-1 hover:bg-surface-hover rounded-xs text-foreground-secondary hover:text-foreground cursor-pointer focus:outline-none"
                        title="Share File"
                      >
                        <Share2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>
                  
                  {/* Visual Print Sheet Canvas scrollable */}
                  <div className="p-6 md:p-8 bg-surface-elevated/40 max-h-[580px] overflow-y-auto font-sans text-xs leading-relaxed space-y-6 relative border-t border-border/10">
                    
                    {/* CONFIDENTIAL WATERMARK */}
                    <div className="absolute inset-0 pointer-events-none flex items-center justify-center opacity-3 select-none">
                      <span className="text-4xl md:text-5xl font-mono font-extrabold rotate-45 text-critical border-4 border-critical p-4 rounded-md">
                        RESTRICTED BANKING AUDIT
                      </span>
                    </div>

                    {/* Cover Page */}
                    <div className="border-b border-border/80 pb-6 text-center space-y-2 select-none">
                      <span className="text-[8px] text-foreground-muted font-mono font-extrabold bg-surface border border-border px-2 py-0.5 rounded-full uppercase">
                        ARTHDRISHTI COMPLIANCE INTEL
                      </span>
                      <h4 className="text-base font-heading font-bold text-foreground pt-1">{activePreview.name}</h4>
                      <div className="text-[9px] text-foreground-secondary font-mono flex items-center justify-center gap-3">
                        <span>ID: <strong className="text-foreground">{activePreview.id}</strong></span>
                        <span>Period: <strong className="text-foreground">{activePreview.analysisPeriod}</strong></span>
                        <span>Generated: <strong className="text-foreground">{activePreview.generatedDate}</strong></span>
                      </div>
                    </div>

                    {/* Executive Summary */}
                    <div className="space-y-1.5">
                      <span className="text-[9px] text-primary font-bold uppercase tracking-wider block">1. Executive Summary</span>
                      <p className="text-foreground-secondary leading-normal text-[11px]">{activePreview.content.executiveSummary}</p>
                    </div>

                    {/* Financial Summary */}
                    <div className="space-y-2 border-t border-border/30 pt-3">
                      <span className="text-[9px] text-primary font-bold uppercase tracking-wider block">2. Financial Health Summary</span>
                      <p className="text-foreground-secondary leading-normal text-[11px]">{activePreview.content.financialHealth}</p>
                      
                      {/* Sub-table summary */}
                      <div className="bg-surface border border-border p-2.5 rounded-sm select-none">
                        <table className="w-full text-left text-[10px]">
                          <thead>
                            <tr className="text-foreground-muted font-bold uppercase border-b border-border/40">
                              <th className="pb-1">Asset Category</th>
                              <th className="pb-1 text-right">Audited Valuation</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-border/20 text-foreground-secondary font-mono font-semibold">
                            <tr>
                              <td className="py-1">Liquid Savings Reserve Balance</td>
                              <td className="py-1 text-right text-positive">₹6,00,000</td>
                            </tr>
                            <tr>
                              <td className="py-1">Fixed Outstanding Liabilities (Debt)</td>
                              <td className="py-1 text-right text-critical">₹1,20,000</td>
                            </tr>
                            <tr>
                              <td className="py-1">Discretionary Monthly Savings Inflows</td>
                              <td className="py-1 text-right text-primary">₹23,000</td>
                            </tr>
                          </tbody>
                        </table>
                      </div>
                    </div>

                    {/* Risk Analysis ECharts graph */}
                    <div className="space-y-2 border-t border-border/30 pt-3">
                      <span className="text-[9px] text-primary font-bold uppercase tracking-wider block">3. Default Probability & Attributions</span>
                      <p className="text-foreground-secondary leading-normal text-[11px]">{activePreview.content.keyRisks}</p>
                      
                      <div className="space-y-1">
                        <span className="text-[9.5px] text-foreground-muted uppercase font-bold block select-none">Balance Sheet Assets Chart</span>
                        <div ref={previewChartRef} className="h-32 w-full select-none" />
                      </div>
                    </div>

                    {/* Fraud Analysis details */}
                    <div className="space-y-1.5 border-t border-border/30 pt-3">
                      <span className="text-[9px] text-primary font-bold uppercase tracking-wider block">4. Security Telemetry & Fraud Index</span>
                      <p className="text-foreground-secondary leading-normal text-[11px]">{activePreview.content.fraudAnalysis}</p>
                    </div>

                    {/* Cash Flow Forecast */}
                    <div className="space-y-1.5 border-t border-border/30 pt-3">
                      <span className="text-[9px] text-primary font-bold uppercase tracking-wider block">5. Time-Series Reserves Forecast</span>
                      <p className="text-foreground-secondary leading-normal text-[11px]">{activePreview.content.cashFlowForecast}</p>
                    </div>

                    {/* AI Recommendation model confidence */}
                    <div className="space-y-3.5 border-t border-border/30 pt-3">
                      <span className="text-[9px] text-primary font-bold uppercase tracking-wider block">6. Deep Model Predictions Explanations</span>
                      <div className="bg-surface border border-border p-3.5 rounded-sm space-y-3">
                        <div className="flex justify-between items-center text-[10px]">
                          <span className="text-foreground-secondary font-bold uppercase">Compliance Model Recommendation</span>
                          <span className="text-positive font-extrabold uppercase bg-positive/10 border border-positive/20 px-2 py-0.5 rounded-xs">
                            {activePreview.summary.topRecommendation}
                          </span>
                        </div>
                        <ModelConfidence value={95.2} />
                      </div>
                    </div>

                    {/* Officer Notes editor */}
                    <div className="space-y-1.5 border-t border-border/30 pt-3">
                      <span className="text-[9px] text-primary font-bold uppercase tracking-wider block">7. Auditing Officer Notes</span>
                      <textarea
                        value={officerNotes}
                        onChange={(e) => setOfficerNotes(e.target.value)}
                        className="w-full bg-surface border border-border rounded-sm p-3 text-[11px] font-sans text-foreground-secondary focus:outline-none focus:ring-1 focus:ring-primary min-h-[70px]"
                        placeholder="Add compliance notes or underwriting overrides justifications..."
                      />
                    </div>

                    {/* Document Footer */}
                    <div className="pt-4 border-t border-border/60 text-center select-none text-[8px] text-foreground-muted font-mono">
                      <span>CLASSIFICATION: CONFIDENTIAL BANKING INTERNAL AUDIT REPORT • PAGE 1 OF 1</span>
                    </div>

                  </div>
                </Card>

              </div>

            </div>

            {/* ==========================================
                REPORT HISTORY (TANSTACK TABLE FULL-WIDTH)
                ========================================== */}
            <div className="space-y-3.5">
              <h3 className="font-heading font-semibold text-sm text-foreground tracking-wide flex items-center gap-1.5 select-none">
                <History className="h-4.5 w-4.5 text-primary" /> Reports History Logs
              </h3>

              <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
                
                {/* Search */}
                <div className="relative w-full sm:w-80 flex items-center">
                  <span className="absolute left-3 text-foreground-muted">
                    <Search className="h-3.5 w-3.5" />
                  </span>
                  <input
                    type="text"
                    placeholder="Search report ID, name, parameters..."
                    value={historySearch}
                    onChange={(e) => setHistorySearch(e.target.value)}
                    className="w-full bg-surface border border-border rounded-sm py-1.5 pl-9 pr-3 text-[11px] font-semibold text-foreground placeholder-foreground-muted focus:outline-none focus:ring-1 focus:ring-primary"
                    aria-label="Search reports history"
                  />
                  {historySearch && (
                    <button
                      onClick={() => setHistorySearch("")}
                      className="absolute right-3 text-foreground-muted hover:text-foreground cursor-pointer focus:outline-none"
                    >
                      <RotateCcw className="h-3 w-3" />
                    </button>
                  )}
                </div>

                <div className="flex flex-wrap items-center gap-2 select-none">
                  {/* Category Filter */}
                  <select
                    value={historyCategory}
                    onChange={(e) => setHistoryCategory(e.target.value)}
                    className="bg-surface border border-border rounded-sm py-1.5 pl-2 pr-6 text-[11px] font-semibold text-foreground focus:outline-none focus:ring-1 focus:ring-primary cursor-pointer"
                  >
                    <option value="All">All Categories</option>
                    <option value="Complete Intelligence">Complete Intelligence</option>
                    <option value="Credit Risk">Credit Risk</option>
                    <option value="Financial Health">Financial Health</option>
                    <option value="Fraud">Fraud Analysis</option>
                    <option value="Cash Flow">Cash Flow</option>
                  </select>

                  {/* Format Filter */}
                  <select
                    value={historyFormat}
                    onChange={(e) => setHistoryFormat(e.target.value)}
                    className="bg-surface border border-border rounded-sm py-1.5 pl-2 pr-6 text-[11px] font-semibold text-foreground focus:outline-none focus:ring-1 focus:ring-primary cursor-pointer"
                  >
                    <option value="All">All Formats</option>
                    <option value="PDF">PDF</option>
                    <option value="Excel">Excel</option>
                    <option value="CSV">CSV</option>
                  </select>

                  {/* Column Visibility popup */}
                  <Popover
                    trigger={
                      <Button variant="outline" size="sm" className="gap-1.5 text-xs font-semibold border-border cursor-pointer hover:bg-surface-hover">
                        <Sliders className="h-3.5 w-3.5" />
                        Columns
                      </Button>
                    }
                  >
                    <div className="space-y-2 select-none">
                      <p className="font-heading font-semibold text-xs text-foreground mb-2 border-b border-border/40 pb-1 flex items-center gap-1.5">
                        <Info className="h-3.5 w-3.5 text-primary" /> Visibility
                      </p>
                      {table.getAllLeafColumns().map((column) => {
                        if (column.id === "actions") return null;
                        return (
                          <label
                            key={column.id}
                            className="flex items-center gap-2 cursor-pointer text-xs text-foreground-secondary hover:text-foreground font-semibold"
                          >
                            <input
                              type="checkbox"
                              checked={column.getIsVisible()}
                              onChange={column.getToggleVisibilityHandler()}
                              className="rounded-xs border-border text-primary focus:ring-primary h-3.5 w-3.5"
                            />
                            <span>{column.columnDef.header as string}</span>
                          </label>
                        );
                      })}
                    </div>
                  </Popover>

                  {/* Density toggle buttons */}
                  <div className="flex items-center bg-surface-elevated border border-border p-0.5 rounded-sm">
                    <button
                      onClick={() => setDensity("default")}
                      className={cn(
                        "px-2.5 py-1 text-[10px] font-semibold rounded-xs transition-colors cursor-pointer",
                        density === "default"
                          ? "bg-surface text-foreground shadow-xs font-bold"
                          : "text-foreground-secondary hover:text-foreground"
                      )}
                    >
                      Comfortable
                    </button>
                    <button
                      onClick={() => setDensity("compact")}
                      className={cn(
                        "px-2.5 py-1 text-[10px] font-semibold rounded-xs transition-colors cursor-pointer",
                        density === "compact"
                          ? "bg-surface text-foreground shadow-xs font-bold"
                          : "text-foreground-secondary hover:text-foreground"
                      )}
                    >
                      Compact
                    </button>
                  </div>

                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setHistorySearch("");
                      setHistoryCategory("All");
                      setHistoryFormat("All");
                    }}
                    className="text-xs hover:text-critical font-bold text-foreground-secondary cursor-pointer"
                  >
                    Reset
                  </Button>
                </div>
              </div>

              {/* TanStack Table Log */}
              <Card className="border border-border/80 bg-surface shadow-xs">
                {filteredHistory.length === 0 ? (
                  <EmptyState
                    title="No Reports Found"
                    description="No historical reports match the filters applied. Adjust parameters or generate a new report."
                    icon={FileText}
                    actionLabel="Reset Table Filters"
                    onAction={() => {
                      setHistorySearch("");
                      setHistoryCategory("All");
                      setHistoryFormat("All");
                    }}
                  />
                ) : (
                  <>
                    {/* Tablet/Desktop Table View */}
                    <div className="hidden md:block overflow-x-auto">
                      <table className="w-full text-xs text-left border-collapse relative">
                        <thead>
                          {table.getHeaderGroups().map((group) => (
                            <tr
                              key={group.id}
                              className="bg-surface-elevated/80 text-[9px] font-bold text-foreground-muted uppercase tracking-wider border-b border-border sticky top-0 z-10 select-none"
                            >
                              {group.headers.map((header) => (
                                <th
                                  key={header.id}
                                  className={cn(
                                    "py-3 px-4 font-sans font-extrabold transition-colors",
                                    header.column.getCanSort() && "cursor-pointer hover:bg-surface-hover hover:text-foreground",
                                    density === "compact" && "py-2 px-3"
                                  )}
                                  onClick={header.column.getToggleSortingHandler()}
                                >
                                  <div className="flex items-center gap-1">
                                    {flexRender(header.column.columnDef.header, header.getContext())}
                                    {header.column.getCanSort() && (
                                      <ChevronDown className={cn(
                                        "h-3 w-3 text-foreground-muted transition-transform",
                                        header.column.getIsSorted() === "asc" && "rotate-180 text-primary",
                                        header.column.getIsSorted() === "desc" && "text-primary"
                                      )} />
                                    )}
                                  </div>
                                </th>
                              ))}
                            </tr>
                          ))}
                        </thead>
                        <tbody>
                          {table.getRowModel().rows.map((row) => (
                            <tr
                              key={row.id}
                              tabIndex={0}
                              className="border-b border-border/30 last:border-b-0 hover:bg-surface-hover/50 transition-colors focus-visible:outline-2 focus-visible:outline-primary"
                            >
                              {row.getVisibleCells().map((cell) => (
                                <td
                                  key={cell.id}
                                  className={cn(
                                    "py-3 px-4 text-foreground-secondary font-sans align-middle",
                                    density === "compact" && "py-1.5 px-3"
                                  )}
                                >
                                  {flexRender(cell.column.columnDef.cell, cell.getContext())}
                                </td>
                              ))}
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>

                    {/* Mobile collapsible Card list */}
                    <div className="md:hidden p-4 space-y-3">
                      {table.getRowModel().rows.map((row) => {
                        const r = row.original;
                        const fmt = r.fileSize.includes("MB") ? "PDF" : r.fileSize.includes("KB") ? "CSV" : "Excel";
                        const badgeStatus = r.status === "Ready" ? "completed" : r.status === "Generating" ? "pending" : "failed";

                        return (
                          <div key={r.id} className="border border-border/60 rounded-md p-4 bg-surface-elevated/45 space-y-2.5">
                            <div className="flex items-center justify-between">
                              <span className="font-mono font-extrabold text-foreground tracking-wider text-xs">{r.id}</span>
                              <StatusBadge status={badgeStatus as "completed" | "pending" | "failed"} />
                            </div>

                            <div className="space-y-1">
                              <span className="font-bold text-foreground block text-xs leading-tight">{r.name}</span>
                              <div className="flex items-center gap-2 text-[9px] text-foreground-secondary select-none font-semibold">
                                <span className="bg-surface border border-border px-1.5 py-0.5 rounded-sm">{r.type}</span>
                                <span>{r.analysisPeriod}</span>
                              </div>
                            </div>

                            <div className="grid grid-cols-2 gap-2 text-[10px] pt-1.5 border-t border-border/10">
                              <div>
                                <span className="text-foreground-muted block uppercase tracking-wider text-[8px] font-bold">Format</span>
                                <span className="font-bold text-foreground">{fmt}</span>
                              </div>
                              <div>
                                <span className="text-foreground-muted block uppercase tracking-wider text-[8px] font-bold">Size</span>
                                <span className="font-mono text-foreground">{r.fileSize}</span>
                              </div>
                            </div>

                            <div className="flex items-center justify-between pt-2 border-t border-border/10">
                              <span className="font-mono text-foreground-muted text-[10px]">{r.generatedDate}</span>
                              <div className="flex items-center gap-1.5 select-none">
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => {
                                    setActivePreview(r);
                                    toast.success(`Loaded "${r.name}" to Preview panel.`);
                                  }}
                                  className="h-7 px-3 text-xs font-semibold gap-1"
                                >
                                  <Eye className="h-3.5 w-3.5" />
                                  Preview
                                </Button>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => handleDownload(r, fmt as "PDF" | "Excel" | "CSV")}
                                  className="h-7 w-7 p-0 cursor-pointer"
                                >
                                  <Download className="h-3.5 w-3.5" />
                                </Button>
                              </div>
                            </div>

                          </div>
                        );
                      })}
                    </div>

                    {/* Pagination Toolbar */}
                    <div className="p-4 border-t border-border/60 flex flex-col sm:flex-row items-center justify-between gap-3 text-[11px] select-none text-foreground-secondary">
                      <div className="flex items-center gap-1.5">
                        <span>Showing</span>
                        <strong className="text-foreground font-mono">{pageIndex * pageSize + 1}</strong>
                        <span>to</span>
                        <strong className="text-foreground font-mono">
                          {Math.min((pageIndex + 1) * pageSize, filteredHistory.length)}
                        </strong>
                        <span>of</span>
                        <strong className="text-foreground font-mono">{filteredHistory.length}</strong>
                        <span>reports</span>
                      </div>

                      <div className="flex items-center gap-4">
                        {/* Page Size select */}
                        <div className="flex items-center gap-1.5">
                          <span>Show</span>
                          <select
                            value={pageSize}
                            onChange={(e) => {
                              setPageSize(Number(e.target.value));
                              setPageIndex(0);
                            }}
                            className="bg-surface border border-border rounded-sm py-1 pl-1.5 pr-6 text-foreground font-semibold cursor-pointer outline-none focus:ring-1 focus:ring-primary"
                          >
                            {[5, 10, 20].map((size) => (
                              <option key={size} value={size}>
                                {size} entries
                              </option>
                            ))}
                          </select>
                        </div>

                        {/* Controls */}
                        <div className="flex items-center gap-1 bg-surface border border-border p-0.5 rounded-sm">
                          <button
                            onClick={() => setPageIndex(p => Math.max(p - 1, 0))}
                            disabled={pageIndex === 0}
                            className="p-1 hover:bg-surface-hover rounded-xs text-foreground disabled:opacity-30 disabled:pointer-events-none cursor-pointer focus-visible:outline-none"
                            aria-label="Previous Page"
                          >
                            <ChevronLeft className="h-3.5 w-3.5" />
                          </button>
                          <span className="px-2 font-mono font-bold text-foreground">
                            {pageIndex + 1} / {table.getPageCount() || 1}
                          </span>
                          <button
                            onClick={() => setPageIndex(p => Math.min(p + 1, table.getPageCount() - 1))}
                            disabled={pageIndex >= table.getPageCount() - 1}
                            className="p-1 hover:bg-surface-hover rounded-xs text-foreground disabled:opacity-30 disabled:pointer-events-none cursor-pointer focus-visible:outline-none"
                            aria-label="Next Page"
                          >
                            <ChevronRight className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </>
                )}
              </Card>
            </div>

          </motion.div>
        )}
      </AnimatePresence>

      {/* ==========================================
          ACTION MODALS / DIALOG DIALOGS
          ========================================== */}
      
      {/* 1. Share Dossier Dialog Sheet Modal */}
      <Modal
        isOpen={shareOpen}
        onClose={() => setShareOpen(false)}
        title="Share Document Dossier"
        className="max-w-md select-none"
      >
        <form onSubmit={handleShareReport} className="space-y-4 font-sans text-xs">
          <div className="space-y-1">
            <span className="text-foreground-secondary font-bold uppercase tracking-wider block">Recipient Name</span>
            <input
              type="text"
              required
              placeholder="e.g. Chief Risk Officer"
              value={shareRecipient}
              onChange={(e) => setShareRecipient(e.target.value)}
              className="w-full bg-surface border border-border rounded-sm py-1.5 px-3 font-semibold text-foreground focus:ring-1 focus:ring-primary focus:outline-none"
            />
          </div>

          <div className="space-y-1">
            <span className="text-foreground-secondary font-bold uppercase tracking-wider block">Email Address</span>
            <input
              type="email"
              required
              placeholder="cro@arthdrishti.com"
              value={shareEmail}
              onChange={(e) => setShareEmail(e.target.value)}
              className="w-full bg-surface border border-border rounded-sm py-1.5 px-3 font-mono text-foreground focus:ring-1 focus:ring-primary focus:outline-none"
            />
          </div>

          <div className="space-y-1">
            <span className="text-foreground-secondary font-bold uppercase tracking-wider block">Access Permissions</span>
            <select
              value={sharePermission}
              onChange={(e) => setSharePermission(e.target.value)}
              className="w-full bg-surface border border-border rounded-sm py-1.5 px-2 font-semibold text-foreground focus:ring-1 focus:ring-primary focus:outline-none cursor-pointer"
            >
              <option value="Read-only">Read-only Access</option>
              <option value="Can Comment">Can Comment / Review</option>
              <option value="Full Access">Full Access Share</option>
            </select>
          </div>

          <div className="space-y-1">
            <span className="text-foreground-secondary font-bold uppercase tracking-wider block">Message to Recipient</span>
            <textarea
              value={shareMessage}
              onChange={(e) => setShareMessage(e.target.value)}
              className="w-full bg-surface border border-border rounded-sm p-3 font-semibold text-foreground focus:outline-none focus:ring-1 focus:ring-primary min-h-[80px]"
              placeholder="Add verification context or review instructions..."
            />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button
              variant="outline"
              size="sm"
              type="button"
              onClick={() => setShareOpen(false)}
              className="border-border hover:bg-surface-hover cursor-pointer font-semibold"
            >
              Cancel
            </Button>
            <Button
              variant="primary"
              size="sm"
              type="submit"
              className="cursor-pointer font-bold"
            >
              Secure Transfer
            </Button>
          </div>
        </form>
      </Modal>

      {/* 2. Schedule Report modal dialog */}
      <Modal
        isOpen={scheduleModalOpen}
        onClose={() => setScheduleModalOpen(false)}
        title="Schedule Recurring Assessment"
        className="max-w-md select-none"
      >
        <form onSubmit={handleSaveSchedule} className="space-y-4 font-sans text-xs">
          <div className="space-y-1">
            <span className="text-foreground-secondary font-bold uppercase tracking-wider block">Schedule Task Name</span>
            <input
              type="text"
              required
              placeholder="e.g. Weekly CIBIL Validation Dispatch"
              value={schName}
              onChange={(e) => setSchName(e.target.value)}
              className="w-full bg-surface border border-border rounded-sm py-1.5 px-3 font-semibold text-foreground focus:ring-1 focus:ring-primary focus:outline-none"
            />
          </div>

          <div className="space-y-1">
            <span className="text-foreground-secondary font-bold uppercase tracking-wider block">Report Model Target</span>
            <select
              value={schReportType}
              onChange={(e) => setSchReportType(e.target.value)}
              className="w-full bg-surface border border-border rounded-sm py-1.5 px-2 font-semibold text-foreground focus:ring-1 focus:ring-primary focus:outline-none cursor-pointer"
            >
              {REPORT_CATEGORIES.map(cat => (
                <option key={cat.id} value={cat.name}>{cat.name}</option>
              ))}
            </select>
          </div>

          <div className="space-y-1">
            <span className="text-foreground-secondary font-bold uppercase tracking-wider block">Recurrence Frequency</span>
            <select
              value={schFrequency}
              onChange={(e) => setSchFrequency(e.target.value as "Daily" | "Weekly" | "Monthly")}
              className="w-full bg-surface border border-border rounded-sm py-1.5 px-2 font-semibold text-foreground focus:ring-1 focus:ring-primary focus:outline-none cursor-pointer"
            >
              <option value="Daily">Daily Schedule (18:00 IST)</option>
              <option value="Weekly">Weekly Schedule (Mondays 08:00 AM)</option>
              <option value="Monthly">Monthly Schedule (1st of month)</option>
            </select>
          </div>

          <div className="space-y-1">
            <span className="text-foreground-secondary font-bold uppercase tracking-wider block">Recipients Email list</span>
            <input
              type="text"
              required
              placeholder="auditors@arthdrishti.com, cro@arth.com"
              value={schRecipients}
              onChange={(e) => setSchRecipients(e.target.value)}
              className="w-full bg-surface border border-border rounded-sm py-1.5 px-3 font-mono text-foreground focus:ring-1 focus:ring-primary focus:outline-none"
            />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button
              variant="outline"
              size="sm"
              type="button"
              onClick={() => setScheduleModalOpen(false)}
              className="border-border hover:bg-surface-hover cursor-pointer font-semibold"
            >
              Cancel
            </Button>
            <Button
              variant="primary"
              size="sm"
              type="submit"
              className="cursor-pointer font-bold"
            >
              Add Schedule
            </Button>
          </div>
        </form>
      </Modal>

    </PageContainer>
  );
}
