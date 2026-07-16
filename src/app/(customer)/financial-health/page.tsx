"use client";

import React, { useState, useMemo, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip as RechartsTooltip, 
  ResponsiveContainer,
  ReferenceDot
} from "recharts";
import { 
  TrendingUp, 
  ShieldCheck, 
  Activity, 
  AlertCircle, 
  ArrowRight,
  Sparkles,
  Award,
  CheckCircle2,
  Bookmark,
  Info
} from "lucide-react";
import { toast } from "sonner";

import PageContainer from "@/components/ui/PageContainer";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Sheet } from "@/components/ui/Overlays";
import { staggerContainer, staggerItem } from "@/lib/animations";

// ==========================================
// TYPE DEFINITIONS
// ==========================================
interface ComponentMetric {
  id: string;
  name: string;
  score: number;
  status: "Excellent" | "Optimal" | "Moderate" | "Needs Attention";
  trend: string;
  weight: string;
  reasons: { label: string; value: string }[];
  improvement: string;
  impact: string;
  icon: React.ComponentType<{ className?: string }>;
}

interface HistoryPoint {
  name: string;
  score: number;
  event?: string;
}

interface PlanItem {
  id: string;
  action: string;
  why: string;
  impact: string;
  difficulty: "Easy" | "Medium" | "Hard";
  time: string;
}

// ==========================================
// STATIC MOCK DATA
// ==========================================

const componentsData: ComponentMetric[] = [
  {
    id: "savings",
    name: "Savings Health",
    score: 78,
    status: "Optimal",
    trend: "+12 points",
    weight: "20%",
    reasons: [
      { label: "Monthly Savings Rate", value: "+12 points" },
      { label: "Emergency Savings Ratio", value: "+8 points" },
      { label: "Irregular Deposits volatility", value: "-4 points" }
    ],
    improvement: "Increase liquid emergency fund reserves to ₹1.5L.",
    impact: "+7 Financial Health Points",
    icon: CheckCircle2
  },
  {
    id: "income",
    name: "Income Stability",
    score: 92,
    status: "Excellent",
    trend: "+2 points",
    weight: "15%",
    reasons: [
      { label: "Paycheck consistency index", value: "+15 points" },
      { label: "Multiple income streams", value: "+5 points" },
      { label: "High single-employer dependence", value: "-8 points" }
    ],
    improvement: "Establish secondary recurring dividend or yield channel.",
    impact: "+3 Financial Health Points",
    icon: TrendingUp
  },
  {
    id: "debt",
    name: "Debt Management",
    score: 85,
    status: "Excellent",
    trend: "+3 points",
    weight: "15%",
    reasons: [
      { label: "Debt-to-Income < 20%", value: "+15 points" },
      { label: "On-time installment timeline", value: "+10 points" },
      { label: "High credit limits room", value: "+5 points" }
    ],
    improvement: "Clear outstanding revolving credit card card balances early.",
    impact: "+2 Financial Health Points",
    icon: ShieldCheck
  },
  {
    id: "investments",
    name: "Investments Ratio",
    score: 60,
    status: "Moderate",
    trend: "+1 point",
    weight: "10%",
    reasons: [
      { label: "Sip deposit frequency", value: "+8 points" },
      { label: "Asset diversification indices", value: "+7 points" },
      { label: "Idle checking account cash drag", value: "-15 points" }
    ],
    improvement: "Reallocate ₹50,000 idle checking cash into mutual debt funds.",
    impact: "+5 Financial Health Points",
    icon: TrendingUp
  },
  {
    id: "expenses",
    name: "Expense Control",
    score: 70,
    status: "Optimal",
    trend: "+2 points",
    weight: "15%",
    reasons: [
      { label: "Low fixed monthly overheads", value: "+10 points" },
      { label: "Redundant subscriptions overlap", value: "-5 points" },
      { label: "Dining and discretionary variances", value: "-5 points" }
    ],
    improvement: "Consolidate overlapping ledger SaaS platforms.",
    impact: "+4 Financial Health Points",
    icon: Activity
  },
  {
    id: "credit",
    name: "Credit History",
    score: 88,
    status: "Excellent",
    trend: "0 points",
    weight: "10%",
    reasons: [
      { label: "Average credit account age", value: "+15 points" },
      { label: "No past due payment indices", value: "+20 points" },
      { label: "Recent hard bureau inquiries", value: "-7 points" }
    ],
    improvement: "Avoid submitting multiple card request applications in 30 days.",
    impact: "+1 Financial Health Point",
    icon: ShieldCheck
  },
  {
    id: "emergency",
    name: "Emergency Fund",
    score: 65,
    status: "Needs Attention",
    trend: "-2 points",
    weight: "15%",
    reasons: [
      { label: "Liquid sweep account access", value: "+10 points" },
      { label: "Reserve coverage < 3 months", value: "-15 points" },
      { label: "Unsecured backup overdraft availability", value: "+5 points" }
    ],
    improvement: "Automate ₹5,000 monthly sweeps into sweep-in deposits.",
    impact: "+9 Financial Health Points",
    icon: AlertCircle
  }
];

const historyDataMap: Record<string, HistoryPoint[]> = {
  "3M": [
    { name: "Apr 26", score: 76, event: "Job shift (+5)" },
    { name: "May 26", score: 79 },
    { name: "Jun 26", score: 82, event: "EMI completed (+3)" }
  ],
  "6M": [
    { name: "Jan 26", score: 72 },
    { name: "Feb 26", score: 74 },
    { name: "Mar 26", score: 73, event: "Tax liabilities (-2)" },
    { name: "Apr 26", score: 76, event: "Job shift (+5)" },
    { name: "May 26", score: 79 },
    { name: "Jun 26", score: 82, event: "EMI completed (+3)" }
  ],
  "1Y": [
    { name: "Jul 25", score: 68 },
    { name: "Sep 25", score: 70, event: "Bonus Sweep (+4)" },
    { name: "Nov 25", score: 71 },
    { name: "Jan 26", score: 72 },
    { name: "Mar 26", score: 73 },
    { name: "May 26", score: 79 },
    { name: "Jun 26", score: 82, event: "EMI completed (+3)" }
  ],
  "ALL": [
    { name: "2024", score: 58 },
    { name: "2025", score: 70, event: "Bonus Sweep (+4)" },
    { name: "2026 (YTD)", score: 82, event: "EMI completed (+3)" }
  ]
};

const planItems: PlanItem[] = [
  {
    id: "plan-1",
    action: "Automate sweep-in reserves sweeps",
    why: "Emergency reserve covers only 2.1 months of regular overheads. Sweeping ₹5,000 monthly bridges this buffer.",
    impact: "+9 Health Points",
    difficulty: "Easy",
    time: "2 mins"
  },
  {
    id: "plan-2",
    action: "Reallocate idle checkings balances",
    why: "₹50k cash idle in checking. Reallocating to short-term bond yields resolves cash drag parameters.",
    impact: "+5 Health Points",
    difficulty: "Medium",
    time: "5 mins"
  },
  {
    id: "plan-3",
    action: "Consolidate double SaaS subscriptions",
    why: "Overlapping statement data scanners found. Cancelling redundancies stops recurring outflows.",
    impact: "+4 Health Points",
    difficulty: "Easy",
    time: "10 mins"
  }
];

export default function FinancialHealthPage() {
  const router = useRouter();

  // Page Controls
  const [historyPeriod, setHistoryPeriod] = useState("6M");
  const [selectedMetric, setSelectedMetric] = useState<ComponentMetric | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [activeCalId, setActiveCalId] = useState<string>("savings");

  const [gaugeAnimated, setGaugeAnimated] = useState(false);
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setGaugeAnimated(true);
  }, []);

  const currentHistoryData = useMemo(() => {
    return historyDataMap[historyPeriod] || [];
  }, [historyPeriod]);

  // Find points with event annotations for referencing dots
  const referenceDots = useMemo(() => {
    return currentHistoryData
      .map((d, idx) => ({ ...d, index: idx }))
      .filter(d => !!d.event);
  }, [currentHistoryData]);

  const handleSimulateInDrawer = (metricName: string) => {
    toast.success(`Simulation profile generated for: ${metricName}`);
    setIsDrawerOpen(false);
    router.push("/simulator");
  };

  const handleSimulateItem = (actionName: string) => {
    toast.info(`Configuring simulator variables for: ${actionName}`);
    router.push("/simulator");
  };

  // Helper colors maps
  const getStatusColor = (status: string) => {
    const maps = {
      "Excellent": "text-positive bg-positive/10 border-positive/20",
      "Optimal": "text-primary bg-primary/10 border-primary/20",
      "Moderate": "text-warning bg-warning/10 border-warning/20",
      "Needs Attention": "text-critical bg-critical/10 border-critical/20"
    };
    return maps[status as keyof typeof maps] || "text-foreground-secondary";
  };

  const getMetricProgressColor = (score: number) => {
    if (score >= 85) return "bg-positive";
    if (score >= 70) return "bg-primary";
    if (score >= 50) return "bg-warning";
    return "bg-critical";
  };

  return (
    <PageContainer className="pb-24">
      
      {/* 1. HERO - IMMEDIATE ANSWER BLOCK */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center border-b border-border pb-8 select-none">
        
        {/* Left Side: Score metrics metadata */}
        <div className="col-span-12 lg:col-span-6 space-y-5 text-center lg:text-left">
          <div className="space-y-1">
            <span className="text-[10px] font-sans font-bold uppercase tracking-widest text-primary bg-primary/10 border border-primary/20 px-3 py-1 rounded-xs inline-block">
              Diagnostics Intelligence
            </span>
            <h1 className="text-3xl sm:text-4xl font-heading font-extrabold text-foreground tracking-tight leading-none mt-2">
              How Financially Healthy Am I?
            </h1>
            <p className="text-xs sm:text-sm text-foreground-secondary leading-relaxed max-w-lg mx-auto lg:mx-0 pt-1">
              Your overall standing is compiled from cash reserve margins, debt leverage scales, and systematic investment ratios.
            </p>
          </div>

          <div className="flex flex-wrap items-center justify-center lg:justify-start gap-4">
            <div className="text-center lg:text-left border-r border-border/80 pr-6">
              <span className="text-xs text-foreground-muted block">Health Rating</span>
              <span className="text-lg font-bold text-foreground block mt-0.5">EXCELLENT</span>
            </div>
            <div className="text-center lg:text-left border-r border-border/80 pr-6">
              <span className="text-xs text-foreground-muted block">Trend Standing</span>
              <span className="text-lg font-bold text-positive block mt-0.5">↑ 6 PTS THIS MONTH</span>
            </div>
            <div className="text-center lg:text-left">
              <span className="text-xs text-foreground-muted block">Percentile</span>
              <span className="text-lg font-bold text-primary block mt-0.5">TOP 18% OF SIMILAR USERS</span>
            </div>
          </div>
        </div>

        {/* Right Side: Curved SVG Radial half-circle gauge */}
        <div className="col-span-12 lg:col-span-6 flex flex-col items-center justify-center relative">
          <div className="relative h-48 w-72 flex flex-col items-center justify-center overflow-hidden">
            <svg className="w-full h-full" viewBox="0 0 240 130">
              <defs>
                <linearGradient id="arcGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="var(--critical)" />
                  <stop offset="50%" stopColor="var(--warning)" />
                  <stop offset="100%" stopColor="var(--positive)" />
                </linearGradient>
              </defs>
              
              {/* Background Arc */}
              <path 
                d="M 20 120 A 100 100 0 0 1 220 120" 
                stroke="var(--border)" 
                strokeWidth="12" 
                strokeLinecap="round" 
                fill="transparent" 
                className="opacity-20"
              />

              {/* Progress Arc */}
              <motion.path 
                d="M 20 120 A 100 100 0 0 1 220 120" 
                stroke="url(#arcGradient)" 
                strokeWidth="12" 
                strokeLinecap="round" 
                fill="transparent" 
                strokeDasharray="314.15"
                initial={{ strokeDashoffset: 314.15 }}
                animate={{ strokeDashoffset: gaugeAnimated ? 314.15 * (1 - 0.82) : 314.15 }}
                transition={{ duration: 1.6, ease: "easeOut" }}
              />

              {/* Ticks markers */}
              <text x="24" y="128" fill="var(--foreground-muted)" fontSize="8" textAnchor="middle" fontWeight="bold">0</text>
              <text x="120" y="15" fill="var(--foreground-muted)" fontSize="8" textAnchor="middle" fontWeight="bold">50</text>
              <text x="216" y="128" fill="var(--foreground-muted)" fontSize="8" textAnchor="middle" fontWeight="bold">100</text>
            </svg>

            {/* Central Score readout */}
            <div className="absolute bottom-2 flex flex-col items-center text-center">
              <span className="text-5xl font-heading font-extrabold text-foreground tracking-tight leading-none">82</span>
              <span className="text-[10px] font-sans font-bold text-foreground-secondary uppercase tracking-widest mt-1">Excellent Score</span>
            </div>
          </div>
        </div>

      </div>

      {/* 2. HEALTH SCORE COMPONENTS GRID */}
      <div className="space-y-4 my-8 select-none">
        <div className="border-b border-border/60 pb-3">
          <h2 className="text-lg font-heading font-semibold text-foreground flex items-center gap-2">
            <Award className="h-5 w-5 text-primary" /> Health Score Components
          </h2>
          <p className="text-xs text-foreground-secondary">
            Scored diagnostic metrics weighting your overall standing. Click components to audit improvement steps.
          </p>
        </div>

        {/* 7-card responsive grid */}
        <motion.div 
          variants={staggerContainer}
          initial="hidden"
          animate="visible"
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5"
        >
          {componentsData.map((metric) => {
            const Icon = metric.icon;
            const progressColor = getMetricProgressColor(metric.score);
            const statusColor = getStatusColor(metric.status);

            return (
              <motion.div key={metric.id} variants={staggerItem}>
                <Card 
                  onClick={() => {
                    setSelectedMetric(metric);
                    setIsDrawerOpen(true);
                  }}
                  className="hover:border-primary/45 transition-colors cursor-pointer flex flex-col justify-between h-[180px] p-5 relative overflow-hidden group outline-none focus-visible:outline-2 focus-visible:outline-offset-2"
                  role="button"
                  tabIndex={0}
                  aria-label={`${metric.name}. Score ${metric.score} out of 100.`}
                >
                  <CardContent className="p-0 flex flex-col justify-between h-full w-full">
                    
                    {/* Top title & status */}
                    <div className="space-y-1">
                      <div className="flex items-start justify-between gap-2">
                        <div className="h-8 w-8 rounded-sm bg-primary/10 border border-primary/20 text-primary flex items-center justify-center shrink-0">
                          <Icon className="h-4.5 w-4.5" />
                        </div>
                        <span className={`text-[9px] font-sans font-bold tracking-wider px-2 py-0.5 rounded-xs border shrink-0 ${statusColor}`}>
                          {metric.status}
                        </span>
                      </div>
                      
                      <h3 className="text-xs font-bold text-foreground font-heading mt-2 truncate">
                        {metric.name}
                      </h3>
                    </div>

                    {/* Middle Score and progress spark */}
                    <div className="space-y-2">
                      <div className="flex items-baseline justify-between">
                        <span className="text-xl font-heading font-extrabold text-foreground">
                          {metric.score} <span className="text-[10px] font-sans font-normal text-foreground-secondary">/100</span>
                        </span>
                        <span className="text-[9px] text-foreground-muted font-sans font-medium">
                          Weight: {metric.weight}
                        </span>
                      </div>

                      {/* Mini visual sparkbar */}
                      <div className="w-full bg-border rounded-full h-1 overflow-hidden">
                        <div 
                          className={`h-full rounded-full transition-all duration-300 ${progressColor}`}
                          style={{ width: `${metric.score}%` }}
                        />
                      </div>
                    </div>

                    {/* Bottom action trigger details */}
                    <div className="flex justify-between items-center text-[9px] text-foreground-muted border-t border-border/40 pt-2 font-sans font-semibold">
                      <span className="text-positive">{metric.trend}</span>
                      <span className="text-primary hover:underline flex items-center gap-0.5">
                        Breakdown <ArrowRight className="h-3 w-3" />
                      </span>
                    </div>

                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </motion.div>
      </div>

      {/* 3. SCORE HISTORY & INTERACTIVE EVENTS */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 my-8 select-none">
        
        {/* Interactive History Chart (8 Columns) */}
        <div className="col-span-12 lg:col-span-8">
          <Card className="h-[420px] flex flex-col justify-between">
            <CardHeader className="pb-2 border-b border-border/60">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <CardTitle className="text-xs uppercase tracking-widest text-foreground-muted font-bold">
                    Score History
                  </CardTitle>
                  <p className="text-[11px] text-foreground-secondary">Historical standing tracking. Click events dots for detail.</p>
                </div>
                
                {/* Period selectors */}
                <div className="flex items-center gap-1.5 border border-border p-1 rounded-sm bg-surface-elevated/45 self-end sm:self-center">
                  {["3M", "6M", "1Y", "ALL"].map((period) => (
                    <button
                      key={period}
                      onClick={() => setHistoryPeriod(period)}
                      className={cn(
                        "text-[10px] font-sans font-bold px-2.5 py-1 rounded-xs transition-colors cursor-pointer",
                        historyPeriod === period 
                          ? "bg-primary text-white" 
                          : "text-foreground-secondary hover:text-foreground hover:bg-surface-hover"
                      )}
                    >
                      {period}
                    </button>
                  ))}
                </div>
              </div>
            </CardHeader>
            <CardContent className="pt-6 flex-1 min-h-0">
              
              <div className="w-full h-full min-h-[240px] flex flex-col justify-end">
                <ResponsiveContainer width="100%" height="95%">
                  <LineChart data={currentHistoryData} margin={{ top: 15, right: 15, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border)" className="opacity-60" />
                    <XAxis 
                      dataKey="name" 
                      tickLine={false} 
                      axisLine={false} 
                      tick={{ fill: "var(--foreground-secondary)", fontSize: 10 }} 
                    />
                    <YAxis 
                      domain={[50, 100]}
                      tickLine={false} 
                      axisLine={false} 
                      tick={{ fill: "var(--foreground-secondary)", fontSize: 10 }} 
                    />
                    <RechartsTooltip 
                      content={({ active, payload }) => {
                        if (active && payload && payload.length) {
                          const data = payload[0].payload;
                          return (
                            <div className="bg-surface-elevated border border-border p-3 shadow-lg rounded-sm text-xs font-sans space-y-1">
                              <p className="text-[10px] font-bold text-foreground-muted uppercase tracking-wider">{data.name}</p>
                              <p className="font-semibold text-foreground">Score: {data.score} / 100</p>
                              {data.event && (
                                <p className="text-[10px] text-primary font-bold border-t border-border/60 pt-1 mt-1">
                                  Event: {data.event}
                                </p>
                              )}
                            </div>
                          );
                        }
                        return null;
                      }}
                    />
                    
                    {/* Primary History Line */}
                    <Line 
                      type="monotone" 
                      dataKey="score" 
                      stroke="var(--primary)" 
                      strokeWidth={2.5}
                      dot={{ r: 4, strokeWidth: 0, fill: "var(--primary)" }}
                      activeDot={{ r: 6, strokeWidth: 0, fill: "var(--primary)" }}
                    />

                    {/* Reference Dot overlays for annotated events */}
                    {referenceDots.map((dot, idx) => (
                      <ReferenceDot 
                        key={idx}
                        x={dot.name}
                        y={dot.score}
                        r={8}
                        stroke="var(--primary)"
                        strokeWidth={1.5}
                        fill="transparent"
                        className="animate-ping"
                      />
                    ))}

                  </LineChart>
                </ResponsiveContainer>
              </div>

            </CardContent>
          </Card>
        </div>

        {/* Annotated Events list details (4 Columns) */}
        <div className="col-span-12 lg:col-span-4">
          <Card className="h-[420px] flex flex-col justify-between">
            <CardHeader className="pb-2 border-b border-border/60">
              <CardTitle className="text-xs uppercase tracking-widest text-foreground-muted font-bold">
                Timeline Milestones
              </CardTitle>
              <p className="text-[11px] text-foreground-secondary">Key structural actions affecting scoring metrics.</p>
            </CardHeader>
            <CardContent className="pt-4 flex-1 overflow-y-auto mt-2">
              <div className="space-y-3.5">
                
                <div className="border-l-2 border-primary/50 pl-3 space-y-0.5">
                  <span className="text-[9px] font-mono text-foreground-muted">JUNE 2026</span>
                  <h4 className="text-xs font-bold text-foreground">EMI Completed</h4>
                  <p className="text-[10px] text-foreground-secondary">Cleared outstanding short-term equipment finance loan. (+3 health pts)</p>
                </div>

                <div className="border-l-2 border-primary/50 pl-3 space-y-0.5">
                  <span className="text-[9px] font-mono text-foreground-muted">APRIL 2026</span>
                  <h4 className="text-xs font-bold text-foreground">Job Change & Promotion</h4>
                  <p className="text-[10px] text-foreground-secondary">Monthly salary base increased by 18%, improving stability metrics. (+5 health pts)</p>
                </div>

                <div className="border-l-2 border-warning/50 pl-3 space-y-0.5">
                  <span className="text-[9px] font-mono text-foreground-muted">MARCH 2026</span>
                  <h4 className="text-xs font-bold text-foreground">Tax Liabilities Settlement</h4>
                  <p className="text-[10px] text-foreground-secondary">Tax advance demerits debited standard balance pools. (-2 health pts)</p>
                </div>

                <div className="border-l-2 border-primary/50 pl-3 space-y-0.5">
                  <span className="text-[9px] font-mono text-foreground-muted">SEPTEMBER 2025</span>
                  <h4 className="text-xs font-bold text-foreground">Annual Bonus Sweep</h4>
                  <p className="text-[10px] text-foreground-secondary">Surplus compensation swept directly to short term mutual deposits. (+4 health pts)</p>
                </div>

              </div>
            </CardContent>
          </Card>
        </div>

      </div>

      {/* 4. STRENGTHS AND WEAKNESSES */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5 my-8 select-none">
        
        {/* Strengths Card */}
        <Card className="border-t-4 border-t-positive">
          <CardHeader className="pb-2 border-b border-border/60">
            <CardTitle className="text-xs uppercase tracking-widest text-positive font-bold flex items-center gap-1.5">
              <CheckCircle2 className="h-4 w-4" /> Financial Strengths
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-4 space-y-3.5 text-xs text-foreground-secondary">
            
            <div className="space-y-1">
              <h4 className="font-bold text-foreground">Optimal Debt Leverage Standings</h4>
              <p className="text-[11px] leading-relaxed">
                Debt-to-Income levels are below the 20% critical threshold. Installs payments and credit cards balances remain clear.
              </p>
            </div>

            <div className="space-y-1">
              <h4 className="font-bold text-foreground">Pristine Bureau Credit History</h4>
              <p className="text-[11px] leading-relaxed">
                Revolving lines of cards have average ages above 4.5 years with zero history of late collections, preserving scoring metrics.
              </p>
            </div>

            <div className="space-y-1">
              <h4 className="font-bold text-foreground">Strong Paycheck Stability Index</h4>
              <p className="text-[11px] leading-relaxed">
                Recurring monthly deposits are validated at 99.8% stability consistency, demonstrating high single-employer predictability.
              </p>
            </div>

          </CardContent>
        </Card>

        {/* Weaknesses Card */}
        <Card className="border-t-4 border-t-critical">
          <CardHeader className="pb-2 border-b border-border/60">
            <CardTitle className="text-xs uppercase tracking-widest text-critical font-bold flex items-center gap-1.5">
              <AlertCircle className="h-4 w-4" /> Areas Requiring Attention
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-4 space-y-3.5 text-xs text-foreground-secondary">
            
            <div className="space-y-1">
              <h4 className="font-bold text-foreground">Emergency Reserve Shortfall</h4>
              <p className="text-[11px] leading-relaxed">
                Liquid cash reserve coverage stands at 2.1 months. Optimal target is 6.0 months to insulate against cash flow fluctuations.
              </p>
            </div>

            <div className="space-y-1">
              <h4 className="font-bold text-foreground">Excess Idle Checking Cash Drag</h4>
              <p className="text-[11px] leading-relaxed">
                ₹50,000 remains idle in checking accounts earning a minimal 2.5%, dragging down yield feature engineering marks.
              </p>
            </div>

            <div className="space-y-1">
              <h4 className="font-bold text-foreground">Overlapping SaaS Subscriptions</h4>
              <p className="text-[11px] leading-relaxed">
                Unnecessary repeating demerits identified in monthly transactions, creating recurring leakage margins of ₹4,800.
              </p>
            </div>

          </CardContent>
        </Card>

      </div>

      {/* 5. HOW IS MY SCORE CALCULATED? (Interactive Explanation) */}
      <div className="space-y-4 my-8 select-none">
        <div className="border-b border-border/60 pb-3">
          <h2 className="text-lg font-heading font-semibold text-foreground flex items-center gap-2">
            <Info className="h-5 w-5 text-primary" /> How is my Score Calculated?
          </h2>
          <p className="text-xs text-foreground-secondary">
            Click component buttons to examine weighting breakdowns and active AI model evaluation confidence indices.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          
          {/* Component Weight Buttons List */}
          <div className="col-span-12 lg:col-span-5 flex flex-col gap-2">
            {[
              { id: "savings", name: "Savings Rate Index", weight: "20%", confidence: 91 },
              { id: "income", name: "Income Stability Index", weight: "15%", confidence: 94 },
              { id: "debt", name: "Debt Service Ratio", weight: "15%", confidence: 96 },
              { id: "expenses", name: "Expense Velocity Score", weight: "15%", confidence: 90 },
              { id: "emergency", name: "Emergency Coverage", weight: "15%", confidence: 92 },
              { id: "credit", name: "Bureau Credit Standings", weight: "10%", confidence: 95 },
              { id: "investments", name: "Investments Diversification", weight: "10%", confidence: 88 }
            ].map((item) => (
              <button
                key={item.id}
                onClick={() => setActiveCalId(item.id)}
                className={cn(
                  "p-3 text-left border rounded-sm transition-all flex items-center justify-between text-xs cursor-pointer focus-visible:outline-2",
                  activeCalId === item.id 
                    ? "border-primary bg-primary/10 font-bold" 
                    : "border-border hover:border-border-strong text-foreground-secondary"
                )}
              >
                <span>{item.name}</span>
                <span className="text-[10px] font-mono text-foreground-muted font-semibold">
                  Weight: {item.weight}
                </span>
              </button>
            ))}
          </div>

          {/* Active explanation detail panel */}
          <div className="col-span-12 lg:col-span-7">
            <Card className="min-h-[220px] bg-surface-elevated/40 border-dashed border-border/80">
              <CardContent className="p-6 space-y-4">
                {activeCalId === "savings" && (
                  <div className="space-y-3.5">
                    <h4 className="text-sm font-bold text-foreground">Savings Rate Index Evaluation</h4>
                    <p className="text-xs text-foreground-secondary leading-relaxed">
                      Measures systematic monthly saving ratios by comparing income sweep amounts against discretionary ledger demerits. High volatility in deposit frequencies dampens scores.
                    </p>
                    <div className="grid grid-cols-2 gap-4 border-t border-border/60 pt-3 text-xs text-foreground-secondary">
                      <div>
                        <span className="text-[9px] font-sans font-bold uppercase tracking-wider text-foreground-muted block">Allocation Weight</span>
                        <span className="font-bold text-foreground mt-0.5 block">20.0% of Overall Score</span>
                      </div>
                      <div>
                        <span className="text-[9px] font-sans font-bold uppercase tracking-wider text-foreground-muted block">AI Model Confidence</span>
                        <span className="font-bold text-primary mt-0.5 block">91% (Based on 12,482 datapoints)</span>
                      </div>
                    </div>
                  </div>
                )}
                {activeCalId === "income" && (
                  <div className="space-y-3.5">
                    <h4 className="text-sm font-bold text-foreground">Income Stability Index Evaluation</h4>
                    <p className="text-xs text-foreground-secondary leading-relaxed">
                      Evaluates paycheck frequency deviations, deposit sizes consistency, and multi-source redundancy margins. Single employer concentration represents minimal risk but caps optimal scores.
                    </p>
                    <div className="grid grid-cols-2 gap-4 border-t border-border/60 pt-3 text-xs text-foreground-secondary">
                      <div>
                        <span className="text-[9px] font-sans font-bold uppercase tracking-wider text-foreground-muted block">Allocation Weight</span>
                        <span className="font-bold text-foreground mt-0.5 block">15.0% of Overall Score</span>
                      </div>
                      <div>
                        <span className="text-[9px] font-sans font-bold uppercase tracking-wider text-foreground-muted block">AI Model Confidence</span>
                        <span className="font-bold text-primary mt-0.5 block">94% (High classification strength)</span>
                      </div>
                    </div>
                  </div>
                )}
                {activeCalId === "debt" && (
                  <div className="space-y-3.5">
                    <h4 className="text-sm font-bold text-foreground">Debt Service Ratio Evaluation</h4>
                    <p className="text-xs text-foreground-secondary leading-relaxed">
                      Computes the ratio of structural EMI repayments relative to total income assets. Keeps credit cards revolving balances out of compound interest ranges.
                    </p>
                    <div className="grid grid-cols-2 gap-4 border-t border-border/60 pt-3 text-xs text-foreground-secondary">
                      <div>
                        <span className="text-[9px] font-sans font-bold uppercase tracking-wider text-foreground-muted block">Allocation Weight</span>
                        <span className="font-bold text-foreground mt-0.5 block">15.0% of Overall Score</span>
                      </div>
                      <div>
                        <span className="text-[9px] font-sans font-bold uppercase tracking-wider text-foreground-muted block">AI Model Confidence</span>
                        <span className="font-bold text-primary mt-0.5 block">96% (Verified bureau match)</span>
                      </div>
                    </div>
                  </div>
                )}
                {activeCalId === "expenses" && (
                  <div className="space-y-3.5">
                    <h4 className="text-sm font-bold text-foreground">Expense Velocity Score Evaluation</h4>
                    <p className="text-xs text-foreground-secondary leading-relaxed">
                      Tracks card debits trends and fixed SaaS utilities bills to isolate discretionary velocity surges. Subscription leaks degrade expense points index.
                    </p>
                    <div className="grid grid-cols-2 gap-4 border-t border-border/60 pt-3 text-xs text-foreground-secondary">
                      <div>
                        <span className="text-[9px] font-sans font-bold uppercase tracking-wider text-foreground-muted block">Allocation Weight</span>
                        <span className="font-bold text-foreground mt-0.5 block">15.0% of Overall Score</span>
                      </div>
                      <div>
                        <span className="text-[9px] font-sans font-bold uppercase tracking-wider text-foreground-muted block">AI Model Confidence</span>
                        <span className="font-bold text-primary mt-0.5 block">90% (Variance analysis model)</span>
                      </div>
                    </div>
                  </div>
                )}
                {activeCalId === "emergency" && (
                  <div className="space-y-3.5">
                    <h4 className="text-sm font-bold text-foreground">Emergency Coverage Evaluation</h4>
                    <p className="text-xs text-foreground-secondary leading-relaxed">
                      Compares instantly liquid cash reserves (sweep accounts, liquid mutual funds) against average fixed monthly outgoings. User stands below the benchmark of 6.0 months.
                    </p>
                    <div className="grid grid-cols-2 gap-4 border-t border-border/60 pt-3 text-xs text-foreground-secondary">
                      <div>
                        <span className="text-[9px] font-sans font-bold uppercase tracking-wider text-foreground-muted block">Allocation Weight</span>
                        <span className="font-bold text-foreground mt-0.5 block">15.0% of Overall Score</span>
                      </div>
                      <div>
                        <span className="text-[9px] font-sans font-bold uppercase tracking-wider text-foreground-muted block">AI Model Confidence</span>
                        <span className="font-bold text-primary mt-0.5 block">92% (Evaluated on cash-out ratios)</span>
                      </div>
                    </div>
                  </div>
                )}
                {activeCalId === "credit" && (
                  <div className="space-y-3.5">
                    <h4 className="text-sm font-bold text-foreground">Bureau Credit Standings Evaluation</h4>
                    <p className="text-xs text-foreground-secondary leading-relaxed">
                      Maps account limits, payment ages, collection histories, and credit requests queries to standard scoring frameworks. Older credit age parameters protect points.
                    </p>
                    <div className="grid grid-cols-2 gap-4 border-t border-border/60 pt-3 text-xs text-foreground-secondary">
                      <div>
                        <span className="text-[9px] font-sans font-bold uppercase tracking-wider text-foreground-muted block">Allocation Weight</span>
                        <span className="font-bold text-foreground mt-0.5 block">10.0% of Overall Score</span>
                      </div>
                      <div>
                        <span className="text-[9px] font-sans font-bold uppercase tracking-wider text-foreground-muted block">AI Model Confidence</span>
                        <span className="font-bold text-primary mt-0.5 block">95% (Direct Bureau matching)</span>
                      </div>
                    </div>
                  </div>
                )}
                {activeCalId === "investments" && (
                  <div className="space-y-3.5">
                    <h4 className="text-sm font-bold text-foreground">Investments Diversification Evaluation</h4>
                    <p className="text-xs text-foreground-secondary leading-relaxed">
                      Evaluates systematic capital growth ratios, equity-to-debt balances, and idle checkings assets. Idle money results in negative points impact.
                    </p>
                    <div className="grid grid-cols-2 gap-4 border-t border-border/60 pt-3 text-xs text-foreground-secondary">
                      <div>
                        <span className="text-[9px] font-sans font-bold uppercase tracking-wider text-foreground-muted block">Allocation Weight</span>
                        <span className="font-bold text-foreground mt-0.5 block">10.0% of Overall Score</span>
                      </div>
                      <div>
                        <span className="text-[9px] font-sans font-bold uppercase tracking-wider text-foreground-muted block">AI Model Confidence</span>
                        <span className="font-bold text-primary mt-0.5 block">88% (Portfolio optimization engines)</span>
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

        </div>
      </div>

      {/* 6. AI IMPROVEMENT PLAN */}
      <div className="space-y-4 my-8 select-none">
        <div className="border-b border-border/60 pb-3">
          <h2 className="text-lg font-heading font-semibold text-foreground flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-ai" /> AI Improvement Plan
          </h2>
          <p className="text-xs text-foreground-secondary">
            Ranked, data-backed optimization recommendations to build long-term resilience.
          </p>
        </div>

        {/* Action recommendations cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {planItems.map((item, idx) => (
            <Card key={item.id} className="flex flex-col justify-between hover:border-border-strong transition-all">
              <CardContent className="p-5 flex flex-col justify-between gap-5 h-full">
                
                <div className="space-y-2.5">
                  <div className="flex justify-between items-center gap-2">
                    <span className="text-[9px] font-sans font-bold text-ai bg-ai/10 border border-ai/20 px-2 py-0.5 rounded-xs uppercase tracking-wider">
                      Rank {idx + 1}
                    </span>
                    <div className="flex gap-2 text-[9px] text-foreground-muted font-sans font-semibold">
                      <span>Diff: {item.difficulty}</span>
                      <span>•</span>
                      <span>Time: {item.time}</span>
                    </div>
                  </div>

                  <h3 className="text-xs font-bold text-foreground font-heading mt-2">
                    {item.action}
                  </h3>
                  <p className="text-[11px] text-foreground-secondary leading-relaxed">
                    {item.why}
                  </p>
                </div>

                <div className="border-t border-border/60 pt-3.5 space-y-3.5">
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-[10px] text-foreground-muted font-sans">Expected Impact</span>
                    <span className="font-bold text-positive">{item.impact}</span>
                  </div>

                  <Button 
                    variant="primary" 
                    size="sm" 
                    onClick={() => handleSimulateItem(item.action)}
                    className="w-full text-[10px] py-1.5 cursor-pointer focus-visible:outline-2 font-semibold"
                  >
                    Simulate
                  </Button>
                </div>

              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* 7. HEALTH BREAKDOWN SHEET DRAWER */}
      <Sheet
        isOpen={isDrawerOpen}
        onClose={() => {
          setIsDrawerOpen(false);
          setSelectedMetric(null);
        }}
        title="Metric Breakdown Audit"
        className="w-full max-w-md"
      >
        {selectedMetric && (
          <div className="space-y-6 font-sans">
            
            {/* Header info */}
            <div className="p-4 rounded-sm bg-surface-elevated border border-border flex items-center justify-between gap-4">
              <div>
                <h3 className="text-sm font-bold text-foreground truncate max-w-[200px]">{selectedMetric.name}</h3>
                <p className="text-[10px] text-foreground-secondary mt-0.5">Allocation weight: {selectedMetric.weight}</p>
              </div>
              <div className="text-right">
                <span className="text-sm font-extrabold text-foreground block">{selectedMetric.score} / 100</span>
                <span className="text-[10px] text-positive font-bold mt-0.5 block">{selectedMetric.trend}</span>
              </div>
            </div>

            {/* WHY THIS SCORE? */}
            <div className="space-y-3">
              <h4 className="text-xs font-bold text-foreground uppercase tracking-wider flex items-center gap-1.5">
                <Bookmark className="h-4 w-4 text-primary" /> Why this score?
              </h4>
              <ul className="grid grid-cols-1 gap-2 pl-0 list-none">
                {selectedMetric.reasons.map((reason, idx) => (
                  <li key={idx} className="flex justify-between items-center p-2.5 bg-surface-elevated/45 border border-border/40 rounded-sm text-xs text-foreground-secondary leading-normal">
                    <span>{reason.label}</span>
                    <span className={reason.value.startsWith("+") ? "text-positive font-bold" : "text-critical font-bold"}>
                      {reason.value}
                    </span>
                  </li>
                ))}
              </ul>
            </div>

            {/* HOW TO IMPROVE */}
            <div className="space-y-2">
              <h4 className="text-xs font-bold text-foreground uppercase tracking-wider">How to improve</h4>
              <p className="text-xs text-foreground-secondary leading-relaxed bg-surface-elevated/25 border border-border/60 p-3 rounded-sm">
                {selectedMetric.improvement}
              </p>
            </div>

            {/* POTENTIAL IMPACT */}
            <div className="p-3.5 border border-primary/20 bg-primary/5 rounded-sm flex items-center justify-between gap-4 text-xs">
              <span className="text-foreground-secondary font-medium">Potential Score Impact</span>
              <span className="font-bold text-primary bg-primary/10 border border-primary/20 px-2 py-0.5 rounded-xs text-[10px]">
                {selectedMetric.impact}
              </span>
            </div>

            {/* Action CTA */}
            <div className="flex gap-3 pt-6 border-t border-border">
              <Button 
                variant="outline" 
                onClick={() => setIsDrawerOpen(false)}
                className="flex-1 text-xs py-2 focus-visible:outline-2 cursor-pointer"
              >
                Close
              </Button>
              <Button 
                variant="primary" 
                onClick={() => handleSimulateInDrawer(selectedMetric.name)}
                className="flex-1 text-xs py-2 focus-visible:outline-2 cursor-pointer font-semibold"
              >
                Simulate Improvement
              </Button>
            </div>

          </div>
        )}
      </Sheet>

    </PageContainer>
  );
}

// Utility styling helper
function cn(...classes: string[]) {
  return classes.filter(Boolean).join(" ");
}
