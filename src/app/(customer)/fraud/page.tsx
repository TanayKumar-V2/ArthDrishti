"use client";

import React, { useState, useMemo } from "react";
import { motion } from "framer-motion";
import { 
  ResponsiveContainer,
  ScatterChart,
  Scatter,
  XAxis,
  YAxis,
  ZAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  Cell
} from "recharts";
import { 
  Fingerprint, 
  AlertTriangle, 
  ShieldCheck, 
  Clock, 
  Search, 
  RefreshCw, 
  MapPin, 
  Globe, 
  Activity, 
  Sliders, 
  AlertCircle,
  TrendingUp, 
  Check, 
  Eye, 
  FileText,
  HelpCircle,
  ArrowUpDown,
  Filter
} from "lucide-react";
import { toast } from "sonner";

import PageContainer from "@/components/ui/PageContainer";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Sheet, Tooltip } from "@/components/ui/Overlays";
import { RiskBadge, StatusBadge } from "@/components/ui/Badge";
import { cn } from "@/lib/utils";
import { mockFraudTransactions, FraudTransaction } from "@/lib/fraudData";

export default function FraudIntelligencePage() {
  // ==========================================
  // STATE MANAGEMENT
  // ==========================================
  const [transactions, setTransactions] = useState<FraudTransaction[]>(mockFraudTransactions);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [lastScanText, setLastScanText] = useState("2 minutes ago");
  const [searchQuery, setSearchQuery] = useState("");
  const [riskFilter, setRiskFilter] = useState<string>("ALL");
  const [anomalyFilter, setAnomalyFilter] = useState<string>("ALL");
  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const [timeframe, setTimeframe] = useState<string>("30d"); // 24h, 7d, 30d, All
  
  // Sorting State
  const [sortKey, setSortKey] = useState<"date" | "amount" | "aiScore">("date");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");

  // Selection & Drawer State
  const [selectedTxnId, setSelectedTxnId] = useState<string | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;

  // Active Transaction computation
  const selectedTxn = useMemo(() => {
    return transactions.find(t => t.id === selectedTxnId) || null;
  }, [transactions, selectedTxnId]);

  // ==========================================
  // RUN ANALYSIS SIMULATION
  // ==========================================
  const handleRunAnalysis = () => {
    setIsAnalyzing(true);
    toast.info("Ingesting ledger updates and executing AI fraud scoring...", {
      description: "Analyzing 12,482 total transactions.",
      duration: 2000
    });

    setTimeout(() => {
      setIsAnalyzing(false);
      setLastScanText("Just now");
      toast.success("Scan completed. No new high-risk anomalies detected.", {
        description: "Checked against 6 core anomaly models."
      });
    }, 2000);
  };

  // ==========================================
  // DRAWER MOCK WORKFLOWS
  // ==========================================
  const handleMarkSafe = (txnId: string) => {
    setTransactions(prev => prev.map(t => {
      if (t.id === txnId) {
        return {
          ...t,
          risk: "Low",
          status: "approved",
          anomalyType: "None",
          aiScore: Math.min(t.aiScore, 10),
          whyFlagged: []
        };
      }
      return t;
    }));
    toast.success(`Transaction ${txnId} marked as Safe.`, {
      description: "Risk score updated and learning pattern feedback registered."
    });
    setIsDrawerOpen(false);
  };

  const handleInvestigate = (txnId: string) => {
    setTransactions(prev => prev.map(t => {
      if (t.id === txnId) {
        return { ...t, status: "under_review" };
      }
      return t;
    }));
    toast.info(`Investigation file opened for ${txnId}.`, {
      description: "Flagged for manual operations review queue."
    });
  };

  const handleGenerateReport = (txnId: string) => {
    toast.success(`Fraud audit report generated for ${txnId}.`, {
      description: "PDF report exported to workspace archive."
    });
  };

  // ==========================================
  // DERIVED DATA & FILTERS
  // ==========================================
  // Total transaction metrics
  const stats = useMemo(() => {
    const totalCount = 12482; // static total analyzed from request
    const highRiskCount = transactions.filter(t => t.risk === "High" || t.risk === "Critical").length;
    const mediumRiskCount = transactions.filter(t => t.risk === "Medium").length;
    const lowRiskCount = transactions.filter(t => t.risk === "Low").length;

    return {
      totalCount,
      highRiskCount,
      mediumRiskCount,
      lowRiskCount
    };
  }, [transactions]);

  // Compute Anomaly distribution counts (Anomaly Summary)
  const anomalySummaryData = useMemo(() => {
    const defaultCounts = {
      "Unusual Amount": 0,
      "Unusual Time": 0,
      "New Merchant": 0,
      "Location Anomaly": 0,
      "Transaction Frequency": 0,
      "Behavior Deviation": 0,
    };

    transactions.forEach(t => {
      if (t.anomalyType !== "None" && t.anomalyType in defaultCounts) {
        defaultCounts[t.anomalyType as keyof typeof defaultCounts]++;
      }
    });

    const totalFlagged = Object.values(defaultCounts).reduce((a, b) => a + b, 0) || 1;

    return Object.entries(defaultCounts).map(([key, val]) => ({
      name: key,
      count: val,
      percentage: Math.round((val / totalFlagged) * 100),
      description: key === "Unusual Amount" ? "Amount deviates significantly from account history threshold bounds."
                 : key === "Unusual Time" ? "Executed during atypical operating hours for this user profile."
                 : key === "New Merchant" ? "First transaction with a newly registered vendor gateway."
                 : key === "Location Anomaly" ? "IP/Terminal geographical distance velocity violation."
                 : key === "Transaction Frequency" ? "High-velocity transaction bursts within short intervals."
                 : "Out-of-pattern spending sector or device fingerprint deviation."
    }));
  }, [transactions]);



  // Filter & Search Logic
  const filteredTransactions = useMemo(() => {
    return transactions.filter(t => {
      // 1. Text Search (Merchant, Account, ID)
      const matchesSearch = 
        t.merchant.toLowerCase().includes(searchQuery.toLowerCase()) ||
        t.account.toLowerCase().includes(searchQuery.toLowerCase()) ||
        t.id.toLowerCase().includes(searchQuery.toLowerCase());

      // 2. Risk Level filter
      const matchesRisk = riskFilter === "ALL" || t.risk === riskFilter;

      // 3. Anomaly Type filter
      const matchesAnomaly = anomalyFilter === "ALL" || t.anomalyType === anomalyFilter;

      // 4. Status filter
      const matchesStatus = statusFilter === "ALL" || t.status === statusFilter;

      // 5. Timeframe filtering
      const txDate = new Date(t.date);
      const now = new Date("2026-07-08T20:58:00Z"); // Sync with system timestamp
      const timeDiff = now.getTime() - txDate.getTime();
      let matchesTime = true;
      if (timeframe === "24h") {
        matchesTime = timeDiff <= 24 * 60 * 60 * 1000;
      } else if (timeframe === "7d") {
        matchesTime = timeDiff <= 7 * 24 * 60 * 60 * 1000;
      } else if (timeframe === "30d") {
        matchesTime = timeDiff <= 30 * 24 * 60 * 60 * 1000;
      }

      return matchesSearch && matchesRisk && matchesAnomaly && matchesStatus && matchesTime;
    });
  }, [transactions, searchQuery, riskFilter, anomalyFilter, statusFilter, timeframe]);

  // Sort Logic
  const sortedTransactions = useMemo(() => {
    const sorted = [...filteredTransactions];
    sorted.sort((a, b) => {
      let comparison = 0;
      if (sortKey === "date") {
        comparison = new Date(a.date).getTime() - new Date(b.date).getTime();
      } else if (sortKey === "amount") {
        comparison = a.amount - b.amount;
      } else if (sortKey === "aiScore") {
        comparison = a.aiScore - b.aiScore;
      }
      return sortOrder === "asc" ? comparison : -comparison;
    });
    return sorted;
  }, [filteredTransactions, sortKey, sortOrder]);

  // Paginated Data
  const activePage = useMemo(() => {
    const maxPage = Math.ceil(sortedTransactions.length / itemsPerPage);
    return Math.max(1, Math.min(currentPage, maxPage || 1));
  }, [sortedTransactions.length, currentPage]);

  const paginatedTransactions = useMemo(() => {
    const startIndex = (activePage - 1) * itemsPerPage;
    return sortedTransactions.slice(startIndex, startIndex + itemsPerPage);
  }, [sortedTransactions, activePage]);

  const totalPages = Math.ceil(sortedTransactions.length / itemsPerPage);

  // ==========================================
  // TIMELINE DATA COMPILATION
  // ==========================================
  // Group transaction density by date for the Recharts timeline visualization
  const timelineData = useMemo(() => {
    // Generate dates for the last 8 days
    const dates: Record<string, { display: string; count: number; totalScore: number; maxScore: number }> = {};
    for (let i = 7; i >= 0; i--) {
      const d = new Date("2026-07-08T00:00:00Z");
      d.setDate(d.getDate() - i);
      const iso = d.toISOString().split("T")[0];
      const display = d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
      dates[iso] = { display, count: 0, totalScore: 0, maxScore: 0 };
    }

    // Populate with mock transaction info
    transactions.forEach(t => {
      const iso = t.date.split("T")[0];
      if (dates[iso]) {
        // If risk filter is active, only include matching points
        if (riskFilter === "ALL" || t.risk === riskFilter) {
          dates[iso].count++;
          dates[iso].totalScore += t.aiScore;
          if (t.aiScore > dates[iso].maxScore) {
            dates[iso].maxScore = t.aiScore;
          }
        }
      }
    });

    return Object.entries(dates).map(([dateStr, metrics]) => ({
      date: dateStr,
      label: metrics.display,
      "Anomalies Found": metrics.count,
      "Max Risk Score": metrics.maxScore,
      "Avg Risk Score": metrics.count > 0 ? Math.round(metrics.totalScore / metrics.count) : 0,
      rawPoints: transactions.filter(t => t.date.split("T")[0] === dateStr && (riskFilter === "ALL" || t.risk === riskFilter))
    }));
  }, [transactions, riskFilter]);

  // ==========================================
  // GEOGRAPHIC ACTIVITY REGIONS
  // ==========================================
  const regionalMetrics = useMemo(() => {
    const regions: Record<string, { alerts: number; totalValue: number; riskRating: "Low" | "Medium" | "High" | "Critical" }> = {
      "Mumbai Hub": { alerts: 0, totalValue: 0, riskRating: "Low" },
      "Delhi NCR Hub": { alerts: 0, totalValue: 0, riskRating: "Low" },
      "Bengaluru Hub": { alerts: 0, totalValue: 0, riskRating: "Low" },
      "Hyderabad Hub": { alerts: 0, totalValue: 0, riskRating: "Low" },
      "International Inbound": { alerts: 0, totalValue: 0, riskRating: "Low" },
    };

    transactions.forEach(t => {
      if (t.region in regions) {
        regions[t.region].totalValue += t.amount;
        if (t.risk === "High" || t.risk === "Critical") {
          regions[t.region].alerts += 1;
        }
      }
    });

    return Object.entries(regions).map(([name, data]) => {
      let riskRating: "Low" | "Medium" | "High" | "Critical" = "Low";
      if (data.alerts >= 2) riskRating = "Critical";
      else if (data.alerts === 1) riskRating = "High";
      else if (data.totalValue > 50000) riskRating = "Medium";

      return {
        name,
        alerts: data.alerts,
        totalValue: data.totalValue,
        riskRating,
        x: name === "Mumbai Hub" ? 35 : name === "Delhi NCR Hub" ? 30 : name === "Bengaluru Hub" ? 40 : name === "Hyderabad Hub" ? 50 : 80,
        y: name === "Mumbai Hub" ? 65 : name === "Delhi NCR Hub" ? 30 : name === "Bengaluru Hub" ? 80 : name === "Hyderabad Hub" ? 70 : 40,
      };
    });
  }, [transactions]);

  const toggleSort = (key: "date" | "amount" | "aiScore") => {
    if (sortKey === key) {
      setSortOrder(prev => prev === "asc" ? "desc" : "asc");
    } else {
      setSortKey(key);
      setSortOrder("desc");
    }
  };

  return (
    <PageContainer className="pb-24">
      {/* ==========================================
          HEADER METRICS BLOCK
          ========================================== */}
      <div className="flex flex-col xl:flex-row xl:items-center justify-between border-b border-border/80 pb-6 gap-6 select-none">
        <div className="space-y-1">
          <span className="text-[10px] font-sans font-bold uppercase tracking-widest text-ai bg-ai/10 border border-ai/20 px-3 py-1 rounded-xs inline-block">
            Intrusion & Security Signals
          </span>
          <h1 className="text-3xl font-heading font-extrabold text-foreground tracking-tight mt-1.5">
            Fraud Intelligence
          </h1>
          <p className="text-xs text-foreground-secondary">
            Continuous transaction anomaly modeling, SHAP attributions, and real-time ledger risk mitigation checks.
          </p>
        </div>

        {/* Operational Statistics counters */}
        <div className="flex flex-wrap items-center gap-4 bg-surface border border-border p-4 rounded-sm shadow-xs">
          <div className="pr-5 border-r border-border/70 text-left">
            <span className="text-[9px] font-sans font-bold text-foreground-muted uppercase tracking-wider block">Analyzed Volume</span>
            <span className="text-xl font-heading font-bold text-foreground mt-0.5 block">
              {stats.totalCount.toLocaleString("en-IN")}
            </span>
          </div>

          <div className="pr-5 border-r border-border/70 text-left pl-1">
            <span className="text-[9px] font-sans font-bold text-critical uppercase tracking-wider flex items-center gap-1">
              <AlertCircle className="h-3 w-3" /> High Risk
            </span>
            <span className="text-xl font-heading font-bold text-critical mt-0.5 block">
              {stats.highRiskCount}
            </span>
          </div>

          <div className="pr-5 border-r border-border/70 text-left pl-1">
            <span className="text-[9px] font-sans font-bold text-warning uppercase tracking-wider flex items-center gap-1">
              <AlertTriangle className="h-3 w-3" /> Medium Risk
            </span>
            <span className="text-xl font-heading font-bold text-warning mt-0.5 block">
              {stats.mediumRiskCount}
            </span>
          </div>

          <div className="text-left pr-4 pl-1">
            <span className="text-[9px] font-sans font-bold text-positive uppercase tracking-wider flex items-center gap-1">
              <ShieldCheck className="h-3 w-3" /> Low Risk
            </span>
            <span className="text-xl font-heading font-bold text-positive mt-0.5 block">
              {stats.lowRiskCount}
            </span>
          </div>

          {/* Trigger Scan Button */}
          <div className="pl-3 border-l border-border/70 flex flex-col items-end gap-1.5 self-center">
            <div className="flex items-center gap-1.5 text-[10px] text-foreground-secondary font-mono">
              <Clock className="h-3 w-3 text-foreground-muted" />
              <span>Scan: {lastScanText}</span>
            </div>
            <Button
              variant="primary"
              size="sm"
              onClick={handleRunAnalysis}
              disabled={isAnalyzing}
              className="text-[10px] font-bold py-1.5 px-4 cursor-pointer gap-2 h-8"
            >
              <RefreshCw className={cn("h-3.5 w-3.5", isAnalyzing ? "animate-spin" : "")} />
              <span>{isAnalyzing ? "Scanning..." : "Run Analysis"}</span>
            </Button>
          </div>
        </div>
      </div>

      {/* ==========================================
          ANOMALY TIMELINE SECTION
          ========================================== */}
      <div className="my-8">
        <Card className="flex flex-col justify-between overflow-hidden select-none">
          <CardHeader className="pb-3 border-b border-border/60">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <CardTitle className="text-xs uppercase tracking-widest text-foreground-muted font-bold flex items-center gap-1.5">
                  <Activity className="h-4.5 w-4.5 text-ai" /> Fraud Activity Timeline
                </CardTitle>
                <p className="text-[11px] text-foreground-secondary">
                  Interactive transaction threat vectors mapped over time. Adjust filter chips to zoom.
                </p>
              </div>

              {/* Chart Controls */}
              <div className="flex flex-wrap items-center gap-3">
                {/* Time filter */}
                <div className="flex items-center gap-1 border border-border p-0.5 rounded-sm bg-surface-elevated">
                  {[
                    { id: "24h", label: "24 Hours" },
                    { id: "7d", label: "7 Days" },
                    { id: "30d", label: "30 Days" },
                    { id: "All", label: "All Time" }
                  ].map(item => (
                    <button
                      key={item.id}
                      onClick={() => setTimeframe(item.id)}
                      className={cn(
                        "text-[10px] font-sans font-semibold px-2.5 py-1 rounded-xs transition-colors cursor-pointer",
                        timeframe === item.id 
                          ? "bg-primary text-white" 
                          : "text-foreground-secondary hover:text-foreground hover:bg-surface-hover"
                      )}
                    >
                      {item.label}
                    </button>
                  ))}
                </div>

                {/* Risk filter quick-switch */}
                <div className="flex items-center gap-1 border border-border p-0.5 rounded-sm bg-surface-elevated">
                  {[
                    { id: "ALL", label: "All Risks" },
                    { id: "High", label: "High" },
                    { id: "Medium", label: "Medium" },
                    { id: "Low", label: "Low" }
                  ].map(item => (
                    <button
                      key={item.id}
                      onClick={() => setRiskFilter(item.id)}
                      className={cn(
                        "text-[10px] font-sans font-semibold px-2.5 py-1 rounded-xs transition-colors cursor-pointer",
                        riskFilter === item.id 
                          ? "bg-ai text-white" 
                          : "text-foreground-secondary hover:text-foreground hover:bg-surface-hover"
                      )}
                    >
                      {item.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </CardHeader>
          <CardContent className="pt-6 min-h-[280px]">
            {isAnalyzing ? (
              <div className="h-[250px] w-full flex flex-col items-center justify-center gap-3">
                <RefreshCw className="h-8 w-8 text-ai animate-spin" />
                <span className="text-xs text-foreground-secondary font-mono animate-pulse">Recalculating ledger vector arrays...</span>
              </div>
            ) : (
              <div className="w-full h-[250px]">
                <ResponsiveContainer width="100%" height="100%">
                  <ScatterChart margin={{ top: 20, right: 20, bottom: 0, left: -20 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border)" className="opacity-50" />
                    <XAxis 
                      dataKey="label" 
                      tickLine={false} 
                      axisLine={false} 
                      tick={{ fill: "var(--foreground-secondary)", fontSize: 10, fontWeight: "bold" }} 
                    />
                    <YAxis 
                      type="number"
                      dataKey="Avg Risk Score"
                      name="Risk Score"
                      domain={[0, 100]}
                      tickLine={false} 
                      axisLine={false} 
                      tickFormatter={(v) => `${v}`}
                      tick={{ fill: "var(--foreground-secondary)", fontSize: 10 }} 
                      label={{ value: "Threat Index", angle: -90, position: "insideLeft", offset: 10, fill: "var(--foreground-muted)", fontSize: 10, fontWeight: "bold" }}
                    />
                    <ZAxis type="number" dataKey="Anomalies Found" range={[100, 500]} name="Volume" />
                    <RechartsTooltip 
                      cursor={{ strokeDasharray: "3 3", stroke: "var(--border-strong)" }}
                      content={({ active, payload }) => {
                        if (active && payload && payload.length) {
                          const data = payload[0].payload;
                          return (
                            <div className="bg-surface-elevated border border-border p-3 shadow-lg rounded-sm text-xs font-sans space-y-2 max-w-xs">
                              <p className="text-[10px] font-bold text-foreground-muted uppercase tracking-wider">{data.label}</p>
                              <div className="space-y-1">
                                <p className="font-semibold text-foreground">Scanned Flagged Count: {data["Anomalies Found"]}</p>
                                <p className="font-semibold text-primary">Avg AI Score: {data["Avg Risk Score"]}/100</p>
                                <p className="font-semibold text-critical">Max Risk Score: {data["Max Risk Score"]}/100</p>
                              </div>
                              {data.rawPoints && data.rawPoints.length > 0 && (
                                <div className="border-t border-border/60 pt-1.5 mt-1.5">
                                  <p className="text-[9px] font-bold text-foreground-muted uppercase tracking-wider mb-1">Alert Targets</p>
                                  <div className="max-h-20 overflow-y-auto space-y-1">
                                    {data.rawPoints.map((p: FraudTransaction) => (
                                      <div key={p.id} className="flex justify-between items-center text-[10px] gap-2">
                                        <span className="font-bold text-foreground truncate max-w-[120px]">{p.merchant}</span>
                                        <span className="font-mono text-foreground-secondary">₹{p.amount.toLocaleString("en-IN")}</span>
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              )}
                            </div>
                          );
                        }
                        return null;
                      }}
                    />
                    <Scatter name="Anomalies" data={timelineData}>
                      {timelineData.map((entry, index) => {
                        // Color node based on threat level
                        const avg = entry["Avg Risk Score"];
                        let color = "var(--positive)";
                        if (avg >= 75) color = "var(--critical)";
                        else if (avg >= 50) color = "var(--warning)";
                        else if (avg > 0) color = "var(--primary)";
                        else color = "var(--foreground-muted)";

                        return <Cell key={`cell-${index}`} fill={color} className="cursor-pointer hover:opacity-85" />;
                      })}
                    </Scatter>
                  </ScatterChart>
                </ResponsiveContainer>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* ==========================================
          ANOMALY SUMMARY & GEOGRAPHIC SEGMENT
          ========================================== */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 my-8 select-none">
        
        {/* Anomaly Summary (7 Columns) */}
        <div className="col-span-12 lg:col-span-7">
          <Card className="h-[430px] flex flex-col justify-between">
            <CardHeader className="pb-3 border-b border-border/60">
              <CardTitle className="text-xs uppercase tracking-widest text-foreground-muted font-bold flex items-center gap-1.5">
                <Sliders className="h-4.5 w-4.5 text-ai" /> Threat Vectors Summary
              </CardTitle>
              <p className="text-[11px] text-foreground-secondary">
                Distribution breakdown of anomalies computed across the active transaction ledger.
              </p>
            </CardHeader>
            <CardContent className="pt-5 flex-1 overflow-y-auto mt-1 space-y-4">
              {anomalySummaryData.map((anomaly) => (
                <div key={anomaly.name} className="space-y-1.5 group">
                  <div className="flex justify-between items-center text-xs font-sans">
                    <Tooltip content={anomaly.description}>
                      <span className="font-bold text-foreground cursor-help hover:text-primary transition-colors flex items-center gap-1.5">
                        {anomaly.name}
                        <HelpCircle className="h-3 w-3 text-foreground-muted" />
                      </span>
                    </Tooltip>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-bold text-foreground-secondary">{anomaly.count} Flags</span>
                      <span className="text-[10px] font-mono font-bold text-primary bg-primary/10 px-1.5 py-0.25 rounded-xs">
                        {anomaly.percentage}%
                      </span>
                    </div>
                  </div>
                  
                  {/* Visual Compact Gauge Progress Bar */}
                  <div className="w-full h-1.5 bg-surface-elevated border border-border/40 rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${anomaly.percentage}%` }}
                      transition={{ duration: 1.2, ease: "easeOut" }}
                      className={cn(
                        "h-full rounded-full",
                        anomaly.percentage > 35 ? "bg-critical" :
                        anomaly.percentage > 15 ? "bg-warning" : "bg-primary"
                      )}
                    />
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

        {/* Geographic Hubs (5 Columns) */}
        <div className="col-span-12 lg:col-span-5">
          <Card className="h-[430px] flex flex-col justify-between overflow-hidden">
            <CardHeader className="pb-3 border-b border-border/60">
              <CardTitle className="text-xs uppercase tracking-widest text-foreground-muted font-bold flex items-center gap-1.5">
                <Globe className="h-4.5 w-4.5 text-primary" /> Regional Risk Distribution
              </CardTitle>
              <p className="text-[11px] text-foreground-secondary">
                SVG alert density map matching real-time activity hubs.
              </p>
            </CardHeader>
            <CardContent className="pt-4 flex-1 flex flex-col justify-between">
              
              {/* Graphic Mock Regional SVG Visualizer */}
              <div className="w-full h-44 bg-surface-elevated/45 border border-border/60 rounded-xs relative flex items-center justify-center overflow-hidden">
                <svg className="w-full h-full opacity-65" viewBox="0 0 200 100" fill="none" stroke="currentColor">
                  {/* Subtle vector patterns representing regional boundaries */}
                  <path d="M 20 40 Q 40 30 70 45 T 120 20 T 170 30" stroke="var(--border)" strokeWidth="0.8" strokeDasharray="3 3" />
                  <path d="M 30 80 Q 80 70 110 85 T 160 55 T 190 70" stroke="var(--border)" strokeWidth="0.8" strokeDasharray="3 3" />
                  <path d="M 50 10 Q 70 50 60 90" stroke="var(--border)" strokeWidth="0.5" />
                  <path d="M 120 10 Q 110 50 130 90" stroke="var(--border)" strokeWidth="0.5" />
                </svg>

                {/* Plot pulsing alert hotspots on the map */}
                {regionalMetrics.map((m) => {
                  const pulseColor = 
                    m.riskRating === "Critical" ? "bg-critical" :
                    m.riskRating === "High" ? "bg-critical/80" :
                    m.riskRating === "Medium" ? "bg-warning" : "bg-positive";

                  return (
                    <div 
                      key={m.name} 
                      style={{ left: `${m.x}%`, top: `${m.y}%` }} 
                      className="absolute -translate-x-1/2 -translate-y-1/2 group/pin"
                    >
                      <div className="relative flex h-3.5 w-3.5 items-center justify-center">
                        <span className={cn("animate-ping absolute inline-flex h-full w-full rounded-full opacity-75", pulseColor)}></span>
                        <span className={cn("relative inline-flex rounded-full h-2 w-2", pulseColor)}></span>
                      </div>
                      
                      {/* Floating tag label on hover */}
                      <div className="absolute left-1/2 -translate-x-1/2 bottom-5 w-max bg-surface border border-border px-2 py-0.5 rounded-xs shadow-md text-[9px] font-sans font-bold text-foreground opacity-0 pointer-events-none group-hover/pin:opacity-100 transition-opacity z-20">
                        {m.name}: {m.alerts} Alerts
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Data list matching coordinates */}
              <div className="mt-4 flex-1 overflow-y-auto space-y-2 max-h-36 pr-1">
                {regionalMetrics.map((region) => (
                  <div key={region.name} className="flex justify-between items-center text-xs border-b border-border/40 pb-1.5">
                    <div className="flex items-center gap-2">
                      <MapPin className="h-3.5 w-3.5 text-foreground-muted" />
                      <span className="font-bold text-foreground">{region.name}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-[10px] font-mono text-foreground-secondary">
                        ₹{region.totalValue.toLocaleString("en-IN")}
                      </span>
                      <span className={cn(
                        "text-[9px] font-sans font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border",
                        region.riskRating === "Critical" ? "bg-critical/10 text-critical border-critical/20 animate-pulse" :
                        region.riskRating === "High" ? "bg-critical/10 text-critical border-critical/15" :
                        region.riskRating === "Medium" ? "bg-warning/10 text-warning border-warning/15" : "bg-positive/10 text-positive border-positive/15"
                      )}>
                        {region.alerts} {region.alerts === 1 ? "Alert" : "Alerts"}
                      </span>
                    </div>
                  </div>
                ))}
              </div>

            </CardContent>
          </Card>
        </div>

      </div>

      {/* ==========================================
          FRAUD TRANSACTION EXPLORER
          ========================================== */}
      <div className="space-y-4 my-8 select-none">
        <div className="border-b border-border/60 pb-3 flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div>
            <h2 className="text-lg font-heading font-semibold text-foreground flex items-center gap-2">
              <Fingerprint className="h-5 w-5 text-primary" /> Fraud Transaction Explorer
            </h2>
            <p className="text-xs text-foreground-secondary">
              Search and filter high-risk ledger triggers. Click rows for Attributions audit details.
            </p>
          </div>
          <div className="text-xs text-foreground-muted font-mono bg-surface-elevated px-3 py-1 border border-border/55 rounded-xs self-start md:self-auto">
            Showing {sortedTransactions.length} of {transactions.length} Ledger entries
          </div>
        </div>

        {/* Explorer Advanced Filters */}
        <Card className="bg-surface border border-border/80">
          <CardContent className="p-4 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
              
              {/* Search bar (4 columns) */}
              <div className="md:col-span-4 relative flex items-center">
                <Search className="absolute left-3 h-4 w-4 text-foreground-muted" />
                <input
                  type="text"
                  placeholder="Search Merchant, Account, ID..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full h-9 pl-9 pr-8 bg-surface-elevated border border-border text-foreground rounded-sm text-xs font-sans placeholder-foreground-muted focus:border-primary focus:outline-none transition-all"
                />
                {searchQuery && (
                  <button 
                    onClick={() => setSearchQuery("")} 
                    className="absolute right-2.5 text-[10px] text-foreground-muted hover:text-foreground"
                  >
                    Clear
                  </button>
                )}
              </div>

              {/* Timeframe selector (3 columns) */}
              <div className="md:col-span-3 flex items-center gap-2 bg-surface-elevated border border-border rounded-sm h-9 px-2">
                <Filter className="h-3.5 w-3.5 text-foreground-muted" />
                <select
                  value={timeframe}
                  onChange={(e) => setTimeframe(e.target.value)}
                  className="bg-transparent text-xs font-sans text-foreground font-semibold border-none outline-none focus:ring-0 cursor-pointer pr-1 flex-1"
                >
                  <option value="All" className="bg-surface">All Dates</option>
                  <option value="24h" className="bg-surface">Last 24 Hours</option>
                  <option value="7d" className="bg-surface">Last 7 Days</option>
                  <option value="30d" className="bg-surface">Last 30 Days</option>
                </select>
              </div>

              {/* Anomaly filter (3 columns) */}
              <div className="md:col-span-3 flex items-center gap-2 bg-surface-elevated border border-border rounded-sm h-9 px-2">
                <Sliders className="h-3.5 w-3.5 text-foreground-muted" />
                <select
                  value={anomalyFilter}
                  onChange={(e) => setAnomalyFilter(e.target.value)}
                  className="bg-transparent text-xs font-sans text-foreground font-semibold border-none outline-none focus:ring-0 cursor-pointer pr-1 flex-1"
                >
                  <option value="ALL" className="bg-surface">All Anomalies</option>
                  <option value="Unusual Amount" className="bg-surface">Unusual Amount</option>
                  <option value="Unusual Time" className="bg-surface">Unusual Time</option>
                  <option value="New Merchant" className="bg-surface">New Merchant</option>
                  <option value="Location Anomaly" className="bg-surface">Location Anomaly</option>
                  <option value="Transaction Frequency" className="bg-surface">Transaction Frequency</option>
                  <option value="Behavior Deviation" className="bg-surface">Behavior Deviation</option>
                  <option value="None" className="bg-surface">No Anomaly</option>
                </select>
              </div>

              {/* Status filter (2 columns) */}
              <div className="md:col-span-2 flex items-center gap-2 bg-surface-elevated border border-border rounded-sm h-9 px-2">
                <Clock className="h-3.5 w-3.5 text-foreground-muted" />
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="bg-transparent text-xs font-sans text-foreground font-semibold border-none outline-none focus:ring-0 cursor-pointer pr-1 flex-1"
                >
                  <option value="ALL" className="bg-surface">All Statuses</option>
                  <option value="completed" className="bg-surface">Completed</option>
                  <option value="under_review" className="bg-surface">Under Review</option>
                  <option value="approved" className="bg-surface">Approved</option>
                  <option value="rejected" className="bg-surface">Rejected</option>
                </select>
              </div>

            </div>

            {/* Risk filter chips */}
            <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-border/40 text-xs">
              <span className="text-foreground-muted font-bold uppercase tracking-wider text-[9px] mr-1">Risk Bounds:</span>
              {[
                { id: "ALL", label: "All Items" },
                { id: "High", label: "High Risk" },
                { id: "Medium", label: "Medium Risk" },
                { id: "Low", label: "Low Risk" }
              ].map(chip => (
                <button
                  key={chip.id}
                  onClick={() => setRiskFilter(chip.id)}
                  className={cn(
                    "px-3 py-1 rounded-full text-[10px] font-sans font-bold border transition-all cursor-pointer",
                    riskFilter === chip.id 
                      ? "bg-primary text-white border-primary shadow-xs" 
                      : "bg-surface-elevated text-foreground-secondary border-border hover:bg-surface-hover hover:border-border-strong"
                  )}
                >
                  {chip.label}
                </button>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Advanced Data Table Grid */}
        <Card className="bg-surface border border-border/80 overflow-hidden">
          
          {/* DESKTOP TABLE VIEW */}
          <div className="hidden md:block overflow-x-auto">
            <table className="w-full text-xs text-left border-collapse font-sans text-foreground-secondary">
              <thead>
                <tr className="bg-surface-elevated border-b border-border text-[9px] uppercase tracking-wider text-foreground-muted">
                  <th className="p-4 font-bold">Transaction ID</th>
                  <th className="p-4 font-bold">Merchant / Vendor</th>
                  <th 
                    className="p-4 font-bold cursor-pointer hover:bg-surface-hover select-none transition-colors"
                    onClick={() => toggleSort("amount")}
                  >
                    <span className="flex items-center gap-1.5">
                      Amount <ArrowUpDown className="h-3 w-3" />
                    </span>
                  </th>
                  <th 
                    className="p-4 font-bold cursor-pointer hover:bg-surface-hover select-none transition-colors"
                    onClick={() => toggleSort("date")}
                  >
                    <span className="flex items-center gap-1.5">
                      Ingest Date <ArrowUpDown className="h-3 w-3" />
                    </span>
                  </th>
                  <th className="p-4 font-bold">Account</th>
                  <th className="p-4 font-bold">Anomaly Type</th>
                  <th 
                    className="p-4 font-bold cursor-pointer hover:bg-surface-hover select-none transition-colors text-center"
                    onClick={() => toggleSort("aiScore")}
                  >
                    <span className="flex items-center justify-center gap-1.5">
                      AI Score <ArrowUpDown className="h-3 w-3" />
                    </span>
                  </th>
                  <th className="p-4 font-bold">Risk Rating</th>
                  <th className="p-4 font-bold">Status</th>
                  <th className="p-4 font-bold text-center">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/40">
                {paginatedTransactions.length === 0 ? (
                  <tr>
                    <td colSpan={10} className="p-12 text-center">
                      <div className="flex flex-col items-center justify-center gap-2">
                        <AlertTriangle className="h-8 w-8 text-foreground-muted" />
                        <span className="font-bold text-foreground">No suspicious transactions found</span>
                        <span className="text-xs text-foreground-secondary">Adjust search parameters or risk boundary filters.</span>
                      </div>
                    </td>
                  </tr>
                ) : (
                  paginatedTransactions.map((txn) => (
                    <tr 
                      key={txn.id}
                      onClick={() => {
                        setSelectedTxnId(txn.id);
                        setIsDrawerOpen(true);
                      }}
                      className={cn(
                        "hover:bg-surface-elevated/85 transition-colors cursor-pointer border-l-2",
                        selectedTxnId === txn.id ? "bg-surface-elevated border-l-primary" : "border-l-transparent"
                      )}
                    >
                      <td className="p-4 font-mono font-bold text-foreground">{txn.id}</td>
                      <td className="p-4 font-bold text-foreground">
                        <div className="flex flex-col">
                          <span>{txn.merchant}</span>
                          <span className="text-[10px] text-foreground-muted font-normal mt-0.5 flex items-center gap-1">
                            <MapPin className="h-3 w-3" /> {txn.location}
                          </span>
                        </div>
                      </td>
                      <td className="p-4 font-mono font-semibold text-foreground">
                        ₹{txn.amount.toLocaleString("en-IN")}
                      </td>
                      <td className="p-4 font-mono">
                        {new Date(txn.date).toLocaleString("en-US", {
                          month: "short",
                          day: "numeric",
                          hour: "2-digit",
                          minute: "2-digit"
                        })}
                      </td>
                      <td className="p-4 truncate max-w-[140px]" title={txn.account}>
                        {txn.account}
                      </td>
                      <td className="p-4">
                        <span className={cn(
                          "px-2 py-0.5 rounded-xs font-semibold text-[10px] border",
                          txn.anomalyType === "None" ? "bg-surface-elevated text-foreground-secondary border-border" :
                          "bg-ai/10 text-ai border-ai/25"
                        )}>
                          {txn.anomalyType}
                        </span>
                      </td>
                      <td className="p-4 text-center font-mono font-bold">
                        <span className={cn(
                          "px-1.5 py-0.5 rounded-xs text-[11px]",
                          txn.aiScore >= 80 ? "text-critical" :
                          txn.aiScore >= 50 ? "text-warning" : "text-positive"
                        )}>
                          {txn.aiScore}/100
                        </span>
                      </td>
                      <td className="p-4">
                        <RiskBadge rating={txn.risk} />
                      </td>
                      <td className="p-4">
                        <StatusBadge status={txn.status} />
                      </td>
                      <td className="p-4 text-center" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center justify-center gap-1.5">
                          <button
                            onClick={() => {
                              setSelectedTxnId(txn.id);
                              setIsDrawerOpen(true);
                            }}
                            className="p-1.5 rounded-xs bg-surface-elevated border border-border text-foreground-secondary hover:text-foreground hover:bg-surface-hover transition-colors"
                            title="Audit Transaction"
                          >
                            <Eye className="h-3.5 w-3.5" />
                          </button>
                          <button
                            onClick={() => handleMarkSafe(txn.id)}
                            className="p-1.5 rounded-xs bg-positive/10 border border-positive/20 text-positive hover:bg-positive hover:text-white transition-colors"
                            title="Approve & Clear Risk"
                          >
                            <Check className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* MOBILE CARD VIEW */}
          <div className="block md:hidden divide-y divide-border/40">
            {paginatedTransactions.length === 0 ? (
              <div className="p-12 text-center">
                <div className="flex flex-col items-center justify-center gap-2">
                  <AlertTriangle className="h-8 w-8 text-foreground-muted" />
                  <span className="font-bold text-foreground">No suspicious transactions found</span>
                </div>
              </div>
            ) : (
              paginatedTransactions.map((txn) => (
                <div 
                  key={txn.id}
                  onClick={() => {
                    setSelectedTxnId(txn.id);
                    setIsDrawerOpen(true);
                  }}
                  className={cn(
                    "p-4 space-y-3.5 hover:bg-surface-elevated transition-colors cursor-pointer border-l-4",
                    selectedTxnId === txn.id ? "bg-surface-elevated border-l-primary" : "border-l-transparent"
                  )}
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <span className="text-[10px] font-mono font-bold text-foreground-muted block">{txn.id}</span>
                      <h4 className="font-bold text-foreground mt-0.5">{txn.merchant}</h4>
                      <span className="text-[10px] text-foreground-secondary mt-0.5 flex items-center gap-1">
                        <MapPin className="h-3 w-3" /> {txn.location}
                      </span>
                    </div>
                    <span className="font-mono font-bold text-sm text-foreground">
                      ₹{txn.amount.toLocaleString("en-IN")}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-2.5 text-[11px] border-t border-b border-border/40 py-2.5 my-1.5 text-foreground-secondary">
                    <div>
                      <span className="text-[9px] text-foreground-muted block font-sans uppercase font-bold tracking-wider">Ingest Date</span>
                      <span className="font-medium block mt-0.5">
                        {new Date(txn.date).toLocaleDateString("en-US", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })}
                      </span>
                    </div>
                    <div>
                      <span className="text-[9px] text-foreground-muted block font-sans uppercase font-bold tracking-wider">Account</span>
                      <span className="font-medium block mt-0.5 truncate max-w-[120px]">{txn.account}</span>
                    </div>
                    <div>
                      <span className="text-[9px] text-foreground-muted block font-sans uppercase font-bold tracking-wider">Anomaly Type</span>
                      <span className="font-medium block mt-0.5 text-ai font-semibold">{txn.anomalyType}</span>
                    </div>
                    <div>
                      <span className="text-[9px] text-foreground-muted block font-sans uppercase font-bold tracking-wider">AI Score</span>
                      <span className="font-bold block mt-0.5 text-critical">{txn.aiScore}/100</span>
                    </div>
                  </div>

                  <div className="flex justify-between items-center gap-2">
                    <div className="flex gap-2">
                      <RiskBadge rating={txn.risk} />
                      <StatusBadge status={txn.status} />
                    </div>
                    
                    <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => {
                          setSelectedTxnId(txn.id);
                          setIsDrawerOpen(true);
                        }}
                        className="text-[10px] py-1 px-2.5 h-7 cursor-pointer"
                      >
                        Audit
                      </Button>
                      <Button 
                        variant="primary" 
                        size="sm"
                        onClick={() => handleMarkSafe(txn.id)}
                        className="text-[10px] py-1 px-2.5 h-7 cursor-pointer bg-positive hover:bg-positive/85 text-white border-none"
                      >
                        Safe
                      </Button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Table pagination footer */}
          {totalPages > 1 && (
            <div className="p-4 border-t border-border flex items-center justify-between font-sans text-xs">
              <span className="text-foreground-secondary">
                Page <strong className="text-foreground">{activePage}</strong> of <strong className="text-foreground">{totalPages}</strong>
              </span>
              <div className="flex items-center gap-1.5">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(activePage - 1)}
                  disabled={activePage === 1}
                  className="text-[10px] py-1 cursor-pointer h-8"
                >
                  Previous
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(activePage + 1)}
                  disabled={activePage === totalPages}
                  className="text-[10px] py-1 cursor-pointer h-8"
                >
                  Next
                </Button>
              </div>
            </div>
          )}

        </Card>
      </div>

      {/* ==========================================
          TRANSACTION INTELLIGENCE DRAWER (SHEET)
          ========================================== */}
      <Sheet
        isOpen={isDrawerOpen}
        onClose={() => {
          setIsDrawerOpen(false);
          setSelectedTxnId(null);
        }}
        title="Transaction Intelligence"
        className="w-full max-w-md"
      >
        {selectedTxn && (
          <div className="space-y-6 font-sans select-none text-foreground-secondary">
            
            {/* 1. Primary Transaction Ingestion Data card */}
            <div className="p-4 rounded-sm bg-surface-elevated border border-border space-y-3">
              <div className="flex justify-between items-start">
                <div>
                  <span className="text-[10px] font-mono font-bold text-foreground-muted block">{selectedTxn.id}</span>
                  <h3 className="text-sm font-bold text-foreground truncate max-w-[200px] mt-0.5">{selectedTxn.merchant}</h3>
                  <span className="text-[10px] text-foreground-secondary mt-0.5 block flex items-center gap-1">
                    <MapPin className="h-3 w-3 text-foreground-muted" /> {selectedTxn.location}
                  </span>
                </div>
                <span className="text-sm font-mono font-extrabold text-foreground bg-surface border border-border px-2.5 py-1 rounded-sm">
                  ₹{selectedTxn.amount.toLocaleString("en-IN")}
                </span>
              </div>
              
              <div className="grid grid-cols-2 gap-3 pt-3 border-t border-border/60 text-xs">
                <div>
                  <span className="text-[9px] font-sans font-bold text-foreground-muted uppercase tracking-wider block">Ingest Timestamp</span>
                  <span className="font-semibold text-foreground mt-0.5 block">
                    {new Date(selectedTxn.date).toLocaleString()}
                  </span>
                </div>
                <div>
                  <span className="text-[9px] font-sans font-bold text-foreground-muted uppercase tracking-wider block">Funding Ledger Account</span>
                  <span className="font-semibold text-foreground mt-0.5 block truncate max-w-[150px]" title={selectedTxn.account}>
                    {selectedTxn.account}
                  </span>
                </div>
              </div>
            </div>

            {/* 2. AI Score Radial/Linear dial */}
            <div className="space-y-3.5">
              <h4 className="text-xs font-bold text-foreground uppercase tracking-wider flex items-center gap-1.5">
                <AlertTriangle className="h-4 w-4 text-ai" /> AI Anomaly Score
              </h4>
              <div className="border border-border/80 p-5 rounded-sm flex items-center gap-6 bg-surface-elevated/45">
                
                {/* Radial Gauge SVG representation */}
                <div className="relative h-20 w-20 flex items-center justify-center flex-shrink-0">
                  <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                    <path
                      className="text-border"
                      strokeWidth="3.5"
                      stroke="currentColor"
                      fill="none"
                      d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                    />
                    <path
                      className={cn(
                        selectedTxn.aiScore >= 80 ? "text-critical" :
                        selectedTxn.aiScore >= 50 ? "text-warning" : "text-positive"
                      )}
                      strokeWidth="3.5"
                      strokeDasharray={`${selectedTxn.aiScore}, 100`}
                      strokeLinecap="round"
                      stroke="currentColor"
                      fill="none"
                      d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                    />
                  </svg>
                  <div className="absolute flex flex-col items-center justify-center text-center">
                    <span className="text-base font-extrabold text-foreground font-heading leading-none">
                      {selectedTxn.aiScore}
                    </span>
                    <span className="text-[8px] font-bold text-foreground-muted uppercase tracking-widest mt-0.5">/ 100</span>
                  </div>
                </div>

                {/* Status indicator description text */}
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <RiskBadge rating={selectedTxn.risk} />
                    <StatusBadge status={selectedTxn.status} />
                  </div>
                  <p className="text-[11px] leading-relaxed text-foreground-secondary pt-1">
                    {selectedTxn.aiScore >= 80 ? "High severity alert: immediate manual security review required. Ingestion locks active." :
                     selectedTxn.aiScore >= 50 ? "Medium threat signature detected. Behavior patterns match suspicious cluster sequences." :
                     "Normal transaction integrity. Signature matches safe profile historical indicators."}
                  </p>
                </div>

              </div>
            </div>

            {/* 3. WHY WAS THIS FLAGGED? SHAP ATTRIBUTIONS */}
            {selectedTxn.whyFlagged && selectedTxn.whyFlagged.length > 0 && (
              <div className="space-y-3">
                <h4 className="text-xs font-bold text-foreground uppercase tracking-wider flex items-center gap-1.5">
                  <AlertCircle className="h-4 w-4 text-critical animate-pulse" /> Why was this flagged?
                </h4>
                <div className="space-y-2 border border-border/80 p-4 rounded-sm bg-surface-elevated/20">
                  {selectedTxn.whyFlagged.map((factor) => (
                    <div key={factor.factor} className="space-y-1">
                      <div className="flex justify-between items-center text-xs">
                        <span className="font-semibold text-foreground">{factor.factor}</span>
                        <span className="font-mono text-critical font-bold">+{factor.weight} Risk</span>
                      </div>
                      <div className="w-full h-1 bg-surface-elevated rounded-full overflow-hidden">
                        <div 
                          style={{ width: `${(factor.weight / 60) * 100}%` }}
                          className="h-full bg-critical rounded-full"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* 4. BEHAVIORAL COMPARISON */}
            {selectedTxn.behavioralComparison && selectedTxn.behavioralComparison.length > 0 && (
              <div className="space-y-3">
                <h4 className="text-xs font-bold text-foreground uppercase tracking-wider flex items-center gap-1.5">
                  <TrendingUp className="h-4 w-4 text-primary" /> Behavioral Habits Comparison
                </h4>
                <div className="border border-border/85 rounded-sm overflow-hidden text-xs">
                  <div className="grid grid-cols-3 bg-surface-elevated border-b border-border/80 p-2.5 font-bold uppercase text-[9px] tracking-wider text-foreground-muted">
                    <span>Metric Vector</span>
                    <span className="text-center">Account Median</span>
                    <span className="text-right">This Transaction</span>
                  </div>
                  <div className="divide-y divide-border/40">
                    {selectedTxn.behavioralComparison.map((comp) => (
                      <div key={comp.metric} className="grid grid-cols-3 p-2.5 items-center">
                        <span className="font-semibold text-foreground text-[11px] leading-tight">{comp.metric}</span>
                        <span className="text-center font-mono font-medium text-foreground-secondary">{comp.historicalAverage}</span>
                        <span className="text-right font-mono font-bold text-critical">{comp.currentTransaction}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* 5. DRAWER ACTIONS */}
            <div className="flex flex-col gap-2 pt-6 border-t border-border mt-4">
              <div className="flex gap-2">
                <Button 
                  variant="primary" 
                  size="sm"
                  onClick={() => handleMarkSafe(selectedTxn.id)}
                  className="text-xs flex-1 py-2 font-semibold bg-positive hover:bg-positive/85 text-white border-none cursor-pointer"
                >
                  <ShieldCheck className="h-4 w-4 mr-1.5" /> Mark Safe
                </Button>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => handleInvestigate(selectedTxn.id)}
                  className="text-xs flex-1 py-2 font-semibold border-border hover:bg-surface-hover hover:border-border-strong text-foreground cursor-pointer"
                  disabled={selectedTxn.status === "under_review"}
                >
                  <Eye className="h-4 w-4 mr-1.5 text-foreground-muted" /> Investigate
                </Button>
              </div>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => handleGenerateReport(selectedTxn.id)}
                className="text-xs py-2 font-semibold border-border hover:bg-surface-hover hover:border-border-strong text-foreground cursor-pointer"
              >
                <FileText className="h-4 w-4 mr-1.5 text-foreground-muted" /> Generate Report
              </Button>
            </div>

          </div>
        )}
      </Sheet>
    </PageContainer>
  );
}
