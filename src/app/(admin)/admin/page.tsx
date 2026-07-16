"use client";

import React, { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  Users,
  Building2,
  Cpu,
  Activity,
  AlertTriangle,
  ArrowUpRight,
  ArrowDownRight,
  Network,
  Database,
  Server,
  FileText,
  ShieldCheck,
  ShieldAlert,
  UserCheck,
  Sparkles,
  ClipboardList,
  RefreshCw,
  Download,
  Settings,
  MoreVertical,
  Plus,
  Search,
  X,
  Clock,
  TrendingUp,
  VolumeX,
  SlidersHorizontal,
  ChevronRight,
  AlertCircle,
  HelpCircle,
  Laptop,
  CheckCircle2
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
  CartesianGrid,
  Legend,
  PieChart,
  Pie,
  Cell
} from "recharts";
import { toast } from "sonner";

import PageContainer from "@/components/ui/PageContainer";
import SectionHeader from "@/components/ui/SectionHeader";
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Sheet, Modal, Tooltip } from "@/components/ui/Overlays";
import { cn } from "@/lib/utils";

// HSL Color Maps from globals.css
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

// ==================================================
// STATIC DATA MODELS
// ==================================================

interface LiveServiceStatus {
  name: string;
  status: "Operational" | "Degraded" | "Critical" | "Offline";
  latency: string;
  uptime: string;
  lastCheck: string;
  sparkline: number[];
}

interface ActivityItem {
  id: string;
  type: string;
  icon: React.ComponentType<{ className?: string }>;
  description: string;
  timestamp: string;
  priority: "Low" | "Medium" | "High" | "Critical";
  relatedEntity: string;
}

interface AIModelSummary {
  name: string;
  version: string;
  accuracy: string;
  latency: string;
  health: "Healthy" | "Warning" | "Drift Detected";
  confidence: string;
  predictionsToday: string;
}

interface SecurityMetric {
  title: string;
  value: string | number;
  status: "safe" | "warning" | "danger" | "info";
  desc: string;
}

interface APIEndpointMetric {
  endpoint: string;
  rpm: number;
  latency: number;
  errorRate: number;
  successRate: number;
}

interface SystemReport {
  id: string;
  name: string;
  generatedBy: string;
  type: string;
  generatedAt: string;
  status: "Completed" | "Pending" | "Failed";
}

export default function EnterpriseAdminDashboardPage() {
  const router = useRouter();

  // Page States
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isError, setIsError] = useState<boolean>(false);
  const [lastSyncTime, setLastSyncTime] = useState<string>("");
  const [globalSearch, setGlobalSearch] = useState<string>("");
  const [showModelDetailsModal, setShowModelDetailsModal] = useState<boolean>(false);
  const [selectedModel, setSelectedModel] = useState<AIModelSummary | null>(null);

  // Tab and Duration states for interactive Overview Chart
  const [activeOverviewTab, setActiveOverviewTab] = useState<
    "usage" | "growth" | "volume" | "revenue" | "orgs" | "load"
  >("usage");
  const [activeDuration, setActiveDuration] = useState<"Today" | "7D" | "30D" | "6M" | "1Y">("7D");

  // Telemetry simulation values
  const [cpuUsage, setCpuUsage] = useState(48);
  const [ramUsage, setRamUsage] = useState(62);
  const [storageUsage, setStorageUsage] = useState(74);
  const [dbConnections, setDbConnections] = useState(42);
  const [redisUsage, setRedisUsage] = useState(38);
  const [queueDepth, setQueueDepth] = useState(12);

  // Initialize and simulate stats load
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
      setLastSyncTime(new Date().toLocaleTimeString());
    }, 850);
    return () => clearTimeout(timer);
  }, []);

  // System Diagnostics Simulator Loop
  useEffect(() => {
    if (isLoading || isError) return;
    const interval = setInterval(() => {
      setCpuUsage((prev) => Math.max(30, Math.min(95, prev + Math.floor(Math.random() * 9) - 4)));
      setRamUsage((prev) => Math.max(55, Math.min(85, prev + Math.floor(Math.random() * 3) - 1)));
      setDbConnections((prev) => Math.max(25, Math.min(80, prev + Math.floor(Math.random() * 5) - 2)));
      setQueueDepth((prev) => Math.max(0, Math.min(50, prev + Math.floor(Math.random() * 3) - 1)));
    }, 4000);
    return () => clearInterval(interval);
  }, [isLoading, isError]);

  // Actions
  const handleRefresh = () => {
    setIsLoading(true);
    setIsError(false);
    setTimeout(() => {
      setLastSyncTime(new Date().toLocaleTimeString());
      setIsLoading(false);
      toast.success("Enterprise command metrics synchronized.");
    }, 700);
  };

  const handleExportAnalytics = () => {
    toast.promise(
      new Promise((resolve) => setTimeout(resolve, 1500)),
      {
        loading: "Exporting raw platform timeseries data to CSV...",
        success: "Platform analytics exported successfully.",
        error: "Export failed."
      }
    );
  };

  const handleGenerateReport = () => {
    toast.promise(
      new Promise((resolve) => setTimeout(resolve, 2000)),
      {
        loading: "Generating PDF Executive Summary report...",
        success: "Executive Summary PDF downloaded successfully.",
        error: "Report generation failed."
      }
    );
  };

  // Sticky alerts mock data
  const adminAlerts = useMemo(() => {
    const list = [
      { id: "a-1", type: "critical", msg: "High CPU Usage: Platform kernel running at 86%. Queuing delays flagged.", active: cpuUsage > 80 },
      { id: "a-2", type: "warning", msg: "Model Drift Detected: Fraud Detection Model accuracy has dropped below 85% canary limit.", active: true },
      { id: "a-3", type: "warning", msg: "Database Warning: Canary database replication delay exceeds 1800ms.", active: true },
      { id: "a-4", type: "critical", msg: "Security Alert: Brute force SSH logins flagged on officer portal port.", active: true },
      { id: "a-5", type: "info", msg: "High API Traffic: Merchant Gateway traffic burst exceeding 2000 Requests/min.", active: true },
      { id: "a-6", type: "warning", msg: "Organization Limit Reached: Active org counts at 142/150 license threshold.", active: true },
      { id: "a-7", type: "info", msg: "Storage Warning: Backup snapshot disk storage utilization exceeds 80%.", active: storageUsage > 80 }
    ];
    return list.filter((a) => a.active);
  }, [cpuUsage, storageUsage]);

  // Live services status registry (12 services)
  const liveServices: LiveServiceStatus[] = [
    { name: "Authentication Service", status: "Operational", latency: "8ms", uptime: "99.99%", lastCheck: "Just now", sparkline: [7, 8, 9, 8, 8, 7, 8] },
    { name: "Prediction Engine", status: "Degraded", latency: "142ms", uptime: "98.84%", lastCheck: "3 mins ago", sparkline: [120, 135, 142, 138, 145, 142, 142] },
    { name: "Fraud Detection Engine", status: "Operational", latency: "28ms", uptime: "99.95%", lastCheck: "1 min ago", sparkline: [25, 27, 28, 29, 28, 27, 28] },
    { name: "Credit Risk Engine", status: "Operational", latency: "35ms", uptime: "99.97%", lastCheck: "Just now", sparkline: [32, 34, 35, 36, 35, 34, 35] },
    { name: "Financial Health Engine", status: "Operational", latency: "22ms", uptime: "99.98%", lastCheck: "Just now", sparkline: [20, 21, 22, 23, 22, 21, 22] },
    { name: "Notification Service", status: "Operational", latency: "12ms", uptime: "99.99%", lastCheck: "2 mins ago", sparkline: [10, 11, 12, 13, 12, 11, 12] },
    { name: "Database Cluster", status: "Operational", latency: "4ms", uptime: "100.00%", lastCheck: "Just now", sparkline: [3, 4, 4, 4, 4, 3, 4] },
    { name: "Redis Cache Service", status: "Operational", latency: "2ms", uptime: "99.99%", lastCheck: "Just now", sparkline: [1, 2, 2, 2, 2, 1, 2] },
    { name: "API Gateway Manager", status: "Operational", latency: "11ms", uptime: "99.99%", lastCheck: "1 min ago", sparkline: [9, 10, 11, 12, 11, 10, 11] },
    { name: "Background Workers", status: "Operational", latency: "18ms", uptime: "99.94%", lastCheck: "4 mins ago", sparkline: [16, 17, 18, 19, 18, 17, 18] },
    { name: "S3 Object Storage", status: "Operational", latency: "19ms", uptime: "99.98%", lastCheck: "5 mins ago", sparkline: [17, 18, 19, 20, 19, 18, 19] },
    { name: "Local File System", status: "Operational", latency: "3ms", uptime: "99.99%", lastCheck: "Just now", sparkline: [2, 3, 3, 3, 3, 2, 3] }
  ];

  // AI model registry summaries (6 models)
  const aiModels: AIModelSummary[] = [
    { name: "Credit Risk Model", version: "v3.1.2", accuracy: "94.8%", latency: "32ms", health: "Healthy", confidence: "94.2%", predictionsToday: "54,200" },
    { name: "Fraud Detection Model", version: "v2.4.1", accuracy: "82.1%", latency: "28ms", health: "Warning", confidence: "88.5%", predictionsToday: "42,100" },
    { name: "Financial Health Model", version: "v1.8.0", accuracy: "96.2%", latency: "22ms", health: "Healthy", confidence: "95.8%", predictionsToday: "18,400" },
    { name: "Cash Flow Forecast Model", version: "v2.0.4", accuracy: "93.5%", latency: "48ms", health: "Healthy", confidence: "91.0%", predictionsToday: "24,100" },
    { name: "Customer Segmentation Model", version: "v1.2.5", accuracy: "89.8%", latency: "15ms", health: "Healthy", confidence: "92.2%", predictionsToday: "12,730" },
    { name: "Explainable AI Engine", version: "v1.6.2", accuracy: "99.9%", latency: "110ms", health: "Healthy", confidence: "98.0%", predictionsToday: "2,700" }
  ];

  // Real-time activity timeline logs
  const activities: ActivityItem[] = [
    { id: "act-1", type: "Orgs", icon: Building2, description: "New Organization onboarded: Finserv Global Corp. (Enterprise License)", timestamp: "2 mins ago", priority: "Medium", relatedEntity: "Organizations" },
    { id: "act-2", type: "Loans", icon: ClipboardList, description: "Loan Auto-Approved: Rahul Sen (app1) cleared threshold bounds.", timestamp: "10 mins ago", priority: "Low", relatedEntity: "Underwriting" },
    { id: "act-3", type: "Security", icon: ShieldAlert, description: "Critical Fraud Anomaly Alert generated on Vikram Malhotra.", timestamp: "15 mins ago", priority: "Critical", relatedEntity: "Security Console" },
    { id: "act-4", type: "Models", icon: Cpu, description: "AI Model Retrained: Credit Risk Model updated to v3.1.2 weights.", timestamp: "1 hour ago", priority: "High", relatedEntity: "Model Registry" },
    { id: "act-5", type: "Users", icon: Users, description: "User session authenticated: Officer Rahul (Senior Underwriter) logged in.", timestamp: "2 hours ago", priority: "Low", relatedEntity: "Access Logs" },
    { id: "act-6", type: "Gateway", icon: Network, description: "Gateway Rate Limiter active: RPM burst from third-party gateway API.", timestamp: "4 hours ago", priority: "High", relatedEntity: "API Monitoring" },
    { id: "act-7", type: "Predictions", icon: Activity, description: "Model inference calculation batch complete for Q2 portfolio drift.", timestamp: "6 hours ago", priority: "Low", relatedEntity: "Batch Runner" },
    { id: "act-8", type: "Reports", icon: FileText, description: "Weekly Audit Executive PDF generated successfully by System Scheduler.", timestamp: "Yesterday", priority: "Medium", relatedEntity: "Report Vault" },
    { id: "act-9", type: "System", icon: Database, description: "Incremental automated system backup successfully completed (248 GB archived).", timestamp: "Yesterday", priority: "Low", relatedEntity: "Backup Server" }
  ];

  // User database metrics
  const userRoleDistribution = [
    { name: "Loan Officers", value: 36, color: COLORS.primary },
    { name: "Super Admins", value: 4, color: COLORS.critical },
    { name: "Auditors", value: 8, color: COLORS.warning },
    { name: "Customer Portal Users", value: 2800, color: COLORS.ai }
  ];

  // Organization Industry analytics
  const orgIndustryDistribution = [
    { name: "Commercial Banks", value: 52 },
    { name: "Credit Unions", value: 34 },
    { name: "NBFC FinTechs", value: 46 },
    { name: "Micro-Finance Inst.", value: 10 }
  ];

  // Security overview lists
  const securityMetrics: SecurityMetric[] = [
    { title: "Security Alerts", value: 4, status: "danger", desc: "1 unresolved login origin breach warning." },
    { title: "Failed Logins Today", value: 18, status: "warning", desc: "4 logins rejected from unverified IP nets." },
    { title: "Blocked Accounts", value: 2, status: "danger", desc: "Suspended for credential conflict patterns." },
    { title: "Suspicious Telemetry", value: 3, status: "warning", desc: "Sessions flagged by fraud geocoding limits." },
    { title: "MFA Adoption Rate", value: "98.4%", status: "safe", desc: "2,790 accounts configured with TOTP tokens." },
    { title: "Global Security Score", value: "A+ (98/100)", status: "safe", desc: "Penetration audit benchmark passed." }
  ];

  // API gateway overview lists
  const apiEndpointMetrics: APIEndpointMetric[] = [
    { endpoint: "POST /api/v1/predictions/underwrite", rpm: 420, latency: 45, errorRate: 0.01, successRate: 0.99 },
    { endpoint: "GET /api/v1/applicants/profile", rpm: 850, latency: 12, errorRate: 0.02, successRate: 0.98 },
    { endpoint: "POST /api/v1/auth/verify-otp", rpm: 210, latency: 8, errorRate: 0.00, successRate: 1.00 },
    { endpoint: "GET /api/v1/reports/portfolio-risk", rpm: 65, latency: 220, errorRate: 0.05, successRate: 0.95 },
    { endpoint: "GET /api/v1/organizations/billing", rpm: 95, latency: 18, errorRate: 0.01, successRate: 0.99 }
  ];

  // Recent system reports table rows
  const recentReports: SystemReport[] = [
    { id: "rep-101", name: "Q2 Core Segment Concentration Audit", generatedBy: "System Scheduler", type: "Portfolio Drift Summary", generatedAt: "2026-07-12 18:00:00", status: "Completed" },
    { id: "rep-102", name: "Canary Accuracy Degradation Log", generatedBy: "AI Monitor Daemon", type: "Model Accuracy Audit", generatedAt: "2026-07-13 09:12:00", status: "Completed" },
    { id: "rep-103", name: "MFA Enrollment Coverage Logs", generatedBy: "Security Auditing unit", type: "Security Compliance Log", generatedAt: "2026-07-13 11:30:00", status: "Pending" },
    { id: "rep-104", name: "Quarterly Hardware Utilization Peak", generatedBy: "Prometheus Agent", type: "Infrastructure Report", generatedAt: "2026-07-10 23:55:00", status: "Completed" },
    { id: "rep-105", name: "Third-party Experian Gateway Downlog", generatedBy: "API Supervisor", type: "Network Outage Report", generatedAt: "2026-07-11 14:02:11", status: "Failed" }
  ];

  // Dynamic Chart Generator driven by active overview tab & active duration filter
  const dynamicOverviewChartData = useMemo(() => {
    // Generate data points count based on duration
    let labels: string[] = [];
    if (activeDuration === "Today") {
      labels = ["00:00", "04:00", "08:00", "12:00", "16:00", "20:00", "24:00"];
    } else if (activeDuration === "7D") {
      labels = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
    } else if (activeDuration === "30D") {
      labels = ["Week 1", "Week 2", "Week 3", "Week 4"];
    } else if (activeDuration === "6M") {
      labels = ["Feb", "Mar", "Apr", "May", "Jun", "Jul"];
    } else {
      labels = ["2022", "2023", "2024", "2025", "2026"];
    }

    // Tab values maps
    return labels.map((label, index) => {
      const modifier = (index + 1) * 1.05;
      
      let valA = 0;
      let valB = 0;
      
      if (activeOverviewTab === "usage") {
        valA = Math.floor(1000 * modifier * (activeDuration === "Today" ? 1.5 : 15));
        valB = Math.floor(valA * 0.95);
      } else if (activeOverviewTab === "growth") {
        valA = Math.floor(120 * modifier);
        valB = Math.floor(valA * 0.1);
      } else if (activeOverviewTab === "volume") {
        valA = Math.floor(12000 * modifier);
        valB = Math.floor(valA * 0.02);
      } else if (activeOverviewTab === "revenue") {
        valA = Math.floor(5200 * modifier);
        valB = Math.floor(valA * 0.2);
      } else if (activeOverviewTab === "orgs") {
        valA = Math.floor(20 * modifier);
        valB = Math.floor(valA * 0.98);
      } else {
        valA = Math.floor(45 + Math.sin(index) * 20);
        valB = Math.floor(60 + Math.cos(index) * 15);
      }

      return {
        name: label,
        Primary: valA,
        Secondary: valB
      };
    });
  }, [activeOverviewTab, activeDuration]);

  // Global Search Filtering logic
  const matchQuery = (val: string) => {
    if (!globalSearch) return true;
    return val.toLowerCase().includes(globalSearch.toLowerCase());
  };

  const filteredModels = useMemo(() => aiModels.filter((m) => matchQuery(m.name) || matchQuery(m.version)), [globalSearch]);
  const filteredActivities = useMemo(() => activities.filter((a) => matchQuery(a.description) || matchQuery(a.relatedEntity)), [globalSearch]);
  const filteredReports = useMemo(() => recentReports.filter((r) => matchQuery(r.name) || matchQuery(r.generatedBy) || matchQuery(r.type)), [globalSearch]);

  const showEmptyState = useMemo(() => {
    return globalSearch && filteredModels.length === 0 && filteredActivities.length === 0 && filteredReports.length === 0;
  }, [globalSearch, filteredModels, filteredActivities, filteredReports]);

  // Color mappings
  const getAlertColor = (type: string) => {
    if (type === "critical") return "bg-critical/10 text-critical border-critical/30";
    if (type === "warning") return "bg-warning/10 text-warning border-warning/30";
    return "bg-surface-elevated text-foreground-secondary border-border";
  };

  const getPriorityBadgeVariant = (priority: string) => {
    if (priority === "Critical") return "destructive";
    if (priority === "High") return "warning";
    if (priority === "Medium") return "primary";
    return "default";
  };

  const handleOpenModelDetails = (model: AIModelSummary) => {
    setSelectedModel(model);
    setShowModelDetailsModal(true);
  };

  return (
    <PageContainer>
      {/* 1. Page Header bar */}
      <SectionHeader
        title="Enterprise Command Center"
        description="Monitor the complete ArthDrishti platform, AI services, organizations, infrastructure, users, security, and operational intelligence from one unified dashboard."
        actions={
          <div className="flex flex-wrap items-center gap-2.5">
            {/* QA error state simulation */}
            <Button variant="ghost" size="sm" className="text-[10px] opacity-40 hover:opacity-100 cursor-pointer" onClick={() => setIsError(true)}>
              Trigger Fail
            </Button>
            
            <Button variant="outline" size="sm" onClick={handleRefresh} disabled={isLoading}>
              <RefreshCw className={cn("h-4 w-4 shrink-0", isLoading && "animate-spin")} />
              Refresh Dashboard
            </Button>
            <Button variant="outline" size="sm" onClick={handleExportAnalytics}>
              <Download className="h-4 w-4 shrink-0" />
              Export Analytics
            </Button>
            <Button variant="outline" size="sm" onClick={handleGenerateReport}>
              <FileText className="h-4 w-4 shrink-0" />
              Generate Executive Report
            </Button>
            <Button variant="primary" size="sm" onClick={() => router.push("/admin/settings")}>
              <Settings className="h-4 w-4 shrink-0" />
              Platform Settings
            </Button>
          </div>
        }
      />

      {/* Header telemetry metadata ribbon */}
      <div className="flex flex-wrap items-center justify-between gap-4 bg-surface border border-border px-4 py-3 rounded-sm text-xs font-sans select-none">
        <div className="flex flex-wrap items-center gap-5">
          <div className="flex items-center gap-2">
            <span className="text-foreground-secondary font-medium">Platform Status:</span>
            <Badge variant={cpuUsage > 80 || liveServices[1].status === "Degraded" ? "warning" : "success"} className="font-semibold">
              {cpuUsage > 85 ? "Degraded Service" : "All Systems Operational"}
            </Badge>
          </div>
          <div className="flex items-center gap-1.5 border-l border-border/80 pl-5">
            <Clock className="h-4 w-4 text-foreground-muted" />
            <span className="text-foreground-secondary font-medium">Last Sync:</span>
            <span className="font-mono text-foreground font-semibold">{lastSyncTime || "Loading..."}</span>
          </div>
        </div>
        <div className="flex items-center gap-2 border-t sm:border-t-0 sm:border-l border-border/80 pt-2 sm:pt-0 sm:pl-5">
          <span className="text-foreground-secondary font-medium">Active Admin:</span>
          <span className="font-semibold text-foreground bg-primary/10 text-primary border border-primary/20 rounded-xs px-2 py-0.5 text-[10px]">
            Super Admin (Rahul Chahar)
          </span>
        </div>
      </div>

      {/* Global search command panel */}
      <div className="relative w-full">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-foreground-muted pointer-events-none" />
        <input
          type="text"
          value={globalSearch}
          onChange={(e) => setGlobalSearch(e.target.value)}
          placeholder="Global platform search (Users, Organizations, Reports, Models, Settings, Audit logs)..."
          className="w-full h-11 pl-10 pr-9 bg-surface border border-border text-foreground rounded-sm text-sm font-sans placeholder-foreground-muted focus:border-primary focus:outline-none transition-all focus-visible:ring-1 focus-visible:ring-primary"
        />
        {globalSearch && (
          <button
            onClick={() => setGlobalSearch("")}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-foreground-muted hover:text-foreground p-0.5 rounded-full"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        )}
      </div>

      {/* Dashboard Error retry state panel */}
      {isError ? (
        <Card className="border-critical/30 bg-critical/5">
          <CardContent className="py-12 flex flex-col items-center justify-center text-center gap-4 font-sans">
            <AlertCircle className="h-12 w-12 text-critical" />
            <div className="space-y-1 max-w-md">
              <h2 className="font-heading font-semibold text-lg text-foreground">Cockpit Sync Failed</h2>
              <p className="text-sm text-foreground-secondary leading-relaxed">
                ArthDrishti platform API monitoring could not sync real-time telemetry from databases or background workers due to network timeout limit.
              </p>
            </div>
            <div className="pt-2 flex gap-3">
              <Button variant="primary" onClick={handleRefresh}>
                Retry Sync Connection
              </Button>
              <Button variant="outline" onClick={() => setIsError(false)}>
                Bypass Warning
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : showEmptyState ? (
        /* GLOBAL SEARCH EMPTY STATE */
        <Card className="border-dashed border-border/80">
          <CardContent className="py-16 flex flex-col items-center justify-center text-center gap-4 font-sans">
            <div className="h-16 w-16 bg-surface-elevated rounded-full flex items-center justify-center text-foreground-muted border border-border border-dashed">
              <Search className="h-7 w-7" />
            </div>
            <div className="space-y-1">
              <h3 className="font-heading font-semibold text-base text-foreground">No Central Matches</h3>
              <p className="text-xs text-foreground-secondary max-w-xs leading-normal">
                No matching telemetry models, log entries, or organizations found for your search query: "{globalSearch}". Try adjusting spelling or query types.
              </p>
            </div>
            <Button variant="outline" size="sm" onClick={() => setGlobalSearch("")}>
              Clear Search Query
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-6 md:space-y-8 font-sans">

          {/* 2. SUMMARY KPIs GRID (8 cards) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-8 gap-4">
            
            {/* Card 1: Total Orgs */}
            <Card className="hover:border-border-strong hover:-translate-y-0.5 transition-all duration-200 cursor-pointer">
              <CardContent className="pt-4 p-4 flex flex-col gap-2 relative">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold text-foreground-secondary uppercase tracking-wider">Total Orgs</span>
                  <Building2 className="h-4 w-4 text-foreground-muted shrink-0" />
                </div>
                {isLoading ? (
                  <div className="space-y-2 animate-pulse pt-1">
                    <div className="h-6 bg-border rounded-sm w-3/4" />
                    <div className="h-3 bg-border rounded-sm w-1/2" />
                  </div>
                ) : (
                  <>
                    <div className="flex flex-col">
                      <span className="text-xl font-bold font-mono tracking-tight text-foreground">142</span>
                      <span className="inline-flex items-center gap-0.5 text-[9px] text-positive font-mono mt-1 font-bold">
                        <ArrowUpRight className="h-3 w-3" /> +4.2% MoM
                      </span>
                    </div>
                    {/* Sparkline */}
                    <div className="h-5 w-full mt-1.5 opacity-80">
                      <svg className="w-full h-full" viewBox="0 0 80 20">
                        <polyline fill="none" stroke={COLORS.primary} strokeWidth="1.5" points="0,15 15,13 30,10 45,7 60,6 80,2" />
                      </svg>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>

            {/* Card 2: Total Registered Users */}
            <Card className="hover:border-border-strong hover:-translate-y-0.5 transition-all duration-200 cursor-pointer">
              <CardContent className="pt-4 p-4 flex flex-col gap-2">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold text-foreground-secondary uppercase tracking-wider">Users Base</span>
                  <Users className="h-4 w-4 text-foreground-muted shrink-0" />
                </div>
                {isLoading ? (
                  <div className="space-y-2 animate-pulse pt-1">
                    <div className="h-6 bg-border rounded-sm w-3/4" />
                    <div className="h-3 bg-border rounded-sm w-1/2" />
                  </div>
                ) : (
                  <>
                    <div className="flex flex-col">
                      <span className="text-xl font-bold font-mono tracking-tight text-foreground">2,845</span>
                      <span className="inline-flex items-center gap-0.5 text-[9px] text-positive font-mono mt-1 font-bold">
                        <ArrowUpRight className="h-3 w-3" /> +12.4% MoM
                      </span>
                    </div>
                    {/* Sparkline */}
                    <div className="h-5 w-full mt-1.5 opacity-80">
                      <svg className="w-full h-full" viewBox="0 0 80 20">
                        <polyline fill="none" stroke={COLORS.ai} strokeWidth="1.5" points="0,18 15,16 30,12 45,8 60,6 80,2" />
                      </svg>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>

            {/* Card 3: Active Users Today */}
            <Card className="hover:border-border-strong hover:-translate-y-0.5 transition-all duration-200 cursor-pointer">
              <CardContent className="pt-4 p-4 flex flex-col gap-2">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold text-foreground-secondary uppercase tracking-wider">DAU Telemetry</span>
                  <UserCheck className="h-4 w-4 text-foreground-muted shrink-0" />
                </div>
                {isLoading ? (
                  <div className="space-y-2 animate-pulse pt-1">
                    <div className="h-6 bg-border rounded-sm w-3/4" />
                    <div className="h-3 bg-border rounded-sm w-1/2" />
                  </div>
                ) : (
                  <>
                    <div className="flex flex-col">
                      <span className="text-xl font-bold font-mono tracking-tight text-foreground">1,284</span>
                      <span className="inline-flex items-center gap-0.5 text-[9px] text-positive font-mono mt-1 font-bold">
                        <ArrowUpRight className="h-3 w-3" /> +8.5% Daily
                      </span>
                    </div>
                    {/* Sparkline */}
                    <div className="h-5 w-full mt-1.5 opacity-80">
                      <svg className="w-full h-full" viewBox="0 0 80 20">
                        <polyline fill="none" stroke={COLORS.forecast} strokeWidth="1.5" points="0,15 15,14 30,8 45,5 60,6 80,3" />
                      </svg>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>

            {/* Card 4: Active Loan Officers */}
            <Card className="hover:border-border-strong hover:-translate-y-0.5 transition-all duration-200 cursor-pointer">
              <CardContent className="pt-4 p-4 flex flex-col gap-2">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold text-foreground-secondary uppercase tracking-wider">Officers</span>
                  <ShieldCheck className="h-4 w-4 text-foreground-muted shrink-0" />
                </div>
                {isLoading ? (
                  <div className="space-y-2 animate-pulse pt-1">
                    <div className="h-6 bg-border rounded-sm w-3/4" />
                    <div className="h-3 bg-border rounded-sm w-1/2" />
                  </div>
                ) : (
                  <>
                    <div className="flex flex-col">
                      <span className="text-xl font-bold font-mono tracking-tight text-foreground">36</span>
                      <span className="inline-flex items-center gap-0.5 text-[9px] text-positive font-mono mt-1 font-bold">
                        <ArrowUpRight className="h-3 w-3" /> +5.1% MoM
                      </span>
                    </div>
                    {/* Sparkline */}
                    <div className="h-5 w-full mt-1.5 opacity-80">
                      <svg className="w-full h-full" viewBox="0 0 80 20">
                        <polyline fill="none" stroke={COLORS.positive} strokeWidth="1.5" points="0,16 15,15 30,13 45,9 60,10 80,6" />
                      </svg>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>

            {/* Card 5: Total Predictions Today */}
            <Card className="hover:border-border-strong hover:-translate-y-0.5 transition-all duration-200 cursor-pointer">
              <CardContent className="pt-4 p-4 flex flex-col gap-2">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold text-foreground-secondary uppercase tracking-wider">Inferences</span>
                  <Cpu className="h-4 w-4 text-foreground-muted shrink-0" />
                </div>
                {isLoading ? (
                  <div className="space-y-2 animate-pulse pt-1">
                    <div className="h-6 bg-border rounded-sm w-3/4" />
                    <div className="h-3 bg-border rounded-sm w-1/2" />
                  </div>
                ) : (
                  <>
                    <div className="flex flex-col">
                      <span className="text-xl font-bold font-mono tracking-tight text-foreground">154,230</span>
                      <span className="inline-flex items-center gap-0.5 text-[9px] text-positive font-mono mt-1 font-bold">
                        <ArrowUpRight className="h-3 w-3" /> +18.9% Daily
                      </span>
                    </div>
                    {/* Sparkline */}
                    <div className="h-5 w-full mt-1.5 opacity-80">
                      <svg className="w-full h-full" viewBox="0 0 80 20">
                        <polyline fill="none" stroke={COLORS.ai} strokeWidth="1.5" points="0,15 15,10 30,14 45,9 60,5 80,1" />
                      </svg>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>

            {/* Card 6: Loans Processed */}
            <Card className="hover:border-border-strong hover:-translate-y-0.5 transition-all duration-200 cursor-pointer">
              <CardContent className="pt-4 p-4 flex flex-col gap-2">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold text-foreground-secondary uppercase tracking-wider">Loans Done</span>
                  <ClipboardList className="h-4 w-4 text-foreground-muted shrink-0" />
                </div>
                {isLoading ? (
                  <div className="space-y-2 animate-pulse pt-1">
                    <div className="h-6 bg-border rounded-sm w-3/4" />
                    <div className="h-3 bg-border rounded-sm w-1/2" />
                  </div>
                ) : (
                  <>
                    <div className="flex flex-col">
                      <span className="text-xl font-bold font-mono tracking-tight text-foreground">8,421</span>
                      <span className="inline-flex items-center gap-0.5 text-[9px] text-positive font-mono mt-1 font-bold">
                        <ArrowUpRight className="h-3 w-3" /> +14.2% MoM
                      </span>
                    </div>
                    {/* Sparkline */}
                    <div className="h-5 w-full mt-1.5 opacity-80">
                      <svg className="w-full h-full" viewBox="0 0 80 20">
                        <polyline fill="none" stroke={COLORS.primary} strokeWidth="1.5" points="0,18 15,17 30,13 45,9 60,6 80,3" />
                      </svg>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>

            {/* Card 7: Average AI Confidence */}
            <Card className="hover:border-border-strong hover:-translate-y-0.5 transition-all duration-200 cursor-pointer">
              <CardContent className="pt-4 p-4 flex flex-col gap-2">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold text-foreground-secondary uppercase tracking-wider">AI Accuracy</span>
                  <Sparkles className="h-4 w-4 text-foreground-muted shrink-0" />
                </div>
                {isLoading ? (
                  <div className="space-y-2 animate-pulse pt-1">
                    <div className="h-6 bg-border rounded-sm w-3/4" />
                    <div className="h-3 bg-border rounded-sm w-1/2" />
                  </div>
                ) : (
                  <>
                    <div className="flex flex-col">
                      <span className="text-xl font-bold font-mono tracking-tight text-foreground">94.2%</span>
                      <span className="inline-flex items-center gap-0.5 text-[9px] text-positive font-mono mt-1 font-bold">
                        <ArrowUpRight className="h-3 w-3" /> +1.2% Daily
                      </span>
                    </div>
                    {/* Sparkline */}
                    <div className="h-5 w-full mt-1.5 opacity-80">
                      <svg className="w-full h-full" viewBox="0 0 80 20">
                        <polyline fill="none" stroke={COLORS.forecast} strokeWidth="1.5" points="0,17 15,16 30,13 45,10 60,11 80,8" />
                      </svg>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>

            {/* Card 8: System Availability */}
            <Card className="hover:border-border-strong hover:-translate-y-0.5 transition-all duration-200 cursor-pointer">
              <CardContent className="pt-4 p-4 flex flex-col gap-2">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold text-foreground-secondary uppercase tracking-wider">Uptime</span>
                  <Activity className="h-4 w-4 text-foreground-muted shrink-0" />
                </div>
                {isLoading ? (
                  <div className="space-y-2 animate-pulse pt-1">
                    <div className="h-6 bg-border rounded-sm w-3/4" />
                    <div className="h-3 bg-border rounded-sm w-1/2" />
                  </div>
                ) : (
                  <>
                    <div className="flex flex-col">
                      <span className="text-xl font-bold font-mono tracking-tight text-foreground">99.98%</span>
                      <span className="inline-flex items-center gap-0.5 text-[9px] text-foreground-secondary font-sans mt-1">
                        High Availability
                      </span>
                    </div>
                    {/* Sparkline */}
                    <div className="h-5 w-full mt-1.5 opacity-80">
                      <svg className="w-full h-full" viewBox="0 0 80 20">
                        <polyline fill="none" stroke={COLORS.positive} strokeWidth="1.5" points="0,10 15,9 30,11 45,9 60,10 80,10" />
                      </svg>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>

          </div>

          {/* 3. PLATFORM OVERVIEW & ADMIN ALERTS SPLIT */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
            
            {/* Interactive Analytics Chart */}
            <Card className="lg:col-span-2 overflow-visible">
              <CardHeader className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-border/40">
                <div className="space-y-1">
                  <CardTitle>Platform Overview</CardTitle>
                  <CardDescription>Visual metrics tracking usage growth, prediction pipelines, and infrastructure loads.</CardDescription>
                </div>
                {/* Duration Filters */}
                <div className="flex items-center bg-surface-elevated border border-border p-0.5 rounded-xs select-none">
                  {(["Today", "7D", "30D", "6M", "1Y"] as const).map((d) => (
                    <button
                      key={d}
                      onClick={() => setActiveDuration(d)}
                      className={cn(
                        "px-2.5 py-1 text-[10px] font-sans font-bold rounded-xs transition-all cursor-pointer",
                        activeDuration === d
                          ? "bg-surface border border-border text-foreground shadow-xs"
                          : "text-foreground-secondary hover:text-foreground"
                      )}
                    >
                      {d}
                    </button>
                  ))}
                </div>
              </CardHeader>
              <CardContent className="p-4 sm:p-5 flex flex-col gap-5">
                {/* Horizontal tabs */}
                <div className="flex border-b border-border/40 overflow-x-auto scrollbar-none pb-0">
                  <div className="flex space-x-6 whitespace-nowrap">
                    {(["usage", "growth", "volume", "revenue", "orgs", "load"] as const).map((tab) => {
                      const tabLabels: Record<string, string> = {
                        usage: "Platform Usage",
                        growth: "User Growth",
                        volume: "Prediction Volume",
                        revenue: "Revenue Statistics",
                        orgs: "Organizations",
                        load: "System Load"
                      };
                      const isActive = activeOverviewTab === tab;
                      return (
                        <button
                          key={tab}
                          onClick={() => setActiveOverviewTab(tab)}
                          className={cn(
                            "relative pb-3 text-xs font-semibold transition-colors cursor-pointer",
                            isActive ? "text-primary font-bold" : "text-foreground-secondary hover:text-foreground"
                          )}
                        >
                          <span>{tabLabels[tab]}</span>
                          {isActive && (
                            <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary rounded-full" />
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Primary Chart Area */}
                {isLoading ? (
                  <div className="h-[250px] w-full bg-surface-elevated border border-border rounded-sm animate-pulse flex items-center justify-center text-xs text-foreground-muted">
                    Loading Telemetry Graph...
                  </div>
                ) : (
                  <div className="h-[250px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={dynamicOverviewChartData} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
                        <defs>
                          <linearGradient id="colorPrimaryGrad" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="var(--primary)" stopOpacity={0.2}/>
                            <stop offset="95%" stopColor="var(--primary)" stopOpacity={0.0}/>
                          </linearGradient>
                          <linearGradient id="colorSecondaryGrad" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="var(--ai)" stopOpacity={0.15}/>
                            <stop offset="95%" stopColor="var(--ai)" stopOpacity={0.0}/>
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border)" opacity={0.6} />
                        <XAxis dataKey="name" tickLine={false} axisLine={false} tick={{ fontSize: 9, fill: "var(--foreground-muted)" }} />
                        <YAxis tickLine={false} axisLine={false} tick={{ fontSize: 9, fill: "var(--foreground-muted)" }} />
                        <RechartsTooltip contentStyle={{ background: "var(--surface-elevated)", border: "1px solid var(--border)", borderRadius: "4px", fontSize: "10px", color: "var(--foreground)" }} />
                        <Legend wrapperStyle={{ fontSize: 9, paddingTop: 10 }} />
                        <Area name="Primary Telemetry" type="monotone" dataKey="Primary" stroke="var(--primary)" strokeWidth={2} fillOpacity={1} fill="url(#colorPrimaryGrad)" />
                        <Area name="Standard Variance" type="monotone" dataKey="Secondary" stroke="var(--ai)" strokeWidth={1.5} strokeDasharray="3 3" fillOpacity={1} fill="url(#colorSecondaryGrad)" />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Admin Sticky Alerts Panel */}
            <Card className="h-full">
              <CardHeader className="p-4 sm:p-5 border-b border-border/40 flex flex-row items-center justify-between">
                <div className="space-y-0.5">
                  <CardTitle className="text-sm flex items-center gap-1.5">
                    <ShieldAlert className="h-4.5 w-4.5 text-critical shrink-0" />
                    System Warnings
                  </CardTitle>
                  <CardDescription className="text-xs">Active anomalies flagged on production core.</CardDescription>
                </div>
                <Badge variant={adminAlerts.length > 0 ? "destructive" : "success"}>
                  {adminAlerts.length} Active
                </Badge>
              </CardHeader>
              <CardContent className="p-4 sm:p-5 font-sans text-xs">
                {isLoading ? (
                  <div className="space-y-3 animate-pulse">
                    {[1, 2, 3].map((s) => (
                      <div key={s} className="h-12 bg-border rounded-xs w-full" />
                    ))}
                  </div>
                ) : adminAlerts.length === 0 ? (
                  <div className="py-12 flex flex-col items-center justify-center text-center gap-3 text-foreground-muted border border-dashed border-border rounded-sm">
                    <CheckCircle2 className="h-10 w-10 text-positive" />
                    <span>No unresolved system logs flagged.</span>
                  </div>
                ) : (
                  <div className="space-y-2.5 overflow-y-auto max-h-[260px] pr-1">
                    {adminAlerts.map((alert) => (
                      <div
                        key={alert.id}
                        className={cn(
                          "p-3 rounded-xs border font-medium leading-relaxed flex gap-2 items-start transition-all",
                          getAlertColor(alert.type)
                        )}
                      >
                        <AlertTriangle className="h-4 w-4 shrink-0 mt-0.5" />
                        <span className="flex-1">{alert.msg}</span>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

          </div>

          {/* 4. LIVE SYSTEM STATUS GRID (12 cards) */}
          <div className="space-y-4">
            <div className="border-b border-border/60 pb-3">
              <h2 className="text-lg font-heading font-semibold text-foreground tracking-tight">Live System Status</h2>
              <p className="text-xs text-foreground-secondary font-sans">Heartbeat telemetry and average request latency of underlying micro-services.</p>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
              {liveServices.map((service) => {
                const isCritical = service.status === "Critical" || service.status === "Offline";
                const isDegraded = service.status === "Degraded";
                
                return (
                  <Card key={service.name} className="hover:border-border-strong hover:-translate-y-0.5 transition-all duration-200">
                    <CardContent className="pt-4 p-4 flex flex-col gap-3 font-sans">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-semibold text-foreground truncate max-w-[120px]" title={service.name}>
                          {service.name}
                        </span>
                        <span className={cn(
                          "h-2 w-2 rounded-full",
                          isCritical ? "bg-critical" : isDegraded ? "bg-warning" : "bg-positive"
                        )} />
                      </div>
                      
                      {isLoading ? (
                        <div className="space-y-2 animate-pulse">
                          <div className="h-6 bg-border rounded-sm w-3/4" />
                          <div className="h-3 bg-border rounded-sm w-1/2" />
                        </div>
                      ) : (
                        <div className="space-y-2">
                          <div className="flex justify-between items-baseline">
                            <span className="text-lg font-bold font-mono text-foreground leading-none">
                              {service.latency}
                            </span>
                            <span className="text-[10px] text-foreground-secondary font-semibold">
                              {service.uptime}
                            </span>
                          </div>
                          
                          {/* Mini latency bar graphs */}
                          <div className="flex gap-0.5 h-3 items-end">
                            {service.sparkline.map((val, idx) => {
                              const maxVal = Math.max(...service.sparkline);
                              const heightPct = maxVal > 0 ? (val / maxVal) * 100 : 10;
                              return (
                                <div
                                  key={idx}
                                  className={cn(
                                    "flex-1 rounded-t-xs transition-all",
                                    isCritical ? "bg-critical/60" : isDegraded ? "bg-warning/60" : "bg-primary/50"
                                  )}
                                  style={{ height: `${heightPct}%` }}
                                  title={`Latency: ${val}ms`}
                                />
                              );
                            })}
                          </div>

                          <div className="flex justify-between items-center text-[9px] text-foreground-muted">
                            <span className="capitalize">{service.status}</span>
                            <span>Ping: {service.lastCheck}</span>
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>

          {/* 5. AI MODEL SUMMARY CARDS */}
          <div className="space-y-4">
            <div className="border-b border-border/60 pb-3">
              <h2 className="text-lg font-heading font-semibold text-foreground tracking-tight">AI Models Registry Cockpit</h2>
              <p className="text-xs text-foreground-secondary font-sans">Monitor versions accuracy scoring and predictive inferences load of ensemble intelligence services.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
              {filteredModels.map((model) => {
                const isHealthy = model.health === "Healthy";
                const isDrift = model.health === "Drift Detected";

                return (
                  <Card key={model.name} className={cn("hover:border-border-strong transition-colors", isDrift && "border-critical/30", model.health === "Warning" && "border-warning/30")}>
                    <CardContent className="pt-4 p-4 flex flex-col gap-3 font-sans text-xs">
                      <div className="flex items-center justify-between border-b border-border/40 pb-2">
                        <span className="font-heading font-bold text-xs text-foreground truncate max-w-[120px]" title={model.name}>
                          {model.name}
                        </span>
                        <Badge variant={isHealthy ? "success" : isDrift ? "destructive" : "warning"} className="text-[9px]">
                          {model.health}
                        </Badge>
                      </div>
                      
                      {isLoading ? (
                        <div className="space-y-2 animate-pulse pt-2">
                          <div className="h-4 bg-border rounded-sm w-3/4" />
                          <div className="h-4 bg-border rounded-sm w-1/2" />
                          <div className="h-3 bg-border rounded-sm w-2/3" />
                        </div>
                      ) : (
                        <div className="space-y-2.5">
                          <div className="flex justify-between items-center text-[10px] text-foreground-secondary">
                            <span>Engine Version:</span>
                            <span className="font-semibold text-foreground font-mono">{model.version}</span>
                          </div>
                          <div className="flex justify-between items-center text-[10px] text-foreground-secondary">
                            <span>Accuracy Score:</span>
                            <span className="font-semibold text-foreground font-mono">{model.accuracy}</span>
                          </div>
                          <div className="flex justify-between items-center text-[10px] text-foreground-secondary">
                            <span>Execution Latency:</span>
                            <span className="font-semibold text-foreground font-mono">{model.latency}</span>
                          </div>
                          <div className="flex justify-between items-center text-[10px] text-foreground-secondary">
                            <span>Model Confidence:</span>
                            <span className="font-semibold text-foreground font-mono">{model.confidence}</span>
                          </div>
                          <div className="flex justify-between items-center text-[10px] text-foreground-secondary">
                            <span>Predictions Today:</span>
                            <span className="font-semibold text-foreground font-mono">{model.predictionsToday}</span>
                          </div>
                          
                          <div className="pt-1.5 border-t border-border/40">
                            <Button
                              variant="outline"
                              size="sm"
                              className="w-full text-[10px] font-bold h-8 cursor-pointer"
                              onClick={() => handleOpenModelDetails(model)}
                            >
                              Audit Details
                            </Button>
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>

          {/* 6. USER, ORGANIZATION & SECURITY ANALYTICS GRID */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
            
            {/* User Access Analytics & Distribution */}
            <Card className="h-full">
              <CardHeader className="p-4 sm:p-5 border-b border-border/40">
                <CardTitle className="text-sm">User Telemetry Distribution</CardTitle>
                <CardDescription className="text-xs">User roles partition and active retention logs.</CardDescription>
              </CardHeader>
              <CardContent className="p-4 sm:p-5 flex flex-col gap-4 font-sans text-xs">
                {isLoading ? (
                  <div className="h-[200px] w-full bg-surface-elevated animate-pulse rounded-sm" />
                ) : (
                  <>
                    <div className="h-[140px] w-full relative flex items-center justify-center">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={userRoleDistribution}
                            cx="50%"
                            cy="50%"
                            innerRadius={45}
                            outerRadius={60}
                            paddingAngle={3}
                            dataKey="value"
                          >
                            {userRoleDistribution.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={entry.color} />
                            ))}
                          </Pie>
                          <RechartsTooltip />
                        </PieChart>
                      </ResponsiveContainer>
                      <div className="absolute flex flex-col items-center justify-center">
                        <span className="text-lg font-bold font-mono text-foreground leading-none">2,848</span>
                        <span className="text-[9px] text-foreground-muted font-sans mt-0.5">Total accounts</span>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-2.5 pt-2">
                      {userRoleDistribution.map((role) => (
                        <div key={role.name} className="flex items-center gap-2">
                          <span className="h-2 w-2 rounded-full shrink-0" style={{ backgroundColor: role.color }} />
                          <div className="flex flex-col leading-none">
                            <span className="text-[10px] text-foreground-secondary truncate max-w-[95px]">{role.name}</span>
                            <span className="font-bold text-foreground font-mono mt-0.5">{role.value}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </>
                )}
              </CardContent>
            </Card>

            {/* Organizations Industries Distribution */}
            <Card className="h-full">
              <CardHeader className="p-4 sm:p-5 border-b border-border/40">
                <CardTitle className="text-sm">Organizations Industries Sector</CardTitle>
                <CardDescription className="text-xs">Finserv accounts categorized by industry groups.</CardDescription>
              </CardHeader>
              <CardContent className="p-4 sm:p-5 flex flex-col gap-4 font-sans text-xs">
                {isLoading ? (
                  <div className="h-[200px] w-full bg-surface-elevated animate-pulse rounded-sm" />
                ) : (
                  <>
                    <div className="h-[140px] w-full">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={orgIndustryDistribution} margin={{ top: 5, right: 5, left: -25, bottom: 0 }}>
                          <XAxis dataKey="name" tickLine={false} axisLine={false} tick={{ fontSize: 7, fill: "var(--foreground-muted)" }} />
                          <YAxis tickLine={false} axisLine={false} tick={{ fontSize: 8, fill: "var(--foreground-muted)" }} />
                          <RechartsTooltip contentStyle={{ background: "var(--surface-elevated)", border: "1px solid var(--border)", borderRadius: "4px", fontSize: "10px", color: "var(--foreground)" }} />
                          <Bar dataKey="value" fill="var(--primary)" opacity={0.8} radius={[2, 2, 0, 0]} />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>

                    <div className="space-y-1.5 pt-2">
                      <div className="flex justify-between text-[10px] border-b border-border/40 pb-1 font-bold text-foreground-secondary">
                        <span>Industry Group</span>
                        <span>Licenses</span>
                      </div>
                      {orgIndustryDistribution.map((item) => (
                        <div key={item.name} className="flex justify-between text-[10px] text-foreground-secondary">
                          <span>{item.name}</span>
                          <span className="font-mono text-foreground font-semibold">{item.value}</span>
                        </div>
                      ))}
                    </div>
                  </>
                )}
              </CardContent>
            </Card>

            {/* Security telemetry parameters */}
            <Card className="h-full">
              <CardHeader className="p-4 sm:p-5 border-b border-border/40">
                <CardTitle className="text-sm">Security Overview cockpit</CardTitle>
                <CardDescription className="text-xs">Monitor MFA adoption rates and account locks telemetry.</CardDescription>
              </CardHeader>
              <CardContent className="p-4 sm:p-5 font-sans text-xs">
                {isLoading ? (
                  <div className="space-y-3 animate-pulse">
                    {[1, 2, 3].map((s) => (
                      <div key={s} className="h-10 bg-border rounded-xs w-full" />
                    ))}
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-[220px] overflow-y-auto pr-1">
                    {securityMetrics.map((metric) => (
                      <div
                        key={metric.title}
                        className="p-3 border border-border/65 bg-surface-elevated/40 rounded-xs flex flex-col gap-1 hover:border-border-strong transition-colors"
                      >
                        <span className="text-[10px] text-foreground-secondary font-semibold">{metric.title}</span>
                        <div className="flex items-center justify-between">
                          <span className={cn(
                            "text-base font-bold font-mono leading-none",
                            metric.status === "danger" ? "text-critical" :
                            metric.status === "warning" ? "text-warning" : "text-foreground"
                          )}>
                            {metric.value}
                          </span>
                          <span className="text-[8px] text-foreground-muted truncate max-w-[80px]" title={metric.desc}>
                            {metric.desc}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

          </div>

          {/* 7. REAL-TIME ACTIVITY TIMELINE & API GATEWAY DECK */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
            
            {/* Real-time Activity Timeline */}
            <Card className="lg:col-span-2">
              <CardHeader className="p-4 sm:p-5 border-b border-border/40 flex flex-row items-center justify-between">
                <div className="space-y-0.5">
                  <CardTitle>Real-Time Activity Feed</CardTitle>
                  <CardDescription>Live telemetry logging operations registers across org partitions.</CardDescription>
                </div>
                <span className="text-[10px] font-mono text-foreground-muted flex items-center gap-1">
                  <span className="h-1.5 w-1.5 bg-positive rounded-full animate-ping" />
                  Live Streaming
                </span>
              </CardHeader>
              <CardContent className="p-4 sm:p-5 font-sans text-xs">
                {isLoading ? (
                  <div className="space-y-3 animate-pulse">
                    {[1, 2, 3].map((s) => (
                      <div key={s} className="h-14 bg-border rounded-xs w-full" />
                    ))}
                  </div>
                ) : filteredActivities.length === 0 ? (
                  <div className="py-12 flex flex-col items-center justify-center text-center gap-3 text-foreground-muted border border-dashed border-border rounded-sm">
                    <Activity className="h-10 w-10 text-foreground-muted" />
                    <span>No matching active logs found.</span>
                  </div>
                ) : (
                  <div className="space-y-4 relative pl-3 border-l border-border/60 ml-2 max-h-[350px] overflow-y-auto pr-1 select-none">
                    {filteredActivities.map((act) => {
                      const IconComponent = act.icon;
                      return (
                        <div key={act.id} className="relative space-y-1 hover:bg-surface-elevated/20 p-2 rounded-xs transition-colors">
                          {/* Dot marker */}
                          <div className="absolute top-3.5 left-[-16px] h-2 w-2 rounded-full bg-border border border-surface shrink-0" />
                          
                          <div className="flex items-center justify-between flex-wrap gap-2">
                            <span className="font-heading font-bold text-xs text-foreground flex items-center gap-2">
                              <IconComponent className="h-4 w-4 text-primary shrink-0" />
                              {act.description}
                            </span>
                            <div className="flex items-center gap-2 shrink-0">
                              <Badge variant={getPriorityBadgeVariant(act.priority)}>{act.priority}</Badge>
                              <span className="text-[9px] text-foreground-secondary font-mono">{act.timestamp}</span>
                            </div>
                          </div>
                          <div className="flex justify-between items-center text-[10px] text-foreground-secondary pl-6">
                            <span>Category: <span className="font-semibold text-foreground">{act.type}</span></span>
                            <span>Entity: <span className="font-mono text-foreground">{act.relatedEntity}</span></span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* API Gateway monitoring stats */}
            <Card>
              <CardHeader className="p-4 sm:p-5 border-b border-border/40">
                <CardTitle className="text-sm">API Gateway overview</CardTitle>
                <CardDescription className="text-xs">Requests rates and error averages on top endpoints.</CardDescription>
              </CardHeader>
              <CardContent className="p-4 sm:p-5 font-sans text-xs space-y-4">
                {isLoading ? (
                  <div className="space-y-3 animate-pulse">
                    {[1, 2, 3].map((s) => (
                      <div key={s} className="h-14 bg-border rounded-xs w-full" />
                    ))}
                  </div>
                ) : (
                  <div className="space-y-3 overflow-y-auto max-h-[350px] pr-1">
                    {apiEndpointMetrics.map((endpoint) => (
                      <div
                        key={endpoint.endpoint}
                        className="p-3 border border-border/60 bg-surface rounded-xs space-y-2 hover:border-border-strong transition-colors"
                      >
                        <div className="flex items-center justify-between border-b border-border/40 pb-1.5">
                          <span className="font-mono text-[10px] text-foreground font-bold truncate max-w-[170px]" title={endpoint.endpoint}>
                            {endpoint.endpoint}
                          </span>
                          <span className="font-mono text-[10px] text-foreground font-bold shrink-0">{endpoint.rpm} RPM</span>
                        </div>
                        <div className="grid grid-cols-3 gap-2 text-[10px] text-foreground-secondary font-sans leading-none">
                          <div className="flex flex-col gap-0.5">
                            <span>Latency</span>
                            <span className="font-bold text-foreground font-mono">{endpoint.latency}ms</span>
                          </div>
                          <div className="flex flex-col gap-0.5 border-x border-border/60 px-2">
                            <span>Err Rate</span>
                            <span className={cn("font-bold font-mono", endpoint.errorRate > 0.02 ? "text-critical" : "text-foreground")}>
                              {(endpoint.errorRate * 100).toFixed(1)}%
                            </span>
                          </div>
                          <div className="flex flex-col gap-0.5 pl-2">
                            <span>Success</span>
                            <span className="font-bold text-positive font-mono">{(endpoint.successRate * 100).toFixed(0)}%</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

          </div>

          {/* 8. Infrastructure Hardware Metrics (Large monitoring bar) */}
          <Card>
            <CardHeader className="p-4 sm:p-5 border-b border-border/40">
              <CardTitle className="text-sm">Infrastructure Hardware Metrics</CardTitle>
              <CardDescription className="text-xs">Real-time CPU cores, memory limits, queuing loads, and cache hits.</CardDescription>
            </CardHeader>
            <CardContent className="p-4 sm:p-5 font-sans text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
                
                {/* CPU */}
                <div className="p-3 border border-border bg-surface rounded-xs space-y-2">
                  <div className="flex justify-between items-center text-[10px] text-foreground-secondary">
                    <span>CPU Telemetry</span>
                    <span className="font-mono font-bold text-foreground">{cpuUsage}%</span>
                  </div>
                  <div className="h-2 w-full bg-border rounded-full overflow-hidden">
                    <div
                      className={cn(
                        "h-full rounded-full transition-all duration-500 ease-out",
                        cpuUsage > 80 ? "bg-critical" : cpuUsage > 60 ? "bg-warning" : "bg-primary"
                      )}
                      style={{ width: `${cpuUsage}%` }}
                    />
                  </div>
                  <span className="text-[9px] text-foreground-muted block leading-none">Canary cluster loads</span>
                </div>

                {/* RAM */}
                <div className="p-3 border border-border bg-surface rounded-xs space-y-2">
                  <div className="flex justify-between items-center text-[10px] text-foreground-secondary">
                    <span>Memory Allocation</span>
                    <span className="font-mono font-bold text-foreground">{ramUsage}%</span>
                  </div>
                  <div className="h-2 w-full bg-border rounded-full overflow-hidden">
                    <div
                      className={cn(
                        "h-full rounded-full transition-all duration-500 ease-out",
                        ramUsage > 80 ? "bg-critical" : "bg-primary"
                      )}
                      style={{ width: `${ramUsage}%` }}
                    />
                  </div>
                  <span className="text-[9px] text-foreground-muted block leading-none">12.8 GB / 16.0 GB active</span>
                </div>

                {/* Storage */}
                <div className="p-3 border border-border bg-surface rounded-xs space-y-2">
                  <div className="flex justify-between items-center text-[10px] text-foreground-secondary">
                    <span>Storage Pool</span>
                    <span className="font-mono font-bold text-foreground">{storageUsage}%</span>
                  </div>
                  <div className="h-2 w-full bg-border rounded-full overflow-hidden">
                    <div
                      className="h-full bg-primary rounded-full transition-all duration-500 ease-out"
                      style={{ width: `${storageUsage}%` }}
                    />
                  </div>
                  <span className="text-[9px] text-foreground-muted block leading-none">1.64 TB / 2.00 TB used</span>
                </div>

                {/* DB pools */}
                <div className="p-3 border border-border bg-surface rounded-xs space-y-2">
                  <div className="flex justify-between items-center text-[10px] text-foreground-secondary">
                    <span>DB Active Pools</span>
                    <span className="font-mono font-bold text-foreground">{dbConnections}/100</span>
                  </div>
                  <div className="h-2 w-full bg-border rounded-full overflow-hidden">
                    <div
                      className="h-full bg-primary rounded-full transition-all duration-500 ease-out"
                      style={{ width: `${dbConnections}%` }}
                    />
                  </div>
                  <span className="text-[9px] text-foreground-muted block leading-none">Replication pool synchrony</span>
                </div>

                {/* Redis */}
                <div className="p-3 border border-border bg-surface rounded-xs space-y-2">
                  <div className="flex justify-between items-center text-[10px] text-foreground-secondary">
                    <span>Redis Cache Hits</span>
                    <span className="font-mono font-bold text-foreground">{redisUsage}%</span>
                  </div>
                  <div className="h-2 w-full bg-border rounded-full overflow-hidden">
                    <div
                      className="h-full bg-primary rounded-full transition-all duration-500 ease-out"
                      style={{ width: `${redisUsage}%` }}
                    />
                  </div>
                  <span className="text-[9px] text-foreground-muted block leading-none">92.4% query cache hits</span>
                </div>

                {/* Queue Depth */}
                <div className="p-3 border border-border bg-surface rounded-xs space-y-2">
                  <div className="flex justify-between items-center text-[10px] text-foreground-secondary">
                    <span>Active Queue Jobs</span>
                    <span className="font-mono font-bold text-foreground">{queueDepth} Jobs</span>
                  </div>
                  <div className="h-2 w-full bg-border rounded-full overflow-hidden">
                    <div
                      className={cn(
                        "h-full rounded-full transition-all duration-500 ease-out",
                        queueDepth > 30 ? "bg-warning" : "bg-primary"
                      )}
                      style={{ width: `${Math.min(100, (queueDepth / 50) * 100)}%` }}
                    />
                  </div>
                  <span className="text-[9px] text-foreground-muted block leading-none">Canary runner queues</span>
                </div>

              </div>
            </CardContent>
          </Card>

          {/* 9. QUICK NAVIGATION CARDS */}
          <div className="space-y-4">
            <div className="border-b border-border/60 pb-3">
              <h2 className="text-lg font-heading font-semibold text-foreground tracking-tight">Quick Platform Actions</h2>
              <p className="text-xs text-foreground-secondary font-sans">Direct shortcuts to access corporate database indexes and active admin consoles.</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-8 gap-4 select-none">
              {[
                { name: "Manage Users", href: "/admin/users", icon: Users },
                { name: "Organizations", href: "/admin/organizations", icon: Building2 },
                { name: "Model Registry", href: "/admin/models", icon: Cpu },
                { name: "Audit Logs", href: "/admin/audit-logs", icon: FileText },
                { name: "System Health", href: "/admin/system-health", icon: Activity },
                { name: "API Monitoring", href: "/admin/api-monitoring", icon: Network },
                { name: "Model Drift", href: "/admin/model-drift", icon: ShieldAlert },
                { name: "Platform Settings", href: "/admin/settings", icon: Settings }
              ].map((act) => {
                const Icon = act.icon;
                return (
                  <Card
                    key={act.name}
                    className="hover:border-primary/50 hover:bg-surface-elevated/40 transition-all cursor-pointer group active:scale-98"
                    onClick={() => {
                      toast.info(`Entering workspace: ${act.name}`);
                      router.push(act.href);
                    }}
                  >
                    <CardContent className="p-4 flex flex-col items-center justify-center text-center gap-2.5">
                      <div className="h-9 w-9 rounded-full bg-surface-elevated border border-border flex items-center justify-center text-foreground-secondary group-hover:bg-primary/10 group-hover:text-primary transition-all">
                        <Icon className="h-4.5 w-4.5" />
                      </div>
                      <span className="font-heading font-semibold text-[11px] text-foreground leading-tight group-hover:text-primary transition-colors">
                        {act.name}
                      </span>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>

          {/* 10. RECENT SYSTEM REPORTS TABLE */}
          <div className="space-y-4">
            <div className="border-b border-border/60 pb-3">
              <h2 className="text-lg font-heading font-semibold text-foreground tracking-tight">Recent Executive Reports</h2>
              <p className="text-xs text-foreground-secondary font-sans">History index of compiled portfolio diagnostics and model drift reports.</p>
            </div>

            <Card className="overflow-x-auto">
              <table className="w-full border-collapse text-left text-xs font-sans">
                <thead>
                  <tr className="border-b border-border bg-surface-elevated text-foreground-secondary font-bold text-[10px] uppercase tracking-wider">
                    <th className="p-3">Report Document</th>
                    <th className="p-3">Generated By</th>
                    <th className="p-3">Report Category Type</th>
                    <th className="p-3">Generation Time</th>
                    <th className="p-3">Status</th>
                    <th className="p-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border text-foreground">
                  {filteredReports.map((report) => (
                    <tr key={report.id} className="hover:bg-surface-elevated/40 transition-colors">
                      <td className="p-3 font-semibold flex items-center gap-2">
                        <FileText className="h-4 w-4 text-foreground-secondary shrink-0" />
                        <span>{report.name}</span>
                      </td>
                      <td className="p-3">{report.generatedBy}</td>
                      <td className="p-3 font-mono text-[10px] text-foreground-secondary">{report.type}</td>
                      <td className="p-3 text-foreground-secondary font-mono">{report.generatedAt}</td>
                      <td className="p-3">
                        <Badge variant={
                          report.status === "Completed" ? "success" :
                          report.status === "Pending" ? "warning" : "destructive"
                        }>
                          {report.status}
                        </Badge>
                      </td>
                      <td className="p-3 text-right">
                        <button
                          onClick={() => {
                            toast.success(`Download summary generated for report ID: ${report.id}`);
                          }}
                          className="text-primary font-bold hover:underline cursor-pointer"
                        >
                          Download
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </Card>
          </div>

        </div>
      )}

      {/* AI MODEL DETAILS MODAL */}
      <Modal
        isOpen={showModelDetailsModal}
        onClose={() => setShowModelDetailsModal(false)}
        title="AI Model Audit Specification"
        className="max-w-md font-sans text-xs"
      >
        {selectedModel && (
          <div className="space-y-5">
            <div className="space-y-1.5 pb-3 border-b border-border">
              <h4 className="font-heading font-bold text-sm text-foreground">{selectedModel.name}</h4>
              <p className="text-foreground-secondary">Canary active version configuration specifications.</p>
            </div>
            
            <div className="space-y-2.5">
              <div className="flex justify-between border-b border-border/40 pb-2">
                <span className="text-foreground-secondary">Model Version</span>
                <span className="font-mono font-bold text-foreground">{selectedModel.version}</span>
              </div>
              <div className="flex justify-between border-b border-border/40 pb-2">
                <span className="text-foreground-secondary">Accuracy Score</span>
                <span className="font-mono font-bold text-foreground">{selectedModel.accuracy}</span>
              </div>
              <div className="flex justify-between border-b border-border/40 pb-2">
                <span className="text-foreground-secondary">Inference Latency</span>
                <span className="font-mono font-bold text-foreground">{selectedModel.latency}</span>
              </div>
              <div className="flex justify-between border-b border-border/40 pb-2">
                <span className="text-foreground-secondary">Retrained Status</span>
                <span className="font-mono font-bold text-positive">Healthy Sync</span>
              </div>
              <div className="flex justify-between border-b border-border/40 pb-2">
                <span className="text-foreground-secondary">Predictions Today</span>
                <span className="font-mono font-bold text-foreground">{selectedModel.predictionsToday}</span>
              </div>
            </div>

            <div className="p-3 border border-warning/25 bg-warning/5 rounded-xs space-y-1">
              <span className="font-bold text-warning block">Feature Drift Telemetry Check</span>
              <p className="text-[11px] text-foreground-secondary leading-relaxed">
                {selectedModel.health === "Warning" ? (
                  "Warning: PSI value shows warning anomalies in geographic input attributes. We recommend initiating a manual retrain sequence."
                ) : (
                  "Features distributions align with calibration parameters. Drift check is within optimal parameters (PSI < 0.1)."
                )}
              </p>
            </div>

            <div className="pt-3 flex gap-2 justify-end border-t border-border/40">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowModelDetailsModal(false)}
              >
                Close Audit
              </Button>
              <Button
                variant="primary"
                size="sm"
                onClick={() => {
                  toast.success(`Retraining pipeline scheduled for: ${selectedModel.name}`);
                  setShowModelDetailsModal(false);
                }}
              >
                Retrain Model
              </Button>
            </div>
          </div>
        )}
      </Modal>

    </PageContainer>
  );
}
