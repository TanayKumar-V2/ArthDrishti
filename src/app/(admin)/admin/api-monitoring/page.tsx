"use client";

import React, { useState, useEffect, useMemo, useCallback } from "react";
import {
  Layers,
  Activity,
  TrendingUp,
  Sliders,
  ShieldAlert,
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
  FileText,
  Calendar,
  Server,
  Clock,
  ArrowRight,
  Network,
  Database,
  Lock,
  Settings,
  Key,
  ChevronLeft,
  Eye,
  EyeOff
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
import { Modal, Tooltip, Dropdown, Sheet } from "@/components/ui/Overlays";
import { cn } from "@/lib/utils";

import {
  API_DIRECTORY_DATA,
  API_MONITORING_DB,
  APIDirectoryItem,
  StickyAlert,
  APIStatus
} from "@/lib/api_monitoring_data";

// Custom theme mapping colors
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

export default function APIOperationsCenterPage() {
  const [mounted, setMounted] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isError, setIsError] = useState(false);
  const [lastSyncTime, setLastSyncTime] = useState("");

  // Targets & Range states
  const [selectedTimeframe, setSelectedTimeframe] = useState<string>("7 Days");
  
  // Interactive UI configurations
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  
  // Controls & Drawer handles
  const [selectedAPI, setSelectedAPI] = useState<APIDirectoryItem | null>(null);
  const [isDetailsDrawerOpen, setIsDetailsDrawerOpen] = useState(false);
  const [selectedAlert, setSelectedAlert] = useState<StickyAlert | null>(null);
  const [isAlertModalOpen, setIsAlertModalOpen] = useState(false);
  const [isThresholdSheetOpen, setIsThresholdSheetOpen] = useState(false);
  const [isSimulateEmptyState, setIsSimulateEmptyState] = useState(false);

  // Table display customizations
  const [tableDensity, setTableDensity] = useState<"compact" | "standard" | "cozy">("standard");
  const [visibleColumns, setVisibleColumns] = useState<Record<string, boolean>>({
    name: true,
    category: true,
    method: true,
    endpoint: true,
    status: true,
    latency: true,
    availability: true,
    requests: true,
    errors: true,
    owner: true,
    lastUpdated: true
  });
  const [showColumnDropdown, setShowColumnDropdown] = useState(false);

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  // Threshold States
  const [latencyAlertLimit, setLatencyAlertLimit] = useState(150); // in ms
  const [availabilityWarningLimit, setAvailabilityWarningLimit] = useState(99.9); // in %
  const [errorRateCriticalLimit, setErrorRateCriticalLimit] = useState(1.5); // in %
  const [rateLimitQuota, setRateLimitQuota] = useState(10000); // req/min

  // Synchronize loading animations
  useEffect(() => {
    setMounted(true);
    setLastSyncTime(new Date().toLocaleTimeString());
    
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 800);
    
    return () => clearTimeout(timer);
  }, []);

  // Manual refresh triggers
  const handleRefresh = useCallback(() => {
    setIsLoading(true);
    setIsError(false);
    setTimeout(() => {
      setIsLoading(false);
      setLastSyncTime(new Date().toLocaleTimeString());
      toast.success("API Operations metrics re-synchronized.");
    }, 600);
  }, []);

  // Exporters download mock triggers
  const handleExport = (format: "PDF" | "CSV" | "Excel") => {
    const toastId = toast.loading(`Compiling API metrics ${format} report...`);
    setTimeout(() => {
      try {
        let content = "";
        let filename = `arthdrishti_api_report_${new Date().toISOString().split("T")[0]}`;
        
        if (format === "CSV") {
          content = "API Name,Category,Method,Endpoint,Latency (ms),Availability (%),Requests,Errors,Owner\n";
          API_DIRECTORY_DATA.forEach(a => {
            content += `${a.name},${a.category},${a.method},${a.endpoint},${a.latency}ms,${a.availability}%,${a.requests},${a.errors},${a.owner}\n`;
          });
          filename += ".csv";
        } else {
          content = `ARTHDRISHTI API OPERATIONS REPORT\n================================\n`;
          content += `Export Date: ${new Date().toLocaleString()}\n`;
          content += `Global Availability: ${API_MONITORING_DB.kpis.find(k => k.title === "Availability")?.value}\n`;
          content += `Error Rate: ${API_MONITORING_DB.kpis.find(k => k.title === "Error Rate")?.value}\n\n`;
          content += `Service Registry Details:\n`;
          API_DIRECTORY_DATA.forEach(a => {
            content += `- ${a.name} [${a.method}] ${a.endpoint} (Uptime: ${a.availability}% | Latency: ${a.latency}ms | Status: ${a.status})\n`;
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
        
        toast.success(`Successfully downloaded API ${format} report.`, { id: toastId });
      } catch (err) {
        toast.error(`Failed to generate ${format} report.`, { id: toastId });
      }
    }, 1200);
  };

  const handleApplyThresholds = () => {
    setIsThresholdSheetOpen(false);
    toast.success("API Monitoring alert thresholds synchronized to edge gateway instances.");
  };

  // Status mapping styles
  const getStatusBadgeVariant = (status: APIStatus) => {
    switch (status) {
      case "Healthy":
        return "success";
      case "Warning":
        return "warning";
      case "Degraded":
        return "warning";
      case "Maintenance":
        return "default";
      case "Offline":
        return "destructive";
      default:
        return "default";
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Healthy":
      case "Operational":
      case "200":
        return "text-positive bg-positive/10 border-positive/20";
      case "Warning":
      case "Degraded":
      case "Maintenance":
      case "400":
      case "401":
      case "429":
        return "text-warning bg-warning/10 border-warning/20";
      case "Offline":
      case "Critical":
      case "500":
      case "503":
      case "504":
        return "text-critical bg-critical/10 border-critical/20 animate-pulse";
      default:
        return "text-foreground-secondary bg-surface-elevated border-border";
    }
  };

  // Sortable column headers state logic
  const [sortField, setSortField] = useState<keyof APIDirectoryItem | "">("requests");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc");

  const handleSort = (field: keyof APIDirectoryItem) => {
    if (sortField === field) {
      setSortDirection(prev => prev === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("desc");
    }
  };

  // Filter & search directory records
  const filteredAPIs = useMemo(() => {
    if (isSimulateEmptyState) return [];
    return API_DIRECTORY_DATA.filter(a => {
      const matchesSearch = a.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                            a.endpoint.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory = categoryFilter === "all" || a.category === categoryFilter;
      const matchesStatus = statusFilter === "all" || a.status === statusFilter;
      return matchesSearch && matchesCategory && matchesStatus;
    });
  }, [searchQuery, categoryFilter, statusFilter, isSimulateEmptyState]);

  // Sort filtered directory records
  const sortedAPIs = useMemo(() => {
    if (!sortField) return filteredAPIs;
    return [...filteredAPIs].sort((a, b) => {
      const valA = a[sortField];
      const valB = b[sortField];

      if (typeof valA === "string" && typeof valB === "string") {
        return sortDirection === "asc" ? valA.localeCompare(valB) : valB.localeCompare(valA);
      }

      if (typeof valA === "number" && typeof valB === "number") {
        return sortDirection === "asc" ? valA - valB : valB - valA;
      }
      return 0;
    });
  }, [filteredAPIs, sortField, sortDirection]);

  // Paginate records
  const paginatedAPIs = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return sortedAPIs.slice(startIndex, startIndex + itemsPerPage);
  }, [sortedAPIs, currentPage]);

  const totalPages = Math.ceil(sortedAPIs.length / itemsPerPage) || 1;

  // Sync pagination index on search
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, categoryFilter, statusFilter]);

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

  const handleRowClick = (api: APIDirectoryItem) => {
    setSelectedAPI(api);
    setIsDetailsDrawerOpen(true);
  };

  const handleAlertClick = (alert: StickyAlert) => {
    setSelectedAlert(alert);
    setIsAlertModalOpen(true);
  };

  if (!mounted) return null;

  return (
    <PageContainer>
      {/* 1. Page Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 border-b border-border/60 pb-5 mb-6 select-none">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="font-heading font-bold text-2xl md:text-3xl text-foreground tracking-tight">
              API Monitoring
            </h1>
            <span className="h-2 w-2 rounded-full bg-forecast animate-pulse" title="Live operational feed synchronized" />
          </div>
          <p className="font-sans text-sm text-foreground-secondary mt-1.5 leading-relaxed max-w-[800px]">
            Monitor API health, availability, performance, traffic, failures and service reliability across the ArthDrishti platform.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleRefresh}
            className="h-9 px-3.5 focus-visible:outline-2"
            aria-label="Refresh API dashboard telemetry metrics"
          >
            <RefreshCw className={cn("h-3.5 w-3.5 mr-1.5", isLoading && "animate-spin")} />
            <span>Refresh</span>
          </Button>

          <Dropdown
            align="right"
            trigger={
              <Button variant="outline" size="sm" className="h-9 px-3.5 focus-visible:outline-2" aria-label="Export metrics reports options">
                <Download className="h-3.5 w-3.5 mr-1.5" />
                <span>Export Metrics</span>
              </Button>
            }
            items={[
              { id: "PDF", label: "PDF Format", icon: FileText, onClick: () => handleExport("PDF") },
              { id: "CSV", label: "CSV Spreadsheet", icon: FileSpreadsheet, onClick: () => handleExport("CSV") },
              { id: "Excel", label: "Excel Workbook", icon: FileDown, onClick: () => handleExport("Excel") }
            ]}
          />

          <Button
            variant="primary"
            size="sm"
            onClick={() => setIsThresholdSheetOpen(true)}
            className="h-9 px-4 bg-primary text-white hover:opacity-95 focus-visible:outline-2"
            aria-label="Configure Alert Limits Drawer"
          >
            <SlidersHorizontal className="h-3.5 w-3.5 mr-1.5" />
            <span>Configure Alerts</span>
          </Button>
        </div>
      </div>

      {/* 2. Sticky Active Alerts Banner */}
      {API_MONITORING_DB.alerts.length > 0 && (
        <div className="mb-6 space-y-2 select-none animate-fadeIn">
          {API_MONITORING_DB.alerts.map((alert) => (
            <div
              key={alert.id}
              onClick={() => handleAlertClick(alert)}
              className={cn(
                "w-full p-4 rounded-sm border flex items-center justify-between cursor-pointer transition-all duration-200 focus-visible:outline-2 focus:outline-none hover:scale-[1.002] shadow-xs",
                alert.severity === "Critical"
                  ? "bg-critical/5 border-critical/20 hover:border-critical/40 text-critical"
                  : alert.severity === "Warning"
                  ? "bg-warning/5 border-warning/20 hover:border-warning/40 text-warning"
                  : "bg-surface-elevated border-border text-foreground-secondary"
              )}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  handleAlertClick(alert);
                }
              }}
              aria-label={`Active Alert: ${alert.title}. Click to view details.`}
            >
              <div className="flex items-center gap-3 min-w-0 pr-4">
                <div className="flex-shrink-0">
                  {alert.severity === "Critical" ? (
                    <ShieldAlert className="h-5 w-5 animate-pulse" />
                  ) : alert.severity === "Warning" ? (
                    <AlertTriangle className="h-5 w-5" />
                  ) : (
                    <Info className="h-5 w-5" />
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
                <span>View Details</span>
                <ChevronRight className="h-4 w-4" />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Toggles & Diagnostic panel */}
      <div className="flex flex-wrap items-center justify-between gap-4 bg-surface border border-border p-4 rounded-sm mb-6 select-none shadow-xs">
        <div className="flex flex-wrap items-center gap-3">
          {/* Timeframe selector */}
          <div className="flex bg-surface-elevated border border-border p-0.5 rounded-sm">
            {["Today", "7 Days", "30 Days", "90 Days", "1 Year"].map((time) => (
              <button
                key={time}
                onClick={() => setSelectedTimeframe(time)}
                className={cn(
                  "px-3.5 py-1.5 text-xs font-sans font-medium rounded-xs transition-colors cursor-pointer outline-none focus-visible:outline-2",
                  selectedTimeframe === time
                    ? "bg-surface text-foreground font-semibold border border-border shadow-xs"
                    : "text-foreground-secondary hover:text-foreground"
                )}
                aria-label={`Filter metrics timeline range by ${time}`}
              >
                {time}
              </button>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Simulate empty list filter state */}
          <Tooltip content="Toggle to simulate missing metrics response data">
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
          <Tooltip content="Toggle to simulate edge gateway timeout connection failure">
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

      {/* ERROR STATE RETRY PANEL */}
      {isError ? (
        <Card className="border border-critical bg-critical/5 select-none my-8 p-8 flex flex-col items-center justify-center text-center gap-4">
          <div className="h-12 w-12 rounded-full bg-critical/10 flex items-center justify-center text-critical">
            <ShieldAlert className="h-6 w-6" />
          </div>
          <div>
            <CardTitle className="text-lg font-heading font-bold text-foreground">
              Edge Gateway Connection Failure
            </CardTitle>
            <CardDescription className="text-sm font-sans mt-2 max-w-lg mx-auto">
              Gateway endpoint queries timed out. Unable to contact internal routing matrices. Check active service cluster status and retry.
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
              <span>Retry Connection</span>
            </Button>
          </div>
        </Card>
      ) : (
        <>
          {/* 3. Global KPI Cards Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            {API_MONITORING_DB.kpis.map((kpi) => {
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
                      {kpi.trend !== 0 && (
                        <TrendIndicator value={kpi.trend} />
                      )}
                    </div>

                    <div className="flex items-baseline justify-between mt-3">
                      <span className={cn(
                        "text-2xl font-bold font-mono tracking-tight",
                        kpi.title === "Availability" && parseFloat(String(kpi.value)) < 99 ? "text-warning" : "text-foreground"
                      )}>
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

          {/* 4. API Overview Dashboard Trends */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6 select-none">
            
            {/* Main Latency & Availability trend curves */}
            <Card className="lg:col-span-2 bg-surface border border-border shadow-xs">
              <CardHeader className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border/40 pb-4">
                <div>
                  <CardTitle className="text-base sm:text-lg font-heading">
                    API Traffic & Availability trends
                  </CardTitle>
                  <CardDescription className="text-xs font-sans">
                    Chronological performance monitoring comparing throughput queries vs uptime rates.
                  </CardDescription>
                </div>
                <div className="flex items-center gap-1.5 text-xs text-foreground-secondary bg-surface-elevated border border-border px-2.5 py-1.5 rounded-sm font-sans font-semibold">
                  <Calendar className="h-3.5 w-3.5 text-foreground-muted" />
                  <span>Range: {selectedTimeframe}</span>
                </div>
              </CardHeader>
              <CardContent className="pt-6">
                {isLoading ? (
                  <div className="h-72 w-full bg-surface-elevated/40 animate-pulse rounded-sm flex items-center justify-center text-foreground-muted text-xs">
                    Loading trend visualizations...
                  </div>
                ) : isSimulateEmptyState ? (
                  <div className="h-72 w-full flex flex-col items-center justify-center text-center gap-2 select-none">
                    <ExclamationIcon className="h-8 w-8 text-foreground-muted" />
                    <span className="text-sm font-semibold text-foreground">No Performance Analytics</span>
                  </div>
                ) : (
                  <div className="h-72 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={API_MONITORING_DB.overview[selectedTimeframe] || API_MONITORING_DB.overview["7 Days"]}>
                        <defs>
                          <linearGradient id="colorRequests" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor={COLORS.primary} stopOpacity={0.2}/>
                            <stop offset="95%" stopColor={COLORS.primary} stopOpacity={0}/>
                          </linearGradient>
                          <linearGradient id="colorLatency" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor={COLORS.ai} stopOpacity={0.2}/>
                            <stop offset="95%" stopColor={COLORS.ai} stopOpacity={0}/>
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" opacity={0.3} />
                        <XAxis dataKey="time" stroke="var(--foreground-muted)" fontSize={10} tickLine={false} />
                        <YAxis yAxisId="left" stroke="var(--foreground-muted)" fontSize={10} tickLine={false} />
                        <YAxis yAxisId="right" orientation="right" stroke="var(--foreground-muted)" fontSize={10} tickLine={false} domain={[90, 100]} />
                        <RechartsTooltip contentStyle={{ backgroundColor: "var(--surface)", borderColor: "var(--border)", borderRadius: "4px", fontSize: "12px" }} />
                        <Legend wrapperStyle={{ fontSize: "11px", paddingTop: "12px" }} />
                        <Area yAxisId="left" name="Throughput (Requests)" type="monotone" dataKey="requests" stroke={COLORS.primary} fillOpacity={1} fill="url(#colorRequests)" strokeWidth={2} />
                        <Area yAxisId="left" name="Latency (ms)" type="monotone" dataKey="latency" stroke={COLORS.ai} fillOpacity={1} fill="url(#colorLatency)" strokeWidth={2} />
                        <Line yAxisId="right" name="Availability (%)" type="monotone" dataKey="availability" stroke={COLORS.positive} strokeWidth={2.5} dot={false} />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Rate limiting metrics status display */}
            <Card className="bg-surface border border-border shadow-xs flex flex-col justify-between">
              <CardHeader className="border-b border-border/40 pb-4">
                <CardTitle className="text-base sm:text-lg font-heading">
                  Ingress Rate Limiting Quota
                </CardTitle>
                <CardDescription className="text-xs">
                  Active parameters controlling gateway bandwidth metrics.
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-6 flex-1 flex flex-col justify-between gap-5">
                <div className="space-y-4">
                  {/* Current limit */}
                  <div className="flex justify-between items-center border-b border-border/40 pb-3">
                    <span className="text-xs text-foreground-secondary font-medium font-sans">Current Rate Limit</span>
                    <span className="text-xs font-bold font-mono text-foreground">{rateLimitQuota} req/min</span>
                  </div>

                  {/* Peak usage */}
                  <div className="flex justify-between items-center border-b border-border/40 pb-3">
                    <span className="text-xs text-foreground-secondary font-medium font-sans">Peak Usage Today</span>
                    <span className="text-xs font-bold font-mono text-foreground">
                      {API_MONITORING_DB.rateLimiting.peakUsage} req/min
                    </span>
                  </div>

                  {/* Blocked request volume */}
                  <div className="flex justify-between items-center border-b border-border/40 pb-3">
                    <span className="text-xs text-foreground-secondary font-medium font-sans">Blocked Requests (429)</span>
                    <span className={cn(
                      "text-xs font-bold font-mono px-1.5 py-0.5 rounded-xs",
                      API_MONITORING_DB.rateLimiting.blockedRequests > 0 ? "text-critical bg-critical/10" : "text-positive bg-positive/10"
                    )}>
                      {API_MONITORING_DB.rateLimiting.blockedRequests}
                    </span>
                  </div>

                  {/* Quota remaining bar */}
                  <div className="space-y-2 mt-2">
                    <div className="flex justify-between text-xs">
                      <span className="text-foreground-secondary font-medium">Quota Volume Remaining</span>
                      <span className="font-mono font-semibold text-primary">
                        {API_MONITORING_DB.rateLimiting.quotaRemaining}%
                      </span>
                    </div>
                    <div className="h-2 bg-border rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-primary rounded-full transition-all duration-500" 
                        style={{ width: `${API_MONITORING_DB.rateLimiting.quotaRemaining}%` }} 
                      />
                    </div>
                  </div>
                </div>

                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => setIsThresholdSheetOpen(true)}
                  className="w-full h-10 border border-border hover:bg-surface-hover mt-4 text-xs font-semibold"
                >
                  <Sliders className="h-3.5 w-3.5 mr-2" />
                  <span>Configure Rate limits</span>
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* 5. API Directory Enterprise Table Section */}
          <Card className="bg-surface border border-border shadow-xs mb-6 select-none flex flex-col">
            <CardHeader className="border-b border-border/40 pb-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <CardTitle className="text-base sm:text-lg font-heading">
                    API Service Directory
                  </CardTitle>
                  <CardDescription className="text-xs font-sans">
                    Registry of all routing methods, versions, latencies, availabilities, and owners.
                  </CardDescription>
                </div>

                {/* Table options selectors */}
                <div className="flex flex-wrap items-center gap-2">
                  
                  {/* Category filters */}
                  <select
                    value={categoryFilter}
                    onChange={(e) => setCategoryFilter(e.target.value)}
                    className="text-xs font-sans font-semibold bg-surface-elevated border border-border px-3.5 py-2.5 focus:border-primary outline-none rounded-sm transition-colors text-foreground cursor-pointer"
                    aria-label="Filter service directory by category type"
                  >
                    <option value="all">All Categories</option>
                    <option value="Security">Security</option>
                    <option value="Customer">Customer</option>
                    <option value="Officer">Officer</option>
                    <option value="Admin">Admin</option>
                    <option value="AI Inference">AI Inference</option>
                    <option value="Platform">Platform</option>
                  </select>

                  {/* Status filters */}
                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="text-xs font-sans font-semibold bg-surface-elevated border border-border px-3.5 py-2.5 focus:border-primary outline-none rounded-sm transition-colors text-foreground cursor-pointer"
                    aria-label="Filter service directory by status type"
                  >
                    <option value="all">All Statuses</option>
                    <option value="Healthy">Healthy</option>
                    <option value="Warning">Warning</option>
                    <option value="Degraded">Degraded</option>
                    <option value="Maintenance">Maintenance</option>
                    <option value="Offline">Offline</option>
                  </select>

                  {/* Density controls toggle */}
                  <div className="flex border border-border bg-surface-elevated p-0.5 rounded-sm">
                    {(["compact", "standard", "cozy"] as const).map((density) => (
                      <button
                        key={density}
                        onClick={() => setTableDensity(density)}
                        className={cn(
                          "px-2.5 py-1 text-[10px] font-sans font-bold uppercase rounded-xs transition-colors cursor-pointer",
                          tableDensity === density
                            ? "bg-surface text-foreground shadow-xs border border-border/80"
                            : "text-foreground-secondary hover:text-foreground"
                        )}
                        aria-label={`Set table layout density to ${density}`}
                      >
                        {density}
                      </button>
                    ))}
                  </div>

                  {/* Column Visibility list toggle dropdown */}
                  <div className="relative">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setShowColumnDropdown(prev => !prev)}
                      className="h-9 px-3.5 focus-visible:outline-2"
                      aria-label="Toggle visible columns options checklist"
                    >
                      <Eye className="h-3.5 w-3.5 mr-1.5" />
                      <span>Columns</span>
                    </Button>
                    {showColumnDropdown && (
                      <div className="absolute right-0 mt-2 z-40 w-44 bg-surface-elevated border border-border rounded-sm shadow-lg p-2.5 flex flex-col gap-1.5">
                        <div className="text-[9px] uppercase font-bold text-foreground-muted tracking-wider select-none mb-1">
                          Visible Columns
                        </div>
                        {Object.keys(visibleColumns).map((col) => (
                          <label key={col} className="flex items-center gap-2 text-xs font-sans text-foreground-secondary hover:text-foreground cursor-pointer select-none">
                            <input
                              type="checkbox"
                              checked={visibleColumns[col]}
                              onChange={(e) => {
                                setVisibleColumns(prev => ({
                                  ...prev,
                                  [col]: e.target.checked
                                }));
                              }}
                              className="rounded-xs border-border text-primary focus:ring-0 cursor-pointer h-3.5 w-3.5"
                            />
                            <span className="capitalize">{col.replace(/([A-Z])/g, ' $1')}</span>
                          </label>
                        ))}
                      </div>
                    )}
                  </div>

                </div>
              </div>

              {/* Table search filters */}
              <div className="relative w-full max-w-sm flex items-center mt-4">
                <Search className="absolute left-3.5 h-4 w-4 text-foreground-muted pointer-events-none" />
                <input
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search APIs by endpoint path or registry name..."
                  className="w-full h-9 pl-9.5 pr-8 bg-surface-elevated border border-border text-foreground rounded-sm text-xs font-sans placeholder-foreground-muted focus:border-primary focus:outline-none transition-all"
                  aria-label="Search API Directory Records"
                />
                {searchQuery && (
                  <button
                    type="button"
                    onClick={() => setSearchQuery("")}
                    className="absolute right-2.5 text-foreground-muted hover:text-foreground p-0.5 rounded-full hover:bg-surface"
                  >
                    <X className="h-3 w-3" />
                  </button>
                )}
              </div>
            </CardHeader>

            <CardContent className="p-0 overflow-x-auto relative">
              {isLoading ? (
                <div className="p-8 space-y-4 animate-pulse">
                  {[1, 2, 3, 4].map(idx => (
                    <div key={idx} className="h-8 bg-surface-elevated rounded-sm w-full" />
                  ))}
                </div>
              ) : paginatedAPIs.length === 0 ? (
                <div className="p-12 text-center flex flex-col items-center justify-center gap-3">
                  <div className="h-10 w-10 rounded-full bg-surface-elevated border border-border flex items-center justify-center text-foreground-muted">
                    <ShieldAlert className="h-5 w-5" />
                  </div>
                  <div>
                    <h4 className="text-sm font-semibold text-foreground">No API Services Found</h4>
                    <p className="text-xs text-foreground-muted mt-1 max-w-xs">
                      We couldn't find any endpoints matching your current filters. Adjust criteria and try again.
                    </p>
                  </div>
                </div>
              ) : (
                <table className="w-full border-collapse text-left font-sans text-xs min-w-[1000px]" aria-label="Registry of configured API services">
                  <thead>
                    <tr className="border-b border-border/40 bg-surface-elevated/40 select-none text-foreground-secondary font-semibold uppercase tracking-wider sticky top-0 z-10 backdrop-blur-xs">
                      {visibleColumns.name && (
                        <th 
                          onClick={() => handleSort("name")}
                          className="p-3 pl-6 cursor-pointer hover:text-foreground transition-colors"
                        >
                          API Name {sortField === "name" && (sortDirection === "asc" ? "▲" : "▼")}
                        </th>
                      )}
                      {visibleColumns.category && <th className="p-3">Category</th>}
                      {visibleColumns.method && <th className="p-3">Method</th>}
                      {visibleColumns.endpoint && <th className="p-3">Endpoint</th>}
                      {visibleColumns.status && <th className="p-3">Status</th>}
                      {visibleColumns.latency && (
                        <th 
                          onClick={() => handleSort("latency")}
                          className="p-3 cursor-pointer hover:text-foreground transition-colors"
                        >
                          Latency {sortField === "latency" && (sortDirection === "asc" ? "▲" : "▼")}
                        </th>
                      )}
                      {visibleColumns.availability && (
                        <th 
                          onClick={() => handleSort("availability")}
                          className="p-3 cursor-pointer hover:text-foreground transition-colors"
                        >
                          Availability {sortField === "availability" && (sortDirection === "asc" ? "▲" : "▼")}
                        </th>
                      )}
                      {visibleColumns.requests && (
                        <th 
                          onClick={() => handleSort("requests")}
                          className="p-3 cursor-pointer hover:text-foreground transition-colors"
                        >
                          Requests {sortField === "requests" && (sortDirection === "asc" ? "▲" : "▼")}
                        </th>
                      )}
                      {visibleColumns.errors && <th className="p-3">Errors</th>}
                      {visibleColumns.owner && <th className="p-3">Owner</th>}
                      {visibleColumns.lastUpdated && <th className="p-3">Last Updated</th>}
                      <th className="p-3 pr-6 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/40">
                    {paginatedAPIs.map((row) => (
                      <tr
                        key={row.id}
                        className={cn(
                          "hover:bg-surface-elevated/40 transition-colors group cursor-pointer",
                          row.status === "Offline" && "bg-critical/5/5",
                          tableDensity === "compact" ? "h-9" : tableDensity === "cozy" ? "h-14" : "h-11"
                        )}
                        onClick={() => handleRowClick(row)}
                      >
                        {visibleColumns.name && (
                          <td className="p-3 pl-6 font-semibold text-foreground truncate max-w-[150px]">
                            {row.name}
                          </td>
                        )}
                        {visibleColumns.category && (
                          <td className="p-3 font-sans text-foreground-secondary">{row.category}</td>
                        )}
                        {visibleColumns.method && (
                          <td className="p-3">
                            <span className={cn(
                              "font-mono font-bold px-1.5 py-0.5 rounded-xs",
                              row.method === "POST" ? "text-primary bg-primary/10" : row.method === "GET" ? "text-positive bg-positive/10" : "text-warning bg-warning/10"
                            )}>
                              {row.method}
                            </span>
                          </td>
                        )}
                        {visibleColumns.endpoint && (
                          <td className="p-3 font-mono text-foreground-secondary max-w-[180px] truncate" title={row.endpoint}>
                            {row.endpoint}
                          </td>
                        )}
                        {visibleColumns.status && (
                          <td className="p-3">
                            <span className={cn("inline-flex items-center rounded-xs px-2 py-0.5 text-[9px] font-bold border", getStatusColor(row.status))}>
                              {row.status}
                            </span>
                          </td>
                        )}
                        {visibleColumns.latency && (
                          <td className="p-3 font-mono text-foreground-secondary">
                            {row.latency === 0 ? "—" : `${row.latency}ms`}
                          </td>
                        )}
                        {visibleColumns.availability && (
                          <td className="p-3 font-mono">
                            <span className={row.availability < 99 ? "text-warning font-semibold" : "text-foreground-secondary"}>
                              {row.availability.toFixed(2)}%
                            </span>
                          </td>
                        )}
                        {visibleColumns.requests && (
                          <td className="p-3 font-mono text-foreground-secondary">
                            {row.requests.toLocaleString()}
                          </td>
                        )}
                        {visibleColumns.errors && (
                          <td className="p-3 font-mono">
                            <span className={row.errors > 100 ? "text-critical font-semibold" : "text-foreground-secondary"}>
                              {row.errors.toLocaleString()}
                            </span>
                          </td>
                        )}
                        {visibleColumns.owner && (
                          <td className="p-3 text-foreground-secondary truncate max-w-[120px]" title={row.owner}>
                            {row.owner}
                          </td>
                        )}
                        {visibleColumns.lastUpdated && (
                          <td className="p-3 font-mono text-foreground-muted">{row.lastUpdated}</td>
                        )}
                        <td className="p-3 pr-6 text-right" onClick={(e) => e.stopPropagation()}>
                          <button
                            onClick={() => handleRowClick(row)}
                            className="text-xs text-primary font-semibold hover:underline outline-none focus-visible:outline-2 cursor-pointer"
                            aria-label={`View detailed logs for ${row.name}`}
                          >
                            Details
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </CardContent>

            {/* Pagination footer bar */}
            {!isLoading && sortedAPIs.length > 0 && (
              <CardFooter className="flex items-center justify-between p-4 border-t border-border/40 bg-surface">
                <span className="text-xs text-foreground-secondary">
                  Showing <span className="font-semibold text-foreground">{(currentPage - 1) * itemsPerPage + 1}</span> to{" "}
                  <span className="font-semibold text-foreground">
                    {Math.min(currentPage * itemsPerPage, sortedAPIs.length)}
                  </span>{" "}
                  of <span className="font-semibold text-foreground">{sortedAPIs.length}</span> services
                </span>

                <div className="flex items-center gap-1.5">
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={currentPage === 1}
                    onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                    className="h-8 px-2 focus-visible:outline-2"
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  {Array.from({ length: totalPages }).map((_, i) => (
                    <button
                      key={i}
                      onClick={() => setCurrentPage(i + 1)}
                      className={cn(
                        "h-8 w-8 text-xs rounded-sm font-semibold transition-colors outline-none focus-visible:outline-2 cursor-pointer",
                        currentPage === i + 1
                          ? "bg-primary text-white"
                          : "text-foreground-secondary hover:text-foreground bg-surface-elevated border border-border"
                      )}
                    >
                      {i + 1}
                    </button>
                  ))}
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={currentPage === totalPages}
                    onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                    className="h-8 px-2 focus-visible:outline-2"
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </CardFooter>
            )}
          </Card>

          {/* 6. Health monitor cards & Analytics breakdowns */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6 select-none">
            
            {/* Endpoints performance metrics summaries */}
            <Card className="lg:col-span-2 bg-surface border border-border shadow-xs flex flex-col justify-between">
              <CardHeader className="border-b border-border/40 pb-4">
                <CardTitle className="text-base sm:text-lg font-heading">
                  Platform Endpoints Ranking Analytics
                </CardTitle>
                <CardDescription className="text-xs">
                  Overview of endpoints categorized by latency limits, call volumes, and errors.
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                
                {/* Slowest list */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between text-xs border-b border-border/40 pb-1.5">
                    <span className="font-bold text-foreground font-sans">Slowest Response Latencies</span>
                    <span className="text-[10px] text-foreground-muted font-mono">p95 Index</span>
                  </div>
                  <div className="space-y-2">
                    {API_MONITORING_DB.slowestEndpoints.map((ep, idx) => (
                      <div key={idx} className="flex justify-between items-center text-xs p-2 rounded-sm bg-surface-elevated/50 border border-border/40">
                        <div className="flex items-center gap-2 min-w-0 pr-2">
                          <span className={cn("font-mono text-[9px] font-bold px-1.5 py-0.25 rounded-xs", ep.method === "POST" ? "text-primary bg-primary/10" : "text-positive bg-positive/10")}>
                            {ep.method}
                          </span>
                          <span className="font-mono text-[10px] text-foreground-secondary truncate" title={ep.path}>{ep.path}</span>
                        </div>
                        <span className="font-mono font-bold text-critical flex-shrink-0">{ep.value}ms</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Error prone list */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between text-xs border-b border-border/40 pb-1.5">
                    <span className="font-bold text-foreground font-sans">Highest Error Frequencies</span>
                    <span className="text-[10px] text-foreground-muted font-mono">Failure Ratio</span>
                  </div>
                  <div className="space-y-2">
                    {API_MONITORING_DB.highestErrorEndpoints.map((ep, idx) => (
                      <div key={idx} className="flex justify-between items-center text-xs p-2 rounded-sm bg-surface-elevated/50 border border-border/40">
                        <div className="flex items-center gap-2 min-w-0 pr-2">
                          <span className={cn("font-mono text-[9px] font-bold px-1.5 py-0.25 rounded-xs", ep.method === "POST" ? "text-primary bg-primary/10" : "text-positive bg-positive/10")}>
                            {ep.method}
                          </span>
                          <span className="font-mono text-[10px] text-foreground-secondary truncate" title={ep.path}>{ep.path}</span>
                        </div>
                        <span className="font-mono font-bold text-critical flex-shrink-0">{ep.value}</span>
                      </div>
                    ))}
                  </div>
                </div>

              </CardContent>
            </Card>

            {/* Ingress HTTP methods volume distribution */}
            <Card className="bg-surface border border-border shadow-xs flex flex-col justify-between">
              <CardHeader className="border-b border-border/40 pb-4">
                <CardTitle className="text-base sm:text-lg font-heading">
                  Request Volume By HTTP Method
                </CardTitle>
                <CardDescription className="text-xs">
                  Distribution of API calls categorized by protocol verbs.
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-6 h-56 w-full">
                {isLoading ? (
                  <div className="h-full bg-surface-elevated/40 animate-pulse rounded-sm" />
                ) : (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={API_MONITORING_DB.requestsByMethod} margin={{ top: 5, right: 10, left: -25, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" opacity={0.3} />
                      <XAxis dataKey="name" stroke="var(--foreground-muted)" fontSize={8} tickLine={false} tickFormatter={(val) => val.split(" ")[0]} />
                      <YAxis stroke="var(--foreground-muted)" fontSize={10} tickLine={false} />
                      <RechartsTooltip contentStyle={{ backgroundColor: "var(--surface)", borderColor: "var(--border)", borderRadius: "4px", fontSize: "11px" }} />
                      <Bar name="Requests" dataKey="value" fill={COLORS.primary} radius={[2, 2, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                )}
              </CardContent>
            </Card>
          </div>

          {/* 7. Error occurrences analysis & Rate limiting quotas */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6 select-none">
            
            {/* Errors distribution */}
            <Card className="lg:col-span-2 bg-surface border border-border shadow-xs flex flex-col justify-between">
              <CardHeader className="border-b border-border/40 pb-4">
                <CardTitle className="text-base sm:text-lg font-heading">
                  Error Code Analysis breakdown
                </CardTitle>
                <CardDescription className="text-xs">
                  Categorized error logs compiled from production edge proxies.
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-6 h-60 w-full">
                {isLoading ? (
                  <div className="h-full bg-surface-elevated/40 animate-pulse rounded-sm" />
                ) : (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={API_MONITORING_DB.errorsBreakdown} margin={{ top: 5, right: 10, left: -25, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" opacity={0.3} />
                      <XAxis dataKey="name" stroke="var(--foreground-muted)" fontSize={8} tickLine={false} />
                      <YAxis stroke="var(--foreground-muted)" fontSize={10} tickLine={false} />
                      <RechartsTooltip contentStyle={{ backgroundColor: "var(--surface)", borderColor: "var(--border)", borderRadius: "4px", fontSize: "11px" }} />
                      <Bar dataKey="count" radius={[2, 2, 0, 0]}>
                        {API_MONITORING_DB.errorsBreakdown.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.fill} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                )}
              </CardContent>
            </Card>

            {/* Visual Dependency flow map representation */}
            <Card className="bg-surface border border-border shadow-xs flex flex-col justify-between">
              <CardHeader className="border-b border-border/40 pb-4">
                <CardTitle className="text-base sm:text-lg font-heading">
                  API Service Dependency Flow Map
                </CardTitle>
                <CardDescription className="text-xs">
                  Maps downstream dependencies between core modules.
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-6 flex-1 flex items-center justify-center">
                {/* Premium SVG Node map */}
                <div className="w-full h-full relative min-h-[220px]">
                  <svg viewBox="0 0 420 220" className="w-full h-full">
                    {/* Definitions for arrow marker endpoints */}
                    <defs>
                      <marker id="arrow" viewBox="0 0 10 10" refX="6" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
                        <path d="M 0 0 L 10 5 L 0 10 z" fill="var(--border-strong)" />
                      </marker>
                    </defs>

                    {/* Flow path links */}
                    <path d="M 60 45 L 140 45" fill="none" stroke="var(--border-strong)" strokeWidth="1.5" markerEnd="url(#arrow)" />
                    <path d="M 175 60 L 175 145" fill="none" stroke="var(--border-strong)" strokeWidth="1.5" markerEnd="url(#arrow)" />
                    <path d="M 210 45 L 290 45" fill="none" stroke="var(--border-strong)" strokeWidth="1.5" markerEnd="url(#arrow)" />
                    <path d="M 325 60 L 325 145" fill="none" stroke="var(--border-strong)" strokeWidth="1.5" markerEnd="url(#arrow)" />
                    <path d="M 210 160 L 290 160" fill="none" stroke="var(--border-strong)" strokeWidth="1.5" markerEnd="url(#arrow)" />
                    
                    {/* Node 1: Auth */}
                    <g transform="translate(15, 30)">
                      <rect width="90" height="30" rx="3" fill="var(--surface-elevated)" stroke="var(--border)" strokeWidth="1" />
                      <circle cx="12" cy="15" r="3.5" fill={COLORS.positive} />
                      <text x="24" y="19" fontSize="8" fontFamily="var(--font-sans)" fontWeight="bold" fill="var(--foreground)">Authentication</text>
                    </g>

                    {/* Node 2: Customer */}
                    <g transform="translate(130, 30)">
                      <rect width="90" height="30" rx="3" fill="var(--surface-elevated)" stroke="var(--border)" strokeWidth="1" />
                      <circle cx="12" cy="15" r="3.5" fill={COLORS.positive} />
                      <text x="24" y="19" fontSize="8" fontFamily="var(--font-sans)" fontWeight="bold" fill="var(--foreground)">Customer API</text>
                    </g>

                    {/* Node 3: Prediction */}
                    <g transform="translate(245, 30)">
                      <rect width="90" height="30" rx="3" fill="var(--surface-elevated)" stroke="var(--border-strong)" strokeWidth="1.5" />
                      <circle cx="12" cy="15" r="3.5" fill={COLORS.warning} className="animate-pulse" />
                      <text x="24" y="19" fontSize="8" fontFamily="var(--font-sans)" fontWeight="bold" fill="var(--foreground)">Prediction AI</text>
                    </g>

                    {/* Node 4: Reports */}
                    <g transform="translate(130, 145)">
                      <rect width="90" height="30" rx="3" fill="var(--surface-elevated)" stroke="var(--border)" strokeWidth="1" />
                      <circle cx="12" cy="15" r="3.5" fill={COLORS.warning} />
                      <text x="24" y="19" fontSize="8" fontFamily="var(--font-sans)" fontWeight="bold" fill="var(--foreground)">Reports BI</text>
                    </g>

                    {/* Node 5: Notifications */}
                    <g transform="translate(245, 145)">
                      <rect width="95" height="30" rx="3" fill="var(--surface-elevated)" stroke="var(--border)" strokeWidth="1" />
                      <circle cx="12" cy="15" r="3.5" fill={COLORS.positive} />
                      <text x="24" y="19" fontSize="8" fontFamily="var(--font-sans)" fontWeight="bold" fill="var(--foreground)">Notifications</text>
                    </g>
                  </svg>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* 8. API Health Monitor Core Services Checklist */}
          <div className="mb-6 select-none">
            <div className="border-b border-border/40 pb-3 mb-4">
              <h2 className="text-base sm:text-lg font-heading font-semibold text-foreground">
                API Health Monitor Checklist
              </h2>
              <p className="text-xs text-foreground-secondary font-sans mt-0.5">
                Target diagnostic counters from individual modular microservice backends.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
              {API_DIRECTORY_DATA.map((api) => (
                <Card 
                  key={api.id}
                  onClick={() => handleRowClick(api)}
                  className="bg-surface border border-border hover:border-primary/50 cursor-pointer transition-all duration-150 p-4 flex flex-col justify-between gap-3 shadow-xs active:scale-98"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-foreground truncate max-w-[130px]">{api.name}</span>
                    <span className={`h-2 w-2 rounded-full flex-shrink-0 ${api.status === "Healthy" ? "bg-positive" : api.status === "Offline" ? "bg-critical" : "bg-warning"}`} />
                  </div>
                  <div>
                    <div className="flex items-baseline justify-between text-xs">
                      <span className="text-foreground-secondary font-medium font-sans">Availability</span>
                      <span className="font-mono font-semibold">{api.availability.toFixed(2)}%</span>
                    </div>
                    <div className="flex items-baseline justify-between text-xs mt-1">
                      <span className="text-foreground-secondary font-medium font-sans">Latency</span>
                      <span className="font-mono font-semibold text-foreground-secondary">{api.latency === 0 ? "Offline" : `${api.latency}ms`}</span>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </div>

          {/* 9. Real-Time Request Monitor Log feed */}
          <Card className="bg-surface border border-border shadow-xs select-none">
            <CardHeader className="border-b border-border/40 pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <CardTitle className="text-base sm:text-lg font-heading">
                  Real-time Request Activity Logger
                </CardTitle>
                <CardDescription className="text-xs">
                  Streaming logs capturing execution runtime statistics on active edge gateways.
                </CardDescription>
              </div>
              <Badge variant="outline" className="font-mono font-medium text-[10px] gap-1.5">
                <span className="h-1.5 w-1.5 rounded-full bg-positive animate-ping" />
                <span>Live activity stream</span>
              </Badge>
            </CardHeader>
            <CardContent className="p-0 overflow-x-auto">
              <table className="w-full border-collapse text-left font-sans text-xs min-w-[700px]">
                <thead>
                  <tr className="border-b border-border/40 bg-surface-elevated/40 text-foreground-secondary font-semibold uppercase tracking-wider">
                    <th className="p-3 pl-6">Timestamp</th>
                    <th className="p-3">API Target</th>
                    <th className="p-3">Method</th>
                    <th className="p-3">Status</th>
                    <th className="p-3">Response Latency</th>
                    <th className="p-3 pr-6">Client Actor ID</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/45 font-mono text-foreground-secondary">
                  {API_MONITORING_DB.realTimeFeed.map((req, idx) => (
                    <tr key={idx} className="hover:bg-surface-elevated/30 transition-colors">
                      <td className="p-3 pl-6 text-foreground-muted">{req.timestamp}</td>
                      <td className="p-3 font-semibold text-foreground">{req.api}</td>
                      <td className="p-3">
                        <span className={cn(
                          "font-bold px-1.5 py-0.5 rounded-xs",
                          req.method === "POST" ? "text-primary bg-primary/10" : "text-positive bg-positive/10"
                        )}>
                          {req.method}
                        </span>
                      </td>
                      <td className="p-3">
                        <span className={cn("inline-flex items-center rounded-xs px-2 py-0.5 text-[9px] font-bold border", getStatusColor(String(req.status)))}>
                          {req.status}
                        </span>
                      </td>
                      <td className="p-3 font-bold text-foreground">
                        {req.latency === 0 ? "—" : `${req.latency}ms`}
                      </td>
                      <td className="p-3 pr-6 text-foreground-muted font-sans font-medium">{req.client}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </CardContent>
          </Card>
        </>
      )}

      {/* 10. Alarm details Modal dialog */}
      <Modal
        isOpen={isAlertModalOpen}
        onClose={() => setIsAlertModalOpen(false)}
        title={selectedAlert ? `${selectedAlert.title}` : "Alarm Details"}
        className="max-w-md"
      >
        {selectedAlert && (
          <div className="space-y-4 font-sans select-none">
            <div className="flex items-center justify-between">
              <span className="text-xs text-foreground-secondary">Severity Level</span>
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
                  toast.success(`Gateway alert logged as acknowledged.`);
                }}
                className="h-9 px-4 text-xs bg-primary text-white"
              >
                Acknowledge Alert
              </Button>
            </div>
          </div>
        )}
      </Modal>

      {/* 11. Configuration Alert limit drawer sheet */}
      <Sheet
        isOpen={isThresholdSheetOpen}
        onClose={() => setIsThresholdSheetOpen(false)}
        title="API Monitoring Thresholds"
        side="right"
      >
        <div className="flex flex-col h-full justify-between pb-8">
          <div className="space-y-6 overflow-y-auto pr-1">
            <p className="text-xs text-foreground-secondary leading-normal font-sans">
              Set latency limits and request quotas on edge routing nodes. Values exceeding these boundaries send immediate webhook notifications to Slack and PagerDuty channels.
            </p>

            {/* Latency Limit Slider */}
            <div className="space-y-2">
              <div className="flex justify-between items-center text-xs">
                <label className="font-semibold text-foreground">Latency Alert Limit</label>
                <span className="font-mono font-bold text-primary">{latencyAlertLimit} ms</span>
              </div>
              <input
                type="range"
                min="50"
                max="500"
                step="10"
                value={latencyAlertLimit}
                onChange={(e) => setLatencyAlertLimit(parseInt(e.target.value))}
                className="w-full h-1.5 bg-border rounded-lg appearance-none cursor-pointer accent-primary focus:outline-none"
              />
              <span className="text-[10px] text-foreground-muted block">
                P95 latency exceeding this limit flags a degraded status alarm.
              </span>
            </div>

            {/* Availability limit slider */}
            <div className="space-y-2">
              <div className="flex justify-between items-center text-xs">
                <label className="font-semibold text-foreground">Availability Alert Threshold</label>
                <span className="font-mono font-bold text-primary">{availabilityWarningLimit}%</span>
              </div>
              <input
                type="range"
                min="95.0"
                max="99.9"
                step="0.1"
                value={availabilityWarningLimit}
                onChange={(e) => setAvailabilityWarningLimit(parseFloat(e.target.value))}
                className="w-full h-1.5 bg-border rounded-lg appearance-none cursor-pointer accent-primary focus:outline-none"
              />
            </div>

            {/* Error rate slider */}
            <div className="space-y-2">
              <div className="flex justify-between items-center text-xs">
                <label className="font-semibold text-foreground">Critical Error Rate limit</label>
                <span className="font-mono font-bold text-primary">{errorRateCriticalLimit}%</span>
              </div>
              <input
                type="range"
                min="0.1"
                max="5.0"
                step="0.1"
                value={errorRateCriticalLimit}
                onChange={(e) => setErrorRateCriticalLimit(parseFloat(e.target.value))}
                className="w-full h-1.5 bg-border rounded-lg appearance-none cursor-pointer accent-primary focus:outline-none"
              />
            </div>

            {/* Rate limiting input */}
            <div className="space-y-2">
              <label className="text-xs font-semibold text-foreground block">Gateway Rate Limiting Quota</label>
              <select
                value={rateLimitQuota}
                onChange={(e) => setRateLimitQuota(parseInt(e.target.value))}
                className="w-full text-xs font-sans font-semibold bg-surface-elevated border border-border px-3.5 py-2.5 focus:border-primary outline-none rounded-sm transition-colors text-foreground cursor-pointer"
              >
                <option value={5000}>5,000 requests/minute</option>
                <option value={10000}>10,000 requests/minute (Standard)</option>
                <option value={20000}>20,000 requests/minute (High)</option>
              </select>
            </div>
          </div>

          <div className="flex gap-3 pt-6 border-t border-border/40 mt-6">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsThresholdSheetOpen(false)}
              className="flex-1 h-10 text-xs text-foreground border border-border"
            >
              Cancel
            </Button>
            <Button
              variant="primary"
              size="sm"
              onClick={handleApplyThresholds}
              className="flex-1 h-10 text-xs bg-primary text-white"
            >
              Apply Settings
            </Button>
          </div>
        </div>
      </Sheet>

      {/* 12. Details Drawer Slide-out Sheet */}
      <Sheet
        isOpen={isDetailsDrawerOpen}
        onClose={() => setIsDetailsDrawerOpen(false)}
        title={selectedAPI ? `${selectedAPI.name} Telemetry` : "API Telemetry Details"}
        side="right"
        className="w-full max-w-md sm:max-w-lg"
      >
        {selectedAPI && (
          <div className="flex flex-col h-full justify-between pb-8 select-none font-sans">
            <div className="space-y-6 overflow-y-auto pr-1">
              <div>
                <span className="text-lg font-heading font-semibold text-foreground">{selectedAPI.name}</span>
                <span className="text-xs text-foreground-secondary block font-mono mt-1">
                  [{selectedAPI.method}] {selectedAPI.endpoint}
                </span>
                <p className="text-xs text-foreground-secondary mt-2.5 leading-normal">
                  {selectedAPI.description}
                </p>
              </div>

              {/* Status & environment block */}
              <div className="grid grid-cols-2 gap-3.5 border-t border-b border-border/40 py-4">
                <div>
                  <span className="text-[10px] uppercase font-bold text-foreground-muted tracking-wider block font-mono">Current Status</span>
                  <span className={cn("inline-flex items-center rounded-xs px-2 py-0.5 text-[9px] font-bold border mt-1.5", getStatusColor(selectedAPI.status))}>
                    {selectedAPI.status}
                  </span>
                </div>
                <div>
                  <span className="text-[10px] uppercase font-bold text-foreground-muted tracking-wider block font-mono">Environment</span>
                  <span className="text-xs font-semibold text-foreground block mt-1.5">{selectedAPI.environment}</span>
                </div>
              </div>

              {/* Telemetry numbers list */}
              <div className="space-y-3.5">
                <h4 className="text-[10px] uppercase font-bold text-foreground-muted tracking-wider font-mono">Performance Metrics</h4>
                
                {[
                  { label: "Average Latency", val: `${selectedAPI.latency} ms` },
                  { label: "Availability Uptime", val: `${selectedAPI.availability.toFixed(2)} %` },
                  { label: "Total Requests (24h)", val: selectedAPI.requests.toLocaleString() },
                  { label: "Error Transactions (24h)", val: selectedAPI.errors.toLocaleString() },
                  { label: "Peak Traffic Rate", val: `${selectedAPI.peakTraffic} req/sec` }
                ].map((met, idx) => (
                  <div key={idx} className="flex justify-between items-center text-xs border-b border-border/40 pb-2">
                    <span className="text-foreground-secondary font-medium">{met.label}</span>
                    <span className="font-mono font-bold text-foreground">{met.val}</span>
                  </div>
                ))}
              </div>

              {/* Security & Ingestion detail block */}
              <div className="space-y-3.5">
                <h4 className="text-[10px] uppercase font-bold text-foreground-muted tracking-wider font-mono">Ingress Configuration</h4>
                
                <div className="flex justify-between items-center text-xs border-b border-border/40 pb-2">
                  <span className="text-foreground-secondary font-medium">Authentication Type</span>
                  <span className="font-semibold text-foreground flex items-center gap-1.5">
                    <Lock className="h-3.5 w-3.5 text-foreground-muted" />
                    {selectedAPI.authentication}
                  </span>
                </div>

                <div className="flex justify-between items-center text-xs border-b border-border/40 pb-2">
                  <span className="text-foreground-secondary font-medium">Service Owner Group</span>
                  <span className="font-semibold text-foreground">{selectedAPI.owner}</span>
                </div>

                <div className="flex justify-between items-center text-xs border-b border-border/40 pb-2">
                  <span className="text-foreground-secondary font-medium">Version Release</span>
                  <span className="font-mono font-semibold text-foreground">{selectedAPI.version}</span>
                </div>

                <div className="flex justify-between items-center text-xs">
                  <span className="text-foreground-secondary font-medium">Last Deployment Sync</span>
                  <span className="font-mono text-foreground-muted">{selectedAPI.lastUpdated}</span>
                </div>
              </div>

            </div>

            <div className="border-t border-border/40 pt-6 mt-6 flex justify-end gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsDetailsDrawerOpen(false)}
                className="h-10 px-5 text-xs text-foreground border border-border"
              >
                Close Drawer
              </Button>
              <Button
                variant="primary"
                size="sm"
                onClick={() => {
                  setIsDetailsDrawerOpen(false);
                  toast.success(`Synchronizing telemetry baseline logs for service: ${selectedAPI.name}`);
                }}
                className="h-10 px-5 text-xs bg-primary text-white"
              >
                Reset Counters
              </Button>
            </div>
          </div>
        )}
      </Sheet>
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
