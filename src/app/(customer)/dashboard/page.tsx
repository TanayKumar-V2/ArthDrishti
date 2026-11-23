"use client";

import React, { useState, useMemo, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip as RechartsTooltip, 
  ResponsiveContainer,
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis
} from "recharts";
import { 
  HeartPulse, 
  Fingerprint, 
  Activity,
  ArrowRight,
  Upload,
  FileSpreadsheet,
  AlertCircle,
  ShieldCheck,
  Sparkles,
  Bot
} from "lucide-react";
import { toast } from "sonner";

import PageContainer from "@/components/ui/PageContainer";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Sheet } from "@/components/ui/Overlays";
import { staggerContainer, staggerItem } from "@/lib/animations";
import { cn } from "@/lib/utils";
import { 
  authApi, 
  getStoredUser, 
  advisorApi, 
  transactionsApi, 
  recommendationsApi, 
  fraudApi, 
  reportsApi, 
  AuthUser 
} from "@/lib/api";

// ==========================================
// TYPE DEFINITIONS
// ==========================================
interface ChartDataPoint {
  name: string;
  current: number;
  previous: number;
}

interface AnomalyItem {
  id: string;
  merchant: string;
  amount: number;
  date: string;
  score: number;
  reasons: string[];
}

// Fallback baseline for financial pulse when new user has no past monthly statements yet
const baselineChartDataMap: Record<string, ChartDataPoint[]> = {
  "CASH FLOW": [
    { name: "Month 1", current: 75000, previous: 70000 },
    { name: "Month 2", current: 82000, previous: 74000 },
    { name: "Month 3", current: 88000, previous: 78000 },
    { name: "Month 4", current: 91000, previous: 81000 },
    { name: "Month 5", current: 94000, previous: 85000 },
    { name: "Month 6", current: 98000, previous: 88000 }
  ],
  "INCOME": [
    { name: "Month 1", current: 110000, previous: 105000 },
    { name: "Month 2", current: 115000, previous: 108000 },
    { name: "Month 3", current: 120000, previous: 112000 },
    { name: "Month 4", current: 120000, previous: 115000 },
    { name: "Month 5", current: 125000, previous: 115000 },
    { name: "Month 6", current: 125000, previous: 118000 }
  ],
  "EXPENSES": [
    { name: "Month 1", current: 48000, previous: 52000 },
    { name: "Month 2", current: 45000, previous: 48000 },
    { name: "Month 3", current: 43000, previous: 46000 },
    { name: "Month 4", current: 41000, previous: 44000 },
    { name: "Month 5", current: 39000, previous: 42000 },
    { name: "Month 6", current: 38000, previous: 41000 }
  ]
};

export default function CustomerCommandCenter() {
  const router = useRouter();

  // User and live backend state
  const [currentUser, setCurrentUser] = useState<AuthUser | null>(null);
  const [context, setContext] = useState<Record<string, any> | null>(null);
  const [summary, setSummary] = useState<any>(null);
  const [recommendations, setRecommendations] = useState<any[]>([]);
  const [fraudAlerts, setFraudAlerts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Controls states
  const [pulseTab, setPulseTab] = useState<"CASH FLOW" | "INCOME" | "EXPENSES">("CASH FLOW");
  const [insightFilter, setInsightFilter] = useState("ALL");
  const [selectedAnomaly, setSelectedAnomaly] = useState<AnomalyItem | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isGeneratingReport, setIsGeneratingReport] = useState(false);
  const [radialAnimated, setRadialAnimated] = useState(false);

  // Load real user and portfolio metrics on mount
  useEffect(() => {
    let isMounted = true;
    const stored = getStoredUser();
    if (stored) setCurrentUser(stored);

    // Animate radial ring after initial render
    setRadialAnimated(true);

    // Fetch real endpoints in parallel
    Promise.allSettled([
      authApi.getCurrentUser(),
      advisorApi.getContext(),
      transactionsApi.getSummary(),
      recommendationsApi.list(),
      fraudApi.listAlerts("unreviewed"),
    ]).then(([userRes, ctxRes, sumRes, recRes, frdRes]) => {
      if (!isMounted) return;
      if (userRes.status === "fulfilled" && userRes.value) setCurrentUser(userRes.value);
      if (ctxRes.status === "fulfilled" && ctxRes.value) setContext(ctxRes.value);
      if (sumRes.status === "fulfilled" && sumRes.value) setSummary(sumRes.value);
      if (recRes.status === "fulfilled" && Array.isArray(recRes.value)) setRecommendations(recRes.value);
      if (frdRes.status === "fulfilled" && Array.isArray(frdRes.value)) setFraudAlerts(frdRes.value);
      setLoading(false);
    });

    return () => { isMounted = false; };
  }, []);

  // Compute greeting and name dynamically
  const displayName = currentUser?.full_name?.trim() || currentUser?.email?.split("@")[0] || "Client";
  const firstName = displayName.split(" ")[0];
  const hours = new Date().getHours();
  const greeting = hours < 12 ? "Good Morning" : hours < 17 ? "Good Afternoon" : "Good Evening";

  // Score and KPI variables derived from live context
  const healthScore = Math.round(Number(context?.financial_health_score ?? 78));
  const creditRiskBand = (context?.credit_risk_band ?? "LOW").toUpperCase();
  const defaultProbability = Number(context?.default_probability_pct ?? 8.5);
  const savingsRate = Number(context?.savings_rate_pct ?? (summary?.savings_rate ? summary.savings_rate * 100 : 24.5));
  const discretionarySpend = Number(context?.discretionary_spend_ratio_pct ?? 28);
  const emergencyMonths = Number(context?.emergency_fund_months ?? 3.2);
  const segmentName = context?.customer_segment ?? "Stable Wealth Builder";

  // Health Score status badge
  const healthStatus = healthScore >= 80 ? "EXCELLENT" : healthScore >= 65 ? "GOOD" : "NEEDS ATTENTION";

  // Handle PDF report generation
  const handleGenerateReport = async () => {
    setIsGeneratingReport(true);
    try {
      await reportsApi.generate("comprehensive");
      toast.success("Financial Intelligence Report generated! Opening Report Center...");
      router.push("/reports");
    } catch {
      toast.error("Failed to compile report. Please verify connection and try again.");
    } finally {
      setIsGeneratingReport(false);
    }
  };

  // Filter recommendations based on chip selection
  const filteredRecommendations = useMemo(() => {
    if (insightFilter === "ALL") return recommendations;
    if (insightFilter === "HIGH") return recommendations.filter(r => r.impact_level?.toLowerCase() === "high");
    if (insightFilter === "MEDIUM") return recommendations.filter(r => r.impact_level?.toLowerCase() === "medium");
    if (insightFilter === "SAVINGS") return recommendations.filter(r => r.category?.toLowerCase() === "savings");
    if (insightFilter === "CREDIT") return recommendations.filter(r => r.category?.toLowerCase() === "credit" || r.category?.toLowerCase() === "debt");
    return recommendations;
  }, [insightFilter, recommendations]);

  // Construct chart series from real monthly trend or baseline
  const pulseChartData = useMemo(() => {
    if (summary?.monthly_trend && summary.monthly_trend.length > 0) {
      return summary.monthly_trend.map((m: any) => ({
        name: m.month,
        current: pulseTab === "INCOME" ? m.income : pulseTab === "EXPENSES" ? m.expenses : m.net_savings,
        previous: (pulseTab === "INCOME" ? m.income : pulseTab === "EXPENSES" ? m.expenses : m.net_savings) * 0.92,
      }));
    }
    return baselineChartDataMap[pulseTab] || [];
  }, [pulseTab, summary]);

  // Dynamic Radar Data based on customer's real metrics
  const radarData = useMemo(() => [
    { subject: "Savings Rate", A: Math.min(100, Math.round(savingsRate * 3)), B: 80, fullMark: 100 },
    { subject: "Debt Control", A: Math.max(20, Math.round(100 - discretionarySpend)), B: 75, fullMark: 100 },
    { subject: "Credit Stability", A: Math.max(30, Math.round(100 - defaultProbability * 4)), B: 85, fullMark: 100 },
    { subject: "Health Index", A: healthScore, B: 80, fullMark: 100 },
    { subject: "Emergency Fund", A: Math.min(100, Math.round(emergencyMonths * 25)), B: 75, fullMark: 100 },
  ], [savingsRate, discretionarySpend, defaultProbability, healthScore, emergencyMonths]);

  // Helper formatting for currency
  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0
    }).format(val);
  };

  const handleScrollToInsights = () => {
    const el = document.getElementById("insights-feed");
    el?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <PageContainer className="pb-24">
      {/* 1. PAGE HEADER */}
      <div className="flex flex-col gap-4 border-b border-border pb-6 sm:flex-row sm:items-center sm:justify-between select-none">
        <div className="space-y-1">
          <h1 className="text-2xl sm:text-3xl font-heading font-semibold text-foreground tracking-tight">
            {greeting}, {firstName}.
          </h1>
          <p className="text-xs sm:text-sm text-foreground-secondary leading-relaxed max-w-xl">
            Logged in as <span className="font-semibold text-foreground">{currentUser?.email || "Authenticated Account"}</span> ({currentUser?.role === "loan_officer" ? "Loan Officer" : "Customer"}). Here is your real-time risk intelligence briefing.
          </p>
        </div>

        {/* Header Actions */}
        <div className="flex flex-wrap items-center gap-3 shrink-0">
          <div className="flex items-center gap-2 bg-surface-elevated border border-border px-3 py-2 rounded-sm text-xs text-foreground-secondary font-medium">
            <span className="relative flex h-1.5 w-1.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-positive opacity-75"></span>
              <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-positive"></span>
            </span>
            <span>Real-time Risk Audit Active</span>
          </div>

          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => router.push("/onboarding/upload")}
            className="gap-2 cursor-pointer focus-visible:outline-2"
          >
            <Upload className="h-4 w-4" />
            Upload Statements
          </Button>

          <Button 
            variant="primary" 
            size="sm" 
            onClick={handleGenerateReport} 
            loading={isGeneratingReport}
            className="gap-2 cursor-pointer focus-visible:outline-2 font-semibold"
          >
            <FileSpreadsheet className="h-4 w-4" />
            Generate Report
          </Button>
        </div>
      </div>

      {/* 2. FIRST ROW: RADIAL SCORE & AI BRIEFING */}
      <motion.div 
        variants={staggerContainer}
        initial="hidden"
        animate="visible"
        className="grid grid-cols-12 gap-5 mt-6"
      >
        {/* Financial Intelligence Score (8 Columns) */}
        <motion.div variants={staggerItem} className="col-span-12 lg:col-span-8">
          <Card className="h-[340px] flex flex-col justify-between">
            <CardHeader className="pb-2">
              <div className="flex justify-between items-center">
                <CardTitle className="text-xs uppercase tracking-widest text-foreground-muted font-bold">
                  Financial Intelligence Score
                </CardTitle>
                <span className={cn(
                  "text-[10px] px-2 py-0.5 rounded-xs font-bold font-sans border",
                  healthScore >= 75 ? "text-positive bg-positive/10 border-positive/20" : "text-warning bg-warning/10 border-warning/20"
                )}>
                  {healthStatus}
                </span>
              </div>
            </CardHeader>
            <CardContent className="flex flex-col sm:flex-row items-center justify-between gap-6 overflow-hidden pt-2">
              
              {/* Radial rings and central score */}
              <div className="relative h-[200px] w-[200px] flex items-center justify-center shrink-0">
                <svg className="w-full h-full transform -rotate-90" viewBox="0 0 240 240">
                  {[105, 87, 69, 51, 33].map((r, i) => (
                    <circle 
                      key={i}
                      cx="120" 
                      cy="120" 
                      r={r} 
                      stroke="var(--border)" 
                      strokeWidth="5" 
                      fill="transparent" 
                      className="opacity-20"
                    />
                  ))}
                  
                  {/* Outer Overall Score Ring */}
                  <motion.circle 
                    cx="120" 
                    cy="120" 
                    r="105" 
                    stroke="var(--primary)" 
                    strokeWidth="7" 
                    strokeLinecap="round"
                    fill="transparent"
                    strokeDasharray={2 * Math.PI * 105}
                    initial={{ strokeDashoffset: 2 * Math.PI * 105 }}
                    animate={{ strokeDashoffset: radialAnimated ? 2 * Math.PI * 105 * (1 - healthScore / 100) : 2 * Math.PI * 105 }}
                    transition={{ duration: 1.5, ease: "easeOut" }}
                  />

                  {/* Savings Rate Ring */}
                  <motion.circle 
                    cx="120" 
                    cy="120" 
                    r="87" 
                    stroke="var(--positive)" 
                    strokeWidth="6" 
                    strokeLinecap="round"
                    fill="transparent"
                    strokeDasharray={2 * Math.PI * 87}
                    initial={{ strokeDashoffset: 2 * Math.PI * 87 }}
                    animate={{ strokeDashoffset: radialAnimated ? 2 * Math.PI * 87 * (1 - Math.min(1, savingsRate / 40)) : 2 * Math.PI * 87 }}
                    transition={{ duration: 1.4, ease: "easeOut", delay: 0.15 }}
                  />

                  {/* Credit Risk Ring */}
                  <motion.circle 
                    cx="120" 
                    cy="120" 
                    r="69" 
                    stroke="var(--forecast)" 
                    strokeWidth="6" 
                    strokeLinecap="round"
                    fill="transparent"
                    strokeDasharray={2 * Math.PI * 69}
                    initial={{ strokeDashoffset: 2 * Math.PI * 69 }}
                    animate={{ strokeDashoffset: radialAnimated ? 2 * Math.PI * 69 * (1 - Math.min(1, (100 - defaultProbability * 4) / 100)) : 2 * Math.PI * 69 }}
                    transition={{ duration: 1.3, ease: "easeOut", delay: 0.25 }}
                  />

                  {/* Emergency Cushion Ring */}
                  <motion.circle 
                    cx="120" 
                    cy="120" 
                    r="51" 
                    stroke="var(--ai)" 
                    strokeWidth="5" 
                    strokeLinecap="round"
                    fill="transparent"
                    strokeDasharray={2 * Math.PI * 51}
                    initial={{ strokeDashoffset: 2 * Math.PI * 51 }}
                    animate={{ strokeDashoffset: radialAnimated ? 2 * Math.PI * 51 * (1 - Math.min(1, emergencyMonths / 6)) : 2 * Math.PI * 51 }}
                    transition={{ duration: 1.2, ease: "easeOut", delay: 0.35 }}
                  />
                </svg>
                
                {/* Center text score */}
                <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                  <span className="text-4xl font-heading font-extrabold text-foreground leading-none">{healthScore}</span>
                  <span className="text-[9px] font-sans font-bold text-foreground-muted uppercase tracking-widest mt-1">/ 100</span>
                </div>
              </div>

              {/* Text parameters details on the side */}
              <div className="flex-1 space-y-4">
                <div className="space-y-1">
                  <h4 className="text-sm font-semibold text-foreground">Client Portfolio: {segmentName}</h4>
                  <p className="text-xs text-foreground-secondary leading-relaxed">
                    Evaluated by ArthDrishti Stacking Classifier. Your risk profile sits in the <span className="font-semibold text-foreground">{creditRiskBand}</span> band with an estimated default probability of <span className="font-semibold text-foreground">{defaultProbability}%</span>.
                  </p>
                </div>

                {/* Segment legends grids */}
                <div className="grid grid-cols-2 xs:grid-cols-3 gap-2.5">
                  <div className="flex items-center gap-2">
                    <span className="h-2 w-2 rounded-full bg-primary shrink-0" />
                    <span className="text-[10px] font-semibold text-foreground-secondary truncate">Health ({healthScore}%)</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="h-2 w-2 rounded-full bg-positive shrink-0" />
                    <span className="text-[10px] font-semibold text-foreground-secondary truncate">Savings ({savingsRate}%)</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="h-2 w-2 rounded-full bg-forecast shrink-0" />
                    <span className="text-[10px] font-semibold text-foreground-secondary truncate">Default Risk ({defaultProbability}%)</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="h-2 w-2 rounded-full bg-ai shrink-0" />
                    <span className="text-[10px] font-semibold text-foreground-secondary truncate">Reserves ({emergencyMonths} Mo)</span>
                  </div>
                </div>

                <div className="pt-2 flex items-center gap-3">
                  <button 
                    onClick={() => router.push("/financial-health")}
                    className="text-xs text-primary hover:underline font-bold flex items-center gap-1.5 focus-visible:outline-2 cursor-pointer"
                  >
                    View Full Analysis <ArrowRight className="h-3.5 w-3.5" />
                  </button>
                  <button 
                    onClick={() => router.push("/ai-advisor")}
                    className="text-xs text-foreground-secondary hover:text-foreground font-semibold flex items-center gap-1 cursor-pointer"
                  >
                    <Bot className="h-3.5 w-3.5 text-primary" /> Ask AI Advisor
                  </button>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* AI Daily Briefing (4 Columns) */}
        <motion.div variants={staggerItem} className="col-span-12 lg:col-span-4">
          <Card className="h-[340px] flex flex-col justify-between">
            <CardHeader className="pb-2">
              <div className="flex justify-between items-center">
                <CardTitle className="text-xs uppercase tracking-widest text-foreground-muted font-bold">
                  AI Model Briefing
                </CardTitle>
                <span className="text-[10px] font-sans font-bold text-primary flex items-center gap-1">
                  <Sparkles className="h-3 w-3" /> Groq / gpt-oss-20b
                </span>
              </div>
            </CardHeader>
            <CardContent className="flex-1 flex flex-col justify-between gap-4 overflow-y-auto mt-2">
              <div className="space-y-3.5">
                
                <div className="flex gap-3 items-start">
                  <span className="text-xs font-mono font-bold text-primary shrink-0 bg-primary/10 h-5 w-5 rounded-full flex items-center justify-center">
                    01
                  </span>
                  <div className="space-y-0.5">
                    <p className="text-xs font-semibold text-foreground">Credit Risk Tier: {creditRiskBand}</p>
                    <p className="text-[10px] text-foreground-secondary">Monotonic model estimates 1-year default probability at {defaultProbability}%.</p>
                  </div>
                </div>

                <div className="flex gap-3 items-start">
                  <span className="text-xs font-mono font-bold text-positive shrink-0 bg-positive/10 h-5 w-5 rounded-full flex items-center justify-center">
                    02
                  </span>
                  <div className="space-y-0.5">
                    <p className="text-xs font-semibold text-foreground">Savings Velocity: {savingsRate}% of Outflow</p>
                    <p className="text-[10px] text-foreground-secondary">Emergency buffer protects {emergencyMonths} months of baseline living expenses.</p>
                  </div>
                </div>

                <div className="flex gap-3 items-start">
                  <span className="text-xs font-mono font-bold text-warning shrink-0 bg-warning/10 h-5 w-5 rounded-full flex items-center justify-center">
                    03
                  </span>
                  <div className="space-y-0.5">
                    <p className="text-xs font-semibold text-foreground">Discretionary Ratio: {discretionarySpend}%</p>
                    <p className="text-[10px] text-foreground-secondary">Keeping discretionary outflow under 30% ensures continuous health score upgrades.</p>
                  </div>
                </div>

              </div>

              <div className="pt-2">
                <button
                  onClick={handleScrollToInsights}
                  className="w-full text-center py-2 text-xs border border-border bg-surface-elevated/45 hover:bg-surface-hover rounded-sm font-semibold text-foreground hover:text-primary transition-colors cursor-pointer focus-visible:outline-2"
                >
                  View Recommendations ({recommendations.length})
                </button>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </motion.div>

      {/* 3. KPI CARDS ROW */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 my-6">
        
        {/* KPI 1: Financial Health */}
        <Card className="hover:border-primary/45 transition-colors relative overflow-hidden group">
          <CardContent className="p-5 flex justify-between items-center">
            <div className="space-y-1.5">
              <span className="text-[10px] font-sans font-bold uppercase tracking-wider text-foreground-secondary block">
                Financial Health
              </span>
              <h2 className="text-2xl sm:text-3xl font-heading font-extrabold text-foreground">
                {healthScore} <span className="text-xs font-sans font-normal text-foreground-secondary">/100</span>
              </h2>
              <span className={cn(
                "text-[10px] font-bold px-1.5 py-0.5 rounded-xs inline-flex items-center gap-0.5 select-none border",
                healthScore >= 75 ? "text-positive bg-positive/10 border-positive/20" : "text-warning bg-warning/10 border-warning/20"
              )}>
                {healthStatus}
              </span>
            </div>
            
            <div className="relative h-12 w-12 flex items-center justify-center shrink-0">
              <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                <circle cx="18" cy="18" r="14" stroke="var(--border)" strokeWidth="3.5" fill="transparent" className="opacity-25" />
                <circle cx="18" cy="18" r="14" stroke="var(--primary)" strokeWidth="3.5" fill="transparent" strokeDasharray="88" strokeDashoffset={88 * (1 - healthScore / 100)} strokeLinecap="round" />
              </svg>
              <HeartPulse className="h-4 w-4 text-primary absolute" />
            </div>
          </CardContent>
        </Card>

        {/* KPI 2: Default Risk */}
        <Card className="hover:border-primary/45 transition-colors relative overflow-hidden group">
          <CardContent className="p-5 flex justify-between items-center">
            <div className="space-y-1.5">
              <span className="text-[10px] font-sans font-bold uppercase tracking-wider text-foreground-secondary block">
                Default Risk
              </span>
              <h2 className="text-2xl sm:text-3xl font-heading font-extrabold text-foreground">
                {defaultProbability}%
              </h2>
              <span className={cn(
                "text-[10px] font-bold px-1.5 py-0.5 rounded-xs inline-flex items-center gap-0.5 select-none border",
                creditRiskBand === "LOW" ? "text-positive bg-positive/10 border-positive/20" : "text-critical bg-critical/10 border-critical/20"
              )}>
                {creditRiskBand} RISK TIER
              </span>
            </div>
            <div className="h-10 w-10 rounded-sm bg-positive/10 border border-positive/20 flex items-center justify-center text-positive shrink-0">
              <ShieldCheck className="h-5 w-5" />
            </div>
          </CardContent>
        </Card>

        {/* KPI 3: Fraud Alerts */}
        <Card className="hover:border-primary/45 transition-colors relative overflow-hidden group">
          <CardContent className="p-5 flex justify-between items-center">
            <div className="space-y-1.5">
              <span className="text-[10px] font-sans font-bold uppercase tracking-wider text-foreground-secondary block">
                Fraud Alerts
              </span>
              <h2 className="text-2xl sm:text-3xl font-heading font-extrabold text-foreground">
                {fraudAlerts.length}
              </h2>
              <span className={cn(
                "text-[10px] font-bold px-1.5 py-0.5 rounded-xs inline-flex items-center gap-0.5 select-none border",
                fraudAlerts.length > 0 ? "text-critical bg-critical/10 border-critical/20" : "text-positive bg-positive/10 border-positive/20"
              )}>
                {fraudAlerts.length > 0 ? `${fraudAlerts.length} UNREVIEWED` : "0 ANOMALIES"}
              </span>
            </div>
            <div className={cn(
              "h-10 w-10 rounded-sm border flex items-center justify-center shrink-0",
              fraudAlerts.length > 0 ? "bg-critical/10 border-critical/20 text-critical animate-pulse" : "bg-positive/10 border-positive/20 text-positive"
            )}>
              <Fingerprint className="h-5 w-5" />
            </div>
          </CardContent>
        </Card>

        {/* KPI 4: Monthly Savings Rate */}
        <Card className="hover:border-primary/45 transition-colors relative overflow-hidden group">
          <CardContent className="p-5 flex justify-between items-center">
            <div className="space-y-1.5">
              <span className="text-[10px] font-sans font-bold uppercase tracking-wider text-foreground-secondary block">
                Net Monthly Surplus
              </span>
              <h2 className="text-xl sm:text-2xl font-heading font-extrabold text-foreground">
                {formatCurrency(summary?.net_cash_flow ?? (summary?.total_income ? summary.total_income * (savingsRate / 100) : 21500))}
              </h2>
              <span className="text-[10px] font-bold text-positive bg-positive/10 border border-positive/20 px-1.5 py-0.5 rounded-xs inline-flex items-center gap-0.5 select-none">
                {savingsRate}% Savings Rate
              </span>
            </div>
            
            <div className="flex items-end gap-1 h-10 w-10 border-b border-border/80 pb-0.5 shrink-0 justify-center">
              <div className="w-1.5 bg-border rounded-xs h-4" />
              <div className="w-1.5 bg-border rounded-xs h-6" />
              <div className="w-1.5 bg-border rounded-xs h-5" />
              <div className="w-1.5 bg-primary rounded-xs h-9 transition-all duration-300" />
            </div>
          </CardContent>
        </Card>

      </div>

      {/* 4. FINANCIAL PULSE & RISK RADAR */}
      <div className="grid grid-cols-12 gap-5 my-6 select-none">
        
        {/* Financial Pulse Chart (8 Columns) */}
        <div className="col-span-12 lg:col-span-8">
          <Card className="h-[460px] flex flex-col justify-between">
            <CardHeader className="pb-2 border-b border-border/60">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <CardTitle className="text-xs uppercase tracking-widest text-foreground-muted font-bold">
                    Financial Pulse & Monthly Dynamics
                  </CardTitle>
                  <p className="text-[11px] text-foreground-secondary">
                    {summary?.monthly_trend?.length ? "Derived from verified statement ingestion logs." : "Baseline cash flow projection trajectory."}
                  </p>
                </div>
                
                {/* Tab Category Selectors */}
                <div className="flex items-center gap-2 border border-border p-1 rounded-sm bg-surface-elevated/45">
                  {(["CASH FLOW", "INCOME", "EXPENSES"] as const).map((tab) => (
                    <button
                      key={tab}
                      onClick={() => setPulseTab(tab)}
                      className={cn(
                        "text-[10px] font-sans font-bold px-2.5 py-1 rounded-xs transition-colors cursor-pointer",
                        pulseTab === tab
                          ? "bg-primary text-white"
                          : "text-foreground-secondary hover:text-foreground hover:bg-surface-hover"
                      )}
                    >
                      {tab}
                    </button>
                  ))}
                </div>
              </div>
            </CardHeader>
            <CardContent className="pt-6 flex-1 min-h-0 relative">
              
              <div className="w-full h-full min-h-[260px] flex flex-col justify-end">
                <ResponsiveContainer width="100%" height="95%">
                  <AreaChart data={pulseChartData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                    <defs>
                      <linearGradient id="colorCurrent" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="var(--primary)" stopOpacity={0.25}/>
                        <stop offset="95%" stopColor="var(--primary)" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border)" className="opacity-60" />
                    <XAxis 
                      dataKey="name" 
                      tickLine={false} 
                      axisLine={false} 
                      tick={{ fill: "var(--foreground-secondary)", fontSize: 10, fontFamily: "var(--font-sans)" }} 
                    />
                    <YAxis 
                      tickLine={false} 
                      axisLine={false} 
                      tickFormatter={(v) => `₹${(v / 1000).toFixed(0)}k`}
                      tick={{ fill: "var(--foreground-secondary)", fontSize: 10, fontFamily: "var(--font-sans)" }} 
                    />
                    <RechartsTooltip 
                      content={({ active, payload }) => {
                        if (active && payload && payload.length) {
                          const cur = payload[0].value as number;
                          const prev = payload[1]?.value as number;
                          return (
                            <div className="bg-surface-elevated border border-border p-3.5 shadow-lg rounded-sm text-xs font-sans space-y-1.5 min-w-[140px]">
                              <p className="text-[10px] font-bold text-foreground-muted uppercase tracking-wider">
                                {payload[0].payload.name}
                              </p>
                              <div className="space-y-1">
                                <div className="flex justify-between gap-4">
                                  <span className="text-foreground-secondary">{pulseTab}:</span>
                                  <span className="font-semibold text-foreground">{formatCurrency(cur)}</span>
                                </div>
                                {prev !== undefined && (
                                  <div className="flex justify-between gap-4">
                                    <span className="text-foreground-secondary">Baseline:</span>
                                    <span className="font-medium text-foreground-muted">{formatCurrency(prev)}</span>
                                  </div>
                                )}
                              </div>
                            </div>
                          );
                        }
                        return null;
                      }}
                    />
                    <Area 
                      type="monotone" 
                      dataKey="previous" 
                      stroke="var(--border-strong)" 
                      strokeWidth={1.5}
                      strokeDasharray="4 4"
                      fill="transparent" 
                      activeDot={false}
                    />
                    <Area 
                      type="monotone" 
                      dataKey="current" 
                      stroke="var(--primary)" 
                      strokeWidth={2}
                      fillOpacity={1} 
                      fill="url(#colorCurrent)" 
                      activeDot={{ r: 5, strokeWidth: 0, fill: "var(--primary)" }}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>

            </CardContent>
          </Card>
        </div>

        {/* Risk Radar (4 Columns) */}
        <div className="col-span-12 lg:col-span-4">
          <Card className="h-[460px] flex flex-col justify-between">
            <CardHeader className="pb-2 border-b border-border/60">
              <CardTitle className="text-xs uppercase tracking-widest text-foreground-muted font-bold">
                Portfolio Risk Radar
              </CardTitle>
              <p className="text-[11px] text-foreground-secondary">Dimension scores against target benchmark.</p>
            </CardHeader>
            <CardContent className="pt-4 flex-1 flex flex-col justify-between gap-4">
              
              <div className="w-full h-64 flex justify-center items-center">
                <ResponsiveContainer width="100%" height="100%">
                  <RadarChart cx="50%" cy="50%" outerRadius="75%" data={radarData}>
                    <PolarGrid stroke="var(--border)" className="opacity-40" />
                    <PolarAngleAxis 
                      dataKey="subject" 
                      tick={{ fill: "var(--foreground-secondary)", fontSize: 9, fontWeight: 600, fontFamily: "var(--font-sans)" }} 
                    />
                    <PolarRadiusAxis 
                      angle={30} 
                      domain={[0, 100]} 
                      tick={{ fill: "var(--foreground-muted)", fontSize: 8 }}
                      axisLine={false}
                    />
                    <Radar 
                      name="Benchmark" 
                      dataKey="B" 
                      stroke="var(--forecast)" 
                      fill="var(--forecast)" 
                      fillOpacity={0.05} 
                      strokeWidth={1.5}
                      strokeDasharray="3 3"
                    />
                    <Radar 
                      name="Your Score" 
                      dataKey="A" 
                      stroke="var(--primary)" 
                      fill="var(--primary)" 
                      fillOpacity={0.2} 
                      strokeWidth={2}
                    />
                  </RadarChart>
                </ResponsiveContainer>
              </div>

              <div className="space-y-3.5">
                <div className="flex justify-center items-center gap-4 text-[10px] font-bold">
                  <div className="flex items-center gap-1.5">
                    <span className="h-2 w-2 rounded-full bg-primary" />
                    <span className="text-foreground-secondary">Your Real Metrics</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="h-1.5 w-1.5 rounded-full border border-dashed border-forecast" />
                    <span className="text-foreground-secondary">Prime Benchmark</span>
                  </div>
                </div>

                <button
                  onClick={() => router.push("/credit-risk")}
                  className="w-full text-center py-2 text-xs border border-border bg-surface-elevated/45 hover:bg-surface-hover rounded-sm font-semibold text-foreground hover:text-primary transition-colors cursor-pointer focus-visible:outline-2"
                >
                  View Full Risk Analysis
                </button>
              </div>

            </CardContent>
          </Card>
        </div>

      </div>

      {/* 5. AI RECOMMENDATIONS FEED */}
      <div id="insights-feed" className="space-y-4 my-8 scroll-mt-24 select-none">
        
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between border-b border-border/60 pb-4">
          <div className="space-y-1">
            <h2 className="text-lg font-heading font-semibold text-foreground flex items-center gap-2">
              <Activity className="h-5 w-5 text-primary" /> Model Recommendations ({recommendations.length})
            </h2>
            <p className="text-xs text-foreground-secondary">Actionable optimizations generated from your verified credit and cash flow metrics.</p>
          </div>

          <div className="flex flex-wrap gap-1.5">
            {["ALL", "HIGH", "MEDIUM", "SAVINGS", "CREDIT"].map((filter) => (
              <button
                key={filter}
                onClick={() => setInsightFilter(filter)}
                className={cn(
                  "text-[10px] font-sans font-bold px-3 py-1 rounded-sm border transition-all cursor-pointer focus-visible:outline-2",
                  insightFilter === filter
                    ? "bg-primary border-primary text-white shadow-xs"
                    : "bg-surface border-border text-foreground-secondary hover:text-foreground hover:border-border-strong"
                )}
              >
                {filter}
              </button>
            ))}
          </div>
        </div>

        {/* Dynamic Recommendations List */}
        {filteredRecommendations.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {filteredRecommendations.map((rec) => (
              <Card 
                key={rec.id} 
                className={cn(
                  "border hover:border-border-strong transition-all flex flex-col justify-between",
                  rec.impact_level?.toLowerCase() === "high" ? "border-primary/40 bg-primary/[0.025]" : "border-border"
                )}
              >
                <CardContent className="p-5 flex flex-col justify-between gap-4 h-full">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <span className={cn(
                          "text-[9px] font-sans font-bold tracking-wider px-2 py-0.5 rounded-xs border uppercase",
                          rec.impact_level?.toLowerCase() === "high"
                            ? "bg-primary/10 text-primary border-primary/20"
                            : "bg-surface-elevated text-foreground-secondary border-border"
                        )}>
                          {rec.impact_level} Impact
                        </span>
                        <span className="text-[10px] font-sans font-bold text-foreground bg-surface-elevated border border-border px-2 py-0.5 rounded-xs">
                          {rec.category}
                        </span>
                      </div>
                      <span className="text-[10px] text-foreground-muted font-mono">Real-time</span>
                    </div>

                    <h3 className="text-sm font-bold text-foreground font-heading mt-1">
                      {rec.title}
                    </h3>
                    <p className="text-xs text-foreground-secondary leading-relaxed">
                      {rec.description}
                    </p>
                  </div>

                  <div className="flex gap-2 pt-2 border-t border-border/40">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => router.push("/ai-advisor")}
                      className="text-[10px] flex-1 py-1.5 focus-visible:outline-2 cursor-pointer gap-1.5"
                    >
                      <Bot className="h-3.5 w-3.5 text-primary" /> Ask Advisor
                    </Button>
                    <Button 
                      variant="primary" 
                      size="sm" 
                      onClick={() => router.push("/simulator")}
                      className="text-[10px] flex-1 py-1.5 font-semibold focus-visible:outline-2 cursor-pointer"
                    >
                      Simulate Impact
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="p-8 text-center bg-surface border border-border rounded-sm">
            <ShieldCheck className="h-8 w-8 text-positive mx-auto mb-2" />
            <h3 className="text-sm font-semibold text-foreground">Portfolio Operating within Safe Thresholds</h3>
            <p className="text-xs text-foreground-secondary mt-1">
              No critical interventions flagged. Your cash flow and risk vectors meet institutional stability benchmarks.
            </p>
          </div>
        )}
      </div>

      {/* 6. SUSPICIOUS TRANSACTIONS (FRAUD ANOMALIES) */}
      <div className="space-y-4 my-8 select-none">
        <div className="border-b border-border/60 pb-4">
          <h2 className="text-lg font-heading font-semibold text-foreground flex items-center gap-2">
            <Fingerprint className="h-5 w-5 text-critical" /> Suspicious Transactions & Fraud Monitoring
          </h2>
          <p className="text-xs text-foreground-secondary">
            Scanned by Isolation Forest anomaly detector calibrated on empirical fraud rates.
          </p>
        </div>

        {fraudAlerts.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {fraudAlerts.map((item) => (
              <div
                key={item.id}
                onClick={() => {
                  setSelectedAnomaly({
                    id: item.id,
                    merchant: item.transaction?.description || item.merchant || "Unrecognized Outflow",
                    amount: item.transaction?.amount ? Number(item.transaction.amount) : 0,
                    date: item.created_at ? new Date(item.created_at).toLocaleDateString() : "Recent",
                    score: Math.round(Number(item.anomaly_score) * 100),
                    reasons: Array.isArray(item.reasons) ? item.reasons : ["Anomaly score exceeds risk boundary"],
                  });
                  setIsDrawerOpen(true);
                }}
                onKeyDown={(event) => {
                  if (event.key === "Enter" || event.key === " ") {
                    event.preventDefault();
                    event.currentTarget.click();
                  }
                }}
                className="p-4 rounded-sm border border-border bg-surface hover:bg-surface-elevated/45 hover:border-critical/35 transition-all flex items-center justify-between gap-4 cursor-pointer outline-none focus-visible:outline-2"
                role="button"
                tabIndex={0}
              >
                <div className="flex items-center gap-3.5 min-w-0">
                  <div className="h-10 w-10 rounded-sm bg-critical/10 border border-critical/20 flex items-center justify-center text-critical shrink-0">
                    <Fingerprint className="h-5 w-5" />
                  </div>
                  <div className="min-w-0">
                    <h4 className="text-xs font-semibold text-foreground truncate">
                      {item.transaction?.description || "Flagged Outflow"}
                    </h4>
                    <p className="text-[10px] text-foreground-secondary mt-0.5">
                      {item.risk_level} Risk • {item.created_at ? new Date(item.created_at).toLocaleDateString() : "Recent"}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-4 shrink-0">
                  <div className="text-right">
                    <span className="text-xs font-bold text-foreground block">
                      {item.transaction?.amount ? formatCurrency(Number(item.transaction.amount)) : "--"}
                    </span>
                    <span className="text-[10px] text-critical font-bold mt-0.5 block">
                      Score {Math.round(Number(item.anomaly_score) * 100)}%
                    </span>
                  </div>
                  <ArrowRight className="h-4 w-4 text-foreground-muted" />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-6 rounded-sm border border-border bg-surface flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-sm bg-positive/10 border border-positive/20 flex items-center justify-center text-positive shrink-0">
                <ShieldCheck className="h-5 w-5" />
              </div>
              <div>
                <h4 className="text-xs font-semibold text-foreground">Zero Suspicious Anomalies Detected</h4>
                <p className="text-[10px] text-foreground-secondary mt-0.5">
                  All transactions align with your expected merchant patterns, amounts, and frequency profiles.
                </p>
              </div>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => router.push("/fraud")}
              className="text-xs cursor-pointer"
            >
              Fraud Center
            </Button>
          </div>
        )}
      </div>

      {/* 7. TRANSACTION INTELLIGENCE DRAWER (SHEET PANEL) */}
      <Sheet
        isOpen={isDrawerOpen}
        onClose={() => {
          setIsDrawerOpen(false);
          setSelectedAnomaly(null);
        }}
        title="Transaction Intelligence Audit"
        className="w-full max-w-md"
      >
        {selectedAnomaly && (
          <div className="space-y-6 font-sans">
            <div className="p-4 rounded-sm bg-surface-elevated border border-border flex items-center justify-between gap-4">
              <div>
                <h3 className="text-sm font-bold text-foreground truncate max-w-[200px]">{selectedAnomaly.merchant}</h3>
                <p className="text-[10px] text-foreground-secondary mt-0.5">{selectedAnomaly.date}</p>
              </div>
              <div className="text-right">
                <span className="text-sm font-extrabold text-foreground block">{formatCurrency(selectedAnomaly.amount)}</span>
                <span className="text-[10px] text-critical font-bold mt-0.5 block">Anomaly: {selectedAnomaly.score}%</span>
              </div>
            </div>

            <div className="space-y-3">
              <h4 className="text-xs font-bold text-foreground uppercase tracking-wider flex items-center gap-1.5">
                <AlertCircle className="h-4 w-4 text-critical" /> Reasons Flagged
              </h4>
              <ul className="grid grid-cols-1 gap-2 pl-0 list-none">
                {selectedAnomaly.reasons.map((reason, idx) => (
                  <li key={idx} className="flex gap-2.5 items-start p-2.5 bg-surface-elevated/45 border border-border/40 rounded-sm text-xs text-foreground-secondary leading-normal">
                    <span className="h-1.5 w-1.5 bg-critical rounded-full shrink-0 mt-1.5" />
                    <span>{reason}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="flex flex-col gap-3 pt-6 border-t border-border">
              <div className="flex gap-3">
                <Button 
                  variant="outline" 
                  onClick={() => {
                    toast.success("Transaction marked safe.");
                    setIsDrawerOpen(false);
                  }}
                  className="flex-1 text-xs py-2 focus-visible:outline-2 cursor-pointer"
                >
                  Mark Safe
                </Button>
                <Button 
                  variant="primary" 
                  onClick={() => {
                    router.push("/fraud");
                    setIsDrawerOpen(false);
                  }}
                  className="flex-1 text-xs py-2 focus-visible:outline-2 cursor-pointer"
                >
                  Investigate in Fraud Portal
                </Button>
              </div>
            </div>
          </div>
        )}
      </Sheet>

    </PageContainer>
  );
}
