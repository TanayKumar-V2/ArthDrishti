"use client";

import React, { useState, useEffect, useMemo, useCallback } from "react";
import Link from "next/link";
import {
  Activity,
  Cpu,
  RefreshCw,
  SlidersHorizontal,
  ChevronLeft,
  ChevronRight,
  TrendingUp,
  Download,
  AlertCircle,
  Sparkles,
  CheckCircle,
  FileText,
  AlertTriangle,
  Clock,
  ExternalLink,
  Layers,
  Database,
  Search,
  User,
  ArrowRight,
  X,
  ShieldCheck,
  Zap,
  LayoutGrid,
  TrendingDown,
  Info
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
import SectionHeader from "@/components/ui/SectionHeader";
import { Card, CardHeader, CardTitle, CardContent, CardDescription, CardFooter } from "@/components/ui/Card";
import { Badge, StatusBadge, TrendIndicator } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Modal, Tooltip, Dropdown } from "@/components/ui/Overlays";
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

// Custom color mappings matching admin theme variables
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

export default function AIModelPerformanceDashboard() {
  const [mounted, setMounted] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isError, setIsError] = useState(false);
  const [lastSyncTime, setLastSyncTime] = useState("");

  // Filters State
  const [selectedModelFilter, setSelectedModelFilter] = useState<string>("all");
  const [selectedTimeFilter, setSelectedTimeFilter] = useState<string>("7d");
  const [showComparisonModal, setShowComparisonModal] = useState(false);

  // Selected models for comparison checklist
  const [comparisonModels, setComparisonModels] = useState<string[]>(["credit-risk", "fraud-detection"]);

  // Live real-time telemetry metrics
  const [realtimeMetrics, setRealtimeMetrics] = useState({
    requests: 124,
    ppm: 7420,
    queueLength: 2,
    failures: 0,
    retries: 1,
    processingTime: 14.5
  });

  // Simulated tick for real-time dashboard elements
  useEffect(() => {
    setMounted(true);
    setLastSyncTime(new Date().toLocaleTimeString());

    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 600);

    // Live monitor updater interval (every 3 seconds)
    const liveInterval = setInterval(() => {
      setRealtimeMetrics(prev => {
        const deltaReqs = Math.floor(Math.random() * 20) - 10;
        const deltaFailures = Math.random() > 0.95 ? 1 : 0;
        const newReqs = Math.max(80, prev.requests + deltaReqs);
        return {
          requests: newReqs,
          ppm: Math.round(newReqs * 60),
          queueLength: Math.max(0, Math.floor(Math.random() * 4)),
          failures: prev.failures + deltaFailures,
          retries: prev.failures + deltaFailures > 0 ? prev.retries + 1 : prev.retries,
          processingTime: Math.round((12.5 + Math.random() * 4.5) * 10) / 10
        };
      });
    }, 3000);

    return () => {
      clearTimeout(timer);
      clearInterval(liveInterval);
    };
  }, []);

  // Trigger Refresh
  const handleRefresh = useCallback(() => {
    setIsLoading(true);
    setIsError(false);
    setTimeout(() => {
      setLastSyncTime(new Date().toLocaleTimeString());
      setIsLoading(false);
      toast.success("AI Model metrics dashboard re-synchronized.");
    }, 600);
  }, []);

  // Exporters Triggers
  const handleExportAnalytics = useCallback((format: "csv" | "excel" | "pdf") => {
    toast.success(`Exporting model performance analytics report in ${format.toUpperCase()} format...`);
  }, []);

  // Selected model info helper
  const activeModelDetails = useMemo(() => {
    if (selectedModelFilter === "all") return null;
    return INITIAL_MODELS.find(m => m.id === selectedModelFilter) || null;
  }, [selectedModelFilter]);

  // Dynamic values based on selected model/time filters
  const currentKPIs = useMemo(() => {
    if (activeModelDetails) {
      const model = activeModelDetails;
      return {
        accuracy: `${model.accuracy}%`,
        accuracyTrend: 0.8,
        confidence: `${model.metrics.confidence}%`,
        confidenceTrend: 1.1,
        predictionVolume: model.predictions.toLocaleString(),
        predictionVolumeTrend: 8.5,
        latency: `${model.latency}ms`,
        latencyTrend: -4.2,
        errorRate: `${model.metrics.errorRate}%`,
        errorRateTrend: 0.2,
        availability: "99.98%",
        healthy: model.health === "Healthy" ? 1 : 0,
        attention: model.health === "Healthy" ? 0 : 1
      };
    }

    // Platform aggregates
    const activeModels = INITIAL_MODELS.filter(m => m.status !== "Archived");
    const avgAccuracy = Math.round((activeModels.reduce((acc, curr) => acc + curr.accuracy, 0) / activeModels.length) * 10) / 10;
    const avgConfidence = Math.round((activeModels.reduce((acc, curr) => acc + curr.metrics.confidence, 0) / activeModels.length) * 10) / 10;
    const totalVolume = INITIAL_MODELS.reduce((acc, curr) => acc + curr.predictions, 0);
    const avgLatency = Math.round((activeModels.reduce((acc, curr) => acc + curr.latency, 0) / activeModels.length) * 10) / 10;
    const avgErrorRate = Math.round((activeModels.reduce((acc, curr) => acc + curr.metrics.errorRate, 0) / activeModels.length) * 100) / 100;
    const healthyCount = INITIAL_MODELS.filter(m => m.health === "Healthy").length;
    const attentionCount = INITIAL_MODELS.filter(m => m.health !== "Healthy").length;

    return {
      accuracy: `${avgAccuracy}%`,
      accuracyTrend: 0.4,
      confidence: `${avgConfidence}%`,
      confidenceTrend: 0.6,
      predictionVolume: totalVolume >= 1000000 ? `${(totalVolume/1000000).toFixed(2)}M` : totalVolume.toLocaleString(),
      predictionVolumeTrend: 12.4,
      latency: `${avgLatency}ms`,
      latencyTrend: -2.1,
      errorRate: `${avgErrorRate}%`,
      errorRateTrend: -0.05,
      availability: "99.95%",
      healthy: healthyCount,
      attention: attentionCount
    };
  }, [activeModelDetails]);

  // Simulated chart data points dynamic multipliers matching timeframe
  const metricsTimeSeries = useMemo(() => {
    const pointsCount = selectedTimeFilter === "today" ? 6 : selectedTimeFilter === "7d" ? 7 : 12;
    const labels = selectedTimeFilter === "today"
      ? ["10:00", "12:00", "14:00", "16:00", "18:00", "20:00"]
      : selectedTimeFilter === "7d"
      ? ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]
      : ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

    // Base multipliers mapping
    const accuracyBase = activeModelDetails ? activeModelDetails.accuracy : 92.5;
    const latencyBase = activeModelDetails ? activeModelDetails.latency : 24.5;
    const confidenceBase = activeModelDetails ? activeModelDetails.metrics.confidence : 94.2;
    const errorBase = activeModelDetails ? activeModelDetails.metrics.errorRate : 2.5;

    return labels.map((label, idx) => {
      const pct = idx / (labels.length - 1 || 1);
      // Deterministic pure pseudo-random offsets based on label index
      const rand1 = (Math.abs(Math.sin((idx + 1) * 12.9898)) * 43758.5453) % 1;
      const rand2 = (Math.abs(Math.sin((idx + 2) * 78.233)) * 43758.5453) % 1;
      const rand3 = (Math.abs(Math.sin((idx + 3) * 45.123)) * 43758.5453) % 1;
      const rand4 = (Math.abs(Math.sin((idx + 4) * 93.992)) * 43758.5453) % 1;
      const rand5 = (Math.abs(Math.sin((idx + 5) * 56.442)) * 43758.5453) % 1;

      // add variance curves
      const accuracyVariance = Math.sin(pct * Math.PI) * 0.8 + (rand1 * 0.4 - 0.2);
      const latencyVariance = Math.cos(pct * Math.PI) * 2.5 + (rand2 * 1.5 - 0.75);
      const confidenceVariance = Math.sin(pct * Math.PI * 2) * 0.5 + (rand3 * 0.2 - 0.1);
      const errorVariance = Math.sin(pct * Math.PI) * -0.3 + (rand4 * 0.1 - 0.05);

      return {
        timestamp: label,
        Accuracy: Math.round((accuracyBase + accuracyVariance) * 10) / 10,
        Latency: Math.round((latencyBase + latencyVariance) * 10) / 10,
        Confidence: Math.round((confidenceBase + confidenceVariance) * 10) / 10,
        ErrorRate: Math.round(Math.max(0.1, errorBase + errorVariance) * 100) / 100,
        Volume: Math.round((selectedModelFilter === "all" ? 120000 : activeModelDetails ? activeModelDetails.predictions/10000 : 8000) * (1 + Math.sin(pct * Math.PI) * 0.2 + rand5 * 0.1)),
        Throughput: Math.round((selectedModelFilter === "all" ? 1400 : 180) * (1 + Math.sin(pct * Math.PI) * 0.15))
      };
    });
  }, [selectedModelFilter, selectedTimeFilter, activeModelDetails]);

  // Confidence histogram distributions
  const confidenceHistogram = useMemo(() => {
    if (activeModelDetails) {
      const details = activeModelDetails.metrics;
      return [
        { bin: "Low (<50%)", count: Math.round(details.predictions * 0.002) },
        { bin: "Medium (50-75%)", count: Math.round(details.predictions * 0.024) },
        { bin: "High (75-90%)", count: Math.round(details.predictions * 0.124) },
        { bin: "Very High (>90%)", count: Math.round(details.predictions * 0.85) }
      ];
    }
    return [
      { bin: "Low (<50%)", count: 4850 },
      { bin: "Medium (50-75%)", count: 18450 },
      { bin: "High (75-90%)", count: 85200 },
      { bin: "Very High (>90%)", count: 845200 }
    ];
  }, [activeModelDetails]);

  // Feature Importance list
  const activeFeatureImportance = useMemo(() => {
    if (activeModelDetails) {
      return [
        { feature: "Debt-to-Income (DTI)", weight: 0.38, contribution: "+28% Risk", trend: "up" },
        { feature: "Credit History Length", weight: 0.24, contribution: "+24% Risk", trend: "up" },
        { feature: "Sector Volatility Index", weight: 0.18, contribution: "+18% Risk", trend: "down" },
        { feature: "Quick Liquidity Ratio", weight: 0.12, contribution: "-12% Risk", trend: "down" },
        { feature: "Cash Reserve Cushion", weight: 0.08, contribution: "-8% Risk", trend: "down" }
      ];
    }
    return [
      { feature: "debt_to_income_ratio", weight: 0.35, contribution: "+30% Risk", trend: "up" },
      { feature: "transaction_value_delta", weight: 0.28, contribution: "+25% Fraud", trend: "up" },
      { feature: "credit_score", weight: 0.18, contribution: "-15% Risk", trend: "down" },
      { feature: "inflow_mean_30d", weight: 0.12, contribution: "+12% Forecast", trend: "down" },
      { feature: "total_asset_coordinates", weight: 0.07, contribution: "+8% Segments", trend: "down" }
    ];
  }, [activeModelDetails]);

  // Compare Checklist toggle handler
  const handleComparisonCheckboxToggle = (id: string) => {
    setComparisonModels(prev =>
      prev.includes(id) ? prev.filter(m => m !== id) : [...prev, id]
    );
  };

  if (!mounted) return null;

  return (
    <PageContainer>
      {/* 1. Page Header */}
      <SectionHeader
        title="AI Model Performance"
        description="Monitor prediction quality, model health, confidence, latency, throughput and operational performance across every deployed AI model."
        actions={
          <div className="flex flex-wrap items-center gap-2.5 select-none">
            <Button variant="ghost" size="sm" className="text-[10px] opacity-40 hover:opacity-100 cursor-pointer hidden md:flex" onClick={() => setIsError(true)}>
              Simulate Failure
            </Button>
            <Button variant="outline" size="sm" onClick={handleRefresh} disabled={isLoading}>
              <RefreshCw className={cn("h-4 w-4 shrink-0", isLoading && "animate-spin")} />
              Refresh Dashboard
            </Button>
            <Button variant="outline" size="sm" onClick={() => setShowComparisonModal(true)}>
              Compare Models
            </Button>
            <Dropdown
              trigger={
                <Button variant="outline" size="sm">
                  <Download className="h-4 w-4 shrink-0" />
                  Export Analytics
                </Button>
              }
              items={[
                { id: "pdf", label: "Export PDF Report", onClick: () => handleExportAnalytics("pdf") },
                { id: "csv", label: "Export CSV Metrics", onClick: () => handleExportAnalytics("csv") },
                { id: "xlsx", label: "Export Excel Sheets", onClick: () => handleExportAnalytics("excel") }
              ]}
              align="right"
            />
            <Button variant="primary" size="sm" onClick={() => toast.success("Generating performance diagnostic audit sheet...")}>
              Generate Performance Report
            </Button>
          </div>
        }
      />

      {/* Synchronized diagnostic lock panel */}
      {isError ? (
        <Card className="border-critical/30 bg-critical/5 shadow-xs animate-fadeIn mb-6">
          <CardContent className="py-12 flex flex-col items-center justify-center text-center gap-4 font-sans text-xs">
            <AlertCircle className="h-12 w-12 text-critical" />
            <div className="space-y-1 max-w-md">
              <h2 className="font-heading font-semibold text-lg text-foreground">Diagnostic Telemetry Pipelines Broken</h2>
              <p className="text-sm text-foreground-secondary leading-relaxed">
                Could not pull CPU resources allocations and live endpoints logs for deployed instances.
              </p>
            </div>
            <div className="pt-2 flex gap-3">
              <Button variant="primary" onClick={handleRefresh}>
                Reconnect Analytics
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
          {/* GLOBAL PERFORMANCE KPIs RIBBON */}
          {/* ================================================== */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-8 gap-4 font-sans select-none">
            {[
              { label: "Overall Accuracy", val: currentKPIs.accuracy, trend: currentKPIs.accuracyTrend, icon: ShieldCheck, sparkline: [91.8, 92.0, 92.1, 92.3, 92.4, 92.5] },
              { label: "Avg Confidence", val: currentKPIs.confidence, trend: currentKPIs.confidenceTrend, icon: Sparkles, sparkline: [93.1, 93.4, 93.8, 94.2, 94.5, 94.8] },
              { label: "Prediction Volume", val: currentKPIs.predictionVolume, trend: currentKPIs.predictionVolumeTrend, icon: Database, sparkline: [38, 41, 45, 52, 58, 65] },
              { label: "Average Latency", val: currentKPIs.latency, trend: currentKPIs.latencyTrend, icon: Zap, sparkline: [22.0, 21.5, 20.8, 19.5, 19.0, 18.5] },
              { label: "Error Rate Cap", val: currentKPIs.errorRate, trend: currentKPIs.errorRateTrend, icon: AlertCircle, sparkline: [0.15, 0.12, 0.08, 0.07, 0.06, 0.04] },
              { label: "Availability Score", val: currentKPIs.availability, trend: 0.02, icon: Activity, sparkline: [99.92, 99.94, 99.95, 99.95, 99.96, 99.98] },
              { label: "Healthy Models", val: currentKPIs.healthy, trend: 10.0, icon: CheckCircle, sparkline: [6, 6, 7, 7, 7, 8] },
              { label: "Requires Attention", val: currentKPIs.attention, trend: -50.0, icon: AlertTriangle, sparkline: [2, 2, 1, 1, 1, 0] }
            ].map((card, idx) => {
              const Icon = card.icon;
              return (
                <Card key={idx} interactive className="hover:-translate-y-0.5 transition-all duration-200 cursor-pointer">
                  <CardContent className="pt-4 p-4 flex flex-col gap-2 relative text-left">
                    <div className="flex items-center justify-between">
                      <span className="text-[9px] font-bold text-foreground-secondary uppercase tracking-wider truncate max-w-[100px]">{card.label}</span>
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
                              stroke={card.trend > 0 && idx !== 3 && idx !== 4 && idx !== 7 ? COLORS.positive : card.trend < 0 && (idx === 3 || idx === 4 || idx === 7) ? COLORS.positive : COLORS.critical}
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
          {/* FILTER CONTROLS (MODEL SELECTOR + TIME FILTER) */}
          {/* ================================================== */}
          <Card>
            <CardContent className="p-4 sm:p-5 flex flex-col sm:flex-row items-center justify-between gap-4 font-sans text-xs select-none">
              
              <div className="flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto">
                {/* Model Selector Dropdown */}
                <div className="flex flex-col gap-1 w-full sm:w-60 text-left">
                  <label className="text-[10px] uppercase font-bold text-foreground-muted tracking-wider">Active Deployed Model</label>
                  <select
                    value={selectedModelFilter}
                    onChange={(e) => { setSelectedModelFilter(e.target.value); toast.info(`Performance dashboard metrics context updated.`); }}
                    className="w-full h-9 px-2.5 bg-surface border border-border focus:border-primary rounded-xs outline-none text-foreground font-semibold cursor-pointer"
                  >
                    <option value="all">All Platform Models (Aggregated)</option>
                    <option value="credit-risk">Credit Risk Prediction Engine</option>
                    <option value="fraud-detection">Anomaly Fraud Autoencoder</option>
                    <option value="financial-health">Financial Health Scoring Model</option>
                    <option value="cash-flow">Institutional Cash Flow Regressor</option>
                    <option value="segmentation">Portfolio Segmentation Clustering</option>
                    <option value="explainable-ai">Explainable Credit Attribution Explainer</option>
                  </select>
                </div>

                {/* Time Range Filter Selector */}
                <div className="flex flex-col gap-1 w-full sm:w-44 text-left">
                  <label className="text-[10px] uppercase font-bold text-foreground-muted tracking-wider">Historical Timeframe</label>
                  <select
                    value={selectedTimeFilter}
                    onChange={(e) => setSelectedTimeFilter(e.target.value)}
                    className="w-full h-9 px-2.5 bg-surface border border-border focus:border-primary rounded-xs outline-none text-foreground font-semibold cursor-pointer"
                  >
                    <option value="today">Today (24 Hours)</option>
                    <option value="7d">Last 7 Days</option>
                    <option value="30d">Last 30 Days</option>
                    <option value="90d">Last 90 Days</option>
                    <option value="1y">Last 1 Year</option>
                  </select>
                </div>
              </div>

              {/* Aggregated telemetry tags */}
              <div className="flex items-center gap-4 w-full sm:w-auto justify-end border-t sm:border-t-0 border-border/40 pt-3 sm:pt-0">
                <div className="flex flex-col items-end">
                  <span className="text-[9px] text-foreground-muted font-sans font-bold uppercase tracking-wider">Status Flag</span>
                  <Badge variant={selectedModelFilter === "fraud-detection" ? "warning" : "success"} className="mt-0.5 scale-90">
                    {selectedModelFilter === "fraud-detection" ? "WARNING_DRIFT" : "HEALTHY"}
                  </Badge>
                </div>
                <div className="h-8 w-px bg-border/60" />
                <div className="flex flex-col items-end">
                  <span className="text-[9px] text-foreground-muted font-sans font-bold uppercase tracking-wider">Last Sync</span>
                  <span className="font-mono font-bold text-foreground mt-0.5">{lastSyncTime}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* ================================================== */}
          {/* MAIN GRAPHICS GRID (ACCURACY, CONFIDENCE, LATENCY) */}
          {/* ================================================== */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 text-left">
            
            {/* Accuracy trend curve chart */}
            <Card className="lg:col-span-2">
              <CardHeader className="p-4 sm:p-5 border-b border-border/40">
                <CardTitle className="text-base">Accuracy Progress Curve</CardTitle>
                <CardDescription>Average validation accuracy scores tracked across selected range.</CardDescription>
              </CardHeader>
              <CardContent className="h-[260px] p-2 select-none">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={metricsTimeSeries} margin={{ top: 5, right: 10, left: -25, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#cbd5e1" opacity={0.2} />
                    <XAxis dataKey="timestamp" tick={{ fontSize: 9 }} />
                    <YAxis domain={["auto", "auto"]} tick={{ fontSize: 9 }} />
                    <RechartsTooltip />
                    <Line type="monotone" name="Accuracy Index (%)" dataKey="Accuracy" stroke={COLORS.primary} strokeWidth={2} dot={{ r: 3 }} />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Confidence Histogram */}
            <Card>
              <CardHeader className="p-4 sm:p-5 border-b border-border/40">
                <CardTitle className="text-base">Confidence Distribution histogram</CardTitle>
                <CardDescription>Histogram bins showing inference probability weights thresholds.</CardDescription>
              </CardHeader>
              <CardContent className="h-[260px] p-2 select-none">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={confidenceHistogram} margin={{ top: 5, right: 5, left: -20, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#cbd5e1" opacity={0.2} />
                    <XAxis dataKey="bin" tick={{ fontSize: 9 }} />
                    <YAxis tick={{ fontSize: 9 }} />
                    <RechartsTooltip />
                    <Bar dataKey="count" name="Prediction count" fill={COLORS.ai} opacity={0.8} radius={[2, 2, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          {/* ================================================== */}
          {/* REAL-TIME MONITOR & PERFORMANCE ALERTS */}
          {/* ================================================== */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 text-left">
            
            {/* Real-time queue metrics */}
            <Card className="lg:col-span-2">
              <CardHeader className="p-4 sm:p-5 border-b border-border/40">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <CardTitle className="text-base flex items-center gap-2">
                      <span className="h-2.5 w-2.5 rounded-full bg-positive animate-pulse shrink-0" />
                      Real-Time Inference Monitor
                    </CardTitle>
                    <CardDescription>Simulated cluster throughput telemetry statistics updating live.</CardDescription>
                  </div>
                  <Badge variant="outline" className="font-mono text-[10px] select-none">Live tick: 3s</Badge>
                </div>
              </CardHeader>
              <CardContent className="p-5 grid grid-cols-2 sm:grid-cols-3 gap-4 text-xs font-sans">
                <Card className="p-4 bg-surface-elevated/20 flex flex-col justify-between select-text">
                  <span className="text-foreground-secondary font-semibold uppercase text-[9px] tracking-wider block border-b border-border/20 pb-1">Current Active Requests</span>
                  <span className="font-mono text-lg font-bold text-foreground mt-2">{realtimeMetrics.requests} reqs</span>
                </Card>

                <Card className="p-4 bg-surface-elevated/20 flex flex-col justify-between select-text">
                  <span className="text-foreground-secondary font-semibold uppercase text-[9px] tracking-wider block border-b border-border/20 pb-1">Predictions Per Minute</span>
                  <span className="font-mono text-lg font-bold text-foreground mt-2">{realtimeMetrics.ppm.toLocaleString()} ppm</span>
                </Card>

                <Card className="p-4 bg-surface-elevated/20 flex flex-col justify-between select-text">
                  <span className="text-foreground-secondary font-semibold uppercase text-[9px] tracking-wider block border-b border-border/20 pb-1">Queue Buffer Length</span>
                  <span className="font-mono text-lg font-bold text-foreground mt-2">{realtimeMetrics.queueLength} tasks</span>
                </Card>

                <Card className="p-4 bg-surface-elevated/20 flex flex-col justify-between select-text">
                  <span className="text-foreground-secondary font-semibold uppercase text-[9px] tracking-wider block border-b border-border/20 pb-1">Error Failures logs</span>
                  <span className={cn("font-mono text-lg font-bold mt-2", realtimeMetrics.failures > 0 ? "text-critical" : "text-foreground")}>{realtimeMetrics.failures} errors</span>
                </Card>

                <Card className="p-4 bg-surface-elevated/20 flex flex-col justify-between select-text">
                  <span className="text-foreground-secondary font-semibold uppercase text-[9px] tracking-wider block border-b border-border/20 pb-1">Container Retries</span>
                  <span className="font-mono text-lg font-bold text-foreground mt-2">{realtimeMetrics.retries} attempts</span>
                </Card>

                <Card className="p-4 bg-surface-elevated/20 flex flex-col justify-between select-text">
                  <span className="text-foreground-secondary font-semibold uppercase text-[9px] tracking-wider block border-b border-border/20 pb-1">Avg Process Duration</span>
                  <span className="font-mono text-lg font-bold text-foreground mt-2">{realtimeMetrics.processingTime} ms</span>
                </Card>
              </CardContent>
            </Card>

            {/* Sticky Performance Alerts panel */}
            <Card className="flex flex-col border-warning/30 bg-warning/2">
              <CardHeader className="p-4 sm:p-5 border-b border-border/40 pb-2">
                <CardTitle className="text-base text-warning uppercase tracking-widest font-bold flex items-center gap-1.5 select-none">
                  <AlertTriangle className="h-5 w-5 shrink-0" />
                  Performance Alerts Logs
                </CardTitle>
                <CardDescription className="select-none">Sticky warnings triggered across the cluster nodes.</CardDescription>
              </CardHeader>
              <CardContent className="p-4 flex-1 overflow-y-auto max-h-[220px] space-y-3 font-sans text-xs text-foreground-secondary leading-relaxed select-text">
                <div className="border-l-2 border-critical pl-2.5">
                  <span className="font-bold text-foreground block">Accuracy Dropped:</span>
                  Model `fraud-detection` accuracy indexes dropped below target threshold to 89.8% due to schema drift.
                </div>
                <div className="border-l-2 border-warning pl-2.5">
                  <span className="font-bold text-foreground block">Latency Spike:</span>
                  Inference latencies for model `cash-flow` exceeded 50ms (avg: 54ms) during peak batch forecasts runs.
                </div>
                <div className="border-l-2 border-primary pl-2.5">
                  <span className="font-bold text-foreground block">Inference Spike:</span>
                  Model `credit-risk` encountered a prediction requests spike (+40% surge) over 10 minutes validation pools.
                </div>
              </CardContent>
            </Card>
          </div>

          {/* ================================================== */}
          {/* LATENCY ANALYSIS & PREDICTION QUALITY CHARTS */}
          {/* ================================================== */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 text-left select-none">
            
            {/* Latency Analysis */}
            <Card className="lg:col-span-2">
              <CardHeader className="p-4 sm:p-5 border-b border-border/40">
                <CardTitle className="text-base">Latency Percentiles Analysis</CardTitle>
                <CardDescription>Response time distributions (p50 / p90 / p99) computed over inference pipelines.</CardDescription>
              </CardHeader>
              <CardContent className="h-[250px] p-2">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={metricsTimeSeries} margin={{ top: 5, right: 10, left: -25, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#cbd5e1" opacity={0.2} />
                    <XAxis dataKey="timestamp" tick={{ fontSize: 9 }} />
                    <YAxis tick={{ fontSize: 9 }} />
                    <RechartsTooltip />
                    <Legend wrapperStyle={{ fontSize: 10 }} />
                    <Area type="monotone" name="p50 Latency" dataKey="Latency" stroke={COLORS.positive} fillOpacity={0.15} fill={COLORS.positive} />
                    <Area type="monotone" name="p90 Latency" dataKey={(d) => Math.round(d.Latency * 1.8)} stroke={COLORS.warning} fillOpacity={0.08} fill={COLORS.warning} />
                    <Area type="monotone" name="p99 Latency" dataKey={(d) => Math.round(d.Latency * 3.1)} stroke={COLORS.critical} fillOpacity={0.03} fill={COLORS.critical} />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Radar Comparison Chart */}
            <Card>
              <CardHeader className="p-4 sm:p-5 border-b border-border/40">
                <CardTitle className="text-base">Prediction Quality Radar</CardTitle>
                <CardDescription>Comparative scores of quality parameters across active model.</CardDescription>
              </CardHeader>
              <CardContent className="h-[250px] flex justify-center items-center p-2">
                <ResponsiveContainer width="100%" height="100%">
                  <RadarChart cx="50%" cy="50%" outerRadius="70%" data={[
                    { subject: "Accuracy", A: 92, fullMark: 100 },
                    { subject: "Precision", A: 90, fullMark: 100 },
                    { subject: "Recall", A: 91, fullMark: 100 },
                    { subject: "F1 Score", A: 90, fullMark: 100 },
                    { subject: "ROC AUC", A: 96, fullMark: 100 },
                    { subject: "Confidence", A: 94, fullMark: 100 }
                  ]}>
                    <PolarGrid stroke="#cbd5e1" opacity={0.3} />
                    <PolarAngleAxis dataKey="subject" tick={{ fontSize: 9 }} />
                    <PolarRadiusAxis angle={30} domain={[0, 100]} tick={{ fontSize: 8 }} />
                    <Radar name="Active Model Metrics" dataKey="A" stroke={COLORS.primary} fill={COLORS.primary} fillOpacity={0.25} />
                  </RadarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          {/* ================================================== */}
          {/* MODEL LEADERBOARD & TRAINING INFRASTRUCTURE */}
          {/* ================================================== */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 text-left">
            
            {/* Leaderboard Ranking Directory */}
            <Card className="lg:col-span-2">
              <CardHeader className="p-4 sm:p-5 border-b border-border/40">
                <CardTitle className="text-base select-none">AI Model Leaderboard Directory</CardTitle>
                <CardDescription className="select-none">Rankings directory sorting models based on predictions accuracy and inference volumes.</CardDescription>
              </CardHeader>
              <CardContent className="p-0 overflow-x-auto">
                <table className="w-full text-left font-sans text-xs">
                  <thead>
                    <tr className="border-b border-border bg-surface-elevated/40 text-[9px] font-bold uppercase tracking-wider text-foreground-secondary select-none">
                      <th className="p-3">Rank #</th>
                      <th className="p-3">Model Predictor</th>
                      <th className="p-3 text-right">Accuracy</th>
                      <th className="p-3 text-right">Latency</th>
                      <th className="p-3 text-right">Confidence</th>
                      <th className="p-3 text-right">Volume</th>
                      <th className="p-3 text-right">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/60 text-foreground-secondary">
                    {INITIAL_MODELS.slice()
                      .sort((a, b) => b.accuracy - a.accuracy)
                      .map((modelItem, idx) => (
                        <tr key={modelItem.id} className="hover:bg-surface-hover/30 transition-colors">
                          <td className="p-3 font-mono font-bold text-foreground text-center select-none">{idx + 1}</td>
                          <td className="p-3">
                            <div className="flex items-center gap-2">
                              <Cpu className="h-3.5 w-3.5 text-foreground-muted" />
                              <Link href={`/admin/models/${modelItem.id}`} className="font-semibold text-foreground hover:text-primary leading-tight">
                                {modelItem.name}
                              </Link>
                            </div>
                          </td>
                          <td className="p-3 text-right font-mono font-bold text-foreground">{modelItem.accuracy}%</td>
                          <td className="p-3 text-right font-mono">{modelItem.latency}ms</td>
                          <td className="p-3 text-right font-mono font-semibold text-foreground">{modelItem.metrics.confidence}%</td>
                          <td className="p-3 text-right font-mono font-semibold text-foreground">
                            {modelItem.predictions >= 1000000 
                              ? `${(modelItem.predictions/1000000).toFixed(1)}M` 
                              : modelItem.predictions.toLocaleString()}
                          </td>
                          <td className="p-3 text-right select-none">
                            <Badge variant={modelItem.health === "Healthy" ? "success" : "warning"} className="scale-90">
                              {modelItem.health === "Healthy" ? "HEALTHY" : "DEGRADED"}
                            </Badge>
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </CardContent>
            </Card>

            {/* Resource utilization bars */}
            <Card>
              <CardHeader className="p-4 sm:p-5 border-b border-border/40">
                <CardTitle className="text-base select-none">Hardware Resource Allocations</CardTitle>
                <CardDescription className="select-none">GPU/CPU cluster resource allocations usage stats.</CardDescription>
              </CardHeader>
              <CardContent className="p-5 space-y-4 font-sans text-xs text-foreground-secondary select-none">
                <div className="space-y-1">
                  <div className="flex justify-between font-medium"><span>CPU utilization</span> <span>38% of 16 Cores</span></div>
                  <div className="w-full bg-border rounded-full h-2 overflow-hidden"><div className="bg-primary h-full rounded-full" style={{ width: "38%" }} /></div>
                </div>
                <div className="space-y-1">
                  <div className="flex justify-between font-medium"><span>System Memory usage</span> <span>54% of 32GB</span></div>
                  <div className="w-full bg-border rounded-full h-2 overflow-hidden"><div className="bg-ai h-full rounded-full" style={{ width: "54%" }} /></div>
                </div>
                <div className="space-y-1">
                  <div className="flex justify-between font-medium"><span>GPU memory utilization</span> <span>22% of 48GB</span></div>
                  <div className="w-full bg-border rounded-full h-2 overflow-hidden"><div className="bg-forecast h-full rounded-full" style={{ width: "22%" }} /></div>
                </div>
                <div className="space-y-1">
                  <div className="flex justify-between font-medium"><span>Storage allocations</span> <span>68% of 1TB</span></div>
                  <div className="w-full bg-border rounded-full h-2 overflow-hidden"><div className="bg-warning h-full rounded-full" style={{ width: "68%" }} /></div>
                </div>
                <div className="space-y-1">
                  <div className="flex justify-between font-medium"><span>Network traffic IO</span> <span>12% (1.2 Gbps)</span></div>
                  <div className="w-full bg-border rounded-full h-2 overflow-hidden"><div className="bg-positive h-full rounded-full" style={{ width: "12%" }} /></div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* ================================================== */}
          {/* TIMELINE OF RECENT METRICS EVENTS */}
          {/* ================================================== */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 text-left select-text">
            
            {/* Timeline ledger */}
            <Card className="lg:col-span-2">
              <CardHeader className="p-4 sm:p-5 border-b border-border/40 select-none">
                <CardTitle className="text-base">Recent Events Audit ledger</CardTitle>
                <CardDescription>Audit timeline logging model deployments, retrainings, spikes, and performance shifts.</CardDescription>
              </CardHeader>
              <CardContent className="p-5">
                <div className="relative border-l border-border pl-4 space-y-6 py-2 ml-1 text-xs">
                  {[
                    { timestamp: "2026-07-13 14:05:40", type: "Performance improved", detail: "Ensemble risk scoring XGBoost model retraining complete. Model accuracy climbed +0.4%.", op: "System Pipeline" },
                    { timestamp: "2026-07-13 10:20:00", type: "Latency spike warning", detail: "Container latency metrics exceeded 50ms during batch forecast calculation.", op: "Drift Monitor" },
                    { timestamp: "2026-07-12 11:30:15", type: "Model Deployed", detail: "Promoted PyTorch deep autoencoder version weights to active Staging Canary Pods.", op: "Rahul Chahar" },
                    { timestamp: "2026-07-10 09:00:00", type: "Rollback Completed", detail: "Rolled back transaction categorization engine weights to previous stable baseline version.", op: "Admin" }
                  ].map((evt, idx) => (
                    <div key={idx} className="relative space-y-1">
                      <div className="absolute -left-[21px] top-0.5 h-2.5 w-2.5 rounded-full border border-background bg-primary" />
                      <div className="flex justify-between items-center text-[10px] text-foreground-muted select-none">
                        <span className="font-bold uppercase tracking-wider text-foreground">{evt.type}</span>
                        <span className="font-mono">{evt.timestamp}</span>
                      </div>
                      <p className="text-foreground-secondary leading-normal">{evt.detail}</p>
                      <span className="text-[10px] text-foreground-muted block select-none">Trigger Operator: {evt.op}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Feature contribution bars */}
            <Card>
              <CardHeader className="p-4 sm:p-5 border-b border-border/40">
                <CardTitle className="text-base select-none">Top Features Contributions</CardTitle>
                <CardDescription className="select-none">attributing parameters computed dynamically over the inference matrix.</CardDescription>
              </CardHeader>
              <CardContent className="p-0 border-t border-border/60">
                <div className="divide-y divide-border/60 font-sans text-xs text-foreground-secondary">
                  {activeFeatureImportance.map(f => (
                    <div key={f.feature} className="flex justify-between items-center p-3.5">
                      <div className="flex flex-col text-left">
                        <span className="font-mono font-semibold text-foreground truncate max-w-[150px]">{f.feature}</span>
                        <span className="text-[10px] text-foreground-muted font-sans mt-0.5">{f.contribution}</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="font-mono font-bold text-foreground">{Math.round(f.weight * 100)}%</span>
                        {f.trend === "up" ? (
                          <TrendingUp className="h-4 w-4 text-positive shrink-0" />
                        ) : (
                          <TrendingDown className="h-4 w-4 text-critical shrink-0" />
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

        </div>
      )}

      {/* ================================================== */}
      {/* MODEL COMPARISON DIALOG MODAL */}
      {/* ================================================== */}
      <Modal
        isOpen={showComparisonModal}
        onClose={() => setShowComparisonModal(false)}
        title="Compare AI Models side-by-side"
        className="max-w-3xl animate-fadeIn"
      >
        <div className="space-y-6 font-sans text-xs text-left">
          
          <p className="text-sm text-foreground-secondary">
            Select up to 3 model profiles to compare performance parameters side-by-side.
          </p>

          {/* Checklist selection */}
          <div className="flex flex-wrap gap-4 border-b border-border pb-4 select-none">
            {INITIAL_MODELS.map(modelItem => {
              const isChecked = comparisonModels.includes(modelItem.id);
              return (
                <label key={modelItem.id} className="flex items-center gap-2 cursor-pointer p-2 border border-border rounded-xs bg-surface-elevated/40 hover:bg-surface-elevated">
                  <input
                    type="checkbox"
                    checked={isChecked}
                    disabled={!isChecked && comparisonModels.length >= 3}
                    onChange={() => handleComparisonCheckboxToggle(modelItem.id)}
                    className="cursor-pointer"
                  />
                  <span className="font-semibold text-foreground">{modelItem.name}</span>
                </label>
              );
            })}
          </div>

          {/* Comparison Matrix Table */}
          {comparisonModels.length > 0 ? (
            <div className="overflow-x-auto relative">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-border bg-surface-elevated text-[9px] font-bold uppercase tracking-wider text-foreground-secondary select-none">
                    <th className="p-3">Metric Parameter</th>
                    {comparisonModels.map(id => {
                      const item = INITIAL_MODELS.find(m => m.id === id);
                      return <th key={id} className="p-3">{item?.name}</th>;
                    })}
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/60 text-foreground-secondary font-sans">
                  <tr>
                    <td className="p-3 font-semibold text-foreground">Model Type</td>
                    {comparisonModels.map(id => {
                      const item = INITIAL_MODELS.find(m => m.id === id);
                      return <td key={id} className="p-3">{item?.type}</td>;
                    })}
                  </tr>
                  <tr>
                    <td className="p-3 font-semibold text-foreground">Accuracy Score</td>
                    {comparisonModels.map(id => {
                      const item = INITIAL_MODELS.find(m => m.id === id);
                      return <td key={id} className="p-3 font-mono font-bold text-foreground">{item?.accuracy}%</td>;
                    })}
                  </tr>
                  <tr>
                    <td className="p-3 font-semibold text-foreground">Precision Score</td>
                    {comparisonModels.map(id => {
                      const item = INITIAL_MODELS.find(m => m.id === id);
                      return <td key={id} className="p-3 font-mono">{(item ? item.metrics.precision * 100 : 0).toFixed(1)}%</td>;
                    })}
                  </tr>
                  <tr>
                    <td className="p-3 font-semibold text-foreground">Recall Score</td>
                    {comparisonModels.map(id => {
                      const item = INITIAL_MODELS.find(m => m.id === id);
                      return <td key={id} className="p-3 font-mono">{(item ? item.metrics.recall * 100 : 0).toFixed(1)}%</td>;
                    })}
                  </tr>
                  <tr>
                    <td className="p-3 font-semibold text-foreground">F1 Score</td>
                    {comparisonModels.map(id => {
                      const item = INITIAL_MODELS.find(m => m.id === id);
                      return <td key={id} className="p-3 font-mono">{(item ? item.metrics.f1Score * 100 : 0).toFixed(1)}%</td>;
                    })}
                  </tr>
                  <tr>
                    <td className="p-3 font-semibold text-foreground">Inference Latency</td>
                    {comparisonModels.map(id => {
                      const item = INITIAL_MODELS.find(m => m.id === id);
                      return <td key={id} className="p-3 font-mono font-semibold text-foreground">{item?.latency}ms</td>;
                    })}
                  </tr>
                  <tr>
                    <td className="p-3 font-semibold text-foreground">Prediction Volume</td>
                    {comparisonModels.map(id => {
                      const item = INITIAL_MODELS.find(m => m.id === id);
                      return <td key={id} className="p-3 font-mono">{(item?.predictions || 0).toLocaleString()}</td>;
                    })}
                  </tr>
                </tbody>
              </table>
            </div>
          ) : (
            <div className="py-8 text-center text-foreground-secondary select-none">
              Select model profiles from checklist above to compare parameters.
            </div>
          )}

          <div className="flex justify-end gap-2 pt-4 border-t border-border/40 mt-4 select-none">
            <Button variant="primary" size="sm" onClick={() => setShowComparisonModal(false)}>Close Comparison</Button>
          </div>
        </div>
      </Modal>
    </PageContainer>
  );
}
