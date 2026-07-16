"use client";

import React, { useState, useEffect, useMemo, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
  Users,
  Building2,
  UserCheck,
  FileText,
  Cpu,
  ShieldAlert,
  TrendingUp,
  Activity,
  RefreshCw,
  FileDown,
  Calendar,
  Sparkles,
  MapPin,
  ChevronRight,
  TrendingDown,
  Clock,
  Layers,
  ArrowUpRight,
  Printer,
  ChevronLeft,
  X,
  Server,
  Zap,
  BookOpen,
  Settings,
  ShieldCheck,
  Lock,
  ArrowRight,
  Eye,
  FileSpreadsheet,
  Info,
  Network
} from "lucide-react";
import {
  AreaChart,
  Area,
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip as RechartsTooltip,
  ResponsiveContainer,
  Legend,
  CartesianGrid,
  Cell,
  PieChart,
  Pie
} from "recharts";
import { toast } from "sonner";

import PageContainer from "@/components/ui/PageContainer";
import SectionHeader from "@/components/ui/SectionHeader";
import { Card, CardHeader, CardTitle, CardContent, CardDescription, CardFooter } from "@/components/ui/Card";
import { Badge, StatusBadge, TrendIndicator } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Modal, Tooltip, Dropdown, Tabs } from "@/components/ui/Overlays";
import { cn } from "@/lib/utils";

import {
  ANALYTICS_KPIS,
  EXECUTIVE_TIMEFRAME_DATA,
  CUSTOMER_SEGMENTS_DATA,
  CREDIT_RISK_DISTRIBUTION,
  LOAN_CATEGORIES_DATA,
  APPLICATIONS_METRICS_DATA,
  TOP_OFFICERS_LEADERBOARD,
  GEOGRAPHICAL_STATE_DATA,
  EXECUTIVE_INSIGHTS,
  CRITICAL_PLATFORM_RISKS,
  REVENUE_COST_SAVINGS_WEEKLY,
  SYSTEM_CPU_MEM_QUEUES,
  EXECUTIVE_REPORTS_LIST,
  AnalyticsKPI,
  OfficerPerformance,
  GeoStateData,
  InsightCard,
  PlatformRisk,
  ExecutiveReportCard
} from "@/lib/analytics_data";

// Theme color map matching CSS variables
const COLORS = {
  primary: "#4F7CFF",
  ai: "#8B5CF6",
  forecast: "#06B6D4",
  positive: "#10B981",
  warning: "#F59E0B",
  critical: "#EF4444",
  secondary: "#64748B",
  muted: "#94A3B8"
};

export default function ExecutiveAnalyticsDashboardPage() {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isError, setIsError] = useState(false);
  const [lastUpdatedTime, setLastUpdatedTime] = useState("");

  // Sub-tabs
  const [activeTab, setActiveTab] = useState<string>("overview");
  // Timeframe selector
  const [timeframe, setTimeframe] = useState<"Today" | "7 Days" | "30 Days" | "Quarter" | "Year">("30 Days");
  
  // Interactive Geographic state filter
  const [selectedGeoState, setSelectedGeoState] = useState<string | null>(null);
  const [isSimulateEmptyState, setIsSimulateEmptyState] = useState(false);

  // Preview Report overlay state
  const [selectedReport, setSelectedReport] = useState<ExecutiveReportCard | null>(null);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);

  // Sync state on load
  useEffect(() => {
    setMounted(true);
    setLastUpdatedTime(new Date().toLocaleTimeString());
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 700);
    return () => clearTimeout(timer);
  }, []);

  // Synchronize data manually
  const handleRefresh = useCallback(() => {
    setIsLoading(true);
    setIsError(false);
    setTimeout(() => {
      setIsLoading(false);
      setLastUpdatedTime(new Date().toLocaleTimeString());
      toast.success("Executive BI data layer re-synchronized.");
    }, 600);
  }, []);

  const handleGenerateReport = () => {
    toast.promise(
      new Promise((resolve) => setTimeout(resolve, 2500)),
      {
        loading: "Synthesizing AI Executive Report across platform metrics...",
        success: "Report generated successfully. Ready for download.",
        error: "Report generation failed."
      }
    );
  };

  const handleExportDashboard = () => {
    toast.success("Dashboard metrics compiled. Triggering CSV ledger download.");
    let csvContent = "Metric,Value\n";
    ANALYTICS_KPIS.forEach(k => {
      csvContent += `${k.title},${k.value}\n`;
    });
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `executive_analytics_summary_${new Date().toISOString().split("T")[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleScheduleReport = () => {
    toast.success("Scheduled report automated dispatch to Slack/Email configurations.");
  };

  // State filtering helper
  const filteredGeoData = useMemo(() => {
    if (!selectedGeoState) return GEOGRAPHICAL_STATE_DATA;
    return GEOGRAPHICAL_STATE_DATA.filter(s => s.id === selectedGeoState);
  }, [selectedGeoState]);

  // Preview Action
  const handlePreviewReport = (rep: ExecutiveReportCard) => {
    setSelectedReport(rep);
    setIsPreviewOpen(true);
  };

  const handleDownloadReport = (title: string) => {
    toast.success(`Downloading report: ${title}. PDF compilation started.`);
  };

  // KPI card icon mapping
  const getKpiIcon = (iconName: string) => {
    switch (iconName) {
      case "Users":
        return Users;
      case "Building2":
        return Building2;
      case "UserCheck":
        return UserCheck;
      case "FileText":
        return FileText;
      case "Cpu":
        return Cpu;
      case "ShieldAlert":
        return ShieldAlert;
      case "TrendingUp":
        return TrendingUp;
      case "Activity":
      default:
        return Activity;
    }
  };

  // Mini sparkline SVG renderer
  const renderSparkline = (points: number[], status: string) => {
    if (!points || points.length === 0) return null;
    const width = 80;
    const height = 24;
    const min = Math.min(...points);
    const max = Math.max(...points);
    const range = max - min || 1;
    
    const coords = points.map((p, idx) => {
      const x = (idx / (points.length - 1)) * width;
      const y = height - ((p - min) / range) * (height - 4) - 2;
      return `${x.toFixed(1)},${y.toFixed(1)}`;
    }).join(" ");

    let strokeColor = "stroke-primary";
    if (status === "success") strokeColor = "stroke-positive";
    if (status === "warning") strokeColor = "stroke-warning";
    if (status === "destructive") strokeColor = "stroke-critical";

    return (
      <svg width={width} height={height} className="overflow-visible select-none pointer-events-none">
        <polyline
          fill="none"
          strokeWidth="1.75"
          className={strokeColor}
          strokeLinecap="round"
          strokeLinejoin="round"
          points={coords}
        />
      </svg>
    );
  };

  const activeTimeframeData = useMemo(() => {
    if (isSimulateEmptyState) return [];
    return EXECUTIVE_TIMEFRAME_DATA[timeframe] || [];
  }, [timeframe, isSimulateEmptyState]);

  if (!mounted) return null;

  return (
    <PageContainer>
      {/* 1. Page Header Actions */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 border-b border-border/60 pb-5 mb-6 select-none">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="font-heading font-bold text-2xl md:text-3xl text-foreground tracking-tight">
              Enterprise Analytics
            </h1>
            <span className="h-2 w-2 rounded-full bg-primary animate-pulse" title="Telemetry ingestion live" />
          </div>
          <p className="font-sans text-sm text-foreground-secondary mt-1.5 leading-relaxed max-w-[800px]">
            Executive overview of platform growth, customer intelligence, AI performance, financial insights and operational excellence.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleRefresh}
            className="h-9 px-3.5 focus-visible:outline-2"
            aria-label="Refresh executive dashboard analytics"
          >
            <RefreshCw className={cn("h-3.5 w-3.5 mr-1.5", isLoading && "animate-spin")} />
            <span>Refresh</span>
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={handleGenerateReport}
            className="h-9 px-3.5 focus-visible:outline-2"
            aria-label="Compile executive reports dispatches"
          >
            <Sparkles className="h-3.5 w-3.5 mr-1.5 text-ai" />
            <span>Generate Report</span>
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={handleExportDashboard}
            className="h-9 px-3.5 focus-visible:outline-2"
            aria-label="Export metrics sheets data files"
          >
            <FileSpreadsheet className="h-3.5 w-3.5 mr-1.5" />
            <span>Export CSV</span>
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={handleScheduleReport}
            className="h-9 px-3.5 focus-visible:outline-2"
            aria-label="Schedule reports distribution"
          >
            <Clock className="h-3.5 w-3.5 mr-1.5" />
            <span>Schedule Report</span>
          </Button>
        </div>
      </div>

      {/* Overview status parameters toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-4 bg-surface border border-border p-4 rounded-sm mb-6 select-none shadow-xs">
        
        {/* Navigation subtabs */}
        <Tabs
          tabs={[
            { id: "overview", label: "Executive BI", icon: Layers },
            { id: "customer", label: "Customer & Loans", icon: Users },
            { id: "ai", label: "AI & Platform", icon: Cpu },
            { id: "geo", label: "Regional Operations", icon: MapPin }
          ]}
          activeTab={activeTab}
          onChangeTab={setActiveTab}
        />

        {/* Global timeframe filter selector */}
        <div className="flex items-center gap-3">
          <div className="flex border border-border bg-surface-elevated p-0.5 rounded-sm">
            {(["Today", "7 Days", "30 Days", "Quarter", "Year"] as const).map((tf) => (
              <button
                key={tf}
                onClick={() => setTimeframe(tf)}
                className={cn(
                  "px-2.5 py-1 text-[10px] font-sans font-bold uppercase rounded-xs transition-colors cursor-pointer outline-none focus-visible:outline-2",
                  timeframe === tf
                    ? "bg-surface text-foreground shadow-xs border border-border/80"
                    : "text-foreground-secondary hover:text-foreground"
                )}
                aria-label={`Set timeframe filter to ${tf}`}
              >
                {tf}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-2">
            <Tooltip content="Toggle to simulate missing dashboard registries">
              <button
                onClick={() => setIsSimulateEmptyState(prev => !prev)}
                className={cn(
                  "p-2 rounded-sm border transition-colors outline-none focus-visible:outline-2 cursor-pointer",
                  isSimulateEmptyState
                    ? "bg-warning/15 text-warning border-warning/45"
                    : "bg-surface-elevated text-foreground-secondary border-border hover:bg-surface-hover"
                )}
                aria-label="Simulate Empty Dashboard State"
              >
                <Info className="h-4.5 w-4.5" />
              </button>
            </Tooltip>

            <Tooltip content="Toggle to simulate metrics fetch failure">
              <button
                onClick={() => setIsError(prev => !prev)}
                className={cn(
                  "p-2 rounded-sm border transition-colors outline-none focus-visible:outline-2 cursor-pointer",
                  isError
                    ? "bg-critical/15 text-critical border-critical/45"
                    : "bg-surface-elevated text-foreground-secondary border-border hover:bg-surface-hover"
                )}
                aria-label="Simulate Network Error State"
              >
                <ShieldAlert className="h-4.5 w-4.5" />
              </button>
            </Tooltip>
          </div>
        </div>

      </div>

      {/* ERROR PANEL SCREEN */}
      {isError ? (
        <Card className="border border-critical bg-critical/5 select-none my-8 p-8 flex flex-col items-center justify-center text-center gap-4">
          <div className="h-12 w-12 rounded-full bg-critical/10 flex items-center justify-center text-critical animate-bounce">
            <ShieldAlert className="h-6 w-6" />
          </div>
          <div>
            <CardTitle className="text-lg font-heading font-bold text-foreground">
              Analytics Gateway Interrupted
            </CardTitle>
            <CardDescription className="text-sm font-sans mt-2 max-w-lg mx-auto">
              Real-time analytics pipelines are temporarily disconnected. Database heap memory check limits reached on primary nodes.
            </CardDescription>
          </div>
          <div className="flex gap-3">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsError(false)}
              className="text-foreground border-border hover:bg-surface-hover"
            >
              Cancel Simulation
            </Button>
            <Button
              variant="destructive"
              size="sm"
              onClick={handleRefresh}
              className="bg-critical text-white focus-visible:outline-2"
            >
              <RefreshCw className="h-3.5 w-3.5 mr-1.5" />
              <span>Retry Registry Load</span>
            </Button>
          </div>
        </Card>
      ) : (
        <>
          {/* TAB 1: EXECUTIVE BI OVERVIEW */}
          {activeTab === "overview" && (
            <div className="space-y-6">
              
              {/* 8 global summary KPI cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {ANALYTICS_KPIS.map((kpi) => {
                  if (isLoading) {
                    return (
                      <Card key={kpi.title} className="bg-surface border border-border select-none animate-pulse">
                        <CardContent className="p-5 flex flex-col gap-3">
                          <div className="flex items-center justify-between">
                            <div className="h-3.5 w-20 bg-border rounded-xs" />
                            <div className="h-3.5 w-8 bg-border rounded-xs" />
                          </div>
                          <div className="h-8 w-16 bg-border rounded-xs mt-1" />
                          <div className="h-6 w-full bg-border rounded-xs mt-2" />
                        </CardContent>
                      </Card>
                    );
                  }

                  const KpiIcon = getKpiIcon(kpi.icon);

                  return (
                    <Card
                      key={kpi.title}
                      className={cn(
                        "bg-surface border border-border/80 hover:border-primary/40 hover:scale-[1.01] transition-all duration-200 select-none shadow-xs group",
                        kpi.status === "destructive" && "border-critical/30 bg-critical/0 hover:border-critical/50"
                      )}
                    >
                      <CardContent className="p-5 flex flex-col justify-between h-full">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <div className="h-7 w-7 rounded-full bg-surface-elevated border border-border flex items-center justify-center text-foreground-secondary shrink-0">
                              <KpiIcon className="h-3.5 w-3.5" />
                            </div>
                            <span className="text-xs font-sans font-medium text-foreground-secondary group-hover:text-foreground transition-colors tracking-wide">
                              {kpi.title}
                            </span>
                          </div>
                          {kpi.trend !== 0 && (
                            <TrendIndicator value={kpi.trend} />
                          )}
                        </div>

                        <div className="flex items-baseline justify-between mt-3">
                          <span className="text-2xl font-bold font-mono tracking-tight text-foreground">
                            {kpi.value}
                          </span>
                          <div className="opacity-90">
                            {renderSparkline(kpi.sparkline, kpi.status)}
                          </div>
                        </div>

                        <p className="text-[10px] text-foreground-muted font-sans font-normal mt-2 truncate">
                          {kpi.description}
                        </p>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>

              {/* Timeframe Platform Growth charts & Weekly revenue cost trends */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 select-none">
                
                {/* Timeframe Platform Growth area chart */}
                <Card className="lg:col-span-2 bg-surface border border-border shadow-xs flex flex-col justify-between">
                  <CardHeader className="border-b border-border/40 pb-4">
                    <CardTitle className="text-base sm:text-lg font-heading">
                      Platform Growth & Prediction Volumes
                    </CardTitle>
                    <CardDescription className="text-xs">
                      Timeframe trend showing prediction volume runs vs approval rates counts ({timeframe}).
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="pt-6 h-72 w-full">
                    {isLoading ? (
                      <div className="h-full bg-surface-elevated/40 animate-pulse rounded-sm" />
                    ) : isSimulateEmptyState ? (
                      <div className="h-full text-center p-6 text-foreground-muted text-xs flex flex-col items-center justify-center gap-2">
                        <Activity className="h-6 w-6" />
                        <span>No growth logs logged.</span>
                      </div>
                    ) : (
                      <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={activeTimeframeData} margin={{ top: 5, right: 10, left: -25, bottom: 0 }}>
                          <defs>
                            <linearGradient id="colorGrowth" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="5%" stopColor={COLORS.primary} stopOpacity={0.25}/>
                              <stop offset="95%" stopColor={COLORS.primary} stopOpacity={0}/>
                            </linearGradient>
                          </defs>
                          <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" opacity={0.3} />
                          <XAxis dataKey="name" stroke="var(--foreground-muted)" fontSize={10} tickLine={false} />
                          <YAxis stroke="var(--foreground-muted)" fontSize={10} tickLine={false} />
                          <RechartsTooltip contentStyle={{ backgroundColor: "var(--surface)", borderColor: "var(--border)", borderRadius: "4px", fontSize: "11px" }} />
                          <Legend wrapperStyle={{ fontSize: "10px" }} />
                          <Area name="Prediction runs" type="monotone" dataKey="growth" stroke={COLORS.primary} fillOpacity={1} fill="url(#colorGrowth)" strokeWidth={2.5} />
                          <Line name="Approvals index" type="monotone" dataKey="approvals" stroke={COLORS.positive} strokeWidth={2} dot={false} />
                        </AreaChart>
                      </ResponsiveContainer>
                    )}
                  </CardContent>
                </Card>

                {/* Financial Weekly revenue cost savings line */}
                <Card className="bg-surface border border-border shadow-xs flex flex-col justify-between">
                  <CardHeader className="border-b border-border/40 pb-4">
                    <CardTitle className="text-base sm:text-lg font-heading">
                      Financial Performance Trends
                    </CardTitle>
                    <CardDescription className="text-xs">
                      Compares daily revenue averages vs operational costs (in ₹ Lakhs).
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="pt-6 h-72 w-full">
                    {isLoading ? (
                      <div className="h-full bg-surface-elevated/40 animate-pulse rounded-sm" />
                    ) : (
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={REVENUE_COST_SAVINGS_WEEKLY} margin={{ top: 5, right: 10, left: -25, bottom: 0 }}>
                          <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" opacity={0.3} />
                          <XAxis dataKey="name" stroke="var(--foreground-muted)" fontSize={10} tickLine={false} />
                          <YAxis stroke="var(--foreground-muted)" fontSize={10} tickLine={false} />
                          <RechartsTooltip contentStyle={{ backgroundColor: "var(--surface)", borderColor: "var(--border)", borderRadius: "4px", fontSize: "11px" }} />
                          <Legend wrapperStyle={{ fontSize: "10px" }} />
                          <Line name="Operational Revenue" type="monotone" dataKey="revenue" stroke={COLORS.forecast} strokeWidth={2.5} />
                          <Line name="Operating Cost" type="monotone" dataKey="cost" stroke={COLORS.critical} strokeWidth={2} />
                          <Line name="Savings Generated" type="monotone" dataKey="savings" stroke={COLORS.positive} strokeWidth={2} />
                        </LineChart>
                      </ResponsiveContainer>
                    )}
                  </CardContent>
                </Card>

              </div>

              {/* 3 columns list: Executive reports checklists / Top Risks alerts / Quick actions */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 select-none">
                
                {/* Reports checklist */}
                <Card className="bg-surface border border-border shadow-sm">
                  <CardHeader className="border-b border-border/40 pb-3">
                    <CardTitle className="text-sm font-heading font-bold uppercase tracking-wider">Executive Reports</CardTitle>
                    <CardDescription className="text-xs">Preview or download generated regulatory audits files.</CardDescription>
                  </CardHeader>
                  <CardContent className="p-4 space-y-3">
                    {EXECUTIVE_REPORTS_LIST.map((rep) => (
                      <div key={rep.id} className="p-3 bg-surface-elevated/45 border border-border/50 hover:border-border rounded-sm space-y-2 flex flex-col justify-between hover:bg-surface-elevated/80 transition-colors">
                        <div>
                          <span className="text-[11px] font-bold text-foreground leading-tight block">{rep.title}</span>
                          <span className="text-[9px] text-foreground-secondary leading-normal block mt-1">{rep.description}</span>
                        </div>
                        <div className="flex items-center justify-between border-t border-border/40 pt-2 text-[9px] font-mono text-foreground-muted select-none">
                          <span>{rep.published} &bull; {rep.size}</span>
                          <div className="flex gap-2.5 font-sans">
                            <button onClick={() => handlePreviewReport(rep)} className="text-xs text-primary font-bold hover:underline cursor-pointer outline-none">Preview</button>
                            <button onClick={() => handleDownloadReport(rep.title)} className="text-xs text-primary font-bold hover:underline cursor-pointer outline-none">Download</button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </CardContent>
                </Card>

                {/* Top risks lists */}
                <Card className="bg-surface border border-border shadow-sm">
                  <CardHeader className="border-b border-border/40 pb-3">
                    <CardTitle className="text-sm font-heading font-bold uppercase tracking-wider">Top Compliance Risks</CardTitle>
                    <CardDescription className="text-xs">Active threats compiled from gateway access blocks.</CardDescription>
                  </CardHeader>
                  <CardContent className="p-4 space-y-3">
                    {CRITICAL_PLATFORM_RISKS.map((risk) => (
                      <div key={risk.id} className="p-3 bg-surface-elevated/45 border border-border/50 hover:border-border rounded-sm flex items-start gap-2.5 hover:bg-surface-elevated/80 transition-colors">
                        <div className={cn(
                          "h-2 w-2 rounded-full mt-1 shrink-0",
                          risk.severity === "Critical" ? "bg-critical animate-pulse" : risk.severity === "High" ? "bg-warning" : "bg-primary"
                        )} />
                        <div className="flex-1 min-w-0">
                          <div className="flex justify-between items-center text-[10px]">
                            <span className="font-bold text-foreground truncate">{risk.title}</span>
                            <span className="text-[8px] text-foreground-muted font-mono shrink-0 ml-1">{risk.timestamp}</span>
                          </div>
                          <span className="text-[9px] text-foreground-secondary leading-normal block mt-1">{risk.description}</span>
                        </div>
                      </div>
                    ))}
                  </CardContent>
                </Card>

                {/* Quick actions direct buttons */}
                <Card className="bg-surface border border-border shadow-sm">
                  <CardHeader className="border-b border-border/40 pb-3">
                    <CardTitle className="text-sm font-heading font-bold uppercase tracking-wider">Dashboard Operations Commands</CardTitle>
                    <CardDescription className="text-xs">Quick navigation pathways inside settings/logs groups.</CardDescription>
                  </CardHeader>
                  <CardContent className="p-4 grid grid-cols-2 gap-2 text-xs font-semibold select-none">
                    {[
                      { label: "Users Manage", path: "/admin/users", icon: Users },
                      { label: "Merchant Orgs", path: "/admin/organizations", icon: Building2 },
                      { label: "AI Models Registry", path: "/admin/models", icon: Cpu },
                      { label: "API Telemetries", path: "/admin/api-monitoring", icon: Network },
                      { label: "Audit Logs", path: "/admin/audit-logs", icon: FileText },
                      { label: "System Health", path: "/admin/system-health", icon: Activity },
                      { label: "Platform settings", path: "/admin/settings", icon: Settings },
                      { label: "Platform Overview", path: "/admin", icon: Layers }
                    ].map((cmd, idx) => {
                      const CmdIcon = cmd.icon;
                      return (
                        <button
                          key={idx}
                          onClick={() => router.push(cmd.path)}
                          className="flex items-center gap-2 p-2.5 bg-surface-elevated/50 hover:bg-surface-elevated border border-border rounded-xs transition-colors text-left text-foreground-secondary hover:text-foreground cursor-pointer focus-visible:outline-2 outline-none font-sans"
                        >
                          <CmdIcon className="h-3.5 w-3.5 text-primary shrink-0" />
                          <span className="truncate">{cmd.label}</span>
                        </button>
                      );
                    })}
                  </CardContent>
                </Card>

              </div>

            </div>
          )}

          {/* TAB 2: CUSTOMER & LOANS ANALYTICS */}
          {activeTab === "customer" && (
            <div className="space-y-6">
              
              {/* Segment spreads & Credit Risk profiles */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 select-none">
                
                {/* Segment spreads pie */}
                <Card className="bg-surface border border-border shadow-xs">
                  <CardHeader className="border-b border-border/40 pb-4">
                    <CardTitle className="text-base sm:text-lg font-heading">
                      Customer FinTech Segments Spreads
                    </CardTitle>
                    <CardDescription className="text-xs">
                      Ratio of B2B fintech channels utilizing underwriting queries.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="pt-6 h-64 w-full flex items-center justify-center">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <RechartsTooltip contentStyle={{ backgroundColor: "var(--surface)", borderColor: "var(--border)", borderRadius: "4px", fontSize: "11px" }} />
                        <Pie
                          data={CUSTOMER_SEGMENTS_DATA}
                          dataKey="value"
                          nameKey="name"
                          cx="50%"
                          cy="50%"
                          innerRadius={45}
                          outerRadius={75}
                          paddingAngle={3}
                        >
                          {CUSTOMER_SEGMENTS_DATA.map((entry, index) => {
                            const colorsList = [COLORS.primary, COLORS.ai, COLORS.forecast, COLORS.warning];
                            return <Cell key={`cell-${index}`} fill={colorsList[index % colorsList.length]} />;
                          })}
                        </Pie>
                        <Legend wrapperStyle={{ fontSize: "10px" }} />
                      </PieChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>

                {/* Credit Risk distribution bar chart */}
                <Card className="bg-surface border border-border shadow-xs">
                  <CardHeader className="border-b border-border/40 pb-4">
                    <CardTitle className="text-base sm:text-lg font-heading">
                      Credit Risk Exposure Distribution
                    </CardTitle>
                    <CardDescription className="text-xs">
                      Spread of applicant creditworthiness profiles (Grades A to E).
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="pt-6 h-64 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={CREDIT_RISK_DISTRIBUTION} margin={{ top: 5, right: 10, left: -25, bottom: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" opacity={0.3} />
                        <XAxis dataKey="name" stroke="var(--foreground-muted)" fontSize={10} tickLine={false} />
                        <YAxis stroke="var(--foreground-muted)" fontSize={10} tickLine={false} />
                        <RechartsTooltip contentStyle={{ backgroundColor: "var(--surface)", borderColor: "var(--border)", borderRadius: "4px", fontSize: "11px" }} />
                        <Bar dataKey="value" radius={[2, 2, 0, 0]}>
                          {CREDIT_RISK_DISTRIBUTION.map((entry, index) => {
                            const colorMap = [COLORS.positive, COLORS.primary, COLORS.warning, COLORS.critical, COLORS.critical];
                            return <Cell key={`cell-${index}`} fill={colorMap[index % colorMap.length]} />;
                          })}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>

              </div>

              {/* Loan categories & Applications metrics */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 select-none">
                
                {/* Loan categories shares pie */}
                <Card className="bg-surface border border-border shadow-xs">
                  <CardHeader className="border-b border-border/40 pb-4">
                    <CardTitle className="text-base sm:text-lg font-heading">
                      Underwritten Loan Categories Distribution
                    </CardTitle>
                    <CardDescription className="text-xs">
                      Ratio of cash credits term loans vs unsecured lines.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="pt-6 h-64 w-full flex items-center justify-center">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <RechartsTooltip contentStyle={{ backgroundColor: "var(--surface)", borderColor: "var(--border)", borderRadius: "4px", fontSize: "11px" }} />
                        <Pie
                          data={LOAN_CATEGORIES_DATA}
                          dataKey="value"
                          nameKey="name"
                          cx="50%"
                          cy="50%"
                          innerRadius={45}
                          outerRadius={75}
                          paddingAngle={3}
                        >
                          {LOAN_CATEGORIES_DATA.map((entry, index) => {
                            const colorsList = [COLORS.primary, COLORS.ai, COLORS.forecast, COLORS.warning];
                            return <Cell key={`cell-${index}`} fill={colorsList[index % colorsList.length]} />;
                          })}
                        </Pie>
                        <Legend wrapperStyle={{ fontSize: "10px" }} />
                      </PieChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>

                {/* Applications metrics bar */}
                <Card className="bg-surface border border-border shadow-xs">
                  <CardHeader className="border-b border-border/40 pb-4">
                    <CardTitle className="text-base sm:text-lg font-heading">
                      Loan Application Processing Metrics
                    </CardTitle>
                    <CardDescription className="text-xs">
                      Total applications received, auto approvals, rejections and manual reviews.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="pt-6 h-64 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={APPLICATIONS_METRICS_DATA} margin={{ top: 5, right: 10, left: -25, bottom: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" opacity={0.3} />
                        <XAxis dataKey="name" stroke="var(--foreground-muted)" fontSize={10} tickLine={false} />
                        <YAxis stroke="var(--foreground-muted)" fontSize={10} tickLine={false} />
                        <RechartsTooltip contentStyle={{ backgroundColor: "var(--surface)", borderColor: "var(--border)", borderRadius: "4px", fontSize: "11px" }} />
                        <Bar dataKey="count" radius={[2, 2, 0, 0]}>
                          {APPLICATIONS_METRICS_DATA.map((entry, index) => {
                            const colorMap = [COLORS.primary, COLORS.positive, COLORS.critical, COLORS.warning];
                            return <Cell key={`cell-${index}`} fill={colorMap[index % colorMap.length]} />;
                          })}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>

              </div>

            </div>
          )}

          {/* TAB 3: AI & INFRASTRUCTURE DIAGNOSTICS */}
          {activeTab === "ai" && (
            <div className="space-y-6">
              
              {/* CPU MEM tracker graph & AI insights */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 select-none">
                
                {/* CPU memory thread levels area chart */}
                <Card className="lg:col-span-2 bg-surface border border-border shadow-xs flex flex-col justify-between">
                  <CardHeader className="border-b border-border/40 pb-4">
                    <CardTitle className="text-base sm:text-lg font-heading">
                      Infrastructure Resources Telemetry
                    </CardTitle>
                    <CardDescription className="text-xs">
                      Hourly distribution checking CPU utilization and memory heap usage.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="pt-6 h-64 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={SYSTEM_CPU_MEM_QUEUES} margin={{ top: 5, right: 10, left: -25, bottom: 0 }}>
                        <defs>
                          <linearGradient id="colorCpu" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor={COLORS.forecast} stopOpacity={0.2}/>
                            <stop offset="95%" stopColor={COLORS.forecast} stopOpacity={0}/>
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" opacity={0.3} />
                        <XAxis dataKey="name" stroke="var(--foreground-muted)" fontSize={10} tickLine={false} />
                        <YAxis stroke="var(--foreground-muted)" fontSize={10} tickLine={false} />
                        <RechartsTooltip contentStyle={{ backgroundColor: "var(--surface)", borderColor: "var(--border)", borderRadius: "4px", fontSize: "11px" }} />
                        <Legend wrapperStyle={{ fontSize: "10px" }} />
                        <Area name="CPU load (%)" type="monotone" dataKey="cpu" stroke={COLORS.forecast} fillOpacity={1} fill="url(#colorCpu)" strokeWidth={2} />
                        <Line name="Memory load (%)" type="monotone" dataKey="memory" stroke={COLORS.ai} strokeWidth={2} dot={false} />
                      </AreaChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>

                {/* AI Executive insights cards */}
                <div className="space-y-4">
                  <div className="border-b border-border/40 pb-3">
                    <span className="text-xs font-bold text-foreground uppercase tracking-wider block font-heading select-none">AI Insight Recommendations</span>
                    <span className="text-[10px] text-foreground-secondary select-none">Suggestions generated by LLM analysis gateway.</span>
                  </div>

                  <div className="space-y-3 max-h-[220px] overflow-y-auto pr-1">
                    {EXECUTIVE_INSIGHTS.map((ins, idx) => (
                      <div key={idx} className="p-3 bg-surface border border-border hover:bg-surface-elevated/45 transition-colors rounded-sm text-[11px] leading-relaxed flex flex-col gap-1.5">
                        <div className="flex justify-between items-center text-foreground font-bold font-heading">
                          <span className="truncate">{ins.title}</span>
                          <span className={cn(
                            "px-1.5 py-0.5 rounded-xs text-[8px] font-mono",
                            ins.priority === "High" ? "text-critical bg-critical/10" : "text-primary bg-primary/10"
                          )}>
                            {ins.confidence}% Confidence
                          </span>
                        </div>
                        <span className="text-[10px] text-foreground-secondary leading-normal block">{ins.impact}</span>
                        <span className="text-[10px] text-primary font-semibold font-sans">Recommendation: {ins.recommendation}</span>
                      </div>
                    ))}
                  </div>
                </div>

              </div>

            </div>
          )}

          {/* TAB 4: GEOGRAPHICAL OPERATIONS */}
          {activeTab === "geo" && (
            <div className="space-y-6">
              
              {/* India geographic coordinates & Officer leaderboard */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 select-none">
                
                {/* SVG India Map mock */}
                <Card className="lg:col-span-2 bg-surface border border-border shadow-xs flex flex-col justify-between">
                  <CardHeader className="border-b border-border/40 pb-4">
                    <CardTitle className="text-base sm:text-lg font-heading flex items-center gap-2">
                      <span>India Regional Operations Map</span>
                      {selectedGeoState && (
                        <button
                          onClick={() => setSelectedGeoState(null)}
                          className="px-2 py-0.5 rounded-sm bg-primary/15 text-primary text-[10px] font-sans hover:bg-primary/20 transition-all cursor-pointer flex items-center gap-1 border border-primary/30"
                        >
                          <span>Filter: {selectedGeoState}</span>
                          <X className="h-3 w-3" />
                        </button>
                      )}
                    </CardTitle>
                    <CardDescription className="text-xs">
                      Click regional nodes or states to filter dashboard metrics logs.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="pt-6 grid grid-cols-1 sm:grid-cols-2 gap-5 h-72 items-center">
                    
                    {/* SVG India Map illustration */}
                    <div className="flex justify-center">
                      <svg width="220" height="240" viewBox="0 0 200 220" className="overflow-visible select-none pointer-events-auto">
                        {/* Regional clickable zones */}
                        {/* North Zone Node */}
                        <circle
                          cx="90" cy="50" r="22"
                          onClick={() => setSelectedGeoState("DL")}
                          className={cn(
                            "fill-surface-elevated stroke-border stroke-2 cursor-pointer transition-all hover:fill-primary/25",
                            selectedGeoState === "DL" && "fill-primary/45 stroke-primary stroke-[3px]"
                          )}
                        />
                        <text x="90" y="52" textAnchor="middle" className="fill-foreground font-sans font-extrabold text-[8px] pointer-events-none select-none">North (DL)</text>

                        {/* West Zone Node */}
                        <circle
                          cx="50" cy="110" r="24"
                          onClick={() => setSelectedGeoState("MH")}
                          className={cn(
                            "fill-surface-elevated stroke-border stroke-2 cursor-pointer transition-all hover:fill-primary/25",
                            selectedGeoState === "MH" && "fill-primary/45 stroke-primary stroke-[3px]"
                          )}
                        />
                        <text x="50" y="112" textAnchor="middle" className="fill-foreground font-sans font-extrabold text-[8px] pointer-events-none select-none">West (MH)</text>

                        {/* South Zone Nodes */}
                        <circle
                          cx="85" cy="170" r="22"
                          onClick={() => setSelectedGeoState("KA")}
                          className={cn(
                            "fill-surface-elevated stroke-border stroke-2 cursor-pointer transition-all hover:fill-primary/25",
                            selectedGeoState === "KA" && "fill-primary/45 stroke-primary stroke-[3px]"
                          )}
                        />
                        <text x="85" y="172" textAnchor="middle" className="fill-foreground font-sans font-extrabold text-[8px] pointer-events-none select-none">South (KA)</text>

                        <circle
                          cx="135" cy="180" r="20"
                          onClick={() => setSelectedGeoState("TN")}
                          className={cn(
                            "fill-surface-elevated stroke-border stroke-2 cursor-pointer transition-all hover:fill-primary/25",
                            selectedGeoState === "TN" && "fill-primary/45 stroke-primary stroke-[3px]"
                          )}
                        />
                        <text x="135" y="182" textAnchor="middle" className="fill-foreground font-sans font-extrabold text-[8px] pointer-events-none select-none">South (TN)</text>

                        {/* East Zone Node */}
                        <circle
                          cx="155" cy="115" r="22"
                          onClick={() => setSelectedGeoState("WB")}
                          className={cn(
                            "fill-surface-elevated stroke-border stroke-2 cursor-pointer transition-all hover:fill-primary/25",
                            selectedGeoState === "WB" && "fill-primary/45 stroke-primary stroke-[3px]"
                          )}
                        />
                        <text x="155" y="117" textAnchor="middle" className="fill-foreground font-sans font-extrabold text-[8px] pointer-events-none select-none">East (WB)</text>
                      </svg>
                    </div>

                    {/* Regional stats indicators lists */}
                    <div className="space-y-3 font-sans text-xs">
                      {filteredGeoData.map((st) => (
                        <div key={st.id} className="p-3 bg-surface-elevated/45 border border-border/80 rounded-sm space-y-2">
                          <div className="flex justify-between items-center text-foreground font-bold">
                            <span>{st.name}</span>
                            <span className={cn(
                              "px-1.5 py-0.5 rounded-xs text-[8px] border font-mono",
                              st.riskClass === "Low" ? "text-positive bg-positive/10 border-positive/20" : st.riskClass === "Medium" ? "text-warning bg-warning/10 border-warning/20" : "text-critical bg-critical/10 border-critical/20"
                            )}>
                              {st.riskClass} Risk
                            </span>
                          </div>
                          
                          <div className="grid grid-cols-2 gap-2 text-[10px] font-mono text-foreground-secondary">
                            <div>Orgs: <span className="text-foreground font-bold">{st.organizations}</span></div>
                            <div>Customers: <span className="text-foreground font-bold">{st.customers.toLocaleString()}</span></div>
                            <div>Loans: <span className="text-foreground font-bold">{st.loans} Cases</span></div>
                            <div>Runs: <span className="text-foreground font-bold">{st.predictions.toLocaleString()}</span></div>
                          </div>
                        </div>
                      ))}
                    </div>

                  </CardContent>
                </Card>

                {/* Underwriting Officers leaderboard */}
                <Card className="bg-surface border border-border shadow-xs flex flex-col justify-between">
                  <CardHeader className="border-b border-border/40 pb-4">
                    <CardTitle className="text-base sm:text-lg font-heading">
                      Underwriters Performance
                    </CardTitle>
                    <CardDescription className="text-xs">
                      Leaderboard tracking cases processed and SLA response timelines.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="pt-4 overflow-y-auto max-h-[220px] pr-1 flex-1 flex flex-col gap-3 font-sans text-xs">
                    {TOP_OFFICERS_LEADERBOARD.map((of) => (
                      <div key={of.name} className="flex items-center justify-between p-2 hover:bg-surface-elevated/40 rounded-xs transition-colors border border-transparent hover:border-border/60">
                        <div className="flex items-center gap-2.5 min-w-0">
                          <div className="h-7 w-7 rounded-full bg-primary/10 border border-primary/20 text-primary flex items-center justify-center font-heading font-extrabold text-[10px] shrink-0">
                            {of.avatar}
                          </div>
                          <div className="flex flex-col min-w-0 leading-tight">
                            <span className="font-bold text-foreground truncate">{of.name}</span>
                            <span className="text-[9px] text-foreground-muted truncate">Processed: {of.cases} cases | Pending: {of.pending}</span>
                          </div>
                        </div>
                        <div className="text-right leading-tight shrink-0">
                          <span className="block font-bold text-positive font-mono">{of.approvalRate}% Appr</span>
                          <span className="block text-[9px] text-foreground-muted font-mono">{of.avgTime} avg</span>
                        </div>
                      </div>
                    ))}
                  </CardContent>
                </Card>

              </div>

            </div>
          )}
        </>
      )}

      {/* 4. Preview Report Modal Dialog */}
      <Modal
        isOpen={isPreviewOpen}
        onClose={() => setIsPreviewOpen(false)}
        title={selectedReport ? `${selectedReport.title}` : "Executive Report Details"}
        className="max-w-md"
      >
        {selectedReport && (
          <div className="space-y-4 font-sans select-none">
            <div className="flex items-center justify-between text-xs">
              <span className="text-foreground-secondary">Published date</span>
              <span className="font-mono text-foreground font-semibold">{selectedReport.published} ({selectedReport.size})</span>
            </div>

            <div className="p-3 bg-surface-elevated border border-border rounded-sm">
              <span className="text-[10px] uppercase font-bold text-foreground-muted tracking-wider block select-none">Report Summary</span>
              <p className="text-xs text-foreground-secondary mt-1.5 leading-relaxed font-sans font-normal">
                {selectedReport.description} This report includes parsed data layers for quarterly revenue cycles, loan compliance checks, model drift metrics, and user logs. All reports are SHA-256 secure signed to prevent integrity violations.
              </p>
            </div>

            <div className="border-t border-border/40 pt-4 flex justify-end gap-2 text-xs">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsPreviewOpen(false)}
                className="h-9 px-4"
              >
                Close Preview
              </Button>
              <Button
                variant="primary"
                size="sm"
                onClick={() => {
                  setIsPreviewOpen(false);
                  toast.success(`Exporting ${selectedReport.id} PDF draft successfully.`);
                }}
                className="h-9 px-4 bg-primary text-white"
              >
                Download PDF Report
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </PageContainer>
  );
}
