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
  ReferenceDot
} from "recharts";
import { 
  AlertTriangle, 
  CheckCircle2, 
  Calendar,
  Layers,
  Sparkles,
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
interface RiskFactor {
  id: string;
  name: string;
  value: string;
  target: string;
  impact: string;
  trend: "Increasing" | "Decreasing" | "Stable" | "Improving";
  confidence: number;
  description: string;
}

interface TimelineEvent {
  id: string;
  date: string;
  title: string;
  type: "application" | "approval" | "emi" | "late" | "closure";
  description: string;
}

interface HistoryPoint {
  name: string;
  probability: number;
  event?: string;
}

// ==========================================
// STATIC MOCK DATA (Declared outside to satisfy ESLint)
// ==========================================

const factorsData: RiskFactor[] = [
  {
    id: "dti",
    name: "Debt-to-Income Ratio",
    value: "24%",
    target: "< 20%",
    impact: "+5.2% Risk",
    trend: "Decreasing",
    confidence: 96,
    description: "Fixed monthly repayments take up 24% of your verified incoming cash flow. Reducing DTI improves cash reserve buffer marks."
  },
  {
    id: "utilization",
    name: "Credit Utilization",
    value: "32%",
    target: "< 30%",
    impact: "+4.1% Risk",
    trend: "Increasing",
    confidence: 94,
    description: "Revolving card balances are slightly above the optimal 30% limit threshold, triggering minor alerts in model parameters."
  },
  {
    id: "late",
    name: "Late Payments",
    value: "1 in 12M",
    target: "0",
    impact: "+8.5% Risk",
    trend: "Stable",
    confidence: 98,
    description: "A single delayed utility payment occurred 4 months ago. Restoring consecutive cycles of on-time clearing mitigates impact."
  },
  {
    id: "savings",
    name: "Low Savings Buffer",
    value: "2.1 Months",
    target: "> 6 Months",
    impact: "+6.3% Risk",
    trend: "Improving",
    confidence: 92,
    description: "Liquid reserve coverage is insufficient to cover extended overhead durations if incoming paycheck cycles cease."
  }
];

const timelineEvents: TimelineEvent[] = [
  {
    id: "t-1",
    date: "Jun 2026",
    title: "Equipment Finance Loan Closed",
    type: "closure",
    description: "Cleared outstanding principal early. Risk probability decreased by 3%."
  },
  {
    id: "t-2",
    date: "Apr 2026",
    title: "EMI Installment Paid",
    type: "emi",
    description: "On-time payment processed on primary car loan ledger."
  },
  {
    id: "t-3",
    date: "Jan 2026",
    title: "New Card Application Approved",
    type: "approval",
    description: "Premium card limit active. Credit inquiries count increased."
  },
  {
    id: "t-4",
    date: "Mar 2025",
    title: "Utility Bill Late Payment",
    type: "late",
    description: "Payment delayed by 4 days due to bank sweep mismatches."
  },
  {
    id: "t-5",
    date: "Jul 2024",
    title: "Car Loan Application Submitted",
    type: "application",
    description: "Submitted loan file request for ₹6,50,000 principal."
  }
];

const historyDataMap: Record<string, HistoryPoint[]> = {
  "3M": [
    { name: "Apr 26", probability: 23, event: "Card Inquiry" },
    { name: "May 26", probability: 21 },
    { name: "Jun 26", probability: 18, event: "Loan Closed" }
  ],
  "6M": [
    { name: "Jan 26", probability: 25 },
    { name: "Feb 26", probability: 24 },
    { name: "Mar 26", probability: 26, event: "Late Payment" },
    { name: "Apr 26", probability: 23, event: "Card Inquiry" },
    { name: "May 26", probability: 21 },
    { name: "Jun 26", probability: 18, event: "Loan Closed" }
  ],
  "1Y": [
    { name: "Jul 25", probability: 20 },
    { name: "Sep 25", probability: 21 },
    { name: "Nov 25", probability: 23 },
    { name: "Jan 26", probability: 25 },
    { name: "Mar 26", probability: 26, event: "Late Payment" },
    { name: "May 26", probability: 21 },
    { name: "Jun 26", probability: 18, event: "Loan Closed" }
  ],
  "ALL": [
    { name: "2024", probability: 15 },
    { name: "2025", probability: 22, event: "Late Payment" },
    { name: "2026 (YTD)", probability: 18, event: "Loan Closed" }
  ]
};

export default function CreditRiskPage() {
  const router = useRouter();

  // Page Controls
  const [historyPeriod, setHistoryPeriod] = useState("6M");
  const [selectedFactor, setSelectedFactor] = useState<RiskFactor | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  const [gaugeAnimated, setGaugeAnimated] = useState(false);
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setGaugeAnimated(true);
  }, []);

  const currentHistoryData = useMemo(() => {
    return historyDataMap[historyPeriod] || [];
  }, [historyPeriod]);

  // Find points with event annotations for dots
  const referenceDots = useMemo(() => {
    return currentHistoryData
      .map((d, idx) => ({ ...d, index: idx }))
      .filter(d => !!d.event);
  }, [currentHistoryData]);

  const handleSimulateInDrawer = (factorName: string) => {
    toast.success(`Simulation variables loaded for: ${factorName}`);
    setIsDrawerOpen(false);
    router.push("/simulator");
  };

  const handleSimulateItem = (actionName: string) => {
    toast.info(`Configuring simulator variables for: ${actionName}`);
    router.push("/simulator");
  };

  const handleRunGlobalSimulation = () => {
    toast.info("Opening What-If Risk Simulator workspace...");
    router.push("/simulator");
  };

  // Helper colors
  const getTrendColor = (trend: string) => {
    if (trend === "Decreasing" || trend === "Improving") return "text-positive";
    if (trend === "Increasing") return "text-critical";
    return "text-foreground-secondary";
  };

  return (
    <PageContainer className="pb-24">

      {/* 1. HERO - DEFAULT RISK READOUT */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center border-b border-border pb-8 select-none">
        
        {/* Left Side: Score metrics metadata */}
        <div className="col-span-12 lg:col-span-6 space-y-5 text-center lg:text-left">
          <div className="space-y-1">
            <span className="text-[10px] font-sans font-bold uppercase tracking-widest text-critical bg-critical/10 border border-critical/20 px-3 py-1 rounded-xs inline-block">
              Risk Diagnostics
            </span>
            <h1 className="text-3xl sm:text-4xl font-heading font-extrabold text-foreground tracking-tight leading-none mt-2">
              How Likely Am I to Default?
            </h1>
            <p className="text-xs sm:text-sm text-foreground-secondary leading-relaxed max-w-lg mx-auto lg:mx-0 pt-1">
              Your structural loan default likelihood is calculated using payment ages, income overhead EMIs, and debt leverage.
            </p>
          </div>

          <div className="flex flex-wrap items-center justify-center lg:justify-start gap-4">
            <div className="text-center lg:text-left border-r border-border/80 pr-6">
              <span className="text-xs text-foreground-muted block">Risk Level</span>
              <span className="text-lg font-bold text-positive block mt-0.5">LOW RISK</span>
            </div>
            <div className="text-center lg:text-left border-r border-border/80 pr-6">
              <span className="text-xs text-foreground-muted block">Model Confidence</span>
              <span className="text-lg font-bold text-primary block mt-0.5">94.2% (Bureau Verified)</span>
            </div>
            <div className="text-center lg:text-left">
              <span className="text-xs text-foreground-muted block">Period Delta</span>
              <span className="text-lg font-bold text-positive block mt-0.5">↓ 4.2% SINCE LAST RUN</span>
            </div>
          </div>
        </div>

        {/* Right Side: Curved SVG Needle Risk Dial */}
        <div className="col-span-12 lg:col-span-6 flex flex-col items-center justify-center relative">
          <div className="relative h-48 w-72 flex flex-col items-center justify-center overflow-hidden">
            <svg className="w-full h-full" viewBox="0 0 240 130">
              <defs>
                <linearGradient id="riskDialGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="var(--positive)" />   {/* Green */}
                  <stop offset="50%" stopColor="var(--warning)" />  {/* Yellow */}
                  <stop offset="100%" stopColor="var(--critical)" /> {/* Red */}
                </linearGradient>
              </defs>
              
              {/* Background Arc */}
              <path 
                d="M 20 120 A 100 100 0 0 1 220 120" 
                stroke="var(--border)" 
                strokeWidth="10" 
                strokeLinecap="round" 
                fill="transparent" 
                className="opacity-20"
              />

              {/* Colorful gradient track arc */}
              <path 
                d="M 20 120 A 100 100 0 0 1 220 120" 
                stroke="url(#riskDialGradient)" 
                strokeWidth="10" 
                strokeLinecap="round" 
                fill="transparent" 
                className="opacity-90"
              />

              {/* Ticks */}
              <text x="24" y="128" fill="var(--foreground-muted)" fontSize="8" textAnchor="middle" fontWeight="bold">0%</text>
              <text x="120" y="15" fill="var(--foreground-muted)" fontSize="8" textAnchor="middle" fontWeight="bold">50%</text>
              <text x="216" y="128" fill="var(--foreground-muted)" fontSize="8" textAnchor="middle" fontWeight="bold">100%</text>
              
              {/* Central Pin */}
              <circle cx="120" cy="120" r="7" fill="var(--foreground)" />

              {/* Animated Needle */}
              <motion.line
                x1="120"
                y1="120"
                x2="45"
                y2="120"
                stroke="var(--foreground)"
                strokeWidth="3"
                strokeLinecap="round"
                initial={{ rotate: 0 }}
                animate={{ rotate: gaugeAnimated ? 18 * 1.8 : 0 }} // 18% of 180 degrees = 32.4 degrees
                style={{ transformOrigin: "120px 120px" }}
                transition={{ duration: 1.6, ease: "easeOut" }}
              />
            </svg>

            {/* Readout label underneath */}
            <div className="absolute bottom-2 flex flex-col items-center text-center">
              <span className="text-4xl font-heading font-extrabold text-foreground tracking-tight leading-none">18%</span>
              <span className="text-[10px] font-sans font-bold text-positive uppercase tracking-widest mt-1">Default Probability</span>
            </div>
          </div>
        </div>

      </div>

      {/* 2. RISK HISTORY TREND */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 my-8 select-none">
        
        {/* Recharts Area Trend Chart (8 Columns) */}
        <div className="col-span-12 lg:col-span-8">
          <Card className="h-[400px] flex flex-col justify-between">
            <CardHeader className="pb-2 border-b border-border/60">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <CardTitle className="text-xs uppercase tracking-widest text-foreground-muted font-bold">
                    Risk History
                  </CardTitle>
                  <p className="text-[11px] text-foreground-secondary">Model computed loan default probability timelines.</p>
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
              
              <div className="w-full h-full min-h-[220px] flex flex-col justify-end">
                <ResponsiveContainer width="100%" height="95%">
                  <AreaChart data={currentHistoryData} margin={{ top: 15, right: 15, left: -20, bottom: 0 }}>
                    <defs>
                      <linearGradient id="colorRisk" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="var(--critical)" stopOpacity={0.15}/>
                        <stop offset="95%" stopColor="var(--critical)" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border)" className="opacity-60" />
                    <XAxis 
                      dataKey="name" 
                      tickLine={false} 
                      axisLine={false} 
                      tick={{ fill: "var(--foreground-secondary)", fontSize: 10 }} 
                    />
                    <YAxis 
                      domain={[0, 40]}
                      tickLine={false} 
                      axisLine={false} 
                      tickFormatter={(v) => `${v}%`}
                      tick={{ fill: "var(--foreground-secondary)", fontSize: 10 }} 
                    />
                    <RechartsTooltip 
                      content={({ active, payload }) => {
                        if (active && payload && payload.length) {
                          const data = payload[0].payload;
                          return (
                            <div className="bg-surface-elevated border border-border p-3 shadow-lg rounded-sm text-xs font-sans space-y-1">
                              <p className="text-[10px] font-bold text-foreground-muted uppercase tracking-wider">{data.name}</p>
                              <p className="font-semibold text-foreground">Default Prob: {data.probability}%</p>
                              {data.event && (
                                <p className="text-[10px] text-critical font-bold border-t border-border/60 pt-1 mt-1">
                                  Trigger: {data.event}
                                </p>
                              )}
                            </div>
                          );
                        }
                        return null;
                      }}
                    />
                    
                    {/* Area Chart Render */}
                    <Area 
                      type="monotone" 
                      dataKey="probability" 
                      stroke="var(--critical)" 
                      strokeWidth={2}
                      fillOpacity={1}
                      fill="url(#colorRisk)"
                      activeDot={{ r: 5, strokeWidth: 0, fill: "var(--critical)" }}
                    />

                    {/* Reference Dot overlays for events */}
                    {referenceDots.map((dot, idx) => (
                      <ReferenceDot 
                        key={idx}
                        x={dot.name}
                        y={dot.probability}
                        r={7}
                        stroke="var(--critical)"
                        strokeWidth={1.5}
                        fill="transparent"
                        className="animate-pulse"
                      />
                    ))}

                  </AreaChart>
                </ResponsiveContainer>
              </div>

            </CardContent>
          </Card>
        </div>

        {/* Quick protective factors summary (4 Columns) */}
        <div className="col-span-12 lg:col-span-4">
          <Card className="h-[400px] flex flex-col justify-between">
            <CardHeader className="pb-2 border-b border-border/60">
              <CardTitle className="text-xs uppercase tracking-widest text-positive font-bold flex items-center gap-1.5">
                <CheckCircle2 className="h-4 w-4" /> Protective Factors
              </CardTitle>
              <p className="text-[11px] text-foreground-secondary">Strengths mitigating default risks standings.</p>
            </CardHeader>
            <CardContent className="pt-4 flex-1 overflow-y-auto mt-2 space-y-4 text-xs text-foreground-secondary">
              
              <div className="space-y-1 border-l-2 border-positive/55 pl-3">
                <h4 className="font-bold text-foreground">Stable Paycheck Inflows</h4>
                <p className="text-[11px] leading-relaxed">
                  Monthly wage deposits are verified at 99.8% consistency index, lowering default modeling scores.
                </p>
              </div>

              <div className="space-y-1 border-l-2 border-positive/55 pl-3">
                <h4 className="font-bold text-foreground">Growing Savings Accumulation</h4>
                <p className="text-[11px] leading-relaxed">
                  Cash reserves sweep additions increased by 12.8% over the past 30 days, expanding emergency buffer.
                </p>
              </div>

              <div className="space-y-1 border-l-2 border-positive/55 pl-3">
                <h4 className="font-bold text-foreground">Pristine Bureau Age Standing</h4>
                <p className="text-[11px] leading-relaxed">
                  Revolving accounts have an average age of 4.5 years with zero instances of severe default collections.
                </p>
              </div>

            </CardContent>
          </Card>
        </div>

      </div>

      {/* 3. PRIMARY RISK FACTORS */}
      <div className="space-y-4 my-8 select-none">
        <div className="border-b border-border/60 pb-3">
          <h2 className="text-lg font-heading font-semibold text-foreground flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-critical animate-pulse" /> Primary Risk Factors
          </h2>
          <p className="text-xs text-foreground-secondary">
            Variables identified as driving risk probabilities upwards. Select Explain to run audit traces.
          </p>
        </div>

        {/* Factors Grid */}
        <motion.div 
          variants={staggerContainer}
          initial="hidden"
          animate="visible"
          className="grid grid-cols-1 md:grid-cols-2 gap-5"
        >
          {factorsData.map((factor) => {
            const trendCol = getTrendColor(factor.trend);
            return (
              <motion.div key={factor.id} variants={staggerItem}>
                <Card className="hover:border-border-strong transition-all flex flex-col justify-between">
                  <CardContent className="p-5 flex flex-col justify-between gap-4 h-full">
                    
                    {/* Top Factor Meta */}
                    <div className="space-y-2">
                      <div className="flex items-center justify-between gap-2">
                        <h3 className="text-xs font-bold text-foreground font-heading">
                          {factor.name}
                        </h3>
                        <span className="text-[9px] font-sans font-bold text-critical bg-critical/10 border border-critical/20 px-2 py-0.5 rounded-xs">
                          {factor.impact}
                        </span>
                      </div>
                      <p className="text-[11px] text-foreground-secondary leading-relaxed">
                        {factor.description}
                      </p>
                    </div>

                    {/* Matrix values */}
                    <div className="grid grid-cols-3 gap-3 border-t border-b border-border/50 py-3.5 my-1 text-xs text-foreground-secondary">
                      <div>
                        <span className="text-[9px] font-sans font-bold uppercase tracking-wider text-foreground-muted block">Current Value</span>
                        <span className="font-bold text-foreground mt-0.5 block">{factor.value}</span>
                      </div>
                      <div>
                        <span className="text-[9px] font-sans font-bold uppercase tracking-wider text-foreground-muted block">Healthy Target</span>
                        <span className="font-bold text-foreground mt-0.5 block">{factor.target}</span>
                      </div>
                      <div>
                        <span className="text-[9px] font-sans font-bold uppercase tracking-wider text-foreground-muted block">Trend Indicator</span>
                        <span className={`font-bold mt-0.5 block ${trendCol}`}>{factor.trend}</span>
                      </div>
                    </div>

                    {/* Action buttons */}
                    <div className="flex gap-2">
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={() => {
                          setSelectedFactor(factor);
                          setIsDrawerOpen(true);
                        }}
                        className="text-[10px] flex-1 py-1.5 focus-visible:outline-2 cursor-pointer"
                      >
                        Explain
                      </Button>
                      <Button 
                        variant="primary" 
                        size="sm" 
                        onClick={() => handleSimulateInDrawer(factor.name)}
                        className="text-[10px] flex-1 py-1.5 font-semibold focus-visible:outline-2 cursor-pointer"
                      >
                        Simulate
                      </Button>
                    </div>

                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </motion.div>
      </div>

      {/* 4. CREDIT PROFILE TABLE */}
      <div className="space-y-4 my-8 select-none">
        <div className="border-b border-border/60 pb-3">
          <h2 className="text-lg font-heading font-semibold text-foreground flex items-center gap-2">
            <Layers className="h-5 w-5 text-primary" /> Credit Profile Details
          </h2>
          <p className="text-xs text-foreground-secondary font-sans">
            Structural parameters isolated from ledger scans. Target optimal bounds to improve rating grades.
          </p>
        </div>

        <Card className="bg-surface border border-border/80 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left border-collapse font-sans text-foreground-secondary">
              <thead>
                <tr className="bg-surface-elevated/45 border-b border-border/80 text-[10px] uppercase tracking-wider text-foreground-muted">
                  <th className="p-4 font-bold">Metric Parameter</th>
                  <th className="p-4 font-bold">Current Ingested Value</th>
                  <th className="p-4 font-bold">Healthy Range Target</th>
                  <th className="p-4 font-bold">Risk Significance</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/40">
                <tr>
                  <td className="p-4 font-bold text-foreground">Debt-to-Income (DTI)</td>
                  <td className="p-4">24%</td>
                  <td className="p-4">&lt; 20%</td>
                  <td className="p-4 text-warning">Medium (EMI assets drag)</td>
                </tr>
                <tr>
                  <td className="p-4 font-bold text-foreground">Credit Utilization</td>
                  <td className="p-4">32%</td>
                  <td className="p-4">&lt; 30%</td>
                  <td className="p-4 text-warning">Medium (Card balance limits)</td>
                </tr>
                <tr>
                  <td className="p-4 font-bold text-foreground">Total Outstanding Debt</td>
                  <td className="p-4">₹1,85,000</td>
                  <td className="p-4">Subject to DTI limits</td>
                  <td className="p-4 text-primary">Optimal</td>
                </tr>
                <tr>
                  <td className="p-4 font-bold text-foreground">Monthly EMI Burden</td>
                  <td className="p-4">₹28,800 / month</td>
                  <td className="p-4">&lt; ₹24,000 / month</td>
                  <td className="p-4 text-warning">Medium (EMI volume)</td>
                </tr>
                <tr>
                  <td className="p-4 font-bold text-foreground">Past Defaults</td>
                  <td className="p-4">0</td>
                  <td className="p-4">0</td>
                  <td className="p-4 text-positive">Excellent (No write-offs)</td>
                </tr>
                <tr>
                  <td className="p-4 font-bold text-foreground">Payment Consistency Index</td>
                  <td className="p-4">95.8%</td>
                  <td className="p-4">&gt; 98.0%</td>
                  <td className="p-4 text-warning">Minor Delay (1 bill missed)</td>
                </tr>
              </tbody>
            </table>
          </div>
        </Card>
      </div>

      {/* 5. LOAN TIMELINE */}
      <div className="space-y-4 my-8 select-none">
        <div className="border-b border-border/60 pb-3">
          <h2 className="text-lg font-heading font-semibold text-foreground flex items-center gap-2">
            <Calendar className="h-5 w-5 text-primary" /> Loan & Credit Milestones
          </h2>
          <p className="text-xs text-foreground-secondary">
            Timeline of applications, approvals, payment anomalies, and debt closures.
          </p>
        </div>

        {/* Vertical Timeline */}
        <div className="relative pl-6 flex flex-col gap-6 pt-2 pb-4">
          <div className="absolute left-9.5 top-0 bottom-0 w-[2px] bg-border/80" />
          
          {timelineEvents.map((event) => {
            return (
              <div key={event.id} className="flex gap-4 relative items-start group">
                {/* Timeline connector circle node */}
                <div className={`h-8 w-8 rounded-full border border-border bg-surface shrink-0 flex items-center justify-center relative z-10 
                  ${event.type === "closure" ? "border-positive/40 text-positive" : 
                    event.type === "late" ? "border-critical/40 text-critical" : "text-primary border-primary/20"}`}
                >
                  <Calendar className="h-4 w-4" />
                </div>

                <div className="space-y-1 mt-1 font-sans">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-[9px] font-mono font-bold text-foreground-muted">{event.date}</span>
                    <span className="text-xs font-bold text-foreground">{event.title}</span>
                  </div>
                  <p className="text-[11px] text-foreground-secondary leading-relaxed">
                    {event.description}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 6. RECOMMENDED ACTIONS PLAN */}
      <div className="space-y-4 my-8 select-none">
        <div className="border-b border-border/60 pb-3">
          <h2 className="text-lg font-heading font-semibold text-foreground flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-ai" /> Recommended Actions Plan
          </h2>
          <p className="text-xs text-foreground-secondary">
            Ranked actions targeting default risk reduction. Click CTA to simulate combined improvements.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {[
            {
              id: "rec-1",
              title: "Pay card balances early",
              why: "Revolving card utilization stands at 32%. Clearing balances before cycle statements cuts risk.",
              reduction: "-3.4% Default Probability",
              impact: "High Impact"
            },
            {
              id: "rec-2",
              title: "Establish sweep deposit sweep",
              why: "Cash reserves are below target. Moving ₹15k checking cash to liquid deposit mitigates risk.",
              reduction: "-1.8% Default Probability",
              impact: "Medium Impact"
            },
            {
              id: "rec-3",
              title: "Cancel overlapping SaaS tools",
              why: "Reduces overall discretionary outflows, improving stability buffer metrics.",
              reduction: "-0.9% Default Probability",
              impact: "Low Impact"
            }
          ].map((rec, idx) => (
            <Card key={rec.id} className="flex flex-col justify-between hover:border-border-strong transition-all">
              <CardContent className="p-5 flex flex-col justify-between gap-5 h-full font-sans text-xs text-foreground-secondary">
                
                <div className="space-y-2.5">
                  <div className="flex justify-between items-center gap-2">
                    <span className="text-[9px] font-bold text-ai bg-ai/10 border border-ai/20 px-2 py-0.5 rounded-xs uppercase tracking-wider">
                      Rank {idx + 1}
                    </span>
                    <span className="text-[9px] text-positive font-bold uppercase tracking-wider">{rec.impact}</span>
                  </div>

                  <h3 className="text-xs font-bold text-foreground font-heading mt-2">
                    {rec.title}
                  </h3>
                  <p className="text-[11px] leading-relaxed">
                    {rec.why}
                  </p>
                </div>

                <div className="border-t border-border/60 pt-3.5 space-y-3.5">
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-[10px] text-foreground-muted">Expected Reduction</span>
                    <span className="font-bold text-positive">{rec.reduction}</span>
                  </div>

                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => handleSimulateItem(rec.title)}
                    className="w-full text-[10px] py-1.5 cursor-pointer focus-visible:outline-2 font-semibold"
                  >
                    Simulate Action
                  </Button>
                </div>

              </CardContent>
            </Card>
          ))}
        </div>

        <div className="pt-4 flex justify-center">
          <Button
            variant="primary"
            onClick={handleRunGlobalSimulation}
            className="w-full sm:w-auto px-8 gap-2 font-semibold cursor-pointer"
          >
            <Sparkles className="h-4 w-4" />
            Run What-If Simulation
          </Button>
        </div>
      </div>

      {/* 7. RISK FACTOR BREAKDOWN SHEET DRAWER */}
      <Sheet
        isOpen={isDrawerOpen}
        onClose={() => {
          setIsDrawerOpen(false);
          setSelectedFactor(null);
        }}
        title="SHAP Explainers Audit"
        className="w-full max-w-md"
      >
        {selectedFactor && (
          <div className="space-y-6 font-sans">
            
            {/* Header info */}
            <div className="p-4 rounded-sm bg-surface-elevated border border-border flex items-center justify-between gap-4">
              <div>
                <h3 className="text-sm font-bold text-foreground truncate max-w-[200px]">{selectedFactor.name}</h3>
                <p className="text-[10px] text-foreground-secondary mt-0.5">Current state: {selectedFactor.value}</p>
              </div>
              <div className="text-right">
                <span className="text-sm font-extrabold text-critical block">{selectedFactor.impact}</span>
                <span className="text-[10px] text-foreground-muted font-bold mt-0.5 block">Confidence: {selectedFactor.confidence}%</span>
              </div>
            </div>

            {/* WHY WAS THIS FLAGGED BY MODEL? */}
            <div className="space-y-3.5">
              <h4 className="text-xs font-bold text-foreground uppercase tracking-wider flex items-center gap-1.5">
                <Info className="h-4 w-4 text-primary" /> SHAP Feature Weight Explanation
              </h4>
              <p className="text-xs text-foreground-secondary leading-relaxed bg-surface-elevated/45 border border-border/60 p-3.5 rounded-sm">
                The gradient boosting decision trees (GBDT) risk analyzer evaluates {selectedFactor.name} against historical cohorts profiles. Moving continuous parameters to {selectedFactor.target} limits positive classification probability.
              </p>
            </div>

            {/* TARGET LIMITS */}
            <div className="p-3.5 border border-primary/20 bg-primary/5 rounded-sm flex items-center justify-between gap-4 text-xs">
              <span className="text-foreground-secondary font-medium">Optimal Standing Boundary</span>
              <span className="font-bold text-primary bg-primary/10 border border-primary/20 px-2 py-0.5 rounded-xs text-[10px]">
                {selectedFactor.target}
              </span>
            </div>

            {/* Drawer Actions */}
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
                onClick={() => handleSimulateInDrawer(selectedFactor.name)}
                className="flex-1 text-xs py-2 focus-visible:outline-2 cursor-pointer font-semibold"
              >
                Run Action Simulator
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
