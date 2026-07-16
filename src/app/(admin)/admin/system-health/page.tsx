"use client";

import React, { useState, useEffect, useMemo, useCallback } from "react";
import {
  Activity,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
  Download,
  SlidersHorizontal,
  Search,
  X,
  ChevronRight,
  Cpu,
  FileSpreadsheet,
  FileDown,
  CheckCircle,
  Info,
  Calendar,
  Server,
  Clock,
  ArrowRight,
  Database,
  Lock,
  Settings,
  Key,
  ChevronLeft,
  Eye,
  Play,
  Pause,
  Edit2,
  Power,
  RotateCw,
  HardDrive,
  Network,
  ListTodo,
  ShieldAlert,
  Flame,
  Terminal,
  FileText
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
  Cell
} from "recharts";
import { toast } from "sonner";

import PageContainer from "@/components/ui/PageContainer";
import SectionHeader from "@/components/ui/SectionHeader";
import { Card, CardHeader, CardTitle, CardContent, CardDescription, CardFooter } from "@/components/ui/Card";
import { Badge, StatusBadge, TrendIndicator } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Modal, Tooltip, Dropdown, Sheet, Tabs } from "@/components/ui/Overlays";
import { cn } from "@/lib/utils";

import {
  SERVICES_HEALTH_DATA,
  BACKGROUND_JOBS_DATA,
  QUEUES_MONITOR_DATA,
  WORKERS_MONITOR_DATA,
  SCHEDULED_TASKS_DATA,
  SYSTEM_OVERVIEW_DATA,
  DATABASE_MONITOR_DATA,
  SYSTEM_ALERTS_DATA,
  EVENT_TIMELINE_DATA,
  ServiceHealthRow,
  BackgroundJobItem,
  ScheduledTaskItem,
  WorkerMonitorItem,
  SystemAlertItem,
  HealthStatus,
  JobStatus
} from "@/lib/system_health_data";

// Theme color map
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

export default function InfrastructureOperationsPage() {
  const [mounted, setMounted] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isError, setIsError] = useState(false);
  const [lastSyncTime, setLastSyncTime] = useState("");

  // Navigation tab selectors
  const [activeTab, setActiveTab] = useState<string>("overview");

  // Filter & Search states
  const [selectedTimeframe, setSelectedTimeframe] = useState<string>("7 Days");
  const [jobSearch, setJobSearch] = useState("");
  const [jobStatusFilter, setJobStatusFilter] = useState<string>("all");
  const [jobDensity, setJobDensity] = useState<"compact" | "standard">("standard");

  // Interaction drawer handles
  const [selectedJob, setSelectedJob] = useState<BackgroundJobItem | null>(null);
  const [isJobDrawerOpen, setIsJobDrawerOpen] = useState(false);
  const [selectedAlert, setSelectedAlert] = useState<SystemAlertItem | null>(null);
  const [isAlertModalOpen, setIsAlertModalOpen] = useState(false);
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);
  
  // Custom states to simulate empty checklists
  const [isSimulateEmptyState, setIsSimulateEmptyState] = useState(false);

  // Scheduled tasks interactive state tracking
  const [scheduledTasks, setScheduledTasks] = useState<ScheduledTaskItem[]>(SCHEDULED_TASKS_DATA);
  const [selectedTaskToEdit, setSelectedTaskToEdit] = useState<ScheduledTaskItem | null>(null);
  const [editCronPattern, setEditCronPattern] = useState("");

  // System thresholds states
  const [cpuWarningLimit, setCpuWarningLimit] = useState(80);
  const [memWarningLimit, setMemWarningLimit] = useState(85);
  const [connWarningLimit, setConnWarningLimit] = useState(400);

  // Sync loading state
  useEffect(() => {
    setMounted(true);
    setLastSyncTime(new Date().toLocaleTimeString());
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 700);
    return () => clearTimeout(timer);
  }, []);

  // Sparkline renders helper
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

  // Sync timeframe loads
  const handleTimeframeChange = (time: string) => {
    setIsLoading(true);
    setSelectedTimeframe(time);
    setTimeout(() => {
      setIsLoading(false);
    }, 450);
  };

  // Re-sync metrics manually
  const handleRefresh = useCallback(() => {
    setIsLoading(true);
    setIsError(false);
    setTimeout(() => {
      setIsLoading(false);
      setLastSyncTime(new Date().toLocaleTimeString());
      toast.success("Infrastructure Operations database metrics synchronized.");
    }, 600);
  }, []);

  // System restart triggers
  const handleRestartService = (name: string) => {
    toast.promise(
      new Promise((resolve) => setTimeout(resolve, 2000)),
      {
        loading: `Dispatched warm boot signals to service container: ${name}...`,
        success: `Container ${name} restarted successfully. Thread checks passed.`,
        error: `Failed to reload ${name}.`
      }
    );
  };

  const handleRestartWorker = (name: string) => {
    toast.promise(
      new Promise((resolve) => setTimeout(resolve, 1500)),
      {
        loading: `Terminating process threads for background worker: ${name}...`,
        success: `Worker thread pool ${name} re-initialized. Listening to event queues.`,
        error: `Failed to reload worker.`
      }
    );
  };

  // Exporters download mock triggers
  const handleExport = (format: "PDF" | "CSV" | "Excel") => {
    const toastId = toast.loading(`Generating system operations ${format} report...`);
    setTimeout(() => {
      try {
        let content = "";
        let filename = `arthdrishti_system_report_${new Date().toISOString().split("T")[0]}`;
        
        if (format === "CSV") {
          content = "Service Name,Status,Uptime (%),CPU Usage (%),Memory (MB),Latency (ms)\n";
          SERVICES_HEALTH_DATA.forEach(s => {
            content += `${s.name},${s.status},${s.uptime}%,${s.cpu}%,${s.memory}MB,${s.latency}ms\n`;
          });
          filename += ".csv";
        } else {
          content = `ARTHDRISHTI SYSTEM HEALTH REPORT\n===============================\n`;
          content += `Export Date: ${new Date().toLocaleString()}\n`;
          content += `Active Workers: ${WORKERS_MONITOR_DATA.length}\n`;
          content += `Running Jobs: ${BACKGROUND_JOBS_DATA.filter(j => j.status === "Running").length}\n\n`;
          content += `Active Alert Logs:\n`;
          SYSTEM_ALERTS_DATA.forEach(a => {
            content += `- [${a.severity}] ${a.title}: ${a.message} (${a.timestamp})\n`;
          });
          filename += format === "Excel" ? ".xlsx" : ".pdf";
        }

        const blob = new Blob([content], { type: "text/plain;charset=utf-8" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        
        toast.success(`Successfully downloaded system health ${format} report.`, { id: toastId });
      } catch (err) {
        toast.error(`Failed to generate ${format} report.`, { id: toastId });
      }
    }, 1200);
  };

  // Scheduled crons pause / resume togglers
  const handleToggleCronTask = (id: string) => {
    setScheduledTasks(prev => 
      prev.map(task => {
        if (task.id === id) {
          const newStatus = task.status === "Paused" ? "Active" : "Paused";
          toast.success(`Scheduled task: ${task.name} ${newStatus === "Paused" ? "paused" : "resumed"}.`);
          return { ...task, status: newStatus };
        }
        return task;
      })
    );
  };

  // Manual cron trigger execution
  const handleRunTaskNow = (name: string) => {
    toast.promise(
      new Promise((resolve) => setTimeout(resolve, 1500)),
      {
        loading: `Queueing task runner thread for: ${name}...`,
        success: `Task execution context loaded. Job dispatches generated.`,
        error: `Runner launch failed.`
      }
    );
  };

  // Edit cron config schedule modal trigger
  const handleEditCronSchedule = (task: ScheduledTaskItem) => {
    setSelectedTaskToEdit(task);
    setEditCronPattern(task.schedule);
    setIsSettingsModalOpen(true);
  };

  const handleApplyCronEdit = () => {
    if (selectedTaskToEdit) {
      setScheduledTasks(prev => 
        prev.map(t => t.id === selectedTaskToEdit.id ? { ...t, schedule: editCronPattern } : t)
      );
      setIsSettingsModalOpen(false);
      toast.success(`Cron pattern updated for task: ${selectedTaskToEdit.name}`);
    }
  };

  // Filter background jobs list matching parameters
  const filteredJobs = useMemo(() => {
    if (isSimulateEmptyState) return [];
    return BACKGROUND_JOBS_DATA.filter(j => {
      const matchesSearch = j.name.toLowerCase().includes(jobSearch.toLowerCase()) || 
                            j.id.toLowerCase().includes(jobSearch.toLowerCase());
      const matchesStatus = jobStatusFilter === "all" || j.status === jobStatusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [jobSearch, jobStatusFilter, isSimulateEmptyState]);

  // Job row click drawer trigger
  const handleJobRowClick = (job: BackgroundJobItem) => {
    setSelectedJob(job);
    setIsJobDrawerOpen(true);
  };

  const handleAlertClick = (alert: SystemAlertItem) => {
    setSelectedAlert(alert);
    setIsAlertModalOpen(true);
  };

  // Status mapping styles
  const getStatusColor = (status: string) => {
    switch (status) {
      case "Healthy":
      case "Active":
      case "Completed":
      case "Success":
        return "text-positive bg-positive/10 border-positive/20";
      case "Warning":
      case "Degraded":
      case "Running":
      case "Retrying":
      case "Scheduled":
        return "text-warning bg-warning/10 border-warning/20";
      case "Offline":
      case "Critical":
      case "Failed":
        return "text-critical bg-critical/10 border-critical/20 animate-pulse";
      case "Paused":
      case "Cancelled":
      case "Maintenance":
        return "text-foreground-secondary bg-surface-elevated border-border";
      default:
        return "text-foreground-secondary bg-surface-elevated border-border";
    }
  };

  // Global KPI parameters cards config
  const globalKPIs = [
    { title: "Platform Availability", value: "99.98%", trend: 0.02, sparkline: [99.95, 99.96, 99.98, 99.97, 99.98, 99.98], icon: Activity, status: "success", desc: "Overall SLA uptime ratio" },
    { title: "Healthy Services", value: "13 / 15", trend: -13.3, sparkline: [15, 15, 14, 14, 13, 13], icon: Server, status: "warning", desc: "Online dependencies nodes" },
    { title: "Active Workers", value: "4 / 5", trend: 0, sparkline: [4, 4, 4, 4, 4, 4], icon: Cpu, status: "info", desc: "Running task executor threads" },
    { title: "Running Jobs", value: 1, trend: 100.0, sparkline: [0, 0, 1, 1, 0, 1], icon: ListTodo, status: "warning", desc: "Jobs currently compute processing" },
    { title: "Failed Jobs (24h)", value: 1, trend: 0, sparkline: [1, 1, 1, 0, 1, 1], icon: ShieldAlert, status: "destructive", desc: "Unsuccessful execution tasks" },
    { title: "Database Health", value: "99.95%", trend: 0.01, sparkline: [99.92, 99.94, 99.95, 99.95, 99.95, 99.95], icon: Database, status: "success", desc: "Postgres cache hit index" },
    { title: "Storage Usage", value: "88.2%", trend: 2.4, sparkline: [85.1, 85.8, 86.4, 87.2, 87.8, 88.2], icon: HardDrive, status: "warning", desc: "Onboarding storage capacity ratio" },
    { title: "Avg CPU Load", value: "48.2%", trend: 15.4, sparkline: [38.2, 42.1, 45.4, 52.1, 46.8, 48.2], icon: Activity, status: "info", desc: "Aggregated CPU core usage index" }
  ];

  if (!mounted) return null;

  return (
    <PageContainer>
      {/* 1. Page Header Actions */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 border-b border-border/60 pb-5 mb-6 select-none">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="font-heading font-bold text-2xl md:text-3xl text-foreground tracking-tight">
              System Health & Background Jobs
            </h1>
            <span className="h-2 w-2 rounded-full bg-positive animate-pulse" title="Diagnostics streaming operational telemetry" />
          </div>
          <p className="font-sans text-sm text-foreground-secondary mt-1.5 leading-relaxed max-w-[800px]">
            Monitor platform infrastructure, databases, services, queues, workers and scheduled background jobs across the ArthDrishti ecosystem.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleRefresh}
            className="h-9 px-3.5 focus-visible:outline-2"
            aria-label="Synchronize telemetry counters data"
          >
            <RefreshCw className={cn("h-3.5 w-3.5 mr-1.5", isLoading && "animate-spin")} />
            <span>Refresh</span>
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={() => handleRestartService("Background Worker")}
            className="h-9 px-3.5 focus-visible:outline-2"
            aria-label="Cold boot targeted core system service container"
          >
            <RotateCw className="h-3.5 w-3.5 mr-1.5 text-warning" />
            <span>Restart Service</span>
          </Button>

          <Dropdown
            align="right"
            trigger={
              <Button variant="outline" size="sm" className="h-9 px-3.5 focus-visible:outline-2" aria-label="Export infrastructure diagnostics analytics files options">
                <Download className="h-3.5 w-3.5 mr-1.5" />
                <span>Export Metrics</span>
              </Button>
            }
            items={[
              { id: "PDF", label: "PDF Document", icon: FileText, onClick: () => handleExport("PDF") },
              { id: "CSV", label: "CSV Logs Spread", icon: FileSpreadsheet, onClick: () => handleExport("CSV") },
              { id: "Excel", label: "Excel Operations Sheet", icon: FileDown, onClick: () => handleExport("Excel") }
            ]}
          />
        </div>
      </div>

      {/* 2. Sticky Platform Alerts Panel */}
      {SYSTEM_ALERTS_DATA.length > 0 && (
        <div className="mb-6 space-y-2 select-none animate-fadeIn">
          {SYSTEM_ALERTS_DATA.map((alert) => (
            <div
              key={alert.id}
              onClick={() => handleAlertClick(alert)}
              className={cn(
                "w-full p-4 rounded-sm border flex items-center justify-between cursor-pointer transition-all duration-200 focus-visible:outline-2 focus:outline-none hover:scale-[1.002] shadow-xs",
                alert.severity === "Critical" 
                  ? "bg-critical/5 border-critical/20 hover:border-critical/40 text-critical" 
                  : "bg-warning/5 border-warning/20 hover:border-warning/40 text-warning"
              )}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  handleAlertClick(alert);
                }
              }}
              aria-label={`Active system notification: ${alert.title}. Click to view metrics trace.`}
            >
              <div className="flex items-center gap-3 min-w-0 pr-4">
                <div className="flex-shrink-0">
                  {alert.severity === "Critical" ? (
                    <Flame className="h-5 w-5 animate-pulse text-critical" />
                  ) : (
                    <AlertTriangle className="h-5 w-5 text-warning" />
                  )}
                </div>
                <div className="flex flex-col text-left min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-xs font-semibold uppercase tracking-wider font-mono">
                      [{alert.severity}]
                    </span>
                    <span className="text-sm font-semibold text-foreground truncate">
                      {alert.title}
                    </span>
                    <span className="text-[10px] text-foreground-muted font-mono">
                      {alert.timestamp}
                    </span>
                  </div>
                  <span className="text-xs text-foreground-secondary truncate mt-0.5">
                    {alert.message}
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-1.5 flex-shrink-0 font-sans text-xs font-semibold text-foreground-secondary group-hover:text-foreground">
                <span>Inspect Trace</span>
                <ChevronRight className="h-4 w-4" />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* 3. Operations Workspace Navigation Tabs */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border/60 pb-3 mb-6 select-none">
        <Tabs
          tabs={[
            { id: "overview", label: "Operations Overview", icon: Activity },
            { id: "services", label: "Services & Infrastructure Status", icon: Server },
            { id: "jobs", label: "Background Jobs Registry", icon: ListTodo }
          ]}
          activeTab={activeTab}
          onChangeTab={setActiveTab}
        />

        <div className="flex items-center gap-2">
          {/* Simulate empty list filter state */}
          <Tooltip content="Toggle to simulate empty events checklists logs">
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

          {/* Simulate error network state */}
          <Tooltip content="Toggle to simulate active infrastructure connection issues">
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

      {/* ERROR PANEL RENDER SCREEN */}
      {isError ? (
        <Card className="border border-critical bg-critical/5 select-none my-8 p-8 flex flex-col items-center justify-center text-center gap-4">
          <div className="h-12 w-12 rounded-full bg-critical/10 flex items-center justify-center text-critical">
            <ShieldAlert className="h-6 w-6" />
          </div>
          <div>
            <CardTitle className="text-lg font-heading font-bold text-foreground">
              MLOps Infrastructure Cluster Timeout
            </CardTitle>
            <CardDescription className="text-sm font-sans mt-2 max-w-lg mx-auto">
              Diagnostic socket timed out while querying memory/CPU loads on telemetry nodes. The connection index has been rejected.
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
              <span>Retry Sync</span>
            </Button>
          </div>
        </Card>
      ) : (
        <>
          {/* TAB 1: OPERATIONS OVERVIEW COCKPIT */}
          {activeTab === "overview" && (
            <div className="space-y-6">
              
              {/* 8 Global KPIs */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {globalKPIs.map((kpi) => {
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

                  const Icon = kpi.icon;

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
                          <span className="text-xs font-sans font-medium text-foreground-secondary group-hover:text-foreground transition-colors tracking-wide">
                            {kpi.title}
                          </span>
                          <div className="flex items-center gap-1.5">
                            {kpi.trend !== 0 && (
                              <TrendIndicator value={kpi.trend} />
                            )}
                            <Icon className="h-4 w-4 text-foreground-muted group-hover:text-primary transition-colors flex-shrink-0" />
                          </div>
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
                          {kpi.desc}
                        </p>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>

              {/* System Graphs & Event Timeline Grid */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                
                {/* Visual Performance Charts (CPU / Memory / Disk / Network) */}
                <Card className="lg:col-span-2 bg-surface border border-border shadow-xs select-none">
                  <CardHeader className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border/40 pb-4">
                    <div>
                      <CardTitle className="text-base sm:text-lg font-heading">
                        Infrastructure Resource Utilization
                      </CardTitle>
                      <CardDescription className="text-xs">
                        Real-time tracking of memory footprints, CPU cores usage, and disk space limits.
                      </CardDescription>
                    </div>
                    <div className="flex items-center gap-1.5 text-xs text-foreground-secondary bg-surface-elevated border border-border px-3 py-1.5 rounded-sm">
                      <select
                        value={selectedTimeframe}
                        onChange={(e) => handleTimeframeChange(e.target.value)}
                        className="bg-transparent text-xs font-sans font-bold border-none outline-none text-foreground cursor-pointer"
                        aria-label="Select timeframe range for resource graphs"
                      >
                        <option value="Live">Live Metrics</option>
                        <option value="Today">Today</option>
                        <option value="7 Days">7 Days</option>
                        <option value="30 Days">30 Days</option>
                      </select>
                    </div>
                  </CardHeader>
                  <CardContent className="pt-6">
                    {isLoading ? (
                      <div className="h-72 w-full bg-surface-elevated/40 animate-pulse rounded-sm flex items-center justify-center text-foreground-muted text-xs">
                        Loading performance graphs...
                      </div>
                    ) : isSimulateEmptyState ? (
                      <div className="h-72 w-full flex flex-col items-center justify-center text-center gap-2 select-none">
                        <Flame className="h-8 w-8 text-foreground-muted" />
                        <span className="text-sm font-semibold text-foreground">No Resource Metrics Captured</span>
                      </div>
                    ) : (
                      <div className="h-72 w-full">
                        <ResponsiveContainer width="100%" height="100%">
                          <AreaChart data={SYSTEM_OVERVIEW_DATA[selectedTimeframe] || SYSTEM_OVERVIEW_DATA["Live"]}>
                            <defs>
                              <linearGradient id="colorCpu" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor={COLORS.primary} stopOpacity={0.2}/>
                                <stop offset="95%" stopColor={COLORS.primary} stopOpacity={0}/>
                              </linearGradient>
                              <linearGradient id="colorMemory" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor={COLORS.ai} stopOpacity={0.2}/>
                                <stop offset="95%" stopColor={COLORS.ai} stopOpacity={0}/>
                              </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" opacity={0.3} />
                            <XAxis dataKey="time" stroke="var(--foreground-muted)" fontSize={10} tickLine={false} />
                            <YAxis stroke="var(--foreground-muted)" fontSize={10} tickLine={false} domain={[0, 100]} />
                            <RechartsTooltip contentStyle={{ backgroundColor: "var(--surface)", borderColor: "var(--border)", borderRadius: "4px", fontSize: "12px" }} />
                            <Legend wrapperStyle={{ fontSize: "11px", paddingTop: "12px" }} />
                            <Area name="CPU load (%)" type="monotone" dataKey="cpu" stroke={COLORS.primary} fillOpacity={1} fill="url(#colorCpu)" strokeWidth={2} />
                            <Area name="Memory utilization (%)" type="monotone" dataKey="memory" stroke={COLORS.ai} fillOpacity={1} fill="url(#colorMemory)" strokeWidth={2} />
                            <Line name="Worker Utilization" type="monotone" dataKey="workerUtil" stroke={COLORS.forecast} strokeWidth={2} dot={false} />
                            <Line name="Disk Storage limit (%)" type="monotone" dataKey="disk" stroke={COLORS.warning} strokeWidth={1.5} dot={false} />
                          </AreaChart>
                        </ResponsiveContainer>
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Sticky events timeline logs */}
                <Card className="bg-surface border border-border shadow-xs select-none flex flex-col justify-between">
                  <CardHeader className="border-b border-border/40 pb-4">
                    <CardTitle className="text-base sm:text-lg font-heading">
                      Operational Event Timeline
                    </CardTitle>
                    <CardDescription className="text-xs">
                      Chronological ledger tracking service updates, backups, and restarts.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="pt-6 flex-1 overflow-y-auto max-h-[300px] scrollbar-none pr-1">
                    {isLoading ? (
                      <div className="space-y-4 animate-pulse">
                        {[1, 2, 3].map(idx => (
                          <div key={idx} className="h-10 bg-surface-elevated rounded-sm w-full" />
                        ))}
                      </div>
                    ) : isSimulateEmptyState ? (
                      <div className="text-center p-6 text-foreground-muted text-xs flex flex-col items-center justify-center gap-2">
                        <Clock className="h-6 w-6 text-foreground-muted" />
                        <span>No System Events Logged</span>
                      </div>
                    ) : (
                      <div className="relative border-l border-border pl-4.5 ml-2.5 space-y-5">
                        {EVENT_TIMELINE_DATA.map((event) => {
                          let dotBg = "bg-primary";
                          if (event.type === "Success") dotBg = "bg-positive";
                          if (event.type === "Warning") dotBg = "bg-warning";
                          if (event.type === "Critical") dotBg = "bg-critical";

                          return (
                            <div key={event.id} className="relative text-left">
                              <div className={cn("absolute -left-[24px] top-1.5 h-3 w-3 rounded-full border border-surface", dotBg)} />
                              <div className="flex items-center gap-2">
                                <span className="text-xs font-semibold text-foreground leading-none">{event.title}</span>
                                <span className="text-[9px] font-mono text-foreground-muted">{event.timestamp}</span>
                              </div>
                              <p className="text-[11px] text-foreground-secondary mt-1 leading-normal font-sans">
                                {event.message}
                              </p>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>

              {/* Database Performance Details */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                
                {/* Database Metrics chart */}
                <Card className="lg:col-span-2 bg-surface border border-border shadow-xs select-none">
                  <CardHeader className="border-b border-border/40 pb-4">
                    <CardTitle className="text-base sm:text-lg font-heading">
                      Database Latency & Cache hit rates
                    </CardTitle>
                    <CardDescription className="text-xs">
                      PostgreSQL response latency metrics (ms) and query metrics distribution.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="pt-6 h-60 w-full">
                    {isLoading ? (
                      <div className="h-full bg-surface-elevated/40 animate-pulse rounded-sm" />
                    ) : (
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={DATABASE_MONITOR_DATA} margin={{ top: 5, right: 10, left: -25, bottom: 0 }}>
                          <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" opacity={0.3} />
                          <XAxis dataKey="time" stroke="var(--foreground-muted)" fontSize={10} tickLine={false} />
                          <YAxis yAxisId="left" stroke="var(--foreground-muted)" fontSize={10} tickLine={false} />
                          <YAxis yAxisId="right" orientation="right" stroke="var(--foreground-muted)" fontSize={10} tickLine={false} domain={[99.5, 100]} />
                          <RechartsTooltip contentStyle={{ backgroundColor: "var(--surface)", borderColor: "var(--border)", borderRadius: "4px", fontSize: "11px" }} />
                          <Legend wrapperStyle={{ fontSize: "10px" }} />
                          <Line yAxisId="left" name="Query Time (ms)" type="monotone" dataKey="queryTime" stroke={COLORS.critical} strokeWidth={2} />
                          <Line yAxisId="left" name="Database Connections" type="monotone" dataKey="connections" stroke={COLORS.primary} strokeWidth={1.5} dot={false} />
                          <Line yAxisId="right" name="Cache Hit Rate (%)" type="monotone" dataKey="cacheHitRate" stroke={COLORS.positive} strokeWidth={2} dot={false} />
                        </LineChart>
                      </ResponsiveContainer>
                    )}
                  </CardContent>
                </Card>

                {/* Queue metrics stats cards */}
                <div className="space-y-4">
                  <div className="border-b border-border/60 pb-3 select-none">
                    <h3 className="text-sm font-heading font-bold text-foreground uppercase tracking-wider">Active Queue Length</h3>
                    <p className="text-[10px] text-foreground-secondary mt-0.5">Estimated backlog jobs volume in queue buffers.</p>
                  </div>
                  <div className="grid grid-cols-1 gap-2.5 max-h-[190px] overflow-y-auto pr-1">
                    {QUEUES_MONITOR_DATA.map((q) => (
                      <div key={q.name} className="p-2.5 rounded-sm bg-surface border border-border/50 hover:bg-surface-elevated/40 transition-colors flex items-center justify-between">
                        <div className="flex flex-col min-w-0 text-left">
                          <span className="text-xs font-semibold text-foreground truncate">{q.name}</span>
                          <span className="text-[9px] text-foreground-muted font-mono mt-0.5">Workers: {q.workers} | Wait: {q.avgWait}s</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] font-mono font-bold text-foreground-secondary">Run: {q.running}</span>
                          <span className={cn(
                            "inline-flex items-center rounded-xs px-2 py-0.5 text-[9px] font-bold border",
                            q.queued > 0 ? "text-critical bg-critical/10 border-critical/20" : "text-positive bg-positive/10 border-positive/20"
                          )}>
                            Queued: {q.queued}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

              </div>

            </div>
          )}

          {/* TAB 2: SERVICE & INFRASTRUCTURE STATUS */}
          {activeTab === "services" && (
            <div className="space-y-6">
              
              <div className="border-b border-border/40 pb-3 mb-4 select-none">
                <h2 className="text-base sm:text-lg font-heading font-semibold text-foreground">Service Registry Nodes</h2>
                <p className="text-xs text-foreground-secondary mt-0.5">Checks operational states of target APIs, storage nodes, databases, and message brokers.</p>
              </div>

              {/* 15 Service status cards matrix */}
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 select-none animate-fadeIn">
                {SERVICES_HEALTH_DATA.map((srv) => (
                  <Card key={srv.id} className="bg-surface border border-border hover:border-primary/45 transition-colors p-4 flex flex-col justify-between gap-3 group">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-foreground truncate max-w-[130px]">{srv.name}</span>
                      <span className={cn("inline-flex items-center rounded-xs px-1.5 py-0.25 text-[9px] font-bold border", getStatusColor(srv.status))}>
                        {srv.status}
                      </span>
                    </div>

                    <div className="space-y-1.5 text-xs text-foreground-secondary">
                      <div className="flex justify-between">
                        <span>CPU Load</span>
                        <span className="font-mono font-semibold text-foreground">{srv.cpu}%</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Memory allocation</span>
                        <span className="font-mono font-semibold text-foreground">{srv.memory === 0 ? "—" : `${srv.memory} MB`}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Ping Latency</span>
                        <span className="font-mono font-semibold text-foreground">{srv.latency === 0 ? "—" : `${srv.latency}ms`}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Uptime index</span>
                        <span className="font-mono font-semibold text-foreground">{srv.uptime}%</span>
                      </div>
                    </div>

                    <div className="border-t border-border/40 pt-2.5 flex items-center justify-between mt-1">
                      <span className="text-[8px] text-foreground-muted font-mono truncate max-w-[80px]" title={`Last check: ${srv.lastCheck}`}>
                        {srv.lastCheck.split(" ")[1]}
                      </span>
                      <button
                        onClick={() => handleRestartService(srv.name)}
                        className="text-[10px] text-warning hover:text-white hover:bg-warning bg-warning/10 border border-warning/20 px-2 py-0.5 rounded-sm font-semibold transition-colors flex items-center gap-1 cursor-pointer focus-visible:outline-2 outline-none"
                        aria-label={`Warm boot service ${srv.name}`}
                      >
                        <Power className="h-2.5 w-2.5" />
                        <span>Restart</span>
                      </button>
                    </div>
                  </Card>
                ))}
              </div>

              {/* Scheduled Tasks list */}
              <div className="mt-8 select-none">
                <div className="border-b border-border/40 pb-3 mb-4">
                  <h2 className="text-base sm:text-lg font-heading font-semibold text-foreground">Scheduled Background Tasks</h2>
                  <p className="text-xs text-foreground-secondary mt-0.5 font-sans">Manage database backup crons, model retrainers, and cache cleaner frequencies.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 animate-fadeIn">
                  {scheduledTasks.map((task) => (
                    <Card key={task.id} className="bg-surface border border-border flex flex-col justify-between p-4.5 gap-4">
                      <div>
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold text-foreground truncate max-w-[150px]">{task.name}</span>
                          <span className={cn("inline-flex items-center rounded-xs px-2 py-0.5 text-[9px] font-bold border", getStatusColor(task.status))}>
                            {task.status}
                          </span>
                        </div>
                        <p className="text-xs text-foreground-secondary mt-2 leading-relaxed h-10 overflow-hidden font-sans">
                          {task.description}
                        </p>
                        <div className="mt-3.5 space-y-1 text-xs font-mono text-foreground-secondary">
                          <div>Cron: <span className="text-primary font-bold">{task.schedule}</span></div>
                          <div className="truncate" title={`Last: ${task.lastRun}`}>Last: {task.lastRun}</div>
                          <div className="truncate" title={`Next: ${task.nextRun}`}>Next: {task.nextRun}</div>
                        </div>
                      </div>

                      <div className="border-t border-border/40 pt-3 flex items-center justify-between gap-2">
                        <button
                          onClick={() => handleToggleCronTask(task.id)}
                          className={cn(
                            "px-2.5 py-1 text-[10px] font-semibold border rounded-sm flex items-center gap-1 cursor-pointer focus-visible:outline-2 outline-none transition-colors",
                            task.status === "Paused" 
                              ? "bg-positive/10 text-positive border-positive/20 hover:bg-positive hover:text-white" 
                              : "bg-surface-elevated text-foreground-secondary border-border hover:bg-surface-hover"
                          )}
                          aria-label={task.status === "Paused" ? `Resume scheduled cron task ${task.name}` : `Pause scheduled cron task ${task.name}`}
                        >
                          {task.status === "Paused" ? <Play className="h-3 w-3" /> : <Pause className="h-3 w-3" />}
                          <span>{task.status === "Paused" ? "Resume" : "Pause"}</span>
                        </button>

                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => handleEditCronSchedule(task)}
                            className="p-1 text-foreground-secondary hover:text-foreground border border-border hover:bg-surface-hover rounded-sm cursor-pointer focus-visible:outline-2 outline-none"
                            title="Edit schedule details"
                            aria-label={`Edit schedule cron pattern for ${task.name}`}
                          >
                            <Edit2 className="h-3 w-3" />
                          </button>
                          <button
                            onClick={() => handleRunTaskNow(task.name)}
                            className="px-2.5 py-1 text-[10px] text-primary hover:text-white hover:bg-primary bg-primary/10 border border-primary/20 rounded-sm font-semibold cursor-pointer focus-visible:outline-2 outline-none transition-colors"
                            aria-label={`Trigger manual runner dispatch for ${task.name}`}
                          >
                            Run Now
                          </button>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              </div>

            </div>
          )}

          {/* TAB 3: BACKGROUND JOBS REGISTRY */}
          {activeTab === "jobs" && (
            <div className="space-y-6">
              
              {/* Directory Filter controls */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-surface border border-border p-4 rounded-sm select-none shadow-xs">
                <div className="relative w-full max-w-sm flex items-center">
                  <Search className="absolute left-3.5 h-4 w-4 text-foreground-muted pointer-events-none" />
                  <input
                    value={jobSearch}
                    onChange={(e) => setJobSearch(e.target.value)}
                    placeholder="Search jobs by ID or task name..."
                    className="w-full h-9 pl-9.5 pr-8 bg-surface-elevated border border-border text-foreground rounded-sm text-xs font-sans placeholder-foreground-muted focus:border-primary focus:outline-none transition-all"
                    aria-label="Search Background Jobs Registry logs"
                  />
                  {jobSearch && (
                    <button
                      type="button"
                      onClick={() => setJobSearch("")}
                      className="absolute right-2.5 text-foreground-muted hover:text-foreground p-0.5 rounded-full hover:bg-surface"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  )}
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  <select
                    value={jobStatusFilter}
                    onChange={(e) => setJobStatusFilter(e.target.value)}
                    className="text-xs font-sans font-semibold bg-surface-elevated border border-border px-3.5 py-2.5 focus:border-primary outline-none rounded-sm transition-colors text-foreground cursor-pointer"
                    aria-label="Filter background jobs list by execution status"
                  >
                    <option value="all">All Statuses</option>
                    <option value="Running">Running</option>
                    <option value="Queued">Queued</option>
                    <option value="Completed">Completed</option>
                    <option value="Failed">Failed</option>
                    <option value="Scheduled">Scheduled</option>
                    <option value="Cancelled">Cancelled</option>
                  </select>

                  <div className="flex border border-border bg-surface-elevated p-0.5 rounded-sm">
                    {(["compact", "standard"] as const).map((density) => (
                      <button
                        key={density}
                        onClick={() => setJobDensity(density)}
                        className={cn(
                          "px-2.5 py-1 text-[10px] font-sans font-bold uppercase rounded-xs transition-colors cursor-pointer",
                          jobDensity === density
                            ? "bg-surface text-foreground shadow-xs border border-border/80"
                            : "text-foreground-secondary hover:text-foreground"
                        )}
                        aria-label={`Set registry list layout density to ${density}`}
                      >
                        {density}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Background Jobs Registry Table */}
              <Card className="bg-surface border border-border shadow-xs overflow-hidden flex flex-col">
                <CardContent className="p-0 overflow-x-auto">
                  {isLoading ? (
                    <div className="p-8 space-y-4 animate-pulse select-none">
                      {[1, 2, 3, 4].map(idx => (
                        <div key={idx} className="h-8 bg-surface-elevated rounded-sm w-full" />
                      ))}
                    </div>
                  ) : filteredJobs.length === 0 ? (
                    <div className="p-12 text-center flex flex-col items-center justify-center gap-3 select-none">
                      <div className="h-10 w-10 rounded-full bg-surface-elevated border border-border flex items-center justify-center text-foreground-muted">
                        <ListTodo className="h-5 w-5" />
                      </div>
                      <div>
                        <h4 className="text-sm font-semibold text-foreground">No Background Jobs Found</h4>
                        <p className="text-xs text-foreground-muted mt-1 max-w-xs">
                          We couldn't find any operational records matching your search query parameter filters.
                        </p>
                      </div>
                    </div>
                  ) : (
                    <table className="w-full border-collapse text-left font-sans text-xs min-w-[900px]" aria-label="Registry log ledger of platform background tasks">
                      <thead>
                        <tr className="border-b border-border/40 bg-surface-elevated/40 select-none text-foreground-secondary font-semibold uppercase tracking-wider sticky top-0 z-10 backdrop-blur-xs">
                          <th className="p-3 pl-6">Job ID</th>
                          <th className="p-3">Job Name</th>
                          <th className="p-3">Category</th>
                          <th className="p-3">Priority</th>
                          <th className="p-3">Queue Target</th>
                          <th className="p-3">Worker Node</th>
                          <th className="p-3">Progress</th>
                          <th className="p-3">Status</th>
                          <th className="p-3">Duration</th>
                          <th className="p-3">Started At</th>
                          <th className="p-3 pr-6 text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-border/40">
                        {filteredJobs.map((row) => (
                          <tr
                            key={row.id}
                            className={cn(
                              "hover:bg-surface-elevated/40 transition-colors group cursor-pointer",
                              row.status === "Failed" && "bg-critical/5/5",
                              jobDensity === "compact" ? "h-9" : "h-12"
                            )}
                            onClick={() => handleJobRowClick(row)}
                          >
                            <td className="p-3 pl-6 font-mono font-semibold text-foreground">{row.id}</td>
                            <td className="p-3 font-semibold text-foreground truncate max-w-[150px]">{row.name}</td>
                            <td className="p-3 text-foreground-secondary">{row.category}</td>
                            <td className="p-3">
                              <span className={cn(
                                "font-medium",
                                row.priority === "Critical" ? "text-critical" : row.priority === "High" ? "text-warning" : "text-foreground-secondary"
                              )}>
                                {row.priority}
                              </span>
                            </td>
                            <td className="p-3 font-mono text-foreground-secondary truncate max-w-[130px]">{row.queue}</td>
                            <td className="p-3 font-mono text-foreground-secondary truncate max-w-[100px]">{row.worker}</td>
                            <td className="p-3 w-32">
                              {row.status === "Running" ? (
                                <div className="space-y-1.5 w-full">
                                  <div className="h-1.5 bg-border rounded-full overflow-hidden">
                                    <div className="h-full bg-primary rounded-full transition-all duration-300" style={{ width: `${row.progress}%` }} />
                                  </div>
                                  <span className="font-mono text-[9px] font-bold text-primary block leading-none">{row.progress}%</span>
                                </div>
                              ) : row.status === "Completed" ? (
                                <span className="font-mono text-[10px] text-positive font-bold">100%</span>
                              ) : row.status === "Failed" ? (
                                <span className="font-mono text-[10px] text-critical font-bold">Error</span>
                              ) : (
                                <span className="font-mono text-[10px] text-foreground-muted">—</span>
                              )}
                            </td>
                            <td className="p-3">
                              <span className={cn("inline-flex items-center rounded-xs px-2 py-0.5 text-[9px] font-bold border", getStatusColor(row.status))}>
                                {row.status}
                              </span>
                            </td>
                            <td className="p-3 font-mono text-foreground-secondary">
                              {row.duration === 0 ? "—" : `${row.duration}s`}
                            </td>
                            <td className="p-3 font-mono text-foreground-secondary truncate max-w-[120px]">{row.startedAt}</td>
                            <td className="p-3 pr-6 text-right" onClick={(e) => e.stopPropagation()}>
                              <button
                                onClick={() => handleJobRowClick(row)}
                                className="text-xs text-primary font-semibold hover:underline outline-none focus-visible:outline-2 cursor-pointer"
                                aria-label={`View execution logs context for task ${row.id}`}
                              >
                                View Logs
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  )}
                </CardContent>
              </Card>

              {/* Workers thread monitoring list */}
              <div className="select-none">
                <div className="border-b border-border/40 pb-3 mb-4">
                  <h2 className="text-base sm:text-lg font-heading font-semibold text-foreground">Background Worker Status</h2>
                  <p className="text-xs text-foreground-secondary mt-0.5">Uptime CPU load, current job, and processed logs counters for background execution nodes.</p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 animate-fadeIn">
                  {WORKERS_MONITOR_DATA.map((wk) => (
                    <Card key={wk.name} className="bg-surface border border-border p-4 flex flex-col justify-between gap-3.5 group">
                      <div>
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold text-foreground truncate max-w-[125px]">{wk.name}</span>
                          <span className={cn("inline-flex items-center rounded-xs px-1.5 py-0.25 text-[9px] font-bold border", getStatusColor(wk.status))}>
                            {wk.status}
                          </span>
                        </div>
                        <div className="mt-3.5 space-y-1.5 text-xs text-foreground-secondary">
                          <div className="truncate">Job: <span className="font-semibold text-foreground">{wk.currentJob}</span></div>
                          <div className="flex justify-between"><span>CPU Usage</span><span className="font-mono text-foreground">{wk.cpu}%</span></div>
                          <div className="flex justify-between"><span>Memory Alloc</span><span className="font-mono text-foreground">{wk.memory} MB</span></div>
                          <div className="flex justify-between"><span>Processed Tasks</span><span className="font-mono text-foreground">{wk.processedJobs}</span></div>
                        </div>
                      </div>

                      <div className="border-t border-border/40 pt-2.5 flex items-center justify-end mt-1">
                        <button
                          onClick={() => handleRestartWorker(wk.name)}
                          className="text-[10px] text-warning hover:text-white hover:bg-warning bg-warning/10 border border-warning/20 px-2 py-0.5 rounded-sm font-semibold transition-colors flex items-center gap-1 cursor-pointer focus-visible:outline-2 outline-none"
                          aria-label={`Warm reboot background worker thread ${wk.name}`}
                        >
                          <Power className="h-2.5 w-2.5" />
                          <span>Restart Worker</span>
                        </button>
                      </div>
                    </Card>
                  ))}
                </div>
              </div>

            </div>
          )}
        </>
      )}

      {/* 4. Active Alarm details dialog Modal */}
      <Modal
        isOpen={isAlertModalOpen}
        onClose={() => setIsAlertModalOpen(false)}
        title={selectedAlert ? `${selectedAlert.title}` : "Alarm Details"}
        className="max-w-md"
      >
        {selectedAlert && (
          <div className="space-y-4 font-sans select-none">
            <div className="flex items-center justify-between">
              <span className="text-xs text-foreground-secondary">Severity classification</span>
              <span className={cn("inline-flex items-center rounded-xs px-2 py-0.5 text-[10px] font-bold border", getStatusColor(selectedAlert.severity))}>
                {selectedAlert.severity}
              </span>
            </div>

            <div className="p-3 bg-surface-elevated border border-border rounded-sm">
              <span className="text-[10px] uppercase font-bold text-foreground-muted tracking-wider font-mono">Alarm timestamp</span>
              <span className="text-xs text-foreground block font-mono font-semibold mt-1">{selectedAlert.timestamp}</span>
            </div>

            <p className="text-xs text-foreground-secondary leading-normal">
              {selectedAlert.message}
            </p>

            <div className="border-t border-border/40 pt-4 flex justify-end gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsAlertModalOpen(false)}
                className="h-9 px-4 text-xs"
              >
                Close
              </Button>
              <Button
                variant="primary"
                size="sm"
                onClick={() => {
                  setIsAlertModalOpen(false);
                  toast.success(`Platform health alarm acknowledged.`);
                }}
                className="h-9 px-4 text-xs bg-primary text-white"
              >
                Acknowledge Alert
              </Button>
            </div>
          </div>
        )}
      </Modal>

      {/* 5. Job Details slide-out Drawer sheet */}
      <Sheet
        isOpen={isJobDrawerOpen}
        onClose={() => setIsJobDrawerOpen(false)}
        title={selectedJob ? `${selectedJob.id} Details` : "Background Job Telemetry"}
        side="right"
        className="w-full max-w-md sm:max-w-lg"
      >
        {selectedJob && (
          <div className="flex flex-col h-full justify-between pb-8 select-none font-sans">
            <div className="space-y-6 overflow-y-auto pr-1">
              <div>
                <span className="text-lg font-heading font-semibold text-foreground">{selectedJob.name}</span>
                <span className="text-xs text-foreground-secondary block font-mono mt-1">
                  Queue: <span className="font-semibold text-foreground">{selectedJob.queue}</span> | Worker: <span className="font-semibold text-foreground">{selectedJob.worker}</span>
                </span>
                <p className="text-xs text-foreground-secondary mt-2.5 leading-normal">
                  {selectedJob.description}
                </p>
              </div>

              {/* Status details */}
              <div className="grid grid-cols-2 gap-3.5 border-t border-b border-border/40 py-4">
                <div>
                  <span className="text-[10px] uppercase font-bold text-foreground-muted tracking-wider block font-mono">Job Status</span>
                  <span className={cn("inline-flex items-center rounded-xs px-2 py-0.5 text-[9px] font-bold border mt-1.5", getStatusColor(selectedJob.status))}>
                    {selectedJob.status}
                  </span>
                </div>
                <div>
                  <span className="text-[10px] uppercase font-bold text-foreground-muted tracking-wider block font-mono">Task Priority</span>
                  <span className={cn(
                    "text-xs font-semibold block mt-1.5",
                    selectedJob.priority === "Critical" ? "text-critical" : selectedJob.priority === "High" ? "text-warning" : "text-foreground-secondary"
                  )}>{selectedJob.priority}</span>
                </div>
              </div>

              {/* Metadata variables list */}
              <div className="space-y-3">
                <h4 className="text-[10px] uppercase font-bold text-foreground-muted tracking-wider font-mono">Execution Metadata</h4>
                
                {[
                  { label: "Created By Requestor", val: selectedJob.createdBy },
                  { label: "Processing Duration", val: selectedJob.duration === 0 ? "—" : `${selectedJob.duration} seconds` },
                  { label: "Execution Progress", val: `${selectedJob.progress}%` },
                  { label: "Triggered Start Time", val: selectedJob.startedAt },
                  { label: "Completed End Time", val: selectedJob.completedAt }
                ].map((met, idx) => (
                  <div key={idx} className="flex justify-between items-center text-xs border-b border-border/40 pb-2">
                    <span className="text-foreground-secondary font-medium">{met.label}</span>
                    <span className="font-semibold text-foreground text-right">{met.val}</span>
                  </div>
                ))}
              </div>

              {/* Console Logs activity stream */}
              <div className="space-y-3">
                <h4 className="text-[10px] uppercase font-bold text-foreground-muted tracking-wider font-mono flex items-center gap-1.5">
                  <Terminal className="h-3.5 w-3.5" />
                  <span>Execution Logs Output</span>
                </h4>
                <div className="bg-surface-elevated border border-border p-3 rounded-sm font-mono text-[10px] leading-relaxed text-foreground-secondary max-h-[140px] overflow-y-auto space-y-1.5">
                  {selectedJob.logs.map((log, idx) => (
                    <div key={idx} className="break-all">{log}</div>
                  ))}
                  <div className="text-foreground font-semibold pt-1 border-t border-border/40 mt-1">Output result: {selectedJob.output}</div>
                </div>
              </div>

            </div>

            <div className="border-t border-border/40 pt-6 mt-6 flex justify-end gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsJobDrawerOpen(false)}
                className="h-10 px-5 text-xs text-foreground border border-border"
              >
                Close Drawer
              </Button>
              {selectedJob.status === "Failed" && (
                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => {
                    setIsJobDrawerOpen(false);
                    toast.success(`Job re-queued successfully for execution: ${selectedJob.id}`);
                  }}
                  className="h-10 px-5 text-xs bg-primary text-white"
                >
                  Re-run Job
                </Button>
              )}
            </div>
          </div>
        )}
      </Sheet>

      {/* 6. Settings Modal dialog (edit cron schedule details) */}
      <Modal
        isOpen={isSettingsModalOpen}
        onClose={() => setIsSettingsModalOpen(false)}
        title="Edit Cron Schedule Details"
        className="max-w-sm font-sans select-none"
      >
        {selectedTaskToEdit && (
          <div className="space-y-4">
            <div>
              <span className="text-sm font-bold text-foreground block">{selectedTaskToEdit.name}</span>
              <span className="text-xs text-foreground-secondary mt-1 block">{selectedTaskToEdit.description}</span>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-semibold text-foreground block">Cron Expression</label>
              <input
                type="text"
                value={editCronPattern}
                onChange={(e) => setEditCronPattern(e.target.value)}
                className="w-full text-xs font-mono font-bold bg-surface-elevated border border-border px-3.5 py-2.5 outline-none focus:border-primary rounded-sm transition-all text-foreground"
                placeholder="e.g. */5 * * * *"
              />
              <span className="text-[10px] text-foreground-muted block">Format: min hour day month day-of-week</span>
            </div>

            <div className="border-t border-border/40 pt-4 flex justify-end gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsSettingsModalOpen(false)}
                className="h-9 px-4 text-xs"
              >
                Cancel
              </Button>
              <Button
                variant="primary"
                size="sm"
                onClick={handleApplyCronEdit}
                className="h-9 px-4 text-xs bg-primary text-white"
              >
                Apply Change
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </PageContainer>
  );
}

// Subcomponent label handles
function ExclamationIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
    </svg>
  );
}
