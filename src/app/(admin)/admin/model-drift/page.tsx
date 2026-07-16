"use client";

import React, { useState, useEffect, useMemo, useCallback } from "react";
import {
  Cpu,
  CheckCircle2,
  AlertTriangle,
  AlertCircle,
  RefreshCw,
  Download,
  SlidersHorizontal,
  Search,
  X,
  ShieldAlert,
  ChevronRight,
  Activity,
  TrendingUp,
  Sliders,
  FileSpreadsheet,
  FileDown,
  CheckCircle,
  Info,
  Calendar,
  Layers,
  ArrowRight,
  FileText,
  AlertCircle as ExclamationIcon
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
  CartesianGrid
} from "recharts";
import { toast } from "sonner";

import PageContainer from "@/components/ui/PageContainer";
import SectionHeader from "@/components/ui/SectionHeader";
import { Card, CardHeader, CardTitle, CardContent, CardDescription, CardFooter } from "@/components/ui/Card";
import { Badge, StatusBadge, TrendIndicator, RiskBadge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Modal, Tooltip, Dropdown, Sheet } from "@/components/ui/Overlays";
import { SearchInput } from "@/components/ui/InputControls";
import { cn } from "@/lib/utils";

import {
  ModelId,
  MODEL_OPTIONS,
  MODEL_DRIFT_DB,
  ModelDriftData,
  FeatureDriftRow,
  DriftAlert,
  RetrainingRecommendation,
  TimelineEvent,
  KPICardData
} from "@/lib/model_drift_data";

// Custom theme color maps matching css variables
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

export default function AIModelDriftMonitoringPage() {
  const [mounted, setMounted] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isError, setIsError] = useState(false);
  const [lastSyncTime, setLastSyncTime] = useState("");

  // Target States
  const [selectedModel, setSelectedModel] = useState<ModelId>("all");
  const [selectedTimeframe, setSelectedTimeframe] = useState<string>("7 Days");
  
  // Interactive Modal & Slider States
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [selectedAlert, setSelectedAlert] = useState<DriftAlert | null>(null);
  const [isAlertModalOpen, setIsAlertModalOpen] = useState(false);
  const [isThresholdSheetOpen, setIsThresholdSheetOpen] = useState(false);
  const [isSimulateEmptyState, setIsSimulateEmptyState] = useState(false);

  // Heatmap hover detail state
  const [hoveredHeatmapCell, setHoveredHeatmapCell] = useState<{
    feature: string;
    time: string;
    score: number;
  } | null>(null);

  // Threshold Panel Parameters (States)
  const [featureThreshold, setFeatureThreshold] = useState(0.10);
  const [predictionThreshold, setPredictionThreshold] = useState(0.08);
  const [conceptThreshold, setConceptThreshold] = useState(0.05);
  const [psiThreshold, setPsiThreshold] = useState(0.10);
  const [alertSensitivity, setAlertSensitivity] = useState<"Low" | "Medium" | "High">("Medium");
  const [notificationFreq, setNotificationFreq] = useState<string>("Hourly");

  // Load database content
  const activeData: ModelDriftData = useMemo(() => {
    return MODEL_DRIFT_DB[selectedModel] || MODEL_DRIFT_DB.all;
  }, [selectedModel]);

  // Synchronize loading animations
  useEffect(() => {
    setMounted(true);
    setLastSyncTime(new Date().toLocaleTimeString());
    
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 800);
    
    return () => clearTimeout(timer);
  }, []);

  // Update model change loads
  const handleModelChange = (id: ModelId) => {
    setIsLoading(true);
    setSelectedModel(id);
    setTimeout(() => {
      setIsLoading(false);
      setLastSyncTime(new Date().toLocaleTimeString());
      toast.success(`Telemetry dashboard updated for model: ${MODEL_OPTIONS.find(m => m.id === id)?.name || id}`);
    }, 500);
  };

  // Manual dashboard synchronization trigger
  const handleRefresh = useCallback(() => {
    setIsLoading(true);
    setIsError(false);
    setTimeout(() => {
      setIsLoading(false);
      setLastSyncTime(new Date().toLocaleTimeString());
      toast.success("AI Model Drift metrics dashboard re-synchronized.");
    }, 600);
  }, []);

  // Trigger retraining validation pipeline
  const handleTriggerRetraining = (recommendation: RetrainingRecommendation) => {
    toast.promise(
      new Promise((resolve) => setTimeout(resolve, 2000)),
      {
        loading: `Initializing MLOps pipeline for ${recommendation.title}...`,
        success: `Pipeline triggered! Retraining model logs generated.`,
        error: `Failed to trigger MLOps pipeline.`
      }
    );
  };

  // Threshold apply settings
  const handleApplyThresholds = () => {
    setIsThresholdSheetOpen(false);
    toast.success("Drift monitoring alerting parameters synchronized to production agents.");
  };

  // Export report programmatically (creates mock downloads)
  const handleExport = (format: "PDF" | "CSV" | "Excel") => {
    const toastId = toast.loading(`Generating model drift ${format} report...`);
    setTimeout(() => {
      try {
        let content = "";
        let filename = `arthdrishti_drift_report_${selectedModel}_${new Date().toISOString().split("T")[0]}`;
        
        if (format === "CSV") {
          content = "Feature Name,Training Mean,Current Mean,Drift Score (PSI),Importance,Severity,Status\n";
          activeData.features.forEach(f => {
            content += `${f.name},${f.trainingMean},${f.currentMean},${f.driftScore},${f.importance}%,${f.severity},${f.status}\n`;
          });
          filename += ".csv";
        } else {
          content = `ARTHDRISHTI MLOPS DRIFT REPORT\n============================\n`;
          content += `Export Date: ${new Date().toLocaleString()}\n`;
          content += `Target Model: ${MODEL_OPTIONS.find(m => m.id === selectedModel)?.name || selectedModel}\n`;
          content += `Primary Drift Score (PSI): ${activeData.health.currentDriftScore}\n`;
          content += `Evaluation Health: ${activeData.health.currentHealth}\n\n`;
          content += `Monitored Features Summary:\n`;
          activeData.features.forEach(f => {
            content += `- ${f.name} (PSI: ${f.driftScore} | Status: ${f.status})\n`;
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
        
        toast.success(`Successfully exported and downloaded ${format} report.`, { id: toastId });
      } catch (err) {
        toast.error(`Failed to export ${format} report.`, { id: toastId });
      }
    }, 1200);
  };

  // Dynamic status styling classes
  const getStatusClass = (status: string) => {
    switch (status) {
      case "Stable":
      case "Healthy":
      case "Resolved":
        return "text-positive bg-positive/10 border-positive/20";
      case "Warning":
      case "Minor":
      case "Medium":
        return "text-warning bg-warning/10 border-warning/20";
      case "Drifted":
      case "Critical":
      case "High":
      case "Degraded":
        return "text-critical bg-critical/10 border-critical/20 font-semibold animate-pulse";
      default:
        return "text-foreground-secondary bg-surface-elevated border-border";
    }
  };

  // Filter feature list matching controls
  const filteredFeatures = useMemo(() => {
    if (isSimulateEmptyState) return [];
    return activeData.features.filter(f => {
      const matchesSearch = f.name.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesStatus = statusFilter === "all" || f.status.toLowerCase() === statusFilter.toLowerCase();
      return matchesSearch && matchesStatus;
    });
  }, [activeData.features, searchQuery, statusFilter, isSimulateEmptyState]);

  // Handle Sort operations on feature columns
  const [sortField, setSortField] = useState<keyof FeatureDriftRow | "">("driftScore");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc");

  const handleSort = (field: keyof FeatureDriftRow) => {
    if (sortField === field) {
      setSortDirection(prev => prev === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("desc");
    }
  };

  const sortedFeatures = useMemo(() => {
    if (!sortField) return filteredFeatures;
    return [...filteredFeatures].sort((a, b) => {
      const valA = a[sortField];
      const valB = b[sortField];
      
      if (typeof valA === "string" && typeof valB === "string") {
        return sortDirection === "asc" 
          ? valA.localeCompare(valB) 
          : valB.localeCompare(valA);
      }
      
      if (typeof valA === "number" && typeof valB === "number") {
        return sortDirection === "asc" ? valA - valB : valB - valA;
      }
      return 0;
    });
  }, [filteredFeatures, sortField, sortDirection]);

  // Mini Sparkline SVG Renderer helper
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

  // Accessibility Focus Ref Mapping
  const handleAlertClick = (alert: DriftAlert) => {
    setSelectedAlert(alert);
    setIsAlertModalOpen(true);
  };

  if (!mounted) return null;

  return (
    <PageContainer>
      {/* 1. Page Title Header & Right Actions Wrapper */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 border-b border-border/60 pb-5 mb-6 select-none">
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <h1 className="font-heading font-bold text-2xl md:text-3xl text-foreground tracking-tight">
              AI Model Drift Monitoring
            </h1>
            <span className="h-2 w-2 rounded-full bg-ai animate-pulse" title="System streaming live metrics" />
          </div>
          <p className="font-sans text-sm text-foreground-secondary mt-1.5 leading-relaxed max-w-[800px]">
            Continuously monitor deployed AI models for feature drift, prediction drift, concept drift and data quality issues to ensure reliable production performance.
          </p>
        </div>

        {/* Global actions bar */}
        <div className="flex flex-wrap items-center gap-2">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={handleRefresh}
            className="h-9 px-3.5 focus-visible:outline-2"
            aria-label="Refresh Dashboard Telemetry"
          >
            <RefreshCw className={cn("h-3.5 w-3.5 mr-1.5", isLoading && "animate-spin")} />
            <span>Refresh</span>
          </Button>

          <Dropdown
            align="right"
            trigger={
              <Button variant="outline" size="sm" className="h-9 px-3.5 focus-visible:outline-2" aria-label="Export Telemetry Reports Options">
                <Download className="h-3.5 w-3.5 mr-1.5" />
                <span>Export Report</span>
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
            aria-label="Configure Alarm Thresholds Panel"
          >
            <SlidersHorizontal className="h-3.5 w-3.5 mr-1.5" />
            <span>Configure Thresholds</span>
          </Button>
        </div>
      </div>

      {/* 2. Top Alert Warning Notification Center */}
      {activeData.alerts.length > 0 && (
        <div className="mb-6 space-y-2 select-none animate-fadeIn">
          {activeData.alerts.map((alert) => (
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
              aria-label={`Open details for active alarm: ${alert.title}`}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  handleAlertClick(alert);
                }
              }}
            >
              <div className="flex items-center gap-3 min-w-0 pr-4">
                <div className="flex-shrink-0">
                  {alert.severity === "Critical" ? (
                    <AlertCircle className="h-5 w-5 animate-pulse" />
                  ) : (
                    <AlertTriangle className="h-5 w-5" />
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
                <span>View Stats</span>
                <ChevronRight className="h-4 w-4" />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* 3. Dropdowns & Controls Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-surface border border-border p-4 rounded-sm mb-6 select-none shadow-xs">
        <div className="flex items-center gap-3 w-full md:w-auto">
          <div className="flex flex-col gap-1 w-full md:w-64">
            <label className="text-[10px] font-sans font-bold tracking-wider text-foreground-muted uppercase">
              Model Selection
            </label>
            <select
              value={selectedModel}
              onChange={(e) => handleModelChange(e.target.value as ModelId)}
              className="w-full text-sm font-sans font-semibold bg-surface-elevated border border-border px-3.5 py-2.5 focus:border-primary outline-none rounded-sm transition-colors text-foreground cursor-pointer"
              aria-label="Select Target AI Model for drift telemetry"
            >
              {MODEL_OPTIONS.map((opt) => (
                <option key={opt.id} value={opt.id} className="bg-surface text-foreground font-semibold">
                  {opt.name} {opt.version !== "N/A" ? `(${opt.version})` : ""}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Timeframe & Diagnostic controllers */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Timeframe toggler */}
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
                aria-label={`Show telemetry data for timeframe ${time}`}
              >
                {time}
              </button>
            ))}
          </div>

          {/* Test Empty State Simulator */}
          <Tooltip content="Toggle to simulate missing telemetry datasets">
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

          {/* Test Error State Simulator */}
          <Tooltip content="Toggle to simulate database connection loss">
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

      {/* ERROR PANEL SCREEN */}
      {isError ? (
        <Card className="border border-critical bg-critical/5 select-none my-8 p-8 flex flex-col items-center justify-center text-center gap-4">
          <div className="h-12 w-12 rounded-full bg-critical/10 flex items-center justify-center text-critical">
            <ShieldAlert className="h-6 w-6" />
          </div>
          <div>
            <CardTitle className="text-lg font-heading font-bold text-foreground">
              MLOps Cluster Connection Failure
            </CardTitle>
            <CardDescription className="text-sm font-sans mt-2 max-w-lg mx-auto">
              We encountered a timeout while fetching active drift data parameters from the Model Observability Nodes. The database cluster has rejected the queries.
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
          {/* 4. Global KPIs Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            {activeData.kpis.map((kpi, idx) => {
              const loadingActive = isLoading;
              
              if (loadingActive) {
                return (
                  <Card key={idx} className="bg-surface border border-border select-none animate-pulse">
                    <CardContent className="p-5 flex flex-col gap-3">
                      <div className="flex items-center justify-between">
                        <div className="h-3.5 w-24 bg-border rounded-xs" />
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

          {/* 5. Drift Overview Section */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
            
            {/* Primary overall charts */}
            <Card className="lg:col-span-2 bg-surface border border-border shadow-xs select-none">
              <CardHeader className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border/40 pb-4">
                <div>
                  <CardTitle className="text-base sm:text-lg font-heading">
                    Drift Metric Trends Overview
                  </CardTitle>
                  <CardDescription className="text-xs">
                    Continuous monitoring timeline of overall, feature, prediction, and concept drifts.
                  </CardDescription>
                </div>
                <div className="flex items-center gap-1.5 text-xs text-foreground-secondary bg-surface-elevated border border-border px-2.5 py-1.5 rounded-sm">
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
                    <span className="text-sm font-semibold text-foreground">No Overview Data Available</span>
                    <span className="text-xs text-foreground-secondary">Verify model inputs or reset simulator.</span>
                  </div>
                ) : (
                  <div className="h-72 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={activeData.overview[selectedTimeframe] || activeData.overview["7 Days"]}>
                        <defs>
                          <linearGradient id="colorOverall" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor={COLORS.primary} stopOpacity={0.2}/>
                            <stop offset="95%" stopColor={COLORS.primary} stopOpacity={0}/>
                          </linearGradient>
                          <linearGradient id="colorConcept" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor={COLORS.ai} stopOpacity={0.2}/>
                            <stop offset="95%" stopColor={COLORS.ai} stopOpacity={0}/>
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" opacity={0.3} />
                        <XAxis 
                          dataKey="time" 
                          stroke="var(--foreground-muted)" 
                          fontSize={10} 
                          tickLine={false} 
                        />
                        <YAxis 
                          stroke="var(--foreground-muted)" 
                          fontSize={10} 
                          tickLine={false} 
                          domain={[0, 'auto']}
                        />
                        <RechartsTooltip 
                          contentStyle={{ 
                            backgroundColor: "var(--surface)", 
                            borderColor: "var(--border)", 
                            borderRadius: "4px",
                            fontSize: "12px",
                            fontFamily: "var(--font-sans)"
                          }}
                          labelClassName="font-semibold text-foreground"
                        />
                        <Legend wrapperStyle={{ fontSize: "11px", paddingTop: "12px" }} />
                        <Area 
                          name="Overall Drift" 
                          type="monotone" 
                          dataKey="overall" 
                          stroke={COLORS.primary} 
                          fillOpacity={1} 
                          fill="url(#colorOverall)" 
                          strokeWidth={2}
                        />
                        <Area 
                          name="Concept Drift" 
                          type="monotone" 
                          dataKey="concept" 
                          stroke={COLORS.ai} 
                          fillOpacity={1} 
                          fill="url(#colorConcept)" 
                          strokeWidth={2}
                        />
                        <Line 
                          name="Feature Drift (PSI)" 
                          type="monotone" 
                          dataKey="feature" 
                          stroke={COLORS.warning} 
                          strokeWidth={2} 
                          dot={false}
                        />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Model health panel */}
            <Card className="bg-surface border border-border shadow-xs select-none flex flex-col">
              <CardHeader className="border-b border-border/40 pb-4">
                <CardTitle className="text-base sm:text-lg font-heading">
                  Model Health Panel
                </CardTitle>
                <CardDescription className="text-xs">
                  Active verification metrics for selected model.
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-6 flex-1 flex flex-col justify-between gap-6">
                {isLoading ? (
                  <div className="flex-1 flex flex-col gap-4 animate-pulse">
                    {[1, 2, 3, 4].map(idx => (
                      <div key={idx} className="h-10 bg-surface-elevated rounded-sm w-full" />
                    ))}
                  </div>
                ) : (
                  <>
                    <div className="space-y-4">
                      {/* Health Status */}
                      <div className="flex items-center justify-between border-b border-border/40 pb-3">
                        <span className="text-xs text-foreground-secondary font-medium font-sans">
                          Current MLOps Health
                        </span>
                        <Badge variant={activeData.health.currentHealth === "Healthy" ? "success" : "warning"}>
                          {activeData.health.currentHealth}
                        </Badge>
                      </div>

                      {/* Last Retraining */}
                      <div className="flex items-center justify-between border-b border-border/40 pb-3">
                        <span className="text-xs text-foreground-secondary font-medium font-sans">
                          Last Retraining Date
                        </span>
                        <span className="text-xs font-semibold font-mono text-foreground">
                          {activeData.health.lastRetraining}
                        </span>
                      </div>

                      {/* Drift score index */}
                      <div className="flex items-center justify-between border-b border-border/40 pb-3">
                        <span className="text-xs text-foreground-secondary font-medium font-sans">
                          Active PSI Score
                        </span>
                        <span className={cn("text-xs font-bold font-mono px-1.5 py-0.5 rounded-xs", getStatusClass(activeData.health.currentDriftScore > 0.1 ? "Warning" : "Stable"))}>
                          {activeData.health.currentDriftScore}
                        </span>
                      </div>

                      {/* Prediction stability percentage */}
                      <div className="flex items-center justify-between border-b border-border/40 pb-3">
                        <span className="text-xs text-foreground-secondary font-medium font-sans">
                          Prediction Stability
                        </span>
                        <span className="text-xs font-bold font-mono text-foreground">
                          {activeData.health.predictionStability}%
                        </span>
                      </div>

                      {/* Last Evaluation runs */}
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-foreground-secondary font-medium font-sans">
                          Last Evaluation Run
                        </span>
                        <span className="text-xs font-semibold text-foreground-muted font-sans">
                          {activeData.health.lastEvaluation}
                        </span>
                      </div>
                    </div>

                    {/* Sync button shortcut */}
                    <Button 
                      variant="secondary" 
                      size="sm" 
                      onClick={handleRefresh}
                      className="w-full h-10 border border-border hover:bg-surface-hover mt-4 text-xs font-semibold"
                    >
                      <RefreshCw className="h-3.5 w-3.5 mr-2" />
                      <span>Re-Evaluate Metrics</span>
                    </Button>
                  </>
                )}
              </CardContent>
            </Card>
          </div>

          {/* 6. Feature Drift Analysis & Heatmap Row */}
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 mb-6">
            
            {/* Table layout */}
            <Card className="xl:col-span-2 bg-surface border border-border shadow-xs flex flex-col">
              <CardHeader className="border-b border-border/40 pb-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <CardTitle className="text-base sm:text-lg font-heading">
                      Feature Drift Analysis
                    </CardTitle>
                    <CardDescription className="text-xs">
                      Compare feature distributions in baseline training samples versus current production logs.
                    </CardDescription>
                  </div>
                  
                  {/* Status filter selection */}
                  <div className="flex items-center gap-2">
                    <select
                      value={statusFilter}
                      onChange={(e) => setStatusFilter(e.target.value)}
                      className="text-xs font-sans font-semibold bg-surface-elevated border border-border px-3 py-1.5 focus:border-primary/50 outline-none rounded-sm transition-colors text-foreground cursor-pointer"
                      aria-label="Filter features by status classification"
                    >
                      <option value="all">All Statuses</option>
                      <option value="Stable">Stable</option>
                      <option value="Warning">Warning</option>
                      <option value="Drifted">Drifted</option>
                    </select>
                  </div>
                </div>

                {/* Search field */}
                <div className="flex items-center gap-3 mt-4">
                  <div className="relative w-full max-w-sm flex items-center">
                    <Search className="absolute left-3 h-4 w-4 text-foreground-muted pointer-events-none" />
                    <input
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Search features..."
                      className="w-full h-9 pl-9 pr-8 bg-surface-elevated border border-border text-foreground rounded-sm text-xs font-sans placeholder-foreground-muted focus:border-primary/50 focus:outline-none transition-all"
                      aria-label="Search feature drift table items"
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
                </div>
              </CardHeader>
              
              <CardContent className="p-0 overflow-x-auto">
                {isLoading ? (
                  <div className="p-8 space-y-4 animate-pulse select-none">
                    {[1, 2, 3, 4, 5].map(idx => (
                      <div key={idx} className="h-8 bg-surface-elevated rounded-sm w-full" />
                    ))}
                  </div>
                ) : sortedFeatures.length === 0 ? (
                  <div className="p-12 text-center flex flex-col items-center justify-center gap-3 select-none">
                    <div className="h-10 w-10 rounded-full bg-surface-elevated border border-border flex items-center justify-center text-foreground-muted">
                      <ExclamationIcon className="h-5 w-5" />
                    </div>
                    <div>
                      <h4 className="text-sm font-semibold text-foreground">No Drift Data Available</h4>
                      <p className="text-xs text-foreground-muted mt-1 max-w-xs">
                        No features matched your search queries or filter selectors. Check criteria and try again.
                      </p>
                    </div>
                  </div>
                ) : (
                  <table className="w-full min-w-[700px] border-collapse font-sans text-xs text-left" aria-label="Active Monitored Feature Distributions">
                    <thead>
                      <tr className="border-b border-border/40 bg-surface-elevated/40 select-none text-foreground-secondary font-semibold uppercase tracking-wider">
                        <th 
                          onClick={() => handleSort("name")}
                          className="p-3.5 pl-6 cursor-pointer hover:text-foreground transition-colors"
                        >
                          Feature Name {sortField === "name" && (sortDirection === "asc" ? "▲" : "▼")}
                        </th>
                        <th className="p-3.5">Training Mean</th>
                        <th className="p-3.5">Current Mean</th>
                        <th 
                          onClick={() => handleSort("driftScore")}
                          className="p-3.5 cursor-pointer hover:text-foreground transition-colors"
                        >
                          Drift Score (PSI) {sortField === "driftScore" && (sortDirection === "asc" ? "▲" : "▼")}
                        </th>
                        <th 
                          onClick={() => handleSort("importance")}
                          className="p-3.5 cursor-pointer hover:text-foreground transition-colors"
                        >
                          Importance {sortField === "importance" && (sortDirection === "asc" ? "▲" : "▼")}
                        </th>
                        <th className="p-3.5">Severity</th>
                        <th className="p-3.5">Status</th>
                        <th className="p-3.5 pr-6 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border/45">
                      {sortedFeatures.map((row) => (
                        <tr 
                          key={row.name} 
                          className={cn(
                            "hover:bg-surface-elevated/30 transition-colors group",
                            row.status === "Drifted" && "bg-critical/5/5"
                          )}
                        >
                          <td className="p-3.5 pl-6 font-semibold text-foreground max-w-[180px] truncate">
                            {row.name}
                          </td>
                          <td className="p-3.5 font-mono text-foreground-secondary">
                            {row.trainingMean.toFixed(2)}
                          </td>
                          <td className="p-3.5 font-mono text-foreground-secondary">
                            {row.currentMean.toFixed(2)}
                          </td>
                          <td className="p-3.5">
                            <span className={cn(
                              "font-mono font-bold px-1.5 py-0.5 rounded-xs",
                              row.driftScore > 0.2 ? "text-critical bg-critical/10" : row.driftScore > 0.1 ? "text-warning bg-warning/10" : "text-positive bg-positive/10"
                            )}>
                              {row.driftScore.toFixed(3)}
                            </span>
                          </td>
                          <td className="p-3.5 font-mono text-foreground-secondary">
                            {row.importance}%
                          </td>
                          <td className="p-3.5">
                            <span className={cn(
                              "font-medium",
                              row.severity === "High" ? "text-critical" : row.severity === "Medium" ? "text-warning" : "text-foreground-secondary"
                            )}>
                              {row.severity}
                            </span>
                          </td>
                          <td className="p-3.5">
                            <span className={cn("inline-flex items-center rounded-xs px-2 py-0.5 text-[9px] font-bold border", getStatusClass(row.status))}>
                              {row.status}
                            </span>
                          </td>
                          <td className="p-3.5 pr-6 text-right">
                            <button
                              onClick={() => toast.info(`Detailed analysis loaded for feature parameter: ${row.name}`)}
                              className="text-xs text-primary font-semibold hover:underline outline-none focus-visible:outline-2 cursor-pointer"
                              aria-label={`Inspect feature distributions for ${row.name}`}
                            >
                              Inspect
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </CardContent>
            </Card>

            {/* Drift Heatmap */}
            <Card className="bg-surface border border-border shadow-xs select-none flex flex-col">
              <CardHeader className="border-b border-border/40 pb-4">
                <CardTitle className="text-base sm:text-lg font-heading">
                  Drift Heatmap matrix
                </CardTitle>
                <CardDescription className="text-xs">
                  Features vs. Time intervals. Darker intensities represent elevated drift score levels.
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-6 flex-1 flex flex-col justify-between">
                {isLoading ? (
                  <div className="h-64 w-full bg-surface-elevated/40 animate-pulse rounded-sm" />
                ) : isSimulateEmptyState ? (
                  <div className="h-64 w-full flex flex-col items-center justify-center text-center gap-2 select-none">
                    <ExclamationIcon className="h-8 w-8 text-foreground-muted" />
                    <span className="text-sm font-semibold text-foreground">No Heatmap Data Available</span>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {/* Heatmap Grid implementation */}
                    <div className="grid grid-cols-6 gap-1 w-full border-t border-l border-border/40 pt-1 pl-1">
                      
                      {/* Empty top-left cell */}
                      <div className="text-[9px] text-foreground-muted font-bold p-1 select-none truncate">
                        Features
                      </div>

                      {/* X headers (dates) */}
                      {["Jul 10", "Jul 11", "Jul 12", "Jul 13", "Jul 14"].map(d => (
                        <div key={d} className="text-[9px] text-foreground-muted font-mono font-bold p-1 text-center truncate">
                          {d}
                        </div>
                      ))}

                      {/* Rows mapping features */}
                      {activeData.features.slice(0, 5).map((f) => (
                        <React.Fragment key={f.name}>
                          {/* Feature label */}
                          <div className="text-[9px] text-foreground-secondary font-sans font-semibold p-1 truncate" title={f.name}>
                            {f.name}
                          </div>

                          {/* Matrix grid cells */}
                          {["Jul 10", "Jul 11", "Jul 12", "Jul 13", "Jul 14"].map((date) => {
                            // Find matching score
                            const cell = activeData.heatmap.find(h => h.feature === f.name && h.time === date);
                            const score = cell ? cell.score : 0.05;

                            // Calculate color thresholds
                            let cellBg = "bg-primary/10";
                            let cellTitle = `${f.name} (${date}) score: ${score} - Stable`;

                            if (score > 0.2) {
                              cellBg = "bg-critical/80 text-white animate-pulse";
                              cellTitle = `${f.name} (${date}) score: ${score} - Critical Drift`;
                            } else if (score > 0.1) {
                              cellBg = "bg-warning/70 text-black";
                              cellTitle = `${f.name} (${date}) score: ${score} - Warning Drift`;
                            } else if (score > 0.05) {
                              cellBg = "bg-warning/20 text-warning-strong";
                              cellTitle = `${f.name} (${date}) score: ${score} - Minor Drift`;
                            }

                            return (
                              <div
                                key={date}
                                onMouseEnter={() => setHoveredHeatmapCell({ feature: f.name, time: date, score })}
                                onMouseLeave={() => setHoveredHeatmapCell(null)}
                                className={cn(
                                  "h-8 rounded-xs transition-transform duration-150 hover:scale-105 border border-surface cursor-help",
                                  cellBg
                                )}
                                title={cellTitle}
                                role="gridcell"
                                aria-label={cellTitle}
                              />
                            );
                          })}
                        </React.Fragment>
                      ))}
                    </div>

                    {/* Interactive hover details box */}
                    <div className="p-3 bg-surface-elevated border border-border rounded-sm min-h-[58px] flex items-center justify-center">
                      {hoveredHeatmapCell ? (
                        <div className="text-center w-full">
                          <span className="text-[10px] font-sans font-bold text-primary block truncate max-w-full">
                            {hoveredHeatmapCell.feature} ({hoveredHeatmapCell.time})
                          </span>
                          <span className="text-xs font-mono font-bold text-foreground mt-0.5 block">
                            PSI Score: {hoveredHeatmapCell.score.toFixed(3)}
                          </span>
                        </div>
                      ) : (
                        <span className="text-[10px] font-sans text-foreground-muted text-center leading-normal">
                          Hover over any cell block in the heatmap matrix to view detailed statistics.
                        </span>
                      )}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* 7. Prediction Drift & Concept Drift charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
            
            {/* Prediction Drift cards */}
            <Card className="bg-surface border border-border shadow-xs select-none">
              <CardHeader className="border-b border-border/40 pb-4">
                <CardTitle className="text-base sm:text-lg font-heading">
                  Prediction & Confidence Distribution
                </CardTitle>
                <CardDescription className="text-xs">
                  Analyzes classification prediction bins or confidence probability shift limits.
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-6">
                {isLoading ? (
                  <div className="h-64 w-full bg-surface-elevated/40 animate-pulse rounded-sm" />
                ) : isSimulateEmptyState ? (
                  <div className="h-64 w-full flex flex-col items-center justify-center text-center gap-2 select-none">
                    <ExclamationIcon className="h-8 w-8 text-foreground-muted" />
                    <span className="text-sm font-semibold text-foreground">No Prediction Drift Data</span>
                  </div>
                ) : (
                  <div className="h-64 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={activeData.predictionDistribution}>
                        <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" opacity={0.3} />
                        <XAxis dataKey="bin" stroke="var(--foreground-muted)" fontSize={10} tickLine={false} />
                        <YAxis stroke="var(--foreground-muted)" fontSize={10} tickLine={false} />
                        <RechartsTooltip 
                          contentStyle={{ 
                            backgroundColor: "var(--surface)", 
                            borderColor: "var(--border)", 
                            borderRadius: "4px",
                            fontSize: "12px"
                          }}
                        />
                        <Legend wrapperStyle={{ fontSize: "11px" }} />
                        <Bar name="Baseline Distribution" dataKey="baselineDensity" fill={COLORS.secondary} opacity={0.65} radius={[2, 2, 0, 0]} />
                        <Bar name="Production Log Distribution" dataKey="currentDensity" fill={COLORS.primary} radius={[2, 2, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Concept Drift & accuracy decay */}
            <Card className="bg-surface border border-border shadow-xs select-none">
              <CardHeader className="border-b border-border/40 pb-4">
                <CardTitle className="text-base sm:text-lg font-heading">
                  Concept Drift & Historical Stability
                </CardTitle>
                <CardDescription className="text-xs">
                  Compares model accuracy metrics over time against target baseline values.
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-6">
                {isLoading ? (
                  <div className="h-64 w-full bg-surface-elevated/40 animate-pulse rounded-sm" />
                ) : isSimulateEmptyState ? (
                  <div className="h-64 w-full flex flex-col items-center justify-center text-center gap-2 select-none">
                    <ExclamationIcon className="h-8 w-8 text-foreground-muted" />
                    <span className="text-sm font-semibold text-foreground">No Concept Drift Data</span>
                  </div>
                ) : (
                  <div className="h-64 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={activeData.conceptDrift}>
                        <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" opacity={0.3} />
                        <XAxis dataKey="time" stroke="var(--foreground-muted)" fontSize={10} tickLine={false} />
                        <YAxis stroke="var(--foreground-muted)" fontSize={10} tickLine={false} domain={[85, 100]} />
                        <RechartsTooltip 
                          contentStyle={{ 
                            backgroundColor: "var(--surface)", 
                            borderColor: "var(--border)", 
                            borderRadius: "4px",
                            fontSize: "12px"
                          }}
                        />
                        <Legend wrapperStyle={{ fontSize: "11px" }} />
                        <Line name="Expected Behavior" type="monotone" dataKey="expectedBehavior" stroke={COLORS.primary} strokeWidth={2} strokeDasharray="5 5" dot={false} />
                        <Line name="Observed Behavior" type="monotone" dataKey="observedBehavior" stroke={COLORS.critical} strokeWidth={2} dot={{ r: 4 }} />
                        <Line name="Concept Stability Index" type="monotone" dataKey="conceptStability" stroke={COLORS.ai} strokeWidth={1.5} dot={false} />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* 8. Data Quality Monitor & Diagnostic cards */}
          <div className="mb-6 select-none">
            <div className="border-b border-border/40 pb-3 mb-4">
              <h2 className="text-base sm:text-lg font-heading font-semibold text-foreground">
                Data Quality Monitor
              </h2>
              <p className="text-xs text-foreground-secondary font-sans mt-0.5">
                Tracks incoming ingestion payloads for missing records, anomalies, and schema validation violations.
              </p>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
              {[
                { label: "Missing Values", val: activeData.dataQuality.missingValues, unit: "cols", desc: "Total empty points", icon: Layers, color: "text-primary" },
                { label: "Duplicate Records", val: activeData.dataQuality.duplicateRecords, unit: "rows", desc: "Redundant samples", icon: FileSpreadsheet, color: "text-warning" },
                { label: "Outliers Detected", val: activeData.dataQuality.outliers, unit: "pts", desc: "Out of range events", icon: AlertTriangle, color: "text-critical" },
                { label: "Schema Changes", val: activeData.dataQuality.schemaChanges, unit: "breaches", desc: "Model signature issues", icon: ShieldAlert, color: activeData.dataQuality.schemaChanges > 0 ? "text-critical" : "text-positive" },
                { label: "Null Percentage", val: `${activeData.dataQuality.nullPercentage}%`, unit: "", desc: "Volume ratio", icon: Activity, color: "text-forecast" },
                { label: "Unexpected Categories", val: activeData.dataQuality.unexpectedCategories, unit: "keys", desc: "Unknown variables", icon: Sliders, color: "text-ai" }
              ].map((card, idx) => (
                <Card key={idx} className="bg-surface border border-border/80 hover:border-primary/30 transition-all shadow-xs">
                  <CardContent className="p-4 flex flex-col justify-between h-full gap-2">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-sans font-semibold text-foreground-secondary tracking-wide truncate">
                        {card.label}
                      </span>
                      <card.icon className={cn("h-4 w-4 flex-shrink-0", card.color)} />
                    </div>
                    <div>
                      <span className="text-lg font-bold font-mono text-foreground">
                        {card.val}
                      </span>
                      <span className="text-[9px] font-sans text-foreground-muted block leading-none mt-1">
                        {card.desc}
                      </span>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* 9. Alert Center Logs, Retraining & Timeline Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 select-none">
            
            {/* Retraining Recommendations */}
            <Card className="bg-surface border border-border shadow-xs flex flex-col">
              <CardHeader className="border-b border-border/40 pb-4">
                <CardTitle className="text-base sm:text-lg font-heading">
                  Retraining Recommendations
                </CardTitle>
                <CardDescription className="text-xs">
                  AI-generated recommended pipeline triggers for degraded model states.
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-6 flex-1 flex flex-col gap-4">
                {isLoading ? (
                  <div className="space-y-4 animate-pulse">
                    {[1, 2].map(idx => (
                      <div key={idx} className="h-16 bg-surface-elevated rounded-sm w-full" />
                    ))}
                  </div>
                ) : activeData.recommendations.length === 0 ? (
                  <div className="text-center p-6 text-foreground-muted text-xs">
                    All model validations aligned. No retraining suggested.
                  </div>
                ) : (
                  activeData.recommendations.map((rec) => (
                    <div 
                      key={rec.id} 
                      className="p-4 rounded-sm border border-border bg-surface-elevated flex flex-col gap-3"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-foreground">
                            {rec.title}
                          </span>
                          <span className={cn(
                            "text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded-xs border",
                            rec.priority === "High" ? "bg-critical/10 text-critical border-critical/20" : "bg-warning/10 text-warning border-warning/20"
                          )}>
                            {rec.priority}
                          </span>
                        </div>
                        <span className="text-[10px] font-mono font-bold text-ai">
                          Conf: {rec.confidence}%
                        </span>
                      </div>
                      
                      <p className="text-xs text-foreground-secondary leading-normal">
                        {rec.reason}
                      </p>

                      <div className="border-t border-border/50 pt-2.5 flex items-center justify-between flex-wrap gap-2">
                        <span className="text-[10px] text-foreground-muted font-sans font-medium">
                          Suggested: {rec.suggestedAction}
                        </span>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleTriggerRetraining(rec)}
                          className="h-8 px-2.5 text-[10px] text-primary hover:bg-primary/10 border border-transparent hover:border-primary/20 flex items-center gap-1 cursor-pointer focus-visible:outline-2"
                        >
                          <RefreshCw className="h-3 w-3" />
                          <span>Trigger Pipeline</span>
                        </Button>
                      </div>
                    </div>
                  ))
                )}
              </CardContent>
            </Card>

            {/* Timeline */}
            <Card className="bg-surface border border-border shadow-xs flex flex-col">
              <CardHeader className="border-b border-border/40 pb-4">
                <CardTitle className="text-base sm:text-lg font-heading">
                  Drift Event Timeline
                </CardTitle>
                <CardDescription className="text-xs">
                  Event ledger tracking baseline checks, model deployments, and warnings.
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-6 flex-1 overflow-y-auto max-h-[380px] scrollbar-none pr-1">
                {isLoading ? (
                  <div className="space-y-4 animate-pulse">
                    {[1, 2, 3].map(idx => (
                      <div key={idx} className="h-10 bg-surface-elevated rounded-sm w-full" />
                    ))}
                  </div>
                ) : activeData.timeline.length === 0 ? (
                  <div className="text-center p-6 text-foreground-muted text-xs">
                    No logged MLOps lifecycle milestones.
                  </div>
                ) : (
                  <div className="relative border-l border-border pl-4.5 ml-2.5 space-y-5">
                    {activeData.timeline.map((event) => {
                      let dotBg = "bg-primary";
                      if (event.type === "Deployment") dotBg = "bg-ai";
                      if (event.type === "Warning") dotBg = "bg-warning";
                      if (event.type === "CriticalDrift") dotBg = "bg-critical";
                      if (event.type === "Recovery") dotBg = "bg-positive";

                      return (
                        <div key={event.id} className="relative group text-left">
                          {/* Chronology Dot */}
                          <div className={cn("absolute -left-[24px] top-1.5 h-3 w-3 rounded-full border border-surface", dotBg)} />
                          
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-semibold text-foreground">
                              {event.title}
                            </span>
                            <span className="text-[9px] font-mono text-foreground-muted">
                              {event.date}
                            </span>
                          </div>
                          
                          <p className="text-xs text-foreground-secondary mt-1 leading-normal">
                            {event.description}
                          </p>
                        </div>
                      );
                    })}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Threshold controls summary */}
            <Card className="bg-surface border border-border shadow-xs flex flex-col justify-between">
              <CardHeader className="border-b border-border/40 pb-4">
                <CardTitle className="text-base sm:text-lg font-heading">
                  Active Alert Thresholds
                </CardTitle>
                <CardDescription className="text-xs">
                  Active statistical limits triggering Slack/Email alert protocols.
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-6 flex-1 flex flex-col justify-between gap-5">
                <div className="space-y-3.5">
                  {[
                    { label: "Feature Drift limit (PSI)", val: featureThreshold, def: "0.10" },
                    { label: "Prediction Drift threshold", val: predictionThreshold, def: "0.08" },
                    { label: "Concept Drift deviation", val: conceptThreshold, def: "0.05" },
                    { label: "Global PSI threshold", val: psiThreshold, def: "0.10" },
                    { label: "Sensitivity level", val: alertSensitivity, def: "Medium" }
                  ].map((lim, idx) => (
                    <div key={idx} className="flex items-center justify-between border-b border-border/40 pb-2.5">
                      <span className="text-xs text-foreground-secondary font-medium font-sans">
                        {lim.label}
                      </span>
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs font-bold font-mono text-foreground">
                          {lim.val}
                        </span>
                        <span className="text-[9px] font-sans text-foreground-muted">
                          (def: {lim.def})
                        </span>
                      </div>
                    </div>
                  ))}
                </div>

                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => setIsThresholdSheetOpen(true)}
                  className="w-full h-10 border border-border hover:bg-surface-hover mt-3 text-xs font-semibold"
                >
                  <Sliders className="h-3.5 w-3.5 mr-2" />
                  <span>Modify Alert Settings</span>
                </Button>
              </CardContent>
            </Card>
          </div>
        </>
      )}

      {/* 10. Alarm Details Dialog Modal */}
      <Modal
        isOpen={isAlertModalOpen}
        onClose={() => setIsAlertModalOpen(false)}
        title={selectedAlert ? `${selectedAlert.title}` : "Alarm Details"}
        className="max-w-md"
      >
        {selectedAlert && (
          <div className="space-y-4">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <span className="text-xs font-sans text-foreground-secondary">
                Model: <span className="font-semibold text-foreground">{selectedAlert.modelName}</span>
              </span>
              <span className={cn(
                "inline-flex items-center rounded-xs px-2 py-0.5 text-[10px] font-bold border",
                getStatusClass(selectedAlert.severity)
              )}>
                {selectedAlert.severity} Severity
              </span>
            </div>

            <div className="p-3 bg-surface-elevated border border-border rounded-sm">
              <span className="text-[10px] uppercase font-bold text-foreground-muted tracking-wider font-mono">
                Alarm Log Timestamp
              </span>
              <span className="text-xs text-foreground block font-mono font-semibold mt-1">
                {selectedAlert.timestamp}
              </span>
            </div>

            <p className="text-xs text-foreground-secondary leading-normal">
              {selectedAlert.details}
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
                  toast.success(`Active alert [${selectedAlert.id}] acknowledged successfully.`);
                }}
                className="h-9 px-4 text-xs bg-primary text-white"
              >
                Acknowledge Alert
              </Button>
            </div>
          </div>
        )}
      </Modal>

      {/* 11. Configuration Settings Drawer Sheet */}
      <Sheet
        isOpen={isThresholdSheetOpen}
        onClose={() => setIsThresholdSheetOpen(false)}
        title="MLOps Alarm Thresholds"
        side="right"
      >
        <div className="flex flex-col h-full justify-between pb-8">
          <div className="space-y-6 overflow-y-auto pr-1">
            <p className="text-xs text-foreground-secondary leading-normal font-sans">
              Set statistical filters on ingestion nodes. Realtime calculations that breach these scores immediately trigger PagerDuty alerts.
            </p>

            {/* Slider Feature Drift PSI limit */}
            <div className="space-y-2">
              <div className="flex justify-between items-center text-xs">
                <label className="font-semibold text-foreground">Feature Drift Limit (PSI)</label>
                <span className="font-mono font-bold text-primary">{featureThreshold.toFixed(2)}</span>
              </div>
              <input
                type="range"
                min="0.02"
                max="0.50"
                step="0.01"
                value={featureThreshold}
                onChange={(e) => setFeatureThreshold(parseFloat(e.target.value))}
                className="w-full h-1.5 bg-border rounded-lg appearance-none cursor-pointer accent-primary focus:outline-none"
              />
              <span className="text-[10px] text-foreground-muted block">
                Breach values higher than this mark indicate feature density shifts.
              </span>
            </div>

            {/* Slider Prediction Drift PSI limit */}
            <div className="space-y-2">
              <div className="flex justify-between items-center text-xs">
                <label className="font-semibold text-foreground">Prediction Drift Threshold</label>
                <span className="font-mono font-bold text-primary">{predictionThreshold.toFixed(2)}</span>
              </div>
              <input
                type="range"
                min="0.02"
                max="0.30"
                step="0.01"
                value={predictionThreshold}
                onChange={(e) => setPredictionThreshold(parseFloat(e.target.value))}
                className="w-full h-1.5 bg-border rounded-lg appearance-none cursor-pointer accent-primary focus:outline-none"
              />
            </div>

            {/* Slider Concept Drift Limit */}
            <div className="space-y-2">
              <div className="flex justify-between items-center text-xs">
                <label className="font-semibold text-foreground">Concept Drift (Accuracy Decay)</label>
                <span className="font-mono font-bold text-primary">{conceptThreshold.toFixed(2)}</span>
              </div>
              <input
                type="range"
                min="0.01"
                max="0.20"
                step="0.01"
                value={conceptThreshold}
                onChange={(e) => setConceptThreshold(parseFloat(e.target.value))}
                className="w-full h-1.5 bg-border rounded-lg appearance-none cursor-pointer accent-primary focus:outline-none"
              />
            </div>

            {/* Sensitivity level selection */}
            <div className="space-y-2">
              <label className="text-xs font-semibold text-foreground block">Alert Sensitivity</label>
              <div className="grid grid-cols-3 gap-2">
                {(["Low", "Medium", "High"] as const).map((sens) => (
                  <button
                    key={sens}
                    onClick={() => setAlertSensitivity(sens)}
                    className={cn(
                      "py-2 text-xs font-sans font-medium rounded-sm border cursor-pointer transition-colors outline-none",
                      alertSensitivity === sens
                        ? "bg-primary/10 text-primary border-primary font-semibold"
                        : "bg-surface-elevated text-foreground-secondary border-border hover:bg-surface-hover"
                    )}
                  >
                    {sens}
                  </button>
                ))}
              </div>
            </div>

            {/* Frequency selection */}
            <div className="space-y-2">
              <label className="text-xs font-semibold text-foreground block">Notification Interval</label>
              <select
                value={notificationFreq}
                onChange={(e) => setNotificationFreq(e.target.value)}
                className="w-full text-xs font-sans font-semibold bg-surface-elevated border border-border px-3.5 py-2.5 focus:border-primary outline-none rounded-sm transition-colors text-foreground cursor-pointer"
              >
                <option value="Realtime">Real-time alerts</option>
                <option value="Hourly">Hourly Digests</option>
                <option value="Daily">Daily Summary</option>
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
    </PageContainer>
  );
}
