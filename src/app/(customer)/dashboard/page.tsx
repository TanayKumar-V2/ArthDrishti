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
  ShieldCheck
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

interface InsightItem {
  id: string;
  priority: "HIGH PRIORITY" | "MEDIUM PRIORITY" | "LOW PRIORITY";
  type: "CREDIT RISK" | "SPENDING" | "CASH FLOW" | "FINANCIAL HEALTH";
  title: string;
  explanation: string;
  impact: string;
  confidence: number;
  timestamp: string;
}

// ==========================================
// STATIC MOCK DATA (Declared outside component to avoid warnings)
// ==========================================

const chartDataMap: Record<string, Record<string, ChartDataPoint[]>> = {
  "NET WORTH": {
    "1M": [
      { name: "Wk 1", current: 810000, previous: 795000 },
      { name: "Wk 2", current: 815000, previous: 798000 },
      { name: "Wk 3", current: 818000, previous: 802000 },
      { name: "Wk 4", current: 820000, previous: 805000 }
    ],
    "3M": [
      { name: "Month 1", current: 790000, previous: 775000 },
      { name: "Month 2", current: 805000, previous: 785000 },
      { name: "Month 3", current: 820000, previous: 795000 }
    ],
    "6M": [
      { name: "Jan", current: 760000, previous: 740000 },
      { name: "Feb", current: 775000, previous: 750000 },
      { name: "Mar", current: 790000, previous: 765000 },
      { name: "Apr", current: 805000, previous: 775000 },
      { name: "May", current: 812000, previous: 782000 },
      { name: "Jun", current: 820000, previous: 795000 }
    ],
    "1Y": [
      { name: "Jul 25", current: 720000, previous: 680000 },
      { name: "Sep 25", current: 745000, previous: 700000 },
      { name: "Nov 25", current: 770000, previous: 725000 },
      { name: "Jan 26", current: 795000, previous: 740000 },
      { name: "Mar 26", current: 808000, previous: 760000 },
      { name: "May 26", current: 820000, previous: 780000 }
    ],
    "ALL": [
      { name: "2024", current: 620000, previous: 550000 },
      { name: "2025", current: 750000, previous: 680000 },
      { name: "2026 (YTD)", current: 820000, previous: 760000 }
    ]
  },
  "INCOME": {
    "1M": [
      { name: "Wk 1", current: 120000, previous: 115000 },
      { name: "Wk 2", current: 120000, previous: 115000 },
      { name: "Wk 3", current: 125000, previous: 115000 },
      { name: "Wk 4", current: 120000, previous: 115000 }
    ],
    "3M": [
      { name: "Month 1", current: 115000, previous: 110000 },
      { name: "Month 2", current: 118000, previous: 112000 },
      { name: "Month 3", current: 121250, previous: 115000 }
    ],
    "6M": [
      { name: "Jan", current: 110000, previous: 105000 },
      { name: "Feb", current: 110000, previous: 105000 },
      { name: "Mar", current: 115000, previous: 108000 },
      { name: "Apr", current: 115000, previous: 110000 },
      { name: "May", current: 120000, previous: 112000 },
      { name: "Jun", current: 121250, previous: 115000 }
    ],
    "1Y": [
      { name: "Jul 25", current: 105000, previous: 98000 },
      { name: "Sep 25", current: 105000, previous: 100000 },
      { name: "Nov 25", current: 108000, previous: 102000 },
      { name: "Jan 26", current: 112000, previous: 105000 },
      { name: "Mar 26", current: 115000, previous: 108000 },
      { name: "May 26", current: 121250, previous: 115000 }
    ],
    "ALL": [
      { name: "2024", current: 95000, previous: 85000 },
      { name: "2025", current: 108000, previous: 98000 },
      { name: "2026 (YTD)", current: 121250, previous: 115000 }
    ]
  },
  "EXPENSES": {
    "1M": [
      { name: "Wk 1", current: 42000, previous: 45000 },
      { name: "Wk 2", current: 39000, previous: 41000 },
      { name: "Wk 3", current: 48000, previous: 43000 },
      { name: "Wk 4", current: 35000, previous: 38000 }
    ],
    "3M": [
      { name: "Month 1", current: 46000, previous: 49000 },
      { name: "Month 2", current: 43000, previous: 46000 },
      { name: "Month 3", current: 41000, previous: 44250 }
    ],
    "6M": [
      { name: "Jan", current: 48000, previous: 52000 },
      { name: "Feb", current: 45000, previous: 49000 },
      { name: "Mar", current: 47000, previous: 48000 },
      { name: "Apr", current: 42000, previous: 46000 },
      { name: "May", current: 44000, previous: 45000 },
      { name: "Jun", current: 41000, previous: 44250 }
    ],
    "1Y": [
      { name: "Jul 25", current: 52000, previous: 55000 },
      { name: "Sep 25", current: 48000, previous: 50000 },
      { name: "Nov 25", current: 50000, previous: 52000 },
      { name: "Jan 26", current: 45000, previous: 48000 },
      { name: "Mar 26", current: 43000, previous: 46000 },
      { name: "May 26", current: 41000, previous: 44250 }
    ],
    "ALL": [
      { name: "2024", current: 58000, previous: 62000 },
      { name: "2025", current: 48000, previous: 53000 },
      { name: "2026 (YTD)", current: 41000, previous: 44250 }
    ]
  },
  "SAVINGS": {
    "1M": [
      { name: "Wk 1", current: 22000, previous: 20000 },
      { name: "Wk 2", current: 23500, previous: 21000 },
      { name: "Wk 3", current: 21000, previous: 20500 },
      { name: "Wk 4", current: 25000, previous: 22000 }
    ],
    "3M": [
      { name: "Month 1", current: 19500, previous: 17000 },
      { name: "Month 2", current: 20200, previous: 18500 },
      { name: "Month 3", current: 22875, previous: 20300 }
    ],
    "6M": [
      { name: "Jan", current: 17000, previous: 15000 },
      { name: "Feb", current: 18500, previous: 16000 },
      { name: "Mar", current: 19000, previous: 17500 },
      { name: "Apr", current: 20500, previous: 18000 },
      { name: "May", current: 21000, previous: 19500 },
      { name: "Jun", current: 22875, previous: 20300 }
    ],
    "1Y": [
      { name: "Jul 25", current: 15500, previous: 13000 },
      { name: "Sep 25", current: 17000, previous: 14500 },
      { name: "Nov 25", current: 18500, previous: 16000 },
      { name: "Jan 26", current: 20000, previous: 17500 },
      { name: "Mar 26", current: 21500, previous: 19000 },
      { name: "May 26", current: 22875, previous: 20300 }
    ],
    "ALL": [
      { name: "2024", current: 14200, previous: 11000 },
      { name: "2025", current: 18800, previous: 15200 },
      { name: "2026 (YTD)", current: 22875, previous: 20300 }
    ]
  },
  "INVESTMENTS": {
    "1M": [
      { name: "Wk 1", current: 145000, previous: 140000 },
      { name: "Wk 2", current: 146500, previous: 142000 },
      { name: "Wk 3", current: 143000, previous: 141500 },
      { name: "Wk 4", current: 148500, previous: 143000 }
    ],
    "3M": [
      { name: "Month 1", current: 135000, previous: 130000 },
      { name: "Month 2", current: 142000, previous: 134000 },
      { name: "Month 3", current: 148500, previous: 138000 }
    ],
    "6M": [
      { name: "Jan", current: 125000, previous: 120000 },
      { name: "Feb", current: 128500, previous: 123000 },
      { name: "Mar", current: 132000, previous: 126000 },
      { name: "Apr", current: 138500, previous: 130000 },
      { name: "May", current: 142000, previous: 133500 },
      { name: "Jun", current: 148500, previous: 138000 }
    ],
    "1Y": [
      { name: "Jul 25", current: 115000, previous: 105000 },
      { name: "Sep 25", current: 121000, previous: 110000 },
      { name: "Nov 25", current: 128000, previous: 117000 },
      { name: "Jan 26", current: 135500, previous: 124000 },
      { name: "Mar 26", current: 141000, previous: 130000 },
      { name: "May 26", current: 148500, previous: 138000 }
    ],
    "ALL": [
      { name: "2024", current: 95000, previous: 82000 },
      { name: "2025", current: 132000, previous: 110000 },
      { name: "2026 (YTD)", current: 148500, previous: 138000 }
    ]
  }
};

const radarData = [
  { subject: "Savings", A: 85, B: 80, fullMark: 100 },
  { subject: "Debt Control", A: 75, B: 70, fullMark: 100 },
  { subject: "Credit Usage", A: 88, B: 75, fullMark: 100 },
  { subject: "Income Stability", A: 90, B: 85, fullMark: 100 },
  { subject: "Emergency Fund", A: 85, B: 80, fullMark: 100 },
  { subject: "Investments", A: 65, B: 70, fullMark: 100 }
];

const insights: InsightItem[] = [
  {
    id: "ins-1",
    priority: "HIGH PRIORITY",
    type: "CREDIT RISK",
    title: "Credit utilization increased by 14%.",
    explanation: "This could increase default probability metrics if the revolving balance trend continues through next cycles.",
    impact: "Default Risk +6.4%",
    confidence: 94,
    timestamp: "2 mins ago"
  },
  {
    id: "ins-2",
    priority: "MEDIUM PRIORITY",
    type: "SPENDING",
    title: "Redundant data platform subscription.",
    explanation: "Our analyzers identified overlapping ledger tools bills, creating opportunity for minor cost exclusions.",
    impact: "₹4,800 potential monthly savings",
    confidence: 89,
    timestamp: "1 hour ago"
  },
  {
    id: "ins-3",
    priority: "HIGH PRIORITY",
    type: "CASH FLOW",
    title: "Possible balance drop below ₹40,000 in 18 days.",
    explanation: "Incoming salary flows are projected to post after quarterly insurance demerits, causing transient margin strain.",
    impact: "Shortfall Probability: 68%",
    confidence: 82,
    timestamp: "2 hours ago"
  },
  {
    id: "ins-4",
    priority: "LOW PRIORITY",
    type: "FINANCIAL HEALTH",
    title: "Savings rate improved by 3.2% this month.",
    explanation: "Discretionary card expenditures on luxury dining and travel shrank relative to baseline running averages.",
    impact: "Net Worth Projection +₹8,400",
    confidence: 91,
    timestamp: "1 day ago"
  }
];

const fraudAnomalies: AnomalyItem[] = [
  {
    id: "frd-1",
    merchant: "DirectBrokerage Inc",
    amount: 45000,
    date: "2026-07-06 23:45",
    score: 92,
    reasons: [
      "Amount is 340% above normal monthly average for this category.",
      "Unusual transaction time (initiated at 11:45 PM).",
      "New merchant (no previous ledger interaction in history).",
      "Location is inconsistent with past device activity logs."
    ]
  },
  {
    id: "frd-2",
    merchant: "GlobalTech Electronics",
    amount: 12800,
    date: "2026-07-05 03:12",
    score: 88,
    reasons: [
      "Unusual transaction time (initiated at 3:12 AM).",
      "Foreign merchant terminal matching mismatch criteria.",
      "Out-of-pattern electronic goods category purchase."
    ]
  }
];

export default function CustomerCommandCenter() {
  const router = useRouter();

  // Controls states
  const [pulseTab, setPulseTab] = useState("NET WORTH");
  const [pulseTime, setPulseTime] = useState("6M");
  const [insightFilter, setInsightFilter] = useState("ALL");
  const [selectedAnomaly, setSelectedAnomaly] = useState<AnomalyItem | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isGeneratingReport, setIsGeneratingReport] = useState(false);

  // Load custom fonts or animations
  const [radialAnimated, setRadialAnimated] = useState(false);
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setRadialAnimated(true);
  }, []);

  const handleGenerateReport = () => {
    setIsGeneratingReport(true);
    toast.promise(
      new Promise((resolve) => setTimeout(resolve, 2000)),
      {
        loading: "Synthesizing Ledger data & AI model projections...",
        success: () => {
          setIsGeneratingReport(false);
          return "Financial Intelligence Report generated! Download starting.";
        },
        error: "Failed to compile report."
      }
    );
  };

  // Filter Insights based on chips selection
  const filteredInsights = useMemo(() => {
    if (insightFilter === "ALL") return insights;
    if (insightFilter === "PRIORITY") return insights.filter(i => i.priority === "HIGH PRIORITY");
    if (insightFilter === "OPPORTUNITIES") return insights.filter(i => i.type === "SPENDING");
    if (insightFilter === "FORECASTS") return insights.filter(i => i.type === "CASH FLOW");
    if (insightFilter === "RISKS") return insights.filter(i => i.type === "CREDIT RISK" || i.priority === "HIGH PRIORITY");
    return insights;
  }, [insightFilter]);

  // Extract selected charts data
  const pulseChartData = useMemo(() => {
    return chartDataMap[pulseTab]?.[pulseTime] || [];
  }, [pulseTab, pulseTime]);

  const handleScrollToInsights = () => {
    const el = document.getElementById("insights-feed");
    el?.scrollIntoView({ behavior: "smooth" });
  };

  // Helper formatting for currency
  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0
    }).format(val);
  };

  return (
    <PageContainer className="pb-24">
      {/* 1. PAGE HEADER */}
      <div className="flex flex-col gap-4 border-b border-border pb-6 sm:flex-row sm:items-center sm:justify-between select-none">
        <div className="space-y-1">
          <h1 className="text-2xl sm:text-3xl font-heading font-semibold text-foreground tracking-tight">
            Good Morning, Rahul.
          </h1>
          <p className="text-xs sm:text-sm text-foreground-secondary leading-relaxed max-w-xl">
            Here&apos;s what your financial intelligence engine discovered today.
          </p>
        </div>

        {/* Header Actions */}
        <div className="flex flex-wrap items-center gap-3 shrink-0">
          <div className="flex items-center gap-2 bg-surface-elevated border border-border px-3 py-2 rounded-sm text-xs text-foreground-secondary font-medium">
            <span className="relative flex h-1.5 w-1.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-positive opacity-75"></span>
              <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-positive"></span>
            </span>
            <span>Last Analysis: 2 minutes ago</span>
          </div>

          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => router.push("/onboarding/upload")}
            className="gap-2 cursor-pointer focus-visible:outline-2"
          >
            <Upload className="h-4 w-4" />
            Upload Data
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
        className="grid grid-cols-12 gap-5"
      >
        {/* Financial Intelligence Score (8 Columns) */}
        <motion.div variants={staggerItem} className="col-span-12 lg:col-span-8">
          <Card className="h-[340px] flex flex-col justify-between">
            <CardHeader className="pb-2">
              <div className="flex justify-between items-center">
                <CardTitle className="text-xs uppercase tracking-widest text-foreground-muted font-bold">
                  Financial Intelligence Score
                </CardTitle>
                <span className="text-[10px] text-positive bg-positive/10 border border-positive/20 px-2 py-0.5 rounded-xs font-bold font-sans">
                  EXCELLENT
                </span>
              </div>
            </CardHeader>
            <CardContent className="flex flex-col sm:flex-row items-center justify-between gap-6 overflow-hidden pt-2">
              
              {/* Radial rings and central score */}
              <div className="relative h-[200px] w-[200px] flex items-center justify-center shrink-0">
                {/* SVG Concentric Rings */}
                <svg className="w-full h-full transform -rotate-90" viewBox="0 0 240 240">
                  {/* Background circles */}
                  {[105, 87, 69, 51, 33, 15].map((r, i) => (
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
                  
                  {/* Outer Overall Ring (82% value, radius 105) */}
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
                    animate={{ strokeDashoffset: radialAnimated ? 2 * Math.PI * 105 * (1 - 0.82) : 2 * Math.PI * 105 }}
                    transition={{ duration: 1.5, ease: "easeOut" }}
                  />

                  {/* Savings segment ring (85% value, radius 87) */}
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
                    animate={{ strokeDashoffset: radialAnimated ? 2 * Math.PI * 87 * (1 - 0.85) : 2 * Math.PI * 87 }}
                    transition={{ duration: 1.4, ease: "easeOut", delay: 0.15 }}
                  />

                  {/* Debt segment ring (45% value, radius 69) */}
                  <motion.circle 
                    cx="120" 
                    cy="120" 
                    r="69" 
                    stroke="var(--critical)" 
                    strokeWidth="6" 
                    strokeLinecap="round"
                    fill="transparent"
                    strokeDasharray={2 * Math.PI * 69}
                    initial={{ strokeDashoffset: 2 * Math.PI * 69 }}
                    animate={{ strokeDashoffset: radialAnimated ? 2 * Math.PI * 69 * (1 - 0.45) : 2 * Math.PI * 69 }}
                    transition={{ duration: 1.3, ease: "easeOut", delay: 0.25 }}
                  />

                  {/* Credit segment ring (88% value, radius 51) */}
                  <motion.circle 
                    cx="120" 
                    cy="120" 
                    r="51" 
                    stroke="var(--primary)" 
                    strokeWidth="5" 
                    strokeLinecap="round"
                    fill="transparent"
                    strokeDasharray={2 * Math.PI * 51}
                    initial={{ strokeDashoffset: 2 * Math.PI * 51 }}
                    animate={{ strokeDashoffset: radialAnimated ? 2 * Math.PI * 51 * (1 - 0.88) : 2 * Math.PI * 51 }}
                    transition={{ duration: 1.2, ease: "easeOut", delay: 0.35 }}
                  />

                  {/* Income stability segment ring (92% value, radius 33) */}
                  <motion.circle 
                    cx="120" 
                    cy="120" 
                    r="33" 
                    stroke="var(--ai)" 
                    strokeWidth="5" 
                    strokeLinecap="round"
                    fill="transparent"
                    strokeDasharray={2 * Math.PI * 33}
                    initial={{ strokeDashoffset: 2 * Math.PI * 33 }}
                    animate={{ strokeDashoffset: radialAnimated ? 2 * Math.PI * 33 * (1 - 0.92) : 2 * Math.PI * 33 }}
                    transition={{ duration: 1.1, ease: "easeOut", delay: 0.45 }}
                  />

                  {/* Investments segment ring (60% value, radius 15) */}
                  <motion.circle 
                    cx="120" 
                    cy="120" 
                    r="15" 
                    stroke="var(--forecast)" 
                    strokeWidth="5" 
                    strokeLinecap="round"
                    fill="transparent"
                    strokeDasharray={2 * Math.PI * 15}
                    initial={{ strokeDashoffset: 2 * Math.PI * 15 }}
                    animate={{ strokeDashoffset: radialAnimated ? 2 * Math.PI * 15 * (1 - 0.60) : 2 * Math.PI * 15 }}
                    transition={{ duration: 1.0, ease: "easeOut", delay: 0.55 }}
                  />
                </svg>
                
                {/* Center text score */}
                <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                  <span className="text-4xl font-heading font-extrabold text-foreground leading-none">82</span>
                  <span className="text-[9px] font-sans font-bold text-positive uppercase tracking-widest mt-1">↑ 6 PTS</span>
                </div>
              </div>

              {/* Text parameters details on the side */}
              <div className="flex-1 space-y-4">
                <div className="space-y-1">
                  <h4 className="text-sm font-semibold text-foreground">Score Factor Optimization</h4>
                  <p className="text-xs text-foreground-secondary leading-relaxed">
                    Your financial position improved due to higher savings and lower credit utilization. Optimize investments parameters to reach maximum grade.
                  </p>
                </div>

                {/* Segment legends grids */}
                <div className="grid grid-cols-2 xs:grid-cols-3 gap-2.5">
                  <div className="flex items-center gap-2">
                    <span className="h-2 w-2 rounded-full bg-primary shrink-0" />
                    <span className="text-[10px] font-semibold text-foreground-secondary truncate">Savings (85%)</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="h-2 w-2 rounded-full bg-critical shrink-0" />
                    <span className="text-[10px] font-semibold text-foreground-secondary truncate">Debt (45%)</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="h-2 w-2 rounded-full bg-positive shrink-0" />
                    <span className="text-[10px] font-semibold text-foreground-secondary truncate">Credit (88%)</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="h-2 w-2 rounded-full bg-ai shrink-0" />
                    <span className="text-[10px] font-semibold text-foreground-secondary truncate">Income (92%)</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="h-2 w-2 rounded-full bg-forecast shrink-0" />
                    <span className="text-[10px] font-semibold text-foreground-secondary truncate">Invest (60%)</span>
                  </div>
                </div>

                <div className="pt-2">
                  <button 
                    onClick={() => router.push("/financial-health")}
                    className="text-xs text-primary hover:underline font-bold flex items-center gap-1.5 focus-visible:outline-2"
                  >
                    View Full Analysis <ArrowRight className="h-3.5 w-3.5" />
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
                  AI Daily Briefing
                </CardTitle>
                <span className="text-[10px] font-sans font-bold text-primary">3 INSIGHTS</span>
              </div>
            </CardHeader>
            <CardContent className="flex-1 flex flex-col justify-between gap-4 overflow-y-auto mt-2">
              <div className="space-y-3.5">
                
                <div className="flex gap-3 items-start">
                  <span className="text-xs font-mono font-bold text-primary shrink-0 bg-primary/10 h-5 w-5 rounded-full flex items-center justify-center">
                    01
                  </span>
                  <div className="space-y-0.5">
                    <p className="text-xs font-semibold text-foreground">Credit utilization decreased.</p>
                    <p className="text-[10px] text-foreground-secondary">Risk parameters improved by 4.2% since statements sync.</p>
                  </div>
                </div>

                <div className="flex gap-3 items-start">
                  <span className="text-xs font-mono font-bold text-positive shrink-0 bg-positive/10 h-5 w-5 rounded-full flex items-center justify-center">
                    02
                  </span>
                  <div className="space-y-0.5">
                    <p className="text-xs font-semibold text-foreground">Food spending velocity increased.</p>
                    <p className="text-[10px] text-foreground-secondary">₹3,400 monthly savings if eating out parameters are restricted.</p>
                  </div>
                </div>

                <div className="flex gap-3 items-start">
                  <span className="text-xs font-mono font-bold text-warning shrink-0 bg-warning/10 h-5 w-5 rounded-full flex items-center justify-center">
                    03
                  </span>
                  <div className="space-y-0.5">
                    <p className="text-xs font-semibold text-foreground">Possible low balance detected in 18 days.</p>
                    <p className="text-[10px] text-foreground-secondary">Quarterly auto-debit transactions coincide with salary deferrals.</p>
                  </div>
                </div>

              </div>

              <div className="pt-2">
                <button
                  onClick={handleScrollToInsights}
                  className="w-full text-center py-2 text-xs border border-border bg-surface-elevated/45 hover:bg-surface-hover rounded-sm font-semibold text-foreground hover:text-primary transition-colors cursor-pointer focus-visible:outline-2"
                >
                  View All Insights
                </button>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </motion.div>

      {/* 3. KPI CARDS ROW (Mismatched visual structures) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 my-6">
        
        {/* KPI 1: Financial Health (Radial mini progress indicator) */}
        <Card className="hover:border-primary/45 transition-colors relative overflow-hidden group">
          <CardContent className="p-5 flex justify-between items-center">
            <div className="space-y-1.5">
              <span className="text-[10px] font-sans font-bold uppercase tracking-wider text-foreground-secondary block">
                Financial Health
              </span>
              <h2 className="text-2xl sm:text-3xl font-heading font-extrabold text-foreground">
                82 <span className="text-xs font-sans font-normal text-foreground-secondary">/100</span>
              </h2>
              <span className="text-[10px] font-bold text-positive bg-positive/10 border border-positive/20 px-1.5 py-0.5 rounded-xs inline-flex items-center gap-0.5 select-none">
                ↑ 6 points
              </span>
            </div>
            
            {/* Visual: Concentric small circle */}
            <div className="relative h-12 w-12 flex items-center justify-center shrink-0">
              <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                <circle cx="18" cy="18" r="14" stroke="var(--border)" strokeWidth="3.5" fill="transparent" className="opacity-25" />
                <circle cx="18" cy="18" r="14" stroke="var(--primary)" strokeWidth="3.5" fill="transparent" strokeDasharray="88" strokeDashoffset={88 * (1 - 0.82)} strokeLinecap="round" />
              </svg>
              <HeartPulse className="h-4 w-4 text-primary absolute" />
            </div>
          </CardContent>
        </Card>

        {/* KPI 2: Default Risk (Risk state color block) */}
        <Card className="hover:border-primary/45 transition-colors relative overflow-hidden group">
          <CardContent className="p-5 flex justify-between items-center">
            <div className="space-y-1.5">
              <span className="text-[10px] font-sans font-bold uppercase tracking-wider text-foreground-secondary block">
                Default Risk
              </span>
              <h2 className="text-2xl sm:text-3xl font-heading font-extrabold text-foreground">
                18%
              </h2>
              <span className="text-[10px] font-bold text-positive bg-positive/10 border border-positive/20 px-1.5 py-0.5 rounded-xs inline-flex items-center gap-0.5 select-none">
                ↓ 4.2% (LOW RISK)
              </span>
            </div>
            <div className="h-10 w-10 rounded-sm bg-positive/10 border border-positive/20 flex items-center justify-center text-positive shrink-0">
              <ShieldCheck className="h-5 w-5" />
            </div>
          </CardContent>
        </Card>

        {/* KPI 3: Fraud Alerts (Warning badge indicators) */}
        <Card className="hover:border-primary/45 transition-colors relative overflow-hidden group">
          <CardContent className="p-5 flex justify-between items-center">
            <div className="space-y-1.5">
              <span className="text-[10px] font-sans font-bold uppercase tracking-wider text-foreground-secondary block">
                Fraud Alerts
              </span>
              <h2 className="text-2xl sm:text-3xl font-heading font-extrabold text-foreground">
                2
              </h2>
              <span className="text-[10px] font-bold text-critical bg-critical/10 border border-critical/20 px-1.5 py-0.5 rounded-xs inline-flex items-center gap-0.5 select-none">
                1 HIGH PRIORITY
              </span>
            </div>
            <div className="h-10 w-10 rounded-sm bg-critical/10 border border-critical/20 flex items-center justify-center text-critical shrink-0 animate-pulse">
              <Fingerprint className="h-5 w-5" />
            </div>
          </CardContent>
        </Card>

        {/* KPI 4: Monthly Savings (Simple numerical progress representation) */}
        <Card className="hover:border-primary/45 transition-colors relative overflow-hidden group">
          <CardContent className="p-5 flex justify-between items-center">
            <div className="space-y-1.5">
              <span className="text-[10px] font-sans font-bold uppercase tracking-wider text-foreground-secondary block">
                Monthly Savings
              </span>
              <h2 className="text-xl sm:text-2xl font-heading font-extrabold text-foreground">
                ₹21,500
              </h2>
              <span className="text-[10px] font-bold text-positive bg-positive/10 border border-positive/20 px-1.5 py-0.5 rounded-xs inline-flex items-center gap-0.5 select-none">
                ↑ 12.8%
              </span>
            </div>
            
            {/* Visual: Vertical Spark Bar */}
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
                    Financial Pulse
                  </CardTitle>
                  <p className="text-[11px] text-foreground-secondary">Ingested statement balance timelines comparison.</p>
                </div>
                
                {/* Time range selectors */}
                <div className="flex items-center gap-1.5 border border-border p-1 rounded-sm bg-surface-elevated/45 self-end sm:self-center">
                  {["1M", "3M", "6M", "1Y", "ALL"].map((time) => (
                    <button
                      key={time}
                      onClick={() => setPulseTime(time)}
                      className={cn(
                        "text-[10px] font-sans font-bold px-2 py-1 rounded-xs transition-colors cursor-pointer",
                        pulseTime === time 
                          ? "bg-primary text-white" 
                          : "text-foreground-secondary hover:text-foreground hover:bg-surface-hover"
                      )}
                    >
                      {time}
                    </button>
                  ))}
                </div>
              </div>

              {/* Tab Category Selectors */}
              <div className="flex items-center gap-5 overflow-x-auto scrollbar-none pt-4">
                {["NET WORTH", "INCOME", "EXPENSES", "SAVINGS", "INVESTMENTS"].map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setPulseTab(tab)}
                    className={cn(
                      "pb-2.5 text-xs font-semibold font-sans tracking-tight transition-colors border-b-2 outline-none cursor-pointer whitespace-nowrap",
                      pulseTab === tab
                        ? "text-primary border-primary"
                        : "text-foreground-secondary hover:text-foreground border-transparent"
                    )}
                  >
                    {tab}
                  </button>
                ))}
              </div>
            </CardHeader>
            <CardContent className="pt-6 flex-1 min-h-0 relative">
              
              {/* Pulse Chart Render */}
              <div className="w-full h-full min-h-[260px] flex flex-col justify-end">
                <ResponsiveContainer width="100%" height="95%">
                  <AreaChart data={pulseChartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <defs>
                      <linearGradient id="colorCurrent" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="var(--primary)" stopOpacity={0.2}/>
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
                          const prev = payload[1].value as number;
                          const delta = cur - prev;
                          const pct = prev === 0 ? 0 : parseFloat(((delta / prev) * 100).toFixed(1));

                          return (
                            <div className="bg-surface-elevated border border-border p-3.5 shadow-lg rounded-sm text-xs font-sans space-y-1.5 min-w-[140px]">
                              <p className="text-[10px] font-bold text-foreground-muted uppercase tracking-wider">
                                {payload[0].payload.name}
                              </p>
                              <div className="space-y-1">
                                <div className="flex justify-between gap-4">
                                  <span className="text-foreground-secondary">Current Period:</span>
                                  <span className="font-semibold text-foreground">{formatCurrency(cur)}</span>
                                </div>
                                <div className="flex justify-between gap-4">
                                  <span className="text-foreground-secondary">Previous Period:</span>
                                  <span className="font-medium text-foreground-muted">{formatCurrency(prev)}</span>
                                </div>
                                <div className="border-t border-border/60 pt-1.5 flex justify-between gap-4 text-[10px] font-bold">
                                  <span className="text-foreground-muted">Period Delta:</span>
                                  <span className={pct >= 0 ? "text-positive" : "text-critical"}>
                                    {pct >= 0 ? "↑" : "↓"} {Math.abs(pct)}%
                                  </span>
                                </div>
                              </div>
                            </div>
                          );
                        }
                        return null;
                      }}
                    />
                    {/* Previous period comparison dashed line */}
                    <Area 
                      type="monotone" 
                      dataKey="previous" 
                      stroke="var(--border-strong)" 
                      strokeWidth={1.5}
                      strokeDasharray="4 4"
                      fill="transparent" 
                      activeDot={false}
                    />
                    {/* Current period active gradient filled area */}
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
                Risk Radar
              </CardTitle>
              <p className="text-[11px] text-foreground-secondary">Comparing metric dimensions against optimal thresholds.</p>
            </CardHeader>
            <CardContent className="pt-4 flex-1 flex flex-col justify-between gap-4">
              
              {/* Radar Chart Render */}
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
                    {/* Benchmark optimal line */}
                    <Radar 
                      name="Optimal Target" 
                      dataKey="B" 
                      stroke="var(--forecast)" 
                      fill="var(--forecast)" 
                      fillOpacity={0.05} 
                      strokeWidth={1.5}
                      strokeDasharray="3 3"
                    />
                    {/* User risk lines */}
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

              {/* Legends & Analysis CTA */}
              <div className="space-y-3.5">
                <div className="flex justify-center items-center gap-4 text-[10px] font-bold">
                  <div className="flex items-center gap-1.5">
                    <span className="h-2 w-2 rounded-full bg-primary" />
                    <span className="text-foreground-secondary">Your Score</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="h-1.5 w-1.5 rounded-full border border-dashed border-forecast" />
                    <span className="text-foreground-secondary">Benchmark</span>
                  </div>
                </div>

                <button
                  onClick={() => router.push("/credit-risk")}
                  className="w-full text-center py-2 text-xs border border-border bg-surface-elevated/45 hover:bg-surface-hover rounded-sm font-semibold text-foreground hover:text-primary transition-colors cursor-pointer focus-visible:outline-2"
                >
                  View Risk Analysis
                </button>
              </div>

            </CardContent>
          </Card>
        </div>

      </div>

      {/* 5. AI INSIGHTS FEED */}
      <div id="insights-feed" className="space-y-4 my-8 scroll-mt-24 select-none">
        
        {/* Title and filters chips */}
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between border-b border-border/60 pb-4">
          <div className="space-y-1">
            <h2 className="text-lg font-heading font-semibold text-foreground flex items-center gap-2">
              <Activity className="h-5 w-5 text-primary" /> AI Insights Feed
            </h2>
            <p className="text-xs text-foreground-secondary">Context-aware optimization rules derived from ledger scans.</p>
          </div>

          {/* Filters array */}
          <div className="flex flex-wrap gap-1.5">
            {["ALL", "PRIORITY", "OPPORTUNITIES", "FORECASTS", "RISKS"].map((filter) => (
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

        {/* Dynamic List */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {filteredInsights.map((insight) => {
            return (
              <Card 
                key={insight.id} 
                className={cn(
                  "border hover:border-border-strong transition-all flex flex-col justify-between",
                  insight.priority === "HIGH PRIORITY" ? "border-l-4 border-l-critical pl-4.5" : "border-l-4 border-l-border"
                )}
              >
                <CardContent className="p-5 flex flex-col justify-between gap-5 h-full">
                  
                  {/* Top: Metadata */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <span className={cn(
                          "text-[9px] font-sans font-bold tracking-wider px-2 py-0.5 rounded-xs",
                          insight.priority === "HIGH PRIORITY" 
                            ? "bg-critical/10 text-critical border border-critical/20" 
                            : "bg-surface-elevated text-foreground-secondary border border-border"
                        )}>
                          {insight.priority}
                        </span>
                        <span className="text-[10px] font-sans font-bold text-primary bg-primary/10 px-2 py-0.5 rounded-xs">
                          {insight.type}
                        </span>
                      </div>
                      <span className="text-[10px] text-foreground-muted font-mono">{insight.timestamp}</span>
                    </div>

                    <h3 className="text-sm font-bold text-foreground font-heading mt-1">
                      {insight.title}
                    </h3>
                    <p className="text-xs text-foreground-secondary leading-relaxed">
                      {insight.explanation}
                    </p>
                  </div>

                  {/* Middle: Impact metrics */}
                  <div className="grid grid-cols-2 gap-4 border-t border-b border-border/60 py-3.5 my-1">
                    <div>
                      <span className="text-[9px] font-sans font-bold uppercase tracking-wider text-foreground-muted block">
                        Potential Impact
                      </span>
                      <span className="text-xs font-bold text-foreground mt-1 block">
                        {insight.impact}
                      </span>
                    </div>
                    <div>
                      <span className="text-[9px] font-sans font-bold uppercase tracking-wider text-foreground-muted block">
                        AI Confidence
                      </span>
                      <span className="text-xs font-bold text-primary mt-1 block">
                        {insight.confidence}%
                      </span>
                    </div>
                  </div>

                  {/* Bottom: Context Actions */}
                  <div className="flex gap-2">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => toast.info(`SHAP Explainers detail: ${insight.title}`)}
                      className="text-[10px] flex-1 py-1.5 focus-visible:outline-2 cursor-pointer"
                    >
                      View Explanation
                    </Button>
                    <Button 
                      variant="primary" 
                      size="sm" 
                      onClick={() => router.push("/simulator")}
                      className="text-[10px] flex-1 py-1.5 font-semibold focus-visible:outline-2 cursor-pointer"
                    >
                      Simulate Improvement
                    </Button>
                  </div>

                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>

      {/* 6. RECENT FRAUD ANOMALIES */}
      <div className="space-y-4 my-8 select-none">
        <div className="border-b border-border/60 pb-4">
          <h2 className="text-lg font-heading font-semibold text-foreground flex items-center gap-2">
            <Fingerprint className="h-5 w-5 text-critical" /> Suspicious Transactions (Anomalies)
          </h2>
          <p className="text-xs text-foreground-secondary">
            Transactions identified as out-of-profile. Inspect anomaly detail metrics before verification.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {fraudAnomalies.map((item) => {
            return (
              <div
                key={item.id}
                onClick={() => {
                  setSelectedAnomaly(item);
                  setIsDrawerOpen(true);
                }}
                className="p-4 rounded-sm border border-border bg-surface hover:bg-surface-elevated/45 hover:border-critical/35 transition-all flex items-center justify-between gap-4 cursor-pointer outline-none focus-visible:outline-2 focus-visible:outline-offset-2"
                role="button"
                tabIndex={0}
                aria-label={`Fraud Anomaly from ${item.merchant}. Score ${item.score} percent.`}
              >
                <div className="flex items-center gap-3.5 min-w-0">
                  <div className="h-10 w-10 rounded-sm bg-critical/10 border border-critical/20 flex items-center justify-center text-critical shrink-0">
                    <Fingerprint className="h-5 w-5" />
                  </div>
                  <div className="min-w-0">
                    <h4 className="text-xs font-semibold text-foreground truncate">{item.merchant}</h4>
                    <p className="text-[10px] text-foreground-secondary mt-0.5">{item.date}</p>
                  </div>
                </div>

                <div className="flex items-center gap-4 shrink-0">
                  <div className="text-right">
                    <span className="text-xs font-bold text-foreground block">{formatCurrency(item.amount)}</span>
                    <span className="text-[10px] text-critical font-bold mt-0.5 block">Score {item.score}%</span>
                  </div>
                  <ArrowRight className="h-4 w-4 text-foreground-muted" />
                </div>
              </div>
            );
          })}
        </div>
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
            
            {/* Header metadata summary */}
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

            {/* Score Ring circular visualization */}
            <div className="flex flex-col items-center justify-center text-center p-4 border border-border/80 rounded-sm">
              <div className="relative h-24 w-24 flex items-center justify-center shrink-0">
                <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                  <circle cx="18" cy="18" r="15" stroke="var(--border)" strokeWidth="3" fill="transparent" className="opacity-20" />
                  <circle 
                    cx="18" 
                    cy="18" 
                    r="15" 
                    stroke="var(--critical)" 
                    strokeWidth="3" 
                    fill="transparent" 
                    strokeDasharray="94.2" 
                    strokeDashoffset={94.2 * (1 - selectedAnomaly.score / 100)} 
                    strokeLinecap="round" 
                  />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-xl font-extrabold text-foreground leading-none">{selectedAnomaly.score}%</span>
                  <span className="text-[8px] font-sans font-bold text-critical uppercase mt-0.5 tracking-wider">Score</span>
                </div>
              </div>
              <h4 className="text-xs font-bold text-foreground mt-3">High Risk Risk anomaly Rating</h4>
              <p className="text-[10px] text-foreground-secondary max-w-xs leading-normal mt-1">
                This transaction deviates significantly from the user&apos;s baseline expenditure behaviors.
              </p>
            </div>

            {/* WHY WAS THIS FLAGGED? */}
            <div className="space-y-3">
              <h4 className="text-xs font-bold text-foreground uppercase tracking-wider flex items-center gap-1.5">
                <AlertCircle className="h-4 w-4 text-critical" /> Why was this flagged?
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

            {/* Drawer Actions */}
            <div className="flex flex-col gap-3 pt-6 border-t border-border">
              <div className="flex gap-3">
                <Button 
                  variant="outline" 
                  onClick={() => {
                    toast.success("Transaction successfully marked safe. Updating local model parameters.");
                    setIsDrawerOpen(false);
                  }}
                  className="flex-1 text-xs py-2 focus-visible:outline-2 cursor-pointer"
                >
                  Mark Safe
                </Button>
                <Button 
                  variant="primary" 
                  onClick={() => {
                    toast.info("Compliance investigation ticket raised. Ledger frozen.");
                    setIsDrawerOpen(false);
                  }}
                  className="flex-1 text-xs py-2 focus-visible:outline-2 cursor-pointer"
                >
                  Investigate
                </Button>
              </div>
              <Button 
                variant="outline" 
                onClick={handleGenerateReport}
                className="w-full text-xs py-2 focus-visible:outline-2 cursor-pointer gap-2"
              >
                <FileSpreadsheet className="h-4 w-4" />
                Generate Audit Report
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
