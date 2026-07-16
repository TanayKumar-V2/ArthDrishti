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
  Settings2,
  Archive,
  Terminal,
  ShieldCheck,
  FileText,
  Play,
  Pause,
  Save,
  Trash
} from "lucide-react";
import { toast } from "sonner";

import PageContainer from "@/components/ui/PageContainer";
import SectionHeader from "@/components/ui/SectionHeader";
import { Card, CardHeader, CardTitle, CardContent, CardDescription, CardFooter } from "@/components/ui/Card";
import { Badge, StatusBadge, TrendIndicator } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Modal, Tooltip, Dropdown, Sheet, Tabs } from "@/components/ui/Overlays";
import { cn } from "@/lib/utils";

import {
  AUDIT_LOGS_REGISTRY,
  AUDIT_TELEMETRY_DB,
  AuditLogRecord,
  AuditActionType,
  SeverityLevel,
  AuditStatus
} from "@/lib/audit_logs_data";

// Custom theme colors
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

export default function AuditComplianceOperationsPage() {
  const [mounted, setMounted] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isError, setIsError] = useState(false);
  const [lastSyncTime, setLastSyncTime] = useState("");

  // Navigation tab states
  const [activeTab, setActiveTab] = useState<string>("registry");

  // Advanced Filters states
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedRole, setSelectedRole] = useState("all");
  const [selectedOrg, setSelectedOrg] = useState("all");
  const [selectedModule, setSelectedModule] = useState("all");
  const [selectedAction, setSelectedAction] = useState("all");
  const [selectedSeverity, setSelectedSeverity] = useState("all");
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [ipQuery, setIpQuery] = useState("");
  const [selectedTimeframe, setSelectedTimeframe] = useState("all");

  // Selection & overlay states
  const [selectedRecord, setSelectedRecord] = useState<AuditLogRecord | null>(null);
  const [isDetailsDrawerOpen, setIsDetailsDrawerOpen] = useState(false);
  const [isSimulateEmptyState, setIsSimulateEmptyState] = useState(false);

  // Table customization states
  const [tableDensity, setTableDensity] = useState<"compact" | "standard" | "cozy">("standard");
  const [visibleColumns, setVisibleColumns] = useState<Record<string, boolean>>({
    timestamp: true,
    user: true,
    role: true,
    module: true,
    action: true,
    entity: true,
    ip: true,
    device: true,
    severity: true,
    status: true,
    duration: true
  });
  const [showColumnDropdown, setShowColumnDropdown] = useState(false);

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  // Sorting states
  const [sortField, setSortField] = useState<keyof AuditLogRecord | "">("timestamp");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc");

  // Real-time logger state
  const [isLiveActive, setIsLiveActive] = useState(true);
  const [liveLogs, setLiveLogs] = useState<AuditLogRecord[]>(AUDIT_LOGS_REGISTRY.slice(0, 3));

  // Sync loading on mount
  useEffect(() => {
    setMounted(true);
    setLastSyncTime(new Date().toLocaleTimeString());
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 700);
    return () => clearTimeout(timer);
  }, []);

  // Simulate streaming log events
  useEffect(() => {
    if (!isLiveActive) return;
    const interval = setInterval(() => {
      // Pick random record from registry to push
      const randomRecord = AUDIT_LOGS_REGISTRY[Math.floor(Math.random() * AUDIT_LOGS_REGISTRY.length)];
      const freshRecord = {
        ...randomRecord,
        id: `AUD-${Math.floor(Math.random() * 100) + 810}`,
        timestamp: new Date().toLocaleTimeString()
      };
      setLiveLogs(prev => [freshRecord, ...prev.slice(0, 4)]);
    }, 4000);
    return () => clearInterval(interval);
  }, [isLiveActive]);

  // Synchronize data manually
  const handleRefresh = useCallback(() => {
    setIsLoading(true);
    setIsError(false);
    setTimeout(() => {
      setIsLoading(false);
      setLastSyncTime(new Date().toLocaleTimeString());
      toast.success("Cryptographic audit trails re-verified.");
    }, 650);
  }, []);

  // Export handlers
  const handleExport = (format: "PDF" | "CSV" | "Excel" | "JSON") => {
    const toastId = toast.loading(`Generating cryptographically signed audit ${format} logs...`);
    setTimeout(() => {
      try {
        let content = "";
        let filename = `arthdrishti_audit_${new Date().toISOString().split("T")[0]}`;
        
        if (format === "JSON") {
          content = JSON.stringify(AUDIT_LOGS_REGISTRY, null, 2);
          filename += ".json";
        } else if (format === "CSV") {
          content = "Event ID,Timestamp,Actor,Role,Action,Module,IP Address,Severity,Status,Duration (ms)\n";
          AUDIT_LOGS_REGISTRY.forEach(a => {
            content += `${a.id},${a.timestamp},${a.actor},${a.role},${a.action},${a.module},${a.ip},${a.severity},${a.status},${a.duration}ms\n`;
          });
          filename += ".csv";
        } else {
          content = `ARTHDRISHTI COMPLIANCE AUDIT LEDGER\n==================================\n`;
          content += `Export Date: ${new Date().toLocaleString()}\n`;
          content += `Integrity Status: VERIFIED SHA-256 SECURED\n\n`;
          AUDIT_LOGS_REGISTRY.forEach(a => {
            content += `[${a.timestamp}] ID: ${a.id} | Actor: ${a.actor} (${a.role}) | Action: ${a.action} | Status: ${a.status} (Ping: ${a.duration}ms)\n`;
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

        toast.success(`Successfully exported signed ${format} log files.`, { id: toastId });
      } catch (err) {
        toast.error(`Failed to export ${format} reports.`, { id: toastId });
      }
    }, 1200);
  };

  // Archive logs manual trigger
  const handleArchiveLogs = () => {
    toast.promise(
      new Promise((resolve) => setTimeout(resolve, 2000)),
      {
        loading: "Compressing active audit segments into cold storage vault S3...",
        success: "Logs Older than 180 Days archived successfully. Hash index locked.",
        error: "Archive failed."
      }
    );
  };

  // Reset all filters in advanced filter bar
  const handleResetFilters = () => {
    setSearchTerm("");
    setSelectedRole("all");
    setSelectedOrg("all");
    setSelectedModule("all");
    setSelectedAction("all");
    setSelectedSeverity("all");
    setSelectedStatus("all");
    setIpQuery("");
    setSelectedTimeframe("all");
    toast.info("Audit filters reset to default.");
  };

  const handleSaveView = () => {
    toast.success("Saved filter configuration to your custom compliance bookmarks.");
  };

  // Table header click sorting logic
  const handleSort = (field: keyof AuditLogRecord) => {
    if (sortField === field) {
      setSortDirection(prev => prev === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("desc");
    }
  };

  // Unique selectors arrays
  const uniqueRoles = useMemo(() => ["all", ...Array.from(new Set(AUDIT_LOGS_REGISTRY.map(r => r.role)))], []);
  const uniqueOrgs = useMemo(() => ["all", ...Array.from(new Set(AUDIT_LOGS_REGISTRY.map(r => r.organization)))], []);
  const uniqueModules = useMemo(() => ["all", ...Array.from(new Set(AUDIT_LOGS_REGISTRY.map(r => r.module)))], []);
  const uniqueActions = useMemo(() => ["all", ...Array.from(new Set(AUDIT_LOGS_REGISTRY.map(r => r.action)))], []);

  // Filter registry records matching criteria
  const filteredRecords = useMemo(() => {
    if (isSimulateEmptyState) return [];
    return AUDIT_LOGS_REGISTRY.filter(r => {
      const matchesSearch = r.actor.toLowerCase().includes(searchTerm.toLowerCase()) || 
                            r.entity.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            r.details.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesRole = selectedRole === "all" || r.role === selectedRole;
      const matchesOrg = selectedOrg === "all" || r.organization === selectedOrg;
      const matchesModule = selectedModule === "all" || r.module === selectedModule;
      const matchesAction = selectedAction === "all" || r.action === selectedAction;
      const matchesSeverity = selectedSeverity === "all" || r.severity === selectedSeverity;
      const matchesStatus = selectedStatus === "all" || r.status === selectedStatus;
      const matchesIp = ipQuery === "" || r.ip.includes(ipQuery);
      
      let matchesTime = true;
      if (selectedTimeframe === "24h") {
        matchesTime = r.timestamp.includes("2026-07-14");
      }

      return matchesSearch && matchesRole && matchesOrg && matchesModule && matchesAction && matchesSeverity && matchesStatus && matchesIp && matchesTime;
    });
  }, [searchTerm, selectedRole, selectedOrg, selectedModule, selectedAction, selectedSeverity, selectedStatus, ipQuery, selectedTimeframe, isSimulateEmptyState]);

  // Sort filtered records
  const sortedRecords = useMemo(() => {
    if (!sortField) return filteredRecords;
    return [...filteredRecords].sort((a, b) => {
      const valA = a[sortField];
      const valB = b[sortField];

      if (valA === null) return 1;
      if (valB === null) return -1;

      if (typeof valA === "string" && typeof valB === "string") {
        return sortDirection === "asc" ? valA.localeCompare(valB) : valB.localeCompare(valA);
      }

      if (typeof valA === "number" && typeof valB === "number") {
        return sortDirection === "asc" ? valA - valB : valB - valA;
      }
      return 0;
    });
  }, [filteredRecords, sortField, sortDirection]);

  // Paginated records
  const paginatedRecords = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return sortedRecords.slice(startIndex, startIndex + itemsPerPage);
  }, [sortedRecords, currentPage]);

  const totalPages = Math.ceil(sortedRecords.length / itemsPerPage) || 1;

  // Reset pagination index on filter changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, selectedRole, selectedOrg, selectedModule, selectedAction, selectedSeverity, selectedStatus, ipQuery, selectedTimeframe]);

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

  const handleRowClick = (row: AuditLogRecord) => {
    setSelectedRecord(row);
    setIsDetailsDrawerOpen(true);
  };

  // Severity color mappings
  const getSeverityBadgeVariant = (sev: SeverityLevel) => {
    switch (sev) {
      case "Low":
        return "default";
      case "Medium":
        return "warning";
      case "High":
        return "warning";
      case "Critical":
        return "destructive";
      default:
        return "default";
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Success":
      case "Verified":
      case "Active":
        return "text-positive bg-positive/10 border-positive/20";
      case "Suspended":
      case "Warning":
      case "Medium":
      case "High":
        return "text-warning bg-warning/10 border-warning/20";
      case "Failed":
      case "Critical":
        return "text-critical bg-critical/10 border-critical/20 animate-pulse";
      default:
        return "text-foreground-secondary bg-surface-elevated border-border";
    }
  };

  if (!mounted) return null;

  return (
    <PageContainer>
      {/* 1. Page Header Actions */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 border-b border-border/60 pb-5 mb-6 select-none">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="font-heading font-bold text-2xl md:text-3xl text-foreground tracking-tight">
              Audit Logs
            </h1>
            <span className="h-2 w-2 rounded-full bg-forecast animate-pulse" title="SHA-256 Cryptographic ledger verified" />
          </div>
          <p className="font-sans text-sm text-foreground-secondary mt-1.5 leading-relaxed max-w-[800px]">
            Track every user action, administrative operation, AI activity, security event, configuration change and system event for compliance and governance.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleRefresh}
            className="h-9 px-3.5 focus-visible:outline-2"
            aria-label="Synchronize audit trail ledger"
          >
            <RefreshCw className={cn("h-3.5 w-3.5 mr-1.5", isLoading && "animate-spin")} />
            <span>Refresh</span>
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={handleArchiveLogs}
            className="h-9 px-3.5 focus-visible:outline-2"
            aria-label="Archive logs older than 180 days to cold storage bucket"
          >
            <Archive className="h-3.5 w-3.5 mr-1.5 text-warning" />
            <span>Archive Logs</span>
          </Button>

          <Dropdown
            align="right"
            trigger={
              <Button variant="outline" size="sm" className="h-9 px-3.5 focus-visible:outline-2" aria-label="Export audit ledger documents options">
                <Download className="h-3.5 w-3.5 mr-1.5" />
                <span>Export Logs</span>
              </Button>
            }
            items={[
              { id: "PDF", label: "PDF Report", icon: FileText, onClick: () => handleExport("PDF") },
              { id: "CSV", label: "CSV Spreadsheet", icon: FileSpreadsheet, onClick: () => handleExport("CSV") },
              { id: "Excel", label: "Excel Sheets", icon: FileDown, onClick: () => handleExport("Excel") },
              { id: "JSON", label: "JSON Metadata", icon: Terminal, onClick: () => handleExport("JSON") }
            ]}
          />
        </div>
      </div>

      {/* Diagnostics Simulator controls */}
      <div className="flex flex-wrap items-center justify-between gap-4 bg-surface border border-border p-4 rounded-sm mb-6 select-none shadow-xs">
        
        {/* Navigation Tabs */}
        <Tabs
          tabs={[
            { id: "registry", label: "Audit Registry Logs", icon: Layers },
            { id: "security", label: "Security & Compliance Auditing", icon: ShieldCheck }
          ]}
          activeTab={activeTab}
          onChangeTab={setActiveTab}
        />

        <div className="flex items-center gap-2">
          {/* Simulate empty list filter state */}
          <Tooltip content="Toggle to simulate missing compliance registry records">
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
          <Tooltip content="Toggle to simulate network authentication logs query error">
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

      {/* ERROR PANEL RETRY RETRIES */}
      {isError ? (
        <Card className="border border-critical bg-critical/5 select-none my-8 p-8 flex flex-col items-center justify-center text-center gap-4">
          <div className="h-12 w-12 rounded-full bg-critical/10 flex items-center justify-center text-critical">
            <ShieldAlert className="h-6 w-6" />
          </div>
          <div>
            <CardTitle className="text-lg font-heading font-bold text-foreground">
              Audit Database Connection Interrupted
            </CardTitle>
            <CardDescription className="text-sm font-sans mt-2 max-w-lg mx-auto">
              Cryptographic ledger signatures check failed. Database validation checks timed out. Reconnect to gateway clusters to retry verification.
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
              <span>Retry Re-verification</span>
            </Button>
          </div>
        </Card>
      ) : (
        <>
          {/* TAB 1: AUDIT REGISTRY LEDGER */}
          {activeTab === "registry" && (
            <div className="space-y-6">
              
              {/* 8 summary KPI cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {AUDIT_TELEMETRY_DB.kpis.map((kpi) => {
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

              {/* Advanced filter toolbar card */}
              <Card className="bg-surface/50 border border-border/80 select-none shadow-xs">
                <CardContent className="py-4 px-6 flex flex-col gap-4">
                  
                  {/* Row 1: Search & Reset */}
                  <div className="flex flex-col md:flex-row gap-4 items-center">
                    
                    <div className="relative w-full flex-1">
                      <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-foreground-muted pointer-events-none" />
                      <input
                        type="text"
                        placeholder="Search logs by actor user, target resource, details..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full h-10 pl-10 pr-4 py-2 text-xs font-sans bg-surface-elevated border border-border focus:border-primary outline-none rounded-sm transition-colors text-foreground"
                        aria-label="Search logs by keyword"
                      />
                    </div>

                    <div className="flex items-center gap-2 w-full md:w-auto">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={handleResetFilters}
                        className="h-10 px-4 text-xs font-semibold"
                      >
                        <X className="h-3.5 w-3.5 mr-1.5 text-foreground-muted" />
                        <span>Reset Filters</span>
                      </Button>
                      <Button
                        variant="primary"
                        size="sm"
                        onClick={handleSaveView}
                        className="h-10 px-4 text-xs font-semibold bg-primary text-white"
                      >
                        <Save className="h-3.5 w-3.5 mr-1.5" />
                        <span>Save View</span>
                      </Button>
                    </div>

                  </div>

                  {/* Row 2: Selectors */}
                  <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-8 gap-3 border-t border-border/40 pt-4">
                    
                    {/* User actor */}
                    <div className="flex flex-col gap-1">
                      <label className="text-[9px] uppercase font-bold text-foreground-muted">Role</label>
                      <select
                        value={selectedRole}
                        onChange={(e) => setSelectedRole(e.target.value)}
                        className="text-xs bg-surface-elevated border border-border px-2.5 py-2 focus:border-primary outline-none rounded-sm transition-colors text-foreground cursor-pointer"
                        aria-label="Filter logs by role selection"
                      >
                        {uniqueRoles.map(r => (
                          <option key={r} value={r}>{r === "all" ? "All Roles" : r}</option>
                        ))}
                      </select>
                    </div>

                    {/* Organization */}
                    <div className="flex flex-col gap-1">
                      <label className="text-[9px] uppercase font-bold text-foreground-muted">Organization</label>
                      <select
                        value={selectedOrg}
                        onChange={(e) => setSelectedOrg(e.target.value)}
                        className="text-xs bg-surface-elevated border border-border px-2.5 py-2 focus:border-primary outline-none rounded-sm transition-colors text-foreground cursor-pointer"
                        aria-label="Filter logs by organization selection"
                      >
                        {uniqueOrgs.map(o => (
                          <option key={o} value={o}>{o === "all" ? "All Orgs" : o}</option>
                        ))}
                      </select>
                    </div>

                    {/* Module */}
                    <div className="flex flex-col gap-1">
                      <label className="text-[9px] uppercase font-bold text-foreground-muted">Module</label>
                      <select
                        value={selectedModule}
                        onChange={(e) => setSelectedModule(e.target.value)}
                        className="text-xs bg-surface-elevated border border-border px-2.5 py-2 focus:border-primary outline-none rounded-sm transition-colors text-foreground cursor-pointer"
                        aria-label="Filter logs by module selection"
                      >
                        {uniqueModules.map(m => (
                          <option key={m} value={m}>{m === "all" ? "All Modules" : m}</option>
                        ))}
                      </select>
                    </div>

                    {/* Action types */}
                    <div className="flex flex-col gap-1">
                      <label className="text-[9px] uppercase font-bold text-foreground-muted">Action Type</label>
                      <select
                        value={selectedAction}
                        onChange={(e) => setSelectedAction(e.target.value)}
                        className="text-xs bg-surface-elevated border border-border px-2.5 py-2 focus:border-primary outline-none rounded-sm transition-colors text-foreground cursor-pointer"
                        aria-label="Filter logs by action type selection"
                      >
                        {uniqueActions.map(a => (
                          <option key={a} value={a}>{a === "all" ? "All Actions" : a}</option>
                        ))}
                      </select>
                    </div>

                    {/* Severity */}
                    <div className="flex flex-col gap-1">
                      <label className="text-[9px] uppercase font-bold text-foreground-muted">Severity</label>
                      <select
                        value={selectedSeverity}
                        onChange={(e) => setSelectedSeverity(e.target.value)}
                        className="text-xs bg-surface-elevated border border-border px-2.5 py-2 focus:border-primary outline-none rounded-sm transition-colors text-foreground cursor-pointer"
                        aria-label="Filter logs by severity level selection"
                      >
                        <option value="all">All Severities</option>
                        <option value="Low">Low</option>
                        <option value="Medium">Medium</option>
                        <option value="High">High</option>
                        <option value="Critical">Critical</option>
                      </select>
                    </div>

                    {/* Status */}
                    <div className="flex flex-col gap-1">
                      <label className="text-[9px] uppercase font-bold text-foreground-muted">Status</label>
                      <select
                        value={selectedStatus}
                        onChange={(e) => setSelectedStatus(e.target.value)}
                        className="text-xs bg-surface-elevated border border-border px-2.5 py-2 focus:border-primary outline-none rounded-sm transition-colors text-foreground cursor-pointer"
                        aria-label="Filter logs by status code"
                      >
                        <option value="all">All Statuses</option>
                        <option value="Success">Success</option>
                        <option value="Failed">Failed</option>
                        <option value="Suspended">Suspended</option>
                      </select>
                    </div>

                    {/* IP query input */}
                    <div className="flex flex-col gap-1">
                      <label className="text-[9px] uppercase font-bold text-foreground-muted">IP Address</label>
                      <input
                        value={ipQuery}
                        onChange={(e) => setIpQuery(e.target.value)}
                        placeholder="e.g. 192.168"
                        className="text-xs bg-surface-elevated border border-border px-2.5 py-2.25 focus:border-primary outline-none rounded-sm transition-colors text-foreground"
                        aria-label="Filter logs by IP Address"
                      />
                    </div>

                    {/* Timeframe */}
                    <div className="flex flex-col gap-1">
                      <label className="text-[9px] uppercase font-bold text-foreground-muted">Timeframe</label>
                      <select
                        value={selectedTimeframe}
                        onChange={(e) => setSelectedTimeframe(e.target.value)}
                        className="text-xs bg-surface-elevated border border-border px-2.5 py-2 focus:border-primary outline-none rounded-sm transition-colors text-foreground cursor-pointer"
                        aria-label="Filter logs by timeframe selection"
                      >
                        <option value="all">All History</option>
                        <option value="24h">Last 24 Hours</option>
                      </select>
                    </div>

                  </div>

                </CardContent>
              </Card>

              {/* Table Options Row (Visible Columns / Density) */}
              <div className="flex flex-wrap items-center justify-between gap-4 select-none">
                <span className="text-xs text-foreground-secondary">
                  Found <span className="font-semibold text-foreground">{sortedRecords.length}</span> compliance audit items
                </span>

                <div className="flex items-center gap-2">
                  
                  {/* Density toggle controls */}
                  <div className="flex border border-border bg-surface-elevated p-0.5 rounded-sm">
                    {(["compact", "standard", "cozy"] as const).map((density) => (
                      <button
                        key={density}
                        onClick={() => setTableDensity(density)}
                        className={cn(
                          "px-2.5 py-1 text-[10px] font-sans font-bold uppercase rounded-xs transition-colors cursor-pointer outline-none focus-visible:outline-2",
                          tableDensity === density
                            ? "bg-surface text-foreground shadow-xs border border-border/80"
                            : "text-foreground-secondary hover:text-foreground"
                        )}
                        aria-label={`Set registry list density layout to ${density}`}
                      >
                        {density}
                      </button>
                    ))}
                  </div>

                  {/* Columns Visibility checklist */}
                  <div className="relative">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setShowColumnDropdown(prev => !prev)}
                      className="h-9 px-3.5 focus-visible:outline-2"
                      aria-label="Configure visible table columns checklist"
                    >
                      <Eye className="h-3.5 w-3.5 mr-1.5" />
                      <span>Columns</span>
                    </Button>
                    {showColumnDropdown && (
                      <div className="absolute right-0 mt-2 z-40 w-44 bg-surface-elevated border border-border rounded-sm shadow-lg p-2.5 flex flex-col gap-1.5">
                        <div className="text-[9px] uppercase font-bold text-foreground-muted tracking-wider mb-1">
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
                            <span className="capitalize">{col}</span>
                          </label>
                        ))}
                      </div>
                    )}
                  </div>

                </div>
              </div>

              {/* Main Directory Table */}
              <Card className="overflow-hidden flex flex-col">
                <CardContent className="p-0 overflow-x-auto relative">
                  {isLoading ? (
                    <div className="p-8 space-y-4 animate-pulse select-none">
                      {[1, 2, 3, 4].map(idx => (
                        <div key={idx} className="h-8 bg-surface-elevated rounded-sm w-full" />
                      ))}
                    </div>
                  ) : paginatedRecords.length === 0 ? (
                    <div className="p-12 text-center flex flex-col items-center justify-center gap-3 select-none">
                      <div className="h-10 w-10 rounded-full bg-surface-elevated border border-border flex items-center justify-center text-foreground-muted">
                        <ShieldAlert className="h-5 w-5" />
                      </div>
                      <div>
                        <h4 className="text-sm font-semibold text-foreground">No Audit Events Found</h4>
                        <p className="text-xs text-foreground-muted mt-1 max-w-xs">
                          We couldn't find any compliance trail records matching your active filters.
                        </p>
                      </div>
                    </div>
                  ) : (
                    <table className="w-full border-collapse text-left font-sans text-xs min-w-[1000px]" aria-label="Registry log table ledger of signed compliance records">
                      <thead>
                        <tr className="border-b border-border/40 bg-surface-elevated/40 select-none text-foreground-secondary font-semibold uppercase tracking-wider sticky top-0 z-10 backdrop-blur-xs">
                          {visibleColumns.timestamp && (
                            <th 
                              onClick={() => handleSort("timestamp")}
                              className="p-3 pl-6 cursor-pointer hover:text-foreground transition-colors"
                            >
                              Timestamp {sortField === "timestamp" && (sortDirection === "asc" ? "▲" : "▼")}
                            </th>
                          )}
                          {visibleColumns.user && <th className="p-3">User</th>}
                          {visibleColumns.role && <th className="p-3">Role</th>}
                          {visibleColumns.module && <th className="p-3">Module</th>}
                          {visibleColumns.action && <th className="p-3">Action</th>}
                          {visibleColumns.entity && <th className="p-3">Entity</th>}
                          {visibleColumns.ip && <th className="p-3">IP Address</th>}
                          {visibleColumns.device && <th className="p-3">Device</th>}
                          {visibleColumns.severity && <th className="p-3">Severity</th>}
                          {visibleColumns.status && <th className="p-3">Status</th>}
                          {visibleColumns.duration && (
                            <th 
                              onClick={() => handleSort("duration")}
                              className="p-3 cursor-pointer hover:text-foreground transition-colors"
                            >
                              Duration {sortField === "duration" && (sortDirection === "asc" ? "▲" : "▼")}
                            </th>
                          )}
                          <th className="p-3 pr-6 text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-border/40 select-text">
                        {paginatedRecords.map((row) => (
                          <tr
                            key={row.id}
                            className={cn(
                              "hover:bg-surface-elevated/40 transition-colors group cursor-pointer",
                              row.status === "Failed" && "bg-critical/5/5",
                              tableDensity === "compact" ? "h-9" : tableDensity === "cozy" ? "h-14" : "h-11"
                            )}
                            onClick={() => handleRowClick(row)}
                          >
                            {visibleColumns.timestamp && (
                              <td className="p-3 pl-6 font-mono text-foreground-secondary truncate max-w-[130px]">
                                {row.timestamp}
                              </td>
                            )}
                            {visibleColumns.user && (
                              <td className="p-3 font-semibold text-foreground truncate max-w-[120px]" title={row.actor}>
                                {row.actor}
                              </td>
                            )}
                            {visibleColumns.role && (
                              <td className="p-3 font-medium text-foreground-secondary truncate max-w-[110px]" title={row.role}>
                                {row.role}
                              </td>
                            )}
                            {visibleColumns.module && (
                              <td className="p-3 text-foreground-secondary">{row.module}</td>
                            )}
                            {visibleColumns.action && (
                              <td className="p-3">
                                <span className={cn(
                                  "font-mono font-bold px-1.5 py-0.5 rounded-xs text-[10px]",
                                  row.action === "Approve" ? "text-positive bg-positive/10 border-positive/20" : row.action === "Security Event" ? "text-critical bg-critical/10 border-critical/20" : "text-primary bg-primary/10 border-primary/20"
                                )}>
                                  {row.action}
                                </span>
                              </td>
                            )}
                            {visibleColumns.entity && (
                              <td className="p-3 font-medium text-foreground-secondary truncate max-w-[130px]" title={row.entity}>
                                {row.entity}
                              </td>
                            )}
                            {visibleColumns.ip && (
                              <td className="p-3 font-mono text-foreground-muted">{row.ip}</td>
                            )}
                            {visibleColumns.device && (
                              <td className="p-3 text-foreground-secondary truncate max-w-[110px]" title={row.device}>
                                {row.device}
                              </td>
                            )}
                            {visibleColumns.severity && (
                              <td className="p-3">
                                <span className={cn("inline-flex items-center rounded-xs px-2 py-0.5 text-[9px] font-bold border", getStatusColor(row.severity))}>
                                  {row.severity}
                                </span>
                              </td>
                            )}
                            {visibleColumns.status && (
                              <td className="p-3">
                                <span className={cn("inline-flex items-center rounded-xs px-2 py-0.5 text-[9px] font-bold border", getStatusColor(row.status))}>
                                  {row.status}
                                </span>
                              </td>
                            )}
                            {visibleColumns.duration && (
                              <td className="p-3 font-mono text-foreground-secondary">
                                {row.duration}ms
                              </td>
                            )}
                            <td className="p-3 pr-6 text-right" onClick={(e) => e.stopPropagation()}>
                              <button
                                onClick={() => handleRowClick(row)}
                                className="text-xs text-primary font-semibold hover:underline outline-none focus-visible:outline-2 cursor-pointer"
                                aria-label={`View audit trace for ${row.id}`}
                              >
                                View Trace
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  )}
                </CardContent>

                {/* Table pagination footer */}
                {!isLoading && sortedRecords.length > 0 && (
                  <CardFooter className="flex items-center justify-between p-4 border-t border-border/40 bg-surface select-none">
                    <span className="text-xs text-foreground-secondary">
                      Showing <span className="font-semibold text-foreground">{(currentPage - 1) * itemsPerPage + 1}</span> to{" "}
                      <span className="font-semibold text-foreground">
                        {Math.min(currentPage * itemsPerPage, sortedRecords.length)}
                      </span>{" "}
                      of <span className="font-semibold text-foreground">{sortedRecords.length}</span> compliance audits
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

              {/* Log Retention Policy cards */}
              <div className="select-none pt-4">
                <div className="border-b border-border/40 pb-3 mb-4">
                  <h3 className="text-sm font-heading font-semibold text-foreground uppercase tracking-wider">Log Retention & Archiving Policies</h3>
                  <p className="text-xs text-foreground-secondary mt-0.5 font-sans">Active schemas dictating the hot storage lifecycle and vault compression pipelines.</p>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 animate-fadeIn">
                  {AUDIT_TELEMETRY_DB.retentionPolicies.map((p, idx) => (
                    <Card key={idx} className="bg-surface border border-border p-4 flex flex-col justify-between gap-3 shadow-xs">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-semibold text-foreground truncate">{p.label}</span>
                        <span className="inline-flex items-center rounded-xs px-2 py-0.5 text-[9px] font-bold border border-positive/20 text-positive bg-positive/5">
                          {p.status}
                        </span>
                      </div>
                      <div className="flex justify-between items-baseline text-xs mt-1">
                        <span className="text-foreground-secondary">Storage Duration</span>
                        <span className="font-mono font-bold text-primary">{p.duration}</span>
                      </div>
                    </Card>
                  ))}
                </div>
              </div>

            </div>
          )}

          {/* TAB 2: SECURITY & COMPLIANCE PANEL */}
          {activeTab === "security" && (
            <div className="space-y-6">
              
              {/* Compliance scorecards & Security Events Grid */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 select-none">
                
                {/* Security threat cards list */}
                <div className="lg:col-span-2 space-y-4">
                  <div className="border-b border-border/40 pb-3">
                    <h3 className="text-sm font-heading font-semibold text-foreground uppercase tracking-wider">Edge Gateway Security Incidents</h3>
                    <p className="text-xs text-foreground-secondary mt-0.5">Threat triggers compiled from active proxy access registries.</p>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 animate-fadeIn">
                    {AUDIT_TELEMETRY_DB.securityCards.map((sec, idx) => (
                      <Card key={idx} className="bg-surface border border-border p-4 flex flex-col justify-between gap-3 shadow-xs">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold text-foreground truncate">{sec.title}</span>
                          <span className={cn("inline-flex items-center rounded-xs px-2 py-0.5 text-[9px] font-bold border", getStatusColor(sec.status))}>
                            {sec.count} Events
                          </span>
                        </div>
                        <p className="text-xs text-foreground-secondary leading-relaxed h-11 overflow-hidden font-sans">
                          {sec.description}
                        </p>
                      </Card>
                    ))}
                  </div>
                </div>

                {/* Compliance Coverage Indicators */}
                <div className="space-y-4">
                  <div className="border-b border-border/40 pb-3">
                    <h3 className="text-sm font-heading font-semibold text-foreground uppercase tracking-wider">Regulatory Compliance Scorecard</h3>
                    <p className="text-xs text-foreground-secondary mt-0.5">Governance indicators mapping audit coverage parameters.</p>
                  </div>
                  <div className="grid grid-cols-1 gap-2.5 max-h-[300px] overflow-y-auto pr-1">
                    {AUDIT_TELEMETRY_DB.complianceCards.map((com, idx) => (
                      <div key={idx} className="p-3 rounded-sm bg-surface border border-border hover:bg-surface-elevated/40 transition-colors flex items-center justify-between">
                        <div className="flex flex-col text-left min-w-0">
                          <span className="text-xs font-semibold text-foreground truncate">{com.title}</span>
                          <span className="text-[9px] text-foreground-muted truncate font-sans leading-none mt-1">{com.description}</span>
                        </div>
                        <span className={cn("inline-flex items-center rounded-xs px-2.5 py-1 text-xs font-bold border font-mono", getStatusColor(com.status))}>
                          {com.value}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

              </div>

              {/* Event Timeline & Real-time Live Log stream */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 select-none">
                
                {/* Event Timeline */}
                <Card className="bg-surface border border-border shadow-xs">
                  <CardHeader className="border-b border-border/40 pb-4">
                    <CardTitle className="text-base sm:text-lg font-heading">
                      Compliance Timeline
                    </CardTitle>
                    <CardDescription className="text-xs">
                      Chronological ledger tracking key deployment overrides, rate limit adjustments, and logins.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="pt-6 overflow-y-auto max-h-[340px] scrollbar-none pr-1">
                    {isLoading ? (
                      <div className="space-y-4 animate-pulse">
                        {[1, 2, 3].map(idx => (
                          <div key={idx} className="h-10 bg-surface-elevated rounded-sm w-full" />
                        ))}
                      </div>
                    ) : isSimulateEmptyState ? (
                      <div className="text-center p-6 text-foreground-muted text-xs flex flex-col items-center justify-center gap-2">
                        <Clock className="h-6 w-6 text-foreground-muted" />
                        <span>No Compliance Events Captured</span>
                      </div>
                    ) : (
                      <div className="relative border-l border-border pl-4.5 ml-2.5 space-y-5">
                        {AUDIT_TELEMETRY_DB.timeline.map((event) => {
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

                {/* Real-time Streaming activity feed */}
                <Card className="bg-surface border border-border shadow-xs flex flex-col justify-between">
                  <CardHeader className="border-b border-border/40 pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                      <CardTitle className="text-base sm:text-lg font-heading flex items-center gap-2">
                        <span>Live Audits Stream</span>
                        {isLiveActive && (
                          <span className="h-1.5 w-1.5 rounded-full bg-positive animate-ping" />
                        )}
                      </CardTitle>
                      <CardDescription className="text-xs">
                        Streaming platform logs parsed through JWT access checkers.
                      </CardDescription>
                    </div>
                    
                    <button
                      onClick={() => setIsLiveActive(prev => !prev)}
                      className={cn(
                        "px-3 py-1.5 text-[10px] font-bold uppercase rounded-sm border cursor-pointer transition-colors focus-visible:outline-2 outline-none flex items-center gap-1.5",
                        isLiveActive 
                          ? "bg-positive/10 text-positive border-positive/30 hover:bg-positive hover:text-white" 
                          : "bg-surface-elevated text-foreground-secondary border-border hover:bg-surface-hover"
                      )}
                      aria-label={isLiveActive ? "Pause active live audits stream" : "Resume live audits stream"}
                    >
                      {isLiveActive ? <Pause className="h-3 w-3" /> : <Play className="h-3 w-3" />}
                      <span>{isLiveActive ? "Pause" : "Resume"}</span>
                    </button>
                  </CardHeader>
                  <CardContent className="pt-4 overflow-y-auto max-h-[340px] pr-1 flex-1 flex flex-col gap-3 font-mono">
                    {liveLogs.map((log) => (
                      <div key={log.id} className="p-3 bg-surface-elevated/40 border border-border/50 hover:border-border rounded-sm text-[10px] leading-relaxed text-foreground-secondary flex flex-col gap-1 hover:bg-surface-elevated/60 transition-colors">
                        <div className="flex items-center justify-between text-foreground">
                          <span className="font-bold flex items-center gap-1.5">
                            <span className="text-[9px] font-sans font-bold px-1.5 py-0.25 rounded-xs text-primary bg-primary/10">{log.action}</span>
                            <span>{log.actor}</span>
                          </span>
                          <span className="text-[9px] text-foreground-muted">{log.timestamp}</span>
                        </div>
                        <div className="truncate text-foreground-secondary font-sans leading-none mt-1">Resource: <span className="font-mono text-foreground font-semibold">{log.entity}</span></div>
                        <div className="text-[9px] text-foreground-muted mt-1 leading-normal break-all font-sans">{log.details}</div>
                      </div>
                    ))}
                  </CardContent>
                </Card>

              </div>

            </div>
          )}
        </>
      )}


      {/* 7. Detailed Compliance Trace Drawer sheet */}
      <Sheet
        isOpen={isDetailsDrawerOpen}
        onClose={() => setIsDetailsDrawerOpen(false)}
        title={selectedRecord ? `Audit Record Trace: ${selectedRecord.id}` : "Audit Log Record details"}
        side="right"
        className="w-full max-w-md sm:max-w-lg"
      >
        {selectedRecord && (
          <div className="flex flex-col h-full justify-between pb-8 select-none font-sans">
            <div className="space-y-6 overflow-y-auto pr-1">
              
              {/* Profile card summary */}
              <div className="p-4 rounded-sm bg-surface-elevated border border-border flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="h-9 w-9 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center text-primary font-heading font-bold text-sm select-none">
                    {selectedRecord.actor.charAt(0)}
                  </div>
                  <div className="flex flex-col">
                    <span className="text-sm font-semibold text-foreground leading-tight">{selectedRecord.actor}</span>
                    <span className="text-[10px] text-foreground-secondary mt-0.5">{selectedRecord.role} | {selectedRecord.organization}</span>
                  </div>
                </div>
                <span className={cn("inline-flex items-center rounded-xs px-2 py-0.5 text-[9px] font-bold border", getStatusColor(selectedRecord.status))}>
                  {selectedRecord.status}
                </span>
              </div>

              {/* Event timestamp & IP */}
              <div className="p-3 bg-surface-elevated/45 border border-border/80 rounded-sm text-xs space-y-2.5">
                <div className="flex justify-between">
                  <span className="text-foreground-secondary">Timestamp</span>
                  <span className="font-mono text-foreground font-semibold">{selectedRecord.timestamp}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-foreground-secondary">Client IP Address</span>
                  <span className="font-mono text-foreground font-semibold">{selectedRecord.ip}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-foreground-secondary">City Location</span>
                  <span className="font-semibold text-foreground">{selectedRecord.location}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-foreground-secondary">Action Type</span>
                  <span className="font-mono font-bold text-primary">{selectedRecord.action}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-foreground-secondary">Module Target</span>
                  <span className="font-semibold text-foreground">{selectedRecord.module}</span>
                </div>
              </div>

              {/* Log messages details */}
              <div className="space-y-1.5">
                <h4 className="text-[10px] font-bold uppercase tracking-wider text-foreground-muted">Incident description details</h4>
                <p className="text-xs text-foreground-secondary leading-relaxed bg-surface-elevated/20 border border-border p-3 rounded-sm">
                  {selectedRecord.details}
                </p>
              </div>

              {/* Device and OS values */}
              <div className="space-y-3">
                <h4 className="text-[10px] uppercase font-bold text-foreground-muted tracking-wider font-mono">Client User Agent Device</h4>
                
                <div className="flex justify-between items-center text-xs border-b border-border/40 pb-2">
                  <span className="text-foreground-secondary font-medium">Device Type</span>
                  <span className="font-semibold text-foreground">{selectedRecord.device}</span>
                </div>

                <div className="flex justify-between items-center text-xs border-b border-border/40 pb-2">
                  <span className="text-foreground-secondary font-medium">Browser Client</span>
                  <span className="font-mono font-semibold text-foreground">{selectedRecord.browser}</span>
                </div>

                <div className="flex justify-between items-center text-xs border-b border-border/40 pb-2">
                  <span className="text-foreground-secondary font-medium">Operating System</span>
                  <span className="font-semibold text-foreground">{selectedRecord.os}</span>
                </div>
              </div>

              {/* Execution time & IDs */}
              <div className="space-y-3">
                <h4 className="text-[10px] uppercase font-bold text-foreground-muted tracking-wider font-mono">Trace Context IDs</h4>
                
                <div className="flex justify-between items-center text-xs border-b border-border/40 pb-2">
                  <span className="text-foreground-secondary font-medium">Request ID</span>
                  <span className="font-mono font-semibold text-foreground truncate max-w-[180px]">{selectedRecord.requestId}</span>
                </div>

                <div className="flex justify-between items-center text-xs border-b border-border/40 pb-2">
                  <span className="text-foreground-secondary font-medium">Correlation ID</span>
                  <span className="font-mono font-semibold text-foreground truncate max-w-[180px]">{selectedRecord.correlationId}</span>
                </div>

                <div className="flex justify-between items-center text-xs">
                  <span className="text-foreground-secondary font-medium">Execution Duration</span>
                  <span className="font-mono font-semibold text-foreground">{selectedRecord.duration} ms</span>
                </div>
              </div>

              {/* Previous vs New Values */}
              {(selectedRecord.previousValue || selectedRecord.newValue) && (
                <div className="space-y-3">
                  <h4 className="text-[10px] uppercase font-bold text-foreground-muted tracking-wider font-mono">Compliance Configuration Delta</h4>
                  
                  {selectedRecord.previousValue && (
                    <div className="space-y-1.5">
                      <span className="text-[10px] text-foreground-muted font-semibold">Previous Value</span>
                      <pre className="p-2.5 bg-neutral-900 text-neutral-400 font-mono text-[9px] rounded-xs overflow-x-auto leading-normal border border-neutral-800">
                        {selectedRecord.previousValue}
                      </pre>
                    </div>
                  )}

                  {selectedRecord.newValue && (
                    <div className="space-y-1.5">
                      <span className="text-[10px] text-foreground-muted font-semibold">New Value</span>
                      <pre className="p-2.5 bg-neutral-900 text-emerald-400 font-mono text-[9px] rounded-xs overflow-x-auto leading-normal border border-neutral-800">
                        {selectedRecord.newValue}
                      </pre>
                    </div>
                  )}
                </div>
              )}

              {/* JSON Metadata Payload */}
              <div className="space-y-1.5">
                <h4 className="text-[10px] font-bold uppercase tracking-wider text-foreground-muted flex items-center justify-between">
                  <span>Structured Metadata Payload</span>
                  <Terminal className="h-3.5 w-3.5 text-foreground-muted" />
                </h4>
                <pre className="p-3 bg-neutral-950 text-emerald-400 font-mono text-[10px] rounded-sm max-h-[160px] overflow-y-auto leading-relaxed border border-neutral-800">
                  {JSON.stringify(selectedRecord.payload, null, 2)}
                </pre>
              </div>

              {/* Related incidents */}
              {selectedRecord.relatedEvents.length > 0 && (
                <div className="space-y-1.5">
                  <h4 className="text-[10px] font-bold uppercase tracking-wider text-foreground-muted">Related Incident Chains</h4>
                  <div className="flex flex-wrap gap-1.5">
                    {selectedRecord.relatedEvents.map(e => (
                      <span key={e} className="font-mono text-[9px] font-semibold bg-surface-elevated border border-border px-2 py-0.5 rounded-xs text-foreground-secondary">
                        {e}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Regulatory Compliance Status block */}
              <div className="space-y-1.5">
                <h4 className="text-[10px] font-bold uppercase tracking-wider text-foreground-muted">Securities Governance Integrity</h4>
                <div className="p-3 bg-surface-elevated/45 border border-border/80 rounded-sm text-xs flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <ShieldCheck className="h-4.5 w-4.5 text-positive" />
                    <span className="font-semibold text-foreground">Compliance check passed</span>
                  </div>
                  <Badge variant={selectedRecord.complianceChecked ? "success" : "destructive"}>
                    {selectedRecord.complianceChecked ? "Verified Integrity" : "Unverified"}
                  </Badge>
                </div>
              </div>

            </div>

            <div className="border-t border-border/40 pt-6 mt-6 flex justify-end">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsDetailsDrawerOpen(false)}
                className="h-10 px-5 text-xs text-foreground border border-border"
              >
                Close Trace
              </Button>
            </div>
          </div>
        )}
      </Sheet>
    </PageContainer>
  );
}
