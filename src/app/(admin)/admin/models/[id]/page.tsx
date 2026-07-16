"use client";

import React, { useState, useEffect, useMemo, useCallback } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  Cpu,
  ArrowLeft,
  Calendar,
  Database,
  Layers,
  Terminal as ConsoleIcon,
  Activity,
  CheckCircle2,
  GitBranch,
  Play,
  RotateCcw,
  Archive,
  Trash2,
  Copy,
  Info,
  Clock,
  ExternalLink,
  Sliders,
  AlertTriangle,
  CheckCircle,
  FileText,
  User,
  ShieldCheck,
  Search,
  X,
  SlidersHorizontal,
  ChevronLeft,
  ChevronRight,
  TrendingUp,
  Download,
  AlertCircle,
  Sparkles,
  RefreshCw,
  Zap,
  Terminal,
  Grid
} from "lucide-react";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip as RechartsTooltip,
  ResponsiveContainer,
  Legend,
  CartesianGrid,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar
} from "recharts";
import { toast } from "sonner";

import PageContainer from "@/components/ui/PageContainer";
import { Card, CardHeader, CardTitle, CardContent, CardDescription, CardFooter } from "@/components/ui/Card";
import { Badge, StatusBadge, TrendIndicator } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Sheet, Modal, Tooltip, Dropdown } from "@/components/ui/Overlays";
import { cn } from "@/lib/utils";

import {
  INITIAL_MODELS,
  AIModel,
  ModelStatus,
  ModelHealth,
  ModelFramework,
  ModelEnvironment,
  VersionLog,
  EnvironmentStatus,
  ModelActivity,
  MetricSnapshot
} from "@/lib/models_data";

// Custom color mappings matching admin dashboard styling
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

type TabType = "overview" | "performance" | "versions" | "deployment" | "explainability" | "training" | "monitoring" | "logs";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default function AIModelDetailsPage(props: PageProps) {
  const params = React.use(props.params);
  const modelId = params.id;

  const [mounted, setMounted] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isError, setIsError] = useState(false);
  const [lastSyncTime, setLastSyncTime] = useState("");

  // Target Model Data
  const [model, setModel] = useState<AIModel | null>(null);

  // Tab State
  const [activeTab, setActiveTab] = useState<TabType>("overview");

  // Comparison version selections
  const [compareVersion, setCompareVersion] = useState<string>("");

  // Logs table query states
  const [logSearch, setLogSearch] = useState("");
  const [logLevel, setLogLevel] = useState<"All" | "INFO" | "WARN" | "ERROR">("All");
  const [logPage, setLogPage] = useState(1);
  const logPageSize = 6;

  // Modal operational triggers
  const [isDeployOpen, setIsDeployOpen] = useState(false);
  const [isRollbackOpen, setIsRollbackOpen] = useState(false);
  const [isRestartOpen, setIsRestartOpen] = useState(false);
  const [isArchiveOpen, setIsArchiveOpen] = useState(false);
  const [isCloneOpen, setIsCloneOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);

  // Form payload states
  const [deployEnv, setDeployEnv] = useState<ModelEnvironment>("Staging");
  const [cloneName, setCloneName] = useState("");
  const [cloneVersion, setCloneVersion] = useState("v1.0.0");
  const [cloneEnv, setCloneEnv] = useState<ModelEnvironment>("Development");

  // Sync data safely
  useEffect(() => {
    setMounted(true);
    setLastSyncTime(new Date().toLocaleTimeString());

    const found = INITIAL_MODELS.find(m => m.id === modelId);
    if (found) {
      setModel(found);
      // Set default comparison version if exists
      if (found.versions.length > 1) {
        setCompareVersion(found.versions[1].version);
      }
    } else {
      // Fallback
      const defaultModel = INITIAL_MODELS[0];
      setModel(defaultModel);
      setCompareVersion(defaultModel.versions[1]?.version || "");
      toast.error(`Model ID '${modelId}' not found. Loading Credit Risk profile.`);
    }

    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 600);

    return () => clearTimeout(timer);
  }, [modelId]);

  // Refresh sync
  const handleRefresh = useCallback(() => {
    setIsLoading(true);
    setIsError(false);
    setTimeout(() => {
      const found = INITIAL_MODELS.find(m => m.id === modelId) || INITIAL_MODELS[0];
      setModel(found);
      setLastSyncTime(new Date().toLocaleTimeString());
      setIsLoading(false);
      toast.success("AI Model metrics data re-synchronized.");
    }, 600);
  }, [modelId]);

  // Update State & Audit logs helper
  const saveModelChanges = useCallback((updated: AIModel, activityType: ModelActivity["type"], detail: string) => {
    const activity: ModelActivity = {
      id: `act-dt-${Date.now()}`,
      type: activityType,
      timestamp: new Date().toISOString().replace("T", " ").substring(0, 16),
      operator: "Rahul Chahar (AI Engineer)",
      detail
    };
    const saved = {
      ...updated,
      activities: [activity, ...updated.activities]
    };
    setModel(saved);
    toast.success("Model state updated successfully.");
  }, []);

  // Deploy trigger submit
  const handleDeploySubmit = () => {
    if (!model) return;
    
    // Simulate env change
    const updatedEnvs = model.environments.map(e => {
      if (e.name === deployEnv) {
        return {
          ...e,
          version: model.version,
          deployedAt: new Date().toISOString().replace("T", " ").substring(0, 16),
          status: "Active" as const,
          health: "Healthy" as ModelHealth
        };
      }
      return e;
    });

    const updatedModel: AIModel = {
      ...model,
      environment: deployEnv,
      status: deployEnv === "Production" ? "Production" : deployEnv === "Staging" ? "Staging" : "Development",
      health: "Healthy",
      environments: updatedEnvs
    };

    saveModelChanges(updatedModel, "Deployment Completed", `Deployed model version ${model.version} to cluster namespace [${deployEnv}].`);
    setIsDeployOpen(false);
  };

  // Rollback trigger submit
  const handleRollbackSubmit = () => {
    if (!model) return;
    if (model.versions.length < 2) {
      toast.error("No rollback candidate releases registered.");
      return;
    }

    const previous = model.versions[1];
    const updatedModel: AIModel = {
      ...model,
      version: previous.version,
      accuracy: previous.accuracy * 100, // percentage display
      latency: previous.latency,
      health: "Healthy",
      versions: model.versions.filter(v => v.version !== previous.version)
    };

    saveModelChanges(updatedModel, "Rollback", `Rolled back production container endpoint from v4.2.1 to previous stable release ${previous.version}.`);
    setIsRollbackOpen(false);
  };

  // Restart trigger
  const handleRestartSubmit = () => {
    if (!model) return;
    saveModelChanges(model, "Version Updated", `Re-booted cluster containers and cleared prediction weights cache pools.`);
    setIsRestartOpen(false);
  };

  // Archive trigger
  const handleArchiveSubmit = () => {
    if (!model) return;
    const updatedModel: AIModel = {
      ...model,
      status: "Archived",
      environment: "Archived",
      health: "Healthy"
    };

    saveModelChanges(updatedModel, "Archive", "Archived model weights. LIVE load balancers dismantled.");
    setIsArchiveOpen(false);
  };

  // Clone trigger
  const handleCloneSubmit = () => {
    if (!model) return;
    toast.success(`Cloned copy '${cloneName}' provisioned in ${cloneEnv}.`);
    setIsCloneOpen(false);
  };

  // Delete trigger
  const handleDeleteSubmit = () => {
    if (!model) return;
    if (model.status === "Production") {
      toast.error("Production models cannot be expunged.");
      return;
    }
    toast.info(`Model profile ${model.name} purged from database.`);
    setIsDeleteOpen(false);
  };

  // Export report
  const handleGenerateReport = () => {
    if (!model) return;
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(model, null, 2));
    const anchor = document.createElement("a");
    anchor.setAttribute("href", dataStr);
    anchor.setAttribute("download", `model_report_audit_${model.id}_${Date.now()}.json`);
    document.body.appendChild(anchor);
    anchor.click();
    anchor.remove();
    toast.success("AI Model metrics diagnostic report generated.");
  };

  // Logs list filtering
  const generatedLogsList = useMemo(() => {
    if (!model) return [];
    
    // Seed detailed logs if they are short in data
    const logs = [
      { timestamp: "2026-07-13 14:00:00", level: "INFO" as const, component: "API Gateway", msg: "Traffic endpoint routed to risk auto-scaling cluster.", status: "SUCCESS" },
      { timestamp: "2026-07-13 14:02:15", level: "INFO" as const, component: "Container Pod", msg: "Memory pool allocation checked. Utilization 42%.", status: "SUCCESS" },
      { timestamp: "2026-07-13 14:05:40", level: "WARN" as const, component: "Drift Monitor", msg: "PSI warning threshold crossed on feature: quick_liquidity_ratio.", status: "WARNING" },
      { timestamp: "2026-07-13 14:10:12", level: "INFO" as const, component: "API Gateway", msg: "Batch inference task initialized for loan portfolio evaluations.", status: "SUCCESS" },
      { timestamp: "2026-07-13 14:12:30", level: "ERROR" as const, component: "Inference Engine", msg: "Invalid input schema: Missing parameter 'net_stable_funding_ratio'.", status: "FAILED" },
      { timestamp: "2026-07-13 14:15:55", level: "INFO" as const, component: "Database Pool", msg: "Training reference matrices synced successfully from S3 bucket.", status: "SUCCESS" },
      { timestamp: "2026-07-13 14:20:00", level: "WARN" as const, component: "Inference Engine", msg: "Inference response latency exceeded 50ms cap (avg: 54ms).", status: "WARNING" }
    ];

    return logs.filter(log => {
      const matchesSearch = log.msg.toLowerCase().includes(logSearch.toLowerCase()) || log.component.toLowerCase().includes(logSearch.toLowerCase());
      const matchesLevel = logLevel === "All" || log.level === logLevel;
      return matchesSearch && matchesLevel;
    });
  }, [model, logSearch, logLevel]);

  const paginatedLogs = useMemo(() => {
    const startIndex = (logPage - 1) * logPageSize;
    return generatedLogsList.slice(startIndex, startIndex + logPageSize);
  }, [generatedLogsList, logPage]);

  // Model comparison specs mapping
  const comparisonData = useMemo(() => {
    if (!model || !compareVersion) return null;
    
    // Find version
    const ver = model.versions.find(v => v.version === compareVersion);
    if (!ver) return null;

    return {
      current: {
        version: model.version,
        accuracy: model.accuracy,
        latency: model.latency,
        predictions: model.predictions,
        confidence: model.metrics.confidence,
        precision: model.metrics.precision,
        recall: model.metrics.recall,
        f1Score: model.metrics.f1Score
      },
      comparison: {
        version: ver.version,
        accuracy: ver.accuracy * 100, // convert back to percentage if metric is 0-1
        latency: ver.latency,
        predictions: ver.predictions,
        confidence: ver.accuracy * 100 * 0.98, // mock confidence
        precision: ver.accuracy * 0.99,
        recall: ver.accuracy * 1.01,
        f1Score: ver.accuracy
      }
    };
  }, [model, compareVersion]);

  if (!mounted || !model) return null;

  return (
    <PageContainer>
      
      {/* Dynamic Header */}
      <div className="flex flex-col gap-4 pb-5 border-b border-border mb-6">
        <div className="flex items-center gap-2">
          <Link
            href="/admin/models"
            className="inline-flex items-center gap-1.5 text-xs text-foreground-secondary hover:text-foreground hover:bg-surface-hover px-2.5 py-1 rounded-sm border border-border transition-colors font-medium outline-none focus-visible:outline-2"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            <span>Back to Registry</span>
          </Link>
        </div>

        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex items-start gap-3">
            <div className="h-11 w-11 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center text-primary flex-shrink-0 mt-1 select-none">
              <Cpu className="h-6 w-6" />
            </div>
            <div className="flex flex-col text-left">
              <h1 className="text-2xl font-heading font-semibold text-foreground tracking-tight flex items-center gap-2.5">
                <span>{model.name}</span>
                <span className="text-sm font-mono text-foreground-secondary bg-surface-elevated border border-border px-2 py-0.5 rounded-sm">
                  {model.version}
                </span>
              </h1>
              <p className="text-sm text-foreground-secondary font-sans leading-relaxed mt-0.5">
                Inspect model metadata, deployment history, operational health, explainability, performance metrics and lifecycle management.
              </p>
            </div>
          </div>

          {/* Header Action Controls */}
          <div className="flex flex-wrap items-center gap-2.5 select-none">
            <Button variant="ghost" size="sm" className="text-[10px] opacity-40 hover:opacity-100 cursor-pointer hidden md:flex" onClick={() => setIsError(true)}>
              Simulate Failure
            </Button>
            <Button variant="outline" size="sm" onClick={handleRefresh} disabled={isLoading}>
              <RefreshCw className={cn("h-4 w-4 shrink-0", isLoading && "animate-spin")} />
              Refresh
            </Button>
            <Button variant="outline" size="sm" onClick={handleGenerateReport}>
              <Download className="h-4 w-4 shrink-0" />
              Export Metadata
            </Button>
            <Button variant="outline" size="sm" onClick={() => { setCloneName(`${model.name} Clone`); setIsCloneOpen(true); }}>
              Clone Model
            </Button>
            <Button variant="outline" size="sm" onClick={() => setIsRollbackOpen(true)}>
              Rollback
            </Button>
            <Button variant="outline" size="sm" onClick={() => setIsArchiveOpen(true)}>
              Archive
            </Button>
            <Button variant="primary" size="sm" onClick={() => setIsDeployOpen(true)}>
              Deploy New Version
            </Button>
          </div>
        </div>
      </div>

      {/* Synchronized diagnostic lock panel */}
      {isError ? (
        <Card className="border-critical/30 bg-critical/5 shadow-xs animate-fadeIn mb-6">
          <CardContent className="py-12 flex flex-col items-center justify-center text-center gap-4 font-sans text-xs">
            <AlertCircle className="h-12 w-12 text-critical" />
            <div className="space-y-1 max-w-md">
              <h2 className="font-heading font-semibold text-lg text-foreground">Diagnostic Telemetry Disconnected</h2>
              <p className="text-sm text-foreground-secondary leading-relaxed">
                Could not pull CPU resources allocations and live endpoints logs for model ID: {model.id}.
              </p>
            </div>
            <div className="pt-2 flex gap-3">
              <Button variant="primary" onClick={handleRefresh}>
                Reconnect Diagnostics
              </Button>
              <Button variant="outline" onClick={() => setIsError(false)}>
                Bypass Errors
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-6 md:space-y-8 animate-fadeIn">
          
          {/* ================================================== */}
          {/* MODEL SUMMARY HERO PANEL */}
          {/* ================================================== */}
          <Card className="bg-surface border-border">
            <CardContent className="p-5 font-sans text-xs flex flex-col gap-4 text-left">
              <div className="flex items-center justify-between border-b border-border/40 pb-3 flex-wrap gap-3">
                <span className="font-heading font-bold text-sm text-foreground">Model Status Hero Overview</span>
                <div className="flex gap-2 items-center select-none">
                  <Badge variant={model.status === "Production" ? "success" : model.status === "Staging" ? "forecast" : "ai"}>
                    {model.status}
                  </Badge>
                  <StatusBadge status={model.health === "Healthy" ? "active" : model.health === "Degraded" ? "pending" : "failed"} />
                </div>
              </div>
              
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-y-4 gap-x-6 text-foreground-secondary">
                <div className="space-y-1">
                  <span className="text-[10px] uppercase font-bold text-foreground-muted tracking-wider">Architecture Type</span>
                  <p className="font-semibold text-foreground text-xs leading-none">{model.type}</p>
                </div>
                <div className="space-y-1">
                  <span className="text-[10px] uppercase font-bold text-foreground-muted tracking-wider">Framework</span>
                  <p className="font-semibold text-foreground text-xs font-mono leading-none">{model.framework}</p>
                </div>
                <div className="space-y-1">
                  <span className="text-[10px] uppercase font-bold text-foreground-muted tracking-wider">Created Date</span>
                  <p className="font-semibold text-foreground text-xs font-mono leading-none">{model.createdDate}</p>
                </div>
                <div className="space-y-1">
                  <span className="text-[10px] uppercase font-bold text-foreground-muted tracking-wider">Last Deployment</span>
                  <p className="font-semibold text-foreground text-xs font-mono leading-none">{model.lastUpdated}</p>
                </div>
                <div className="space-y-1">
                  <span className="text-[10px] uppercase font-bold text-foreground-muted tracking-wider">Active Division</span>
                  <p className="font-semibold text-foreground text-xs leading-none">{model.owner}</p>
                </div>
                <div className="space-y-1">
                  <span className="text-[10px] uppercase font-bold text-foreground-muted tracking-wider">Dataset Registry</span>
                  <p className="font-semibold text-foreground text-xs font-mono truncate max-w-[120px] leading-none" title={model.datasetName}>{model.datasetName}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* ================================================== */}
          {/* 8 MODEL HEALTH KPI CARDS */}
          {/* ================================================== */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 font-sans select-none">
            {[
              { label: "Model Accuracy", val: `${model.accuracy}%`, trend: 0.8, icon: CheckCircle2, sparkline: [93.1, 93.5, 93.8, 94.0, 94.5, model.accuracy] },
              { label: "Model Precision", val: `${(model.metrics.precision * 100).toFixed(1)}%`, trend: 1.2, icon: ShieldCheck, sparkline: [91.0, 91.5, 92.0, 92.5, 93.0, model.metrics.precision * 100] },
              { label: "Model Recall", val: `${(model.metrics.recall * 100).toFixed(1)}%`, trend: 0.5, icon: TargetIndicator, sparkline: [93.0, 93.5, 94.0, 94.2, 94.8, model.metrics.recall * 100] },
              { label: "F1 Score", val: `${(model.metrics.f1Score * 100).toFixed(1)}%`, trend: 0.9, icon: Activity, sparkline: [92.0, 92.5, 93.0, 93.4, 94.0, model.metrics.f1Score * 100] },
              { label: "ROC-AUC", val: model.metrics.rocAuc, trend: 0.2, icon: Sparkles, sparkline: [0.95, 0.955, 0.96, 0.965, 0.97, model.metrics.rocAuc] },
              { label: "Average Latency", val: `${model.latency}ms`, trend: -5.4, icon: Zap, sparkline: [22.0, 21.5, 20.8, 19.5, 19.0, model.latency] },
              { label: "Predictions today", val: model.predictions >= 1000000 ? `${(model.predictions/1000000).toFixed(2)}M` : model.predictions.toLocaleString(), trend: 12.8, icon: Database, sparkline: [38, 41, 45, 52, 58, 65] },
              { label: "Confidence score", val: `${model.metrics.confidence}%`, trend: 1.1, icon: Cpu, sparkline: [94.0, 94.5, 95.0, 95.5, 96.0, model.metrics.confidence] }
            ].map((card, idx) => {
              const Icon = card.icon || Cpu;
              return (
                <Card key={idx} interactive className="hover:-translate-y-0.5 transition-all duration-200 cursor-pointer">
                  <CardContent className="pt-4 p-4 flex flex-col gap-2 relative">
                    <div className="flex items-center justify-between">
                      <span className="text-[9px] font-bold text-foreground-secondary uppercase tracking-wider truncate max-w-[120px]">{card.label}</span>
                      <Icon className="h-4 w-4 text-foreground-muted" />
                    </div>
                    {isLoading ? (
                      <div className="space-y-2 animate-pulse pt-1">
                        <div className="h-5 bg-border rounded-sm w-3/4" />
                        <div className="h-3 bg-border rounded-sm w-1/2" />
                      </div>
                    ) : (
                      <div className="flex flex-col">
                        <span className="text-xl font-bold font-mono text-foreground leading-none">{card.val}</span>
                        <div className="flex items-center justify-between mt-1.5">
                          <TrendIndicator value={card.trend} className="text-[10px]" />
                          <svg className="w-10 h-4 overflow-visible shrink-0" viewBox="0 0 10 4">
                            <polyline
                              fill="none"
                              stroke={card.trend > 0 && idx !== 5 ? COLORS.positive : card.trend < 0 && idx === 5 ? COLORS.positive : COLORS.critical}
                              strokeWidth="0.8"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              points={card.sparkline
                                .map((val, i) => `${(i / (card.sparkline.length - 1)) * 10}, ${4 - ((val - Math.min(...card.sparkline)) / (Math.max(...card.sparkline) - Math.min(...card.sparkline) || 1)) * 4}`)
                                .join(" ")}
                            />
                          </svg>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {/* ================================================== */}
          {/* TAB LAYOUT SYSTEM */}
          {/* ================================================== */}
          <div className="flex flex-col gap-6">
            
            {/* Scrollable Tabs bar */}
            <div className="border-b border-border overflow-x-auto flex select-none scrollbar-none gap-2">
              {[
                { id: "overview", label: "Overview details" },
                { id: "performance", label: "Interactive Performance" },
                { id: "versions", label: "Versions timeline" },
                { id: "deployment", label: "Environments Deployment" },
                { id: "explainability", label: "SHAP Explainability" },
                { id: "training", label: "Training configurations" },
                { id: "monitoring", label: "Diagnostics Monitoring" },
                { id: "logs", label: "Container Logs" }
              ].map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as TabType)}
                  className={cn(
                    "px-4.5 py-3 text-xs font-semibold border-b-2 font-sans shrink-0 whitespace-nowrap transition-colors outline-none",
                    activeTab === tab.id 
                      ? "border-primary text-primary" 
                      : "border-transparent text-foreground-secondary hover:text-foreground hover:bg-surface-hover/30"
                  )}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Content Switcher */}
            <div className="min-h-[400px]">
              
              {/* TAB 1: OVERVIEW */}
              {activeTab === "overview" && (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-fadeIn">
                  
                  {/* Left Side: General description */}
                  <div className="lg:col-span-2 space-y-6 text-left">
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-base">Identity Context & Objectives</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4 text-sm leading-relaxed text-foreground-secondary font-sans">
                        <p>{model.description}</p>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                          <div className="p-3.5 border border-border/80 bg-surface rounded-sm">
                            <span className="text-[10px] uppercase font-bold text-foreground-muted block mb-1">Business Purpose</span>
                            <p className="text-foreground leading-normal">{model.description}</p>
                          </div>
                          <div className="p-3.5 border border-border/80 bg-surface rounded-sm">
                            <span className="text-[10px] uppercase font-bold text-foreground-muted block mb-1">Target Prediction Variable</span>
                            <p className="text-foreground leading-none font-semibold">default_probability (boolean)</p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    {/* Features list table */}
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-base">Input Features Schema</CardTitle>
                        <CardDescription>Input fields count: {model.featureCount} variables defined in schema validation rules.</CardDescription>
                      </CardHeader>
                      <CardContent className="p-0 border-t border-border/60">
                        <div className="overflow-x-auto">
                          <table className="w-full text-left font-sans text-xs">
                            <thead>
                              <tr className="border-b border-border bg-surface-elevated/40 text-[9px] font-bold uppercase tracking-wider text-foreground-secondary">
                                <th className="p-3">Feature Field Name</th>
                                <th className="p-3">Data Type</th>
                                <th className="p-3">Imputation Rule</th>
                                <th className="p-3 text-right">Drift Status</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-border/50 text-foreground-secondary">
                              {[
                                { name: "debt_to_income_ratio", type: "float32", rule: "Mean Imputation", status: "Healthy" },
                                { name: "quick_liquidity_ratio", type: "float32", rule: "Forward Fill", status: "Healthy" },
                                { name: "credit_score", type: "int32", rule: "Median Imputation", status: "Healthy" },
                                { name: "sector_volatility_idx", type: "float32", rule: "Static Constant (0.0)", status: "Healthy" }
                              ].map(f => (
                                <tr key={f.name}>
                                  <td className="p-3 font-mono text-foreground font-semibold">{f.name}</td>
                                  <td className="p-3 font-mono">{f.type}</td>
                                  <td className="p-3">{f.rule}</td>
                                  <td className="p-3 text-right"><span className="inline-flex h-2 w-2 rounded-full bg-positive" /></td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </CardContent>
                    </Card>
                  </div>

                  {/* Right Side: Parameters details */}
                  <div className="space-y-6 text-left">
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-base">Environment Specifications</CardTitle>
                      </CardHeader>
                      <CardContent className="p-0 border-t border-border/60">
                        <div className="divide-y divide-border text-xs font-sans text-foreground-secondary">
                          <div className="flex justify-between p-3.5"><span className="text-foreground-muted">Programming Code:</span> <span className="font-semibold text-foreground">Python 3.11</span></div>
                          <div className="flex justify-between p-3.5"><span className="text-foreground-muted">Framework Version:</span> <span className="font-semibold text-foreground font-mono">{model.framework} 2.1.2</span></div>
                          <div className="flex justify-between p-3.5"><span className="text-foreground-muted">Output Classes:</span> <span className="font-semibold text-foreground">2 (Probability score 0-1)</span></div>
                          <div className="flex justify-between p-3.5"><span className="text-foreground-muted">Dataset:</span> <span className="font-semibold text-foreground font-mono">{model.datasetName}</span></div>
                          <div className="flex justify-between p-3.5"><span className="text-foreground-muted">Repository:</span> <a href={`https://${model.repositoryLink}`} target="_blank" rel="noopener noreferrer" className="font-semibold text-primary hover:underline flex items-center gap-1 font-mono">Git URL <ExternalLink className="h-3 w-3" /></a></div>
                        </div>
                      </CardContent>
                    </Card>

                    {/* AI Recommendations warnings */}
                    <Card className="border-warning/30 bg-warning/5">
                      <CardHeader className="pb-2">
                        <CardTitle className="text-xs font-bold text-warning uppercase tracking-widest flex items-center gap-1.5">
                          <AlertTriangle className="h-4 w-4 shrink-0" />
                          AI Suggestions
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-3 font-sans text-xs text-foreground-secondary leading-relaxed">
                        <div className="border-l-2 border-warning pl-2">
                          <span className="font-bold text-foreground block">Drift Warning:</span>
                          quick_liquidity_ratio feature drift detected. Consider re-triggering training scheduler soon.
                        </div>
                        <div className="border-l-2 border-primary pl-2">
                          <span className="font-bold text-foreground block">Resource Upgrade recommended:</span>
                          Average transaction categorization latencies climbed to 32ms. Upgrade target container memory limits.
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </div>
              )}

              {/* TAB 2: PERFORMANCE */}
              {activeTab === "performance" && (
                <div className="space-y-6 animate-fadeIn">
                  
                  {/* Accuracy & Latency lines graphs */}
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 text-left">
                    <Card className="lg:col-span-2">
                      <CardHeader>
                        <CardTitle className="text-base">Metrics Progress History</CardTitle>
                        <CardDescription>Visualizing model accuracy and predictions logs across training epoch cycles.</CardDescription>
                      </CardHeader>
                      <CardContent className="h-[250px] w-full pb-0 select-none">
                        <ResponsiveContainer width="100%" height="100%">
                          <LineChart data={model.versions.slice().reverse().map((v, i) => ({ run: `Run ${i+1}`, acc: v.accuracy * 100, lat: v.latency }))} margin={{ top: 5, right: 10, left: -25, bottom: 5 }}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" opacity={0.3} />
                            <XAxis dataKey="run" tick={{ fontSize: 9 }} />
                            <YAxis tick={{ fontSize: 9 }} />
                            <RechartsTooltip />
                            <Legend wrapperStyle={{ fontSize: 10 }} />
                            <Line type="monotone" name="Accuracy (%)" dataKey="acc" stroke={COLORS.primary} strokeWidth={2} dot={{ r: 3 }} />
                            <Line type="monotone" name="Latency (ms)" dataKey="lat" stroke={COLORS.forecast} strokeWidth={2} dot={{ r: 3 }} />
                          </LineChart>
                        </ResponsiveContainer>
                      </CardContent>
                    </Card>

                    {/* Confusion matrix grid */}
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-base">Inference Outcomes Matrix</CardTitle>
                        <CardDescription>Confusion outcomes calculated on evaluation holdout sets.</CardDescription>
                      </CardHeader>
                      <CardContent className="flex flex-col justify-center items-center h-[200px] font-sans">
                        <div className="grid grid-cols-2 gap-2 w-48 h-48 text-center text-xs relative mt-3">
                          <div className="absolute -top-4 left-1/4 -translate-x-1/2 text-[8px] font-bold text-foreground-secondary uppercase">Predicted Neg</div>
                          <div className="absolute -top-4 right-1/4 translate-x-1/2 text-[8px] font-bold text-foreground-secondary uppercase">Predicted Pos</div>
                          
                          <div className="bg-positive/10 border border-positive/20 rounded-xs flex flex-col items-center justify-center p-3">
                            <span className="font-mono font-bold text-foreground text-sm">88.5%</span>
                            <span className="text-[8px] text-foreground-muted mt-0.5">True Neg (TN)</span>
                          </div>
                          <div className="bg-critical/5 border border-critical/10 rounded-xs flex flex-col items-center justify-center p-3">
                            <span className="font-mono font-bold text-foreground text-sm">2.1%</span>
                            <span className="text-[8px] text-foreground-muted mt-0.5">False Pos (FP)</span>
                          </div>
                          <div className="bg-critical/5 border border-critical/10 rounded-xs flex flex-col items-center justify-center p-3">
                            <span className="font-mono font-bold text-foreground text-sm">3.4%</span>
                            <span className="text-[8px] text-foreground-muted mt-0.5">False Neg (FN)</span>
                          </div>
                          <div className="bg-positive/10 border border-positive/20 rounded-xs flex flex-col items-center justify-center p-3">
                            <span className="font-mono font-bold text-foreground text-sm">6.0%</span>
                            <span className="text-[8px] text-foreground-muted mt-0.5">True Pos (TP)</span>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>

                  {/* ROC Curves and PR Curves */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-left">
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-base">ROC Curve Validation</CardTitle>
                        <CardDescription>Live curve plotting True Positive vs False Positive rates (ROC AUC: {model.metrics.rocAuc}).</CardDescription>
                      </CardHeader>
                      <CardContent className="h-48 flex justify-center items-center select-none pt-0">
                        {/* Custom SVG Drawing the ROC Curve */}
                        <svg className="w-full max-w-[280px] h-40 overflow-visible" viewBox="0 0 100 100">
                          {/* Grid lines */}
                          <line x1="0" y1="0" x2="0" y2="100" stroke="#cbd5e1" strokeWidth="0.5" />
                          <line x1="0" y1="100" x2="100" y2="100" stroke="#cbd5e1" strokeWidth="0.5" />
                          <line x1="0" y1="100" x2="100" y2="0" stroke="#cbd5e1" strokeWidth="0.3" strokeDasharray="2 2" />
                          
                          {/* Curve line */}
                          <path
                            d="M 0,100 Q 10,15 100,0"
                            fill="none"
                            stroke={COLORS.primary}
                            strokeWidth="2"
                          />
                          <circle cx="10" cy="15" r="2" fill={COLORS.primary} />
                          
                          {/* Axis labels */}
                          <text x="50" y="112" fontSize="6" textAnchor="middle" fill="#64748b" className="font-sans">False Positive Rate</text>
                          <text x="-50" y="-8" fontSize="6" textAnchor="middle" transform="rotate(-90)" fill="#64748b" className="font-sans">True Positive Rate</text>
                        </svg>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader>
                        <CardTitle className="text-base">Precision-Recall Curve</CardTitle>
                        <CardDescription>Attribution tradeoff values mapping precision thresholds against recall values.</CardDescription>
                      </CardHeader>
                      <CardContent className="h-48 flex justify-center items-center select-none pt-0">
                        {/* Custom SVG Drawing the PR Curve */}
                        <svg className="w-full max-w-[280px] h-40 overflow-visible" viewBox="0 0 100 100">
                          {/* Grid lines */}
                          <line x1="0" y1="0" x2="0" y2="100" stroke="#cbd5e1" strokeWidth="0.5" />
                          <line x1="0" y1="100" x2="100" y2="100" stroke="#cbd5e1" strokeWidth="0.5" />
                          
                          {/* Curve line */}
                          <path
                            d="M 0,10 H 70 Q 80,12 100,100"
                            fill="none"
                            stroke={COLORS.ai}
                            strokeWidth="2"
                          />
                          <circle cx="70" cy="10" r="2" fill={COLORS.ai} />
                          
                          {/* Axis labels */}
                          <text x="50" y="112" fontSize="6" textAnchor="middle" fill="#64748b" className="font-sans">Recall Score</text>
                          <text x="-50" y="-8" fontSize="6" textAnchor="middle" transform="rotate(-90)" fill="#64748b" className="font-sans">Precision Score</text>
                        </svg>
                      </CardContent>
                    </Card>
                  </div>
                </div>
              )}

              {/* TAB 3: VERSION HISTORY & COMPARE */}
              {activeTab === "versions" && (
                <div className="space-y-6 animate-fadeIn text-left">
                  
                  {/* Version Timeline */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-base">Release Versions Register</CardTitle>
                    </CardHeader>
                    <CardContent className="p-0 border-t border-border/60">
                      <div className="overflow-x-auto">
                        <table className="w-full text-left font-sans text-xs">
                          <thead>
                            <tr className="border-b border-border bg-surface-elevated/40 text-[9px] font-bold uppercase tracking-wider text-foreground-secondary">
                              <th className="p-3">Version Tag</th>
                              <th className="p-3">Release Date</th>
                              <th className="p-3">Environment</th>
                              <th className="p-3">Status</th>
                              <th className="p-3">Performance Metrics</th>
                              <th className="p-3 text-right">Operational Actions</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-border/60 text-foreground-secondary">
                            {model.versions.map(v => (
                              <tr key={v.id} className="hover:bg-surface-hover/30 transition-colors">
                                <td className="p-3 font-mono font-bold text-foreground">{v.version}</td>
                                <td className="p-3 font-mono">{v.updatedDate}</td>
                                <td className="p-3"><Badge variant="outline">{v.status}</Badge></td>
                                <td className="p-3">
                                  <span className={`inline-flex items-center gap-1 text-[10px] font-semibold ${v.health === "Healthy" ? "text-positive" : "text-critical"}`}>
                                    <span className={cn("h-1.5 w-1.5 rounded-full", v.health === "Healthy" ? "bg-positive" : "bg-critical")} />
                                    {v.health}
                                  </span>
                                </td>
                                <td className="p-3 font-mono text-foreground font-semibold">{(v.accuracy * 100).toFixed(1)}% Acc</td>
                                <td className="p-3 text-right">
                                  <div className="flex gap-2 justify-end select-none">
                                    <Button variant="ghost" size="sm" className="h-7 px-2 text-[10px]" onClick={() => { setCompareVersion(v.version); toast.info(`Comparing version ${v.version} side-by-side.`); }}>Compare</Button>
                                    <Button variant="ghost" size="sm" className="h-7 px-2 text-[10px]" onClick={() => setIsRollbackOpen(true)}>Rollback</Button>
                                  </div>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Side by side comparison dashboard */}
                  {comparisonData && (
                    <Card className="border-primary/20 bg-primary/2 flex flex-col gap-4 p-5">
                      <div className="flex items-center justify-between border-b border-border/40 pb-3 flex-wrap gap-3">
                        <div className="space-y-0.5">
                          <h4 className="font-bold text-sm text-foreground">Active Model Comparison Dashboard</h4>
                          <p className="text-[10px] text-foreground-secondary">Contrast current version parameters side-by-side with older runs.</p>
                        </div>
                        <div className="flex items-center gap-2 select-none">
                          <span className="text-[10px] text-foreground-muted font-bold uppercase">Compare with:</span>
                          <select
                            value={compareVersion}
                            onChange={(e) => setCompareVersion(e.target.value)}
                            className="bg-surface border border-border rounded-xs px-2.5 py-1 text-xs outline-none focus:border-primary cursor-pointer text-foreground font-semibold"
                          >
                            {model.versions.map(v => <option key={v.version} value={v.version}>{v.version}</option>)}
                          </select>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs font-sans">
                        <Card className="p-4 flex flex-col justify-between">
                          <span className="text-[9px] font-bold text-foreground-secondary uppercase tracking-widest block border-b border-border/20 pb-1.5 mb-2.5">Evaluation accuracy</span>
                          <div className="flex justify-between items-baseline mt-1">
                            <div className="text-center w-1/2">
                              <span className="text-lg font-mono font-bold text-foreground">{comparisonData.current.accuracy.toFixed(1)}%</span>
                              <span className="text-[8px] text-foreground-muted block uppercase mt-0.5">Current ({comparisonData.current.version})</span>
                            </div>
                            <div className="text-center w-1/2 border-l border-border/60">
                              <span className="text-lg font-mono font-bold text-foreground-secondary">{comparisonData.comparison.accuracy.toFixed(1)}%</span>
                              <span className="text-[8px] text-foreground-muted block uppercase mt-0.5">Prior ({comparisonData.comparison.version})</span>
                            </div>
                          </div>
                        </Card>

                        <Card className="p-4 flex flex-col justify-between">
                          <span className="text-[9px] font-bold text-foreground-secondary uppercase tracking-widest block border-b border-border/20 pb-1.5 mb-2.5">Response Latency</span>
                          <div className="flex justify-between items-baseline mt-1">
                            <div className="text-center w-1/2">
                              <span className="text-lg font-mono font-bold text-foreground">{comparisonData.current.latency}ms</span>
                              <span className="text-[8px] text-foreground-muted block uppercase mt-0.5">Current ({comparisonData.current.version})</span>
                            </div>
                            <div className="text-center w-1/2 border-l border-border/60">
                              <span className="text-lg font-mono font-bold text-foreground-secondary">{comparisonData.comparison.latency}ms</span>
                              <span className="text-[8px] text-foreground-muted block uppercase mt-0.5">Prior ({comparisonData.comparison.version})</span>
                            </div>
                          </div>
                        </Card>

                        <Card className="p-4 flex flex-col justify-between">
                          <span className="text-[9px] font-bold text-foreground-secondary uppercase tracking-widest block border-b border-border/20 pb-1.5 mb-2.5">Confidence Levels</span>
                          <div className="flex justify-between items-baseline mt-1">
                            <div className="text-center w-1/2">
                              <span className="text-lg font-mono font-bold text-foreground">{comparisonData.current.confidence.toFixed(1)}%</span>
                              <span className="text-[8px] text-foreground-muted block uppercase mt-0.5">Current ({comparisonData.current.version})</span>
                            </div>
                            <div className="text-center w-1/2 border-l border-border/60">
                              <span className="text-lg font-mono font-bold text-foreground-secondary">{comparisonData.comparison.confidence.toFixed(1)}%</span>
                              <span className="text-[8px] text-foreground-muted block uppercase mt-0.5">Prior ({comparisonData.comparison.version})</span>
                            </div>
                          </div>
                        </Card>
                      </div>
                    </Card>
                  )}
                </div>
              )}

              {/* TAB 4: DEPLOYMENT */}
              {activeTab === "deployment" && (
                <div className="space-y-6 animate-fadeIn text-left select-text">
                  <h3 className="text-sm font-semibold text-foreground select-none">Target Cluster Namespace Status</h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {model.environments.map(env => (
                      <Card key={env.name} className="border border-border">
                        <CardHeader className="p-4 border-b border-border/40 flex flex-row items-center justify-between select-none">
                          <CardTitle className="text-xs font-bold uppercase tracking-wider">{env.name} Environment</CardTitle>
                          <Badge variant={env.status === "Active" ? "success" : env.status === "Canary" ? "ai" : "outline"} className="scale-90">
                            {env.status}
                          </Badge>
                        </CardHeader>
                        <CardContent className="p-4 text-xs font-sans text-foreground-secondary space-y-2.5">
                          <div className="flex justify-between"><span className="text-foreground-muted">Deployed Version:</span> <span className="font-mono font-bold text-foreground">{env.version}</span></div>
                          <div className="flex justify-between"><span className="text-foreground-muted">Deployed Time:</span> <span className="font-mono text-foreground-secondary">{env.deployedAt}</span></div>
                          <div className="flex justify-between"><span className="text-foreground-muted">Average Latency:</span> <span className="font-mono text-foreground-secondary">{model.latency}ms</span></div>
                          <div className="flex justify-between"><span className="text-foreground-muted">Requests (Throughput):</span> <span className="font-mono text-foreground-secondary">1.2K req/sec</span></div>
                          <div className="flex justify-between"><span className="text-foreground-muted">Errors Rate percentage:</span> <span className="font-mono text-critical font-bold">0.02%</span></div>
                          <div className="flex justify-between select-none">
                            <span className="text-foreground-muted">Operational Health:</span>
                            <StatusBadge status={env.health === "Healthy" ? "active" : "failed"} className="scale-85" />
                          </div>
                        </CardContent>
                        <CardFooter className="p-3 bg-surface-elevated/20 border-t border-border/30 flex justify-end gap-2 select-none">
                          <Button variant="ghost" size="sm" className="h-8 px-2.5 text-[10px]" onClick={() => setIsRestartOpen(true)}>Restart pods</Button>
                          <Button variant="ghost" size="sm" className="h-8 px-2.5 text-[10px]" onClick={() => { setDeployEnv(env.name); setIsDeployOpen(true); }}>Promote candidate</Button>
                        </CardFooter>
                      </Card>
                    ))}
                  </div>

                  {/* System Dependencies card */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-base select-none">System Dependencies Schema</CardTitle>
                    </CardHeader>
                    <CardContent className="p-0 border-t border-border/60">
                      <div className="divide-y divide-border/60 font-sans text-xs text-foreground-secondary">
                        <div className="flex justify-between p-3.5"><span className="text-foreground-muted">Runtime Base:</span> <span className="font-semibold text-foreground font-mono">python:3.11-slim-bookworm</span></div>
                        <div className="flex justify-between p-3.5"><span className="text-foreground-muted">Required Packages:</span> <span className="font-semibold text-foreground font-mono">xgboost==2.0.3, scikit-learn==1.4.1, numpy==1.26.4, pandas==2.2.0</span></div>
                        <div className="flex justify-between p-3.5"><span className="text-foreground-muted">Target Host OS:</span> <span className="font-semibold text-foreground">Kubernetes (k8s-pod-deployment-v2)</span></div>
                        <div className="flex justify-between p-3.5"><span className="text-foreground-muted">Environment Variables:</span> <span className="font-semibold text-foreground font-mono">MODEL_BIN_URI, CUDA_VISIBLE_DEVICES=0, THREADS_CAP=8</span></div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              )}

              {/* TAB 5: EXPLAINABILITY */}
              {activeTab === "explainability" && (
                <div className="space-y-6 animate-fadeIn text-left">
                  
                  {/* Features importance bar chart */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-base">Global Feature Importance (SHAP values)</CardTitle>
                      <CardDescription>Relative contribution variables evaluated over cross-validation validation sets.</CardDescription>
                    </CardHeader>
                    <CardContent className="h-64 w-full select-none">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={[
                          { name: "Debt-to-Income (DTI)", shap: 0.38 },
                          { name: "Credit History Length", shap: 0.24 },
                          { name: "Sector Volatility Index", shap: 0.18 },
                          { name: "Quick Liquidity Ratio", shap: 0.12 },
                          { name: "Cash Reserve Cushion", shap: 0.08 }
                        ]} layout="vertical" margin={{ top: 5, right: 30, left: 10, bottom: 5 }}>
                          <CartesianGrid strokeDasharray="3 3" stroke="#cbd5e1" opacity={0.2} />
                          <XAxis type="number" tick={{ fontSize: 9 }} />
                          <YAxis dataKey="name" type="category" tick={{ fontSize: 9 }} width={140} />
                          <RechartsTooltip />
                          <Bar dataKey="shap" fill={COLORS.ai} radius={[0, 4, 4, 0]} barSize={15} />
                        </BarChart>
                      </ResponsiveContainer>
                    </CardContent>
                  </Card>

                  {/* Local explanations attribution detail path */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-base">Attribution Explanation Path</CardTitle>
                      <CardDescription>Attribution thresholds triggers mapping inference variables path decisions.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-3 font-sans text-xs text-foreground-secondary leading-normal select-text">
                      <div className="p-3 bg-surface-elevated/40 border border-border/80 rounded-sm">
                        <span className="font-bold text-foreground block mb-1">Decision Node 1:</span>
                        Is `debt_to_income_ratio` &gt; 0.35? (Weight path: +0.28 risk probability)
                      </div>
                      <div className="p-3 bg-surface-elevated/40 border border-border/80 rounded-sm">
                        <span className="font-bold text-foreground block mb-1">Decision Node 2:</span>
                        Is `credit_score` &lt; 650? (Weight path: +0.24 risk probability)
                      </div>
                      <div className="p-3 bg-surface-elevated/40 border border-border/80 rounded-sm">
                        <span className="font-bold text-foreground block mb-1">Decision Node 3:</span>
                        Is `quick_liquidity_ratio` &gt; 1.5? (Weight path: -0.12 risk probability)
                      </div>
                    </CardContent>
                  </Card>
                </div>
              )}

              {/* TAB 6: TRAINING */}
              {activeTab === "training" && (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-fadeIn text-left select-text">
                  
                  {/* Left Side: Datasets variables */}
                  <div className="lg:col-span-2 space-y-6">
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-base">Pipeline Dataset Manifests</CardTitle>
                      </CardHeader>
                      <CardContent className="p-0 border-t border-border/60">
                        <div className="divide-y divide-border text-xs font-sans text-foreground-secondary">
                          <div className="flex justify-between p-3.5"><span className="text-foreground-muted">Training Dataset path:</span> <span className="font-semibold text-foreground font-mono">s3://arthdrishti-datasets/train/credit_v5_train.parquet</span></div>
                          <div className="flex justify-between p-3.5"><span className="text-foreground-muted">Validation Dataset path:</span> <span className="font-semibold text-foreground font-mono">s3://arthdrishti-datasets/train/credit_v5_val.parquet</span></div>
                          <div className="flex justify-between p-3.5"><span className="text-foreground-muted">Test Dataset path:</span> <span className="font-semibold text-foreground font-mono">s3://arthdrishti-datasets/train/credit_v5_test.parquet</span></div>
                          <div className="flex justify-between p-3.5"><span className="text-foreground-muted">Training Execution Duration:</span> <span className="font-semibold text-foreground font-mono">2h 14m 12s</span></div>
                          <div className="flex justify-between p-3.5"><span className="text-foreground-muted">Maximum Epochs / Estimators:</span> <span className="font-semibold text-foreground font-mono">150 trees</span></div>
                          <div className="flex justify-between p-3.5"><span className="text-foreground-muted">Optimization Library:</span> <span className="font-semibold text-foreground font-mono">Adam Optimizer (lr=0.025)</span></div>
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader>
                        <CardTitle className="text-base">Training Execution Notes</CardTitle>
                      </CardHeader>
                      <CardContent className="text-xs leading-relaxed text-foreground-secondary font-sans">
                        <p>
                          Model weights training initialized on NVIDIA A10G Tensor Core GPU node clusters. Hyperparameter sweeps calculated over 5-fold cross validations. Initial early stopping patience counter limit reached at step 124 of estimators creation.
                        </p>
                      </CardContent>
                    </Card>
                  </div>

                  {/* Right Side: Training parameters details */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-base">Hyperparameter sweeps</CardTitle>
                    </CardHeader>
                    <CardContent className="p-0 border-t border-border/60">
                      <div className="divide-y divide-border text-xs font-sans text-foreground-secondary">
                        <div className="flex justify-between p-3.5"><span className="text-foreground-muted">learning_rate:</span> <span className="font-mono text-foreground font-bold">0.025</span></div>
                        <div className="flex justify-between p-3.5"><span className="text-foreground-muted">max_depth:</span> <span className="font-mono text-foreground font-bold">6</span></div>
                        <div className="flex justify-between p-3.5"><span className="text-foreground-muted">subsample:</span> <span className="font-mono text-foreground font-bold">0.82</span></div>
                        <div className="flex justify-between p-3.5"><span className="text-foreground-muted">colsample_bytree:</span> <span className="font-mono text-foreground font-bold">0.80</span></div>
                        <div className="flex justify-between p-3.5"><span className="text-foreground-muted">min_child_weight:</span> <span className="font-mono text-foreground font-bold">1.50</span></div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              )}

              {/* TAB 7: MONITORING */}
              {activeTab === "monitoring" && (
                <div className="space-y-6 animate-fadeIn text-left">
                  
                  {/* Throughput and Resource usages charts */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs font-sans select-none">
                    <Card className="p-4 flex flex-col gap-1 border border-border">
                      <span className="text-foreground-muted uppercase text-[9px] font-bold tracking-widest">Network availability</span>
                      <span className="font-mono text-xl font-bold text-foreground">99.98%</span>
                    </Card>
                    <Card className="p-4 flex flex-col gap-1 border border-border">
                      <span className="text-foreground-muted uppercase text-[9px] font-bold tracking-widest">Throughput volume</span>
                      <span className="font-mono text-xl font-bold text-foreground">1,245 req/s</span>
                    </Card>
                    <Card className="p-4 flex flex-col gap-1 border border-border">
                      <span className="text-foreground-muted uppercase text-[9px] font-bold tracking-widest">Active Alerts triggers</span>
                      <span className="font-mono text-xl font-bold text-warning">1 warning alert</span>
                    </Card>
                  </div>

                  {/* Resource usage bars */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-base">Container Resource allocations usage</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4 font-sans text-xs text-foreground-secondary">
                      <div className="space-y-1">
                        <div className="flex justify-between font-medium"><span>CPU utilization</span> <span>42% of 4 Cores</span></div>
                        <div className="w-full bg-border rounded-full h-2 overflow-hidden"><div className="bg-primary h-full rounded-full" style={{ width: "42%" }} /></div>
                      </div>
                      <div className="space-y-1">
                        <div className="flex justify-between font-medium"><span>GPU memory utilization</span> <span>28% of 16GB</span></div>
                        <div className="w-full bg-border rounded-full h-2 overflow-hidden"><div className="bg-ai h-full rounded-full" style={{ width: "28%" }} /></div>
                      </div>
                      <div className="space-y-1">
                        <div className="flex justify-between font-medium"><span>System memory usage</span> <span>65% of 8GB</span></div>
                        <div className="w-full bg-border rounded-full h-2 overflow-hidden"><div className="bg-forecast h-full rounded-full" style={{ width: "65%" }} /></div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              )}

              {/* TAB 8: LOGS */}
              {activeTab === "logs" && (
                <Card className="animate-fadeIn text-left select-text">
                  <CardHeader className="p-4 sm:p-5 border-b border-border/40 flex flex-row items-center justify-between flex-wrap gap-3">
                    <div className="space-y-0.5">
                      <CardTitle className="text-sm font-semibold select-none">Container Logs (stdout/stderr)</CardTitle>
                    </div>
                    <div className="flex items-center gap-2 select-none">
                      <Button variant="outline" size="sm" onClick={() => { toast.success("Logs stream exported to logs.csv."); }}>
                        Export Logs
                      </Button>
                    </div>
                  </CardHeader>

                  {/* Log filters bar */}
                  <div className="p-4 bg-surface-elevated/40 border-b border-border flex flex-col md:flex-row items-center gap-4 text-xs font-sans">
                    <div className="relative flex-1 w-full">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-foreground-muted pointer-events-none" />
                      <input
                        type="text"
                        value={logSearch}
                        onChange={(e) => { setLogSearch(e.target.value); setLogPage(1); }}
                        placeholder="Search logs message contents or component name..."
                        className="w-full pl-9 h-8 bg-surface border border-border focus:border-primary rounded-xs outline-none text-xs text-foreground placeholder-foreground-muted"
                      />
                    </div>
                    <div className="flex items-center gap-2 w-full md:w-auto select-none shrink-0 justify-end">
                      <span className="text-foreground-secondary font-semibold">Log Level:</span>
                      <div className="flex gap-1 bg-surface border border-border p-0.5 rounded-xs">
                        {["All", "INFO", "WARN", "ERROR"].map((level) => (
                          <button
                            key={level}
                            onClick={() => { setLogLevel(level as any); setLogPage(1); }}
                            className={cn(
                              "px-2.5 py-0.5 rounded-xs font-bold text-[10px] cursor-pointer transition-colors outline-none",
                              logLevel === level ? "bg-primary text-white" : "text-foreground-secondary hover:text-foreground"
                            )}
                          >
                            {level}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Logs table list */}
                  <CardContent className="p-0 overflow-x-auto">
                    <table className="w-full text-left font-sans text-xs">
                      <thead>
                        <tr className="border-b border-border bg-surface-elevated/20 text-[9px] font-bold uppercase tracking-wider text-foreground-secondary">
                          <th className="p-3">Timestamp</th>
                          <th className="p-3">Level</th>
                          <th className="p-3">Component</th>
                          <th className="p-3">Message</th>
                          <th className="p-3">Status</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-border/60 text-foreground-secondary font-mono text-[11px]">
                        {paginatedLogs.map((log, idx) => {
                          const levelColors = {
                            INFO: "text-positive bg-positive/10 border-positive/10",
                            WARN: "text-warning bg-warning/10 border-warning/10",
                            ERROR: "text-critical bg-critical/10 border-critical/10"
                          };
                          return (
                            <tr key={idx} className="hover:bg-surface-hover/30 transition-colors">
                              <td className="p-3 text-foreground-muted">{log.timestamp}</td>
                              <td className="p-3">
                                <Badge variant="outline" className={cn("scale-90 font-bold", levelColors[log.level])}>
                                  {log.level}
                                </Badge>
                              </td>
                              <td className="p-3 font-sans text-foreground font-semibold">{log.component}</td>
                              <td className={cn(
                                "p-3 font-sans leading-normal",
                                log.level === "ERROR" ? "text-critical font-medium" : log.level === "WARN" ? "text-warning" : "text-foreground-secondary"
                              )}>{log.msg}</td>
                              <td className="p-3">
                                <span className={`inline-flex items-center gap-1 font-bold ${log.status === "SUCCESS" ? "text-positive" : log.status === "WARNING" ? "text-warning" : "text-critical"}`}>
                                  {log.status}
                                </span>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </CardContent>

                  {/* Logs Pagination */}
                  <div className="p-3 border-t border-border flex items-center justify-between font-sans text-xs select-none">
                    <span className="text-foreground-secondary">
                      Logs: {(logPage-1)*logPageSize+1}-{Math.min(logPage*logPageSize, generatedLogsList.length)} of {generatedLogsList.length} filtered lines.
                    </span>
                    <div className="flex gap-1">
                      <Button variant="outline" size="sm" onClick={() => setLogPage(p => Math.max(1, p - 1))} disabled={logPage === 1}>Back</Button>
                      <Button variant="outline" size="sm" onClick={() => setLogPage(p => p + 1)} disabled={logPage * logPageSize >= generatedLogsList.length}>Next</Button>
                    </div>
                  </div>
                </Card>
              )}

            </div>
          </div>

          {/* ================================================== */}
          {/* MODEL LIFECYCLE STEP TIMELINE PANEL */}
          {/* ================================================== */}
          <Card className="text-left">
            <CardHeader>
              <CardTitle className="text-base select-none">Model Registry Lifecycle Stepper</CardTitle>
            </CardHeader>
            <CardContent className="p-5 border-t border-border/60">
              <div className="flex flex-col md:flex-row justify-between items-center md:items-start gap-6 font-sans text-xs select-none relative">
                {[
                  { label: "Created", desc: "Model weights indexed.", done: true, current: false },
                  { label: "Validated", desc: "Feature validation checks passed.", done: true, current: false },
                  { label: "Approved", desc: "Approved by Compliance AI.", done: true, current: false },
                  { label: "Deployed", desc: "Promoted to staging canary cluster.", done: model.status !== "Development", current: model.status === "Staging" },
                  { label: "Monitored", desc: "Diagnostic pipeline metrics synced.", done: model.status === "Production", current: model.status === "Production" },
                  { label: "Retired", desc: "Archived baseline.", done: model.status === "Archived", current: model.status === "Archived" }
                ].map((step, idx) => (
                  <div key={idx} className="flex flex-col items-center text-center max-w-[120px] relative w-full">
                    <div className={cn(
                      "h-8 w-8 rounded-full flex items-center justify-center font-bold text-xs border transition-all",
                      step.current 
                        ? "bg-primary border-primary text-white scale-110 shadow-sm"
                        : step.done 
                          ? "bg-positive/10 border-positive text-positive" 
                          : "bg-surface border-border text-foreground-muted"
                    )}>
                      {step.done && !step.current ? <CheckCircle className="h-4.5 w-4.5 shrink-0" /> : idx + 1}
                    </div>
                    <span className={cn(
                      "font-bold mt-2",
                      step.current ? "text-primary" : "text-foreground"
                    )}>{step.label}</span>
                    <p className="text-[10px] text-foreground-secondary leading-normal mt-1">{step.desc}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* ================================================== */}
      {/* DEPLOY MODAL DIALOG */}
      {/* ================================================== */}
      <Modal isOpen={isDeployOpen} onClose={() => setIsDeployOpen(false)} title="Deploy Model Version">
        <div className="space-y-4 font-sans text-xs">
          <div className="space-y-1">
            <label className="text-foreground-secondary font-bold">Select Target Environment</label>
            <select
              value={deployEnv}
              onChange={(e) => setDeployEnv(e.target.value as ModelEnvironment)}
              className="w-full h-9 px-2.5 bg-surface border border-border text-xs rounded-xs outline-none focus:border-primary text-foreground cursor-pointer"
            >
              <option value="Development">Development Sandbox</option>
              <option value="Testing">Testing QA</option>
              <option value="Staging">Staging Canary</option>
              <option value="Production">Production live</option>
            </select>
          </div>
          <p className="text-[10px] text-foreground-muted leading-relaxed">
            Traffic routing triggers canary checks before promotion to Production live load balancers.
          </p>
          <div className="flex justify-end gap-2 pt-4 border-t border-border/40 mt-4 select-none">
            <Button variant="outline" size="sm" onClick={() => setIsDeployOpen(false)}>Cancel</Button>
            <Button variant="primary" size="sm" onClick={handleDeploySubmit}>Deploy Version</Button>
          </div>
        </div>
      </Modal>

      {/* ROLLBACK MODAL DIALOG */}
      <Modal isOpen={isRollbackOpen} onClose={() => setIsRollbackOpen(false)} title="Rollback Version">
        <div className="space-y-4 font-sans text-xs">
          <p className="text-sm leading-relaxed text-foreground-secondary">
            Are you sure you want to roll back this active model endpoint to the previous stable release candidate?
          </p>
          <div className="flex justify-end gap-2 pt-4 border-t border-border/40 mt-4 select-none">
            <Button variant="outline" size="sm" onClick={() => setIsRollbackOpen(false)}>Cancel</Button>
            <Button variant="primary" size="sm" onClick={handleRollbackSubmit}>Confirm Rollback</Button>
          </div>
        </div>
      </Modal>

      {/* RESTART MODAL DIALOG */}
      <Modal isOpen={isRestartOpen} onClose={() => setIsRestartOpen(false)} title="Restart Cluster Pods">
        <div className="space-y-4 font-sans text-xs">
          <p className="text-sm leading-relaxed text-foreground-secondary">
            Restarting pods will re-initialize host memory blocks. Live inference requests will undergo temporary buffering delay.
          </p>
          <div className="flex justify-end gap-2 pt-4 border-t border-border/40 mt-4 select-none">
            <Button variant="outline" size="sm" onClick={() => setIsRestartOpen(false)}>Cancel</Button>
            <Button variant="primary" size="sm" onClick={handleRestartSubmit}>Restart Pods</Button>
          </div>
        </div>
      </Modal>

      {/* ARCHIVE MODAL DIALOG */}
      <Modal isOpen={isArchiveOpen} onClose={() => setIsArchiveOpen(false)} title="Archive Model weights">
        <div className="space-y-4 font-sans text-xs">
          <p className="text-sm leading-relaxed text-foreground-secondary">
            Archiving will terminate live route paths for this model ID. Binary weights will remain serialized in S3 storage folders.
          </p>
          <div className="flex justify-end gap-2 pt-4 border-t border-border/40 mt-4 select-none">
            <Button variant="outline" size="sm" onClick={() => setIsArchiveOpen(false)}>Cancel</Button>
            <Button variant="primary" size="sm" onClick={handleArchiveSubmit}>Archive Model</Button>
          </div>
        </div>
      </Modal>

      {/* CLONE MODAL DIALOG */}
      <Modal isOpen={isCloneOpen} onClose={() => setIsCloneOpen(false)} title="Clone Model Profile">
        <div className="space-y-4 font-sans text-xs">
          <div className="space-y-1">
            <label className="text-foreground-secondary font-bold">New Model Name</label>
            <input
              type="text"
              value={cloneName}
              onChange={(e) => setCloneName(e.target.value)}
              className="w-full h-9 px-3 bg-surface border border-border text-xs rounded-xs outline-none focus:border-primary text-foreground font-semibold"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-foreground-secondary font-bold">Clone Version</label>
              <input
                type="text"
                value={cloneVersion}
                onChange={(e) => setCloneVersion(e.target.value)}
                className="w-full h-9 px-3 bg-surface border border-border text-xs rounded-xs outline-none focus:border-primary text-foreground font-mono"
              />
            </div>
            <div className="space-y-1">
              <label className="text-foreground-secondary font-bold">Target Environment</label>
              <select
                value={cloneEnv}
                onChange={(e) => setCloneEnv(e.target.value as any)}
                className="w-full h-9 px-2.5 bg-surface border border-border text-xs rounded-xs outline-none focus:border-primary text-foreground cursor-pointer"
              >
                <option value="Development">Development</option>
                <option value="Testing">Testing</option>
                <option value="Staging">Staging</option>
                <option value="Production">Production</option>
              </select>
            </div>
          </div>
          <div className="flex justify-end gap-2 pt-4 border-t border-border/40 mt-4 select-none">
            <Button variant="outline" size="sm" onClick={() => setIsCloneOpen(false)}>Cancel</Button>
            <Button variant="primary" size="sm" onClick={handleCloneSubmit}>Clone Model</Button>
          </div>
        </div>
      </Modal>
    </PageContainer>
  );
}

// Target icon indicators definitions
function TargetIndicator(props: any) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="12" cy="12" r="10" />
      <circle cx="12" cy="12" r="6" />
      <circle cx="12" cy="12" r="2" />
    </svg>
  );
}
