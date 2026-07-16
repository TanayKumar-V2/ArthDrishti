"use client";

import React, { useState, useMemo } from "react";
import { motion } from "framer-motion";
import { 
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip
} from "recharts";
import { 
  DollarSign, 
  TrendingUp, 
  TrendingDown, 
  Calendar, 
  Clock, 
  Search, 
  Sliders, 
  Check, 
  ArrowUpRight,
  Sparkles,
  ShoppingBag,
  Coffee,
  Car,
  Tv,
  Activity,
  HeartPulse,
  CheckCircle2
} from "lucide-react";
import { toast } from "sonner";

import PageContainer from "@/components/ui/PageContainer";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Overlays";
import { cn } from "@/lib/utils";

import { 
  mockCategories, 
  mockDailyTrends, 
  mockWeeklyTrends, 
  mockMonthlyTrends, 
  mockBehavioralMetrics, 
  mockMerchants, 
  mockSavingsOpportunities
} from "@/lib/spendingData";

export default function SpendingIntelligencePage() {
  // ==========================================
  // STATE MANAGEMENT
  // ==========================================
  const categories = mockCategories;
  const [trendPeriod, setTrendPeriod] = useState<"daily" | "weekly" | "monthly">("weekly");
  const [showComparison, setShowComparison] = useState(true);
  
  // Category toggles for chart
  const [chartCategories, setChartCategories] = useState<Record<string, boolean>>({
    Food: true,
    Travel: true,
    Entertainment: true,
    Shopping: true,
    Utilities: true,
    Healthcare: true
  });

  // Flow node hover highlight states
  const [activeFlowNode, setActiveFlowNode] = useState<string | null>(null);

  // Merchant tab state: "top" | "frequent" | "spikes" | "new"
  const [merchantTab, setMerchantTab] = useState<"top" | "frequent" | "spikes" | "new">("top");

  // Recommendation slider sandbox state
  const [activeOpportunityId, setActiveOpportunityId] = useState<string>("opp-1");
  const [opportunitySavingsSim, setOpportunitySavingsSim] = useState<Record<string, number>>({
    "opp-1": 15, // percentage reduction simulated
    "opp-2": 10,
    "opp-3": 20
  });

  // Action Modals state
  const [isGoalModalOpen, setIsGoalModalOpen] = useState(false);
  const [isTxnModalOpen, setIsTxnModalOpen] = useState(false);
  const [isSimModalOpen, setIsSimModalOpen] = useState(false);
  
  // Custom goal values
  const [savingGoalName, setSavingGoalName] = useState("");
  const [savingGoalTarget, setSavingGoalTarget] = useState("1000");

  const activeOpp = useMemo(() => {
    return mockSavingsOpportunities.find(o => o.id === activeOpportunityId) || mockSavingsOpportunities[0];
  }, [activeOpportunityId]);

  // ==========================================
  // SAVINGS SIMULATORS & GOALS
  // ==========================================
  const simulatedSavingValue = useMemo(() => {
    const scale = opportunitySavingsSim[activeOpp.id] || 0;
    return Math.round((activeOpp.potentialSaving * scale) / 100);
  }, [activeOpp, opportunitySavingsSim]);

  const handleCreateGoal = (e: React.FormEvent) => {
    e.preventDefault();
    if (!savingGoalName.trim()) {
      toast.error("Please enter a goal description");
      return;
    }
    toast.success(`Savings Goal Created: ${savingGoalName}`, {
      description: `Target cap limit set at ₹${Number(savingGoalTarget).toLocaleString("en-IN")}/month.`
    });
    setIsGoalModalOpen(false);
    setSavingGoalName("");
  };

  const handleApplySimulator = () => {
    const scale = opportunitySavingsSim[activeOpp.id] || 0;
    toast.success(`Simulation applied successfully!`, {
      description: `Simulated a ${scale}% spending reduction in ${activeOpp.category}, saving ₹${simulatedSavingValue.toLocaleString("en-IN")}/Mo.`
    });
    setIsSimModalOpen(false);
  };

  // ==========================================
  // DERIVED DATA FOR CHARTS
  // ==========================================
  const currentTrendData = useMemo(() => {
    const rawData = trendPeriod === "daily" ? mockDailyTrends 
                    : trendPeriod === "weekly" ? mockWeeklyTrends 
                    : mockMonthlyTrends;
    
    // Dynamically sum only checked categories
    return rawData.map(pt => {
      let activeTotal = 0;
      if (chartCategories.Food) activeTotal += pt.Food;
      if (chartCategories.Travel) activeTotal += pt.Travel;
      if (chartCategories.Entertainment) activeTotal += pt.Entertainment;
      if (chartCategories.Shopping) activeTotal += pt.Shopping;
      if (chartCategories.Utilities) activeTotal += pt.Utilities;
      if (chartCategories.Healthcare) activeTotal += pt.Healthcare;

      return {
        ...pt,
        activeTotal,
        // If comparison is on, adjust comparison totals
        activeCompareTotal: showComparison ? (pt.compareTotal || pt.total * 0.9) : undefined
      };
    });
  }, [trendPeriod, chartCategories, showComparison]);

  const toggleChartCategory = (catName: string) => {
    setChartCategories(prev => ({
      ...prev,
      [catName]: !prev[catName]
    }));
  };

  // Icon Helper mapping
  const getBehaviorIcon = (iconName: string) => {
    switch (iconName) {
      case "Calendar": return Calendar;
      case "TrendingUp": return TrendingUp;
      case "Clock": return Clock;
      case "DollarSign": return DollarSign;
      case "Search": return Search;
      default: return Sliders;
    }
  };

  return (
    <PageContainer className="pb-24">
      {/* ==========================================
          DASHBOARD HERO BLOCK
          ========================================== */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center border-b border-border pb-8 select-none">
        
        {/* Left Side: Spending Readout */}
        <div className="col-span-12 lg:col-span-5 space-y-4 text-center lg:text-left">
          <div className="space-y-1">
            <span className="text-[10px] font-sans font-bold uppercase tracking-widest text-forecast bg-forecast/10 border border-forecast/20 px-3 py-1 rounded-xs inline-block">
              Outflow Analytics
            </span>
            <h1 className="text-sm font-sans font-bold text-foreground-secondary uppercase tracking-wider mt-3">
              Monthly Spending
            </h1>
            <div className="flex items-center justify-center lg:justify-start gap-4 mt-1">
              <span className="text-4xl sm:text-5xl font-heading font-extrabold text-foreground tracking-tight leading-none">
                ₹84,200
              </span>
              <span className="inline-flex items-center gap-1 font-mono text-xs font-semibold text-critical bg-critical/10 border border-critical/20 px-2 py-0.75 rounded-xs mt-1">
                <TrendingUp className="h-3 w-3" />
                12.4% MoM
              </span>
            </div>
            <span className="text-[10px] text-foreground-muted block pt-1 font-sans">vs. ₹74,900 last billing period</span>
          </div>

          <div className="flex flex-wrap items-center justify-center lg:justify-start gap-5 pt-1 text-xs">
            <div className="border-r border-border/80 pr-5">
              <span className="text-foreground-muted block uppercase text-[9px] font-bold">Total Ingested Budget</span>
              <span className="font-bold text-foreground mt-0.5 block">₹95,000 / month</span>
            </div>
            <div>
              <span className="text-foreground-muted block uppercase text-[9px] font-bold">Budget Buffer Remaining</span>
              <span className="font-bold text-positive mt-0.5 block">₹10,800 Safe</span>
            </div>
          </div>
        </div>

        {/* Right Side: AI summary block */}
        <div className="col-span-12 lg:col-span-7">
          <div className="relative p-5 bg-surface border border-border rounded-md shadow-xs overflow-hidden flex flex-col justify-between h-full min-h-[140px]">
            <div className="absolute right-0 top-0 w-24 h-24 bg-forecast/5 rounded-full blur-2xl" />
            <div className="absolute left-0 bottom-0 w-20 h-20 bg-ai/5 rounded-full blur-2xl" />
            
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Sparkles className="h-4.5 w-4.5 text-ai animate-pulse" />
                <span className="text-[10px] font-sans font-bold text-ai uppercase tracking-wider">AI Spending Insights</span>
              </div>
              <h3 className="text-xs font-bold text-foreground font-heading">Discretionary Influx Summary</h3>
              <p className="text-xs text-foreground-secondary leading-relaxed max-w-xl">
                Discretionary spending increased primarily due to food delivery and shopping activity. Over <strong>42% of spending</strong> occurred during weekend intervals, creating a structural saving threshold delta.
              </p>
            </div>

            <div className="border-t border-border/50 pt-2.5 mt-3 flex items-center justify-between text-[10px]">
              <span className="text-foreground-muted">Model: Vector-Spend-Classifier v3.4</span>
              <button 
                onClick={() => {
                  setActiveOpportunityId("opp-1");
                  setIsSimModalOpen(true);
                }} 
                className="text-ai font-bold hover:underline flex items-center gap-1 cursor-pointer"
              >
                Simulate Reduction <ArrowUpRight className="h-3 w-3" />
              </button>
            </div>
          </div>
        </div>

      </div>

      {/* ==========================================
          SPENDING FLOW (VISUAL SVG DIAGRAM)
          ========================================== */}
      <div className="my-8 select-none">
        <Card className="overflow-hidden">
          <CardHeader className="pb-3 border-b border-border/60">
            <CardTitle className="text-xs uppercase tracking-widest text-foreground-muted font-bold flex items-center gap-1.5">
              <Activity className="h-4.5 w-4.5 text-forecast" /> Spending Flow Analysis
            </CardTitle>
            <p className="text-[11px] text-foreground-secondary">
              Interactive financial routing maps. Hover over middle nodes to highlight flows.
            </p>
          </CardHeader>
          <CardContent className="pt-6">
            
            {/* SVG Visual Flow Panel */}
            <div className="w-full overflow-x-auto scrollbar-none flex justify-center">
              <div className="min-w-[700px] w-full max-w-[850px] aspect-[800/300] relative">
                
                {/* SVG Flow lines background layer */}
                <svg className="absolute inset-0 w-full h-full pointer-events-none" viewBox="0 0 800 300">
                  <defs>
                    <linearGradient id="flowGradEssentials" x1="0%" y1="0%" x2="100%" y2="0%">
                      <stop offset="0%" stopColor="var(--primary)" stopOpacity="0.4" />
                      <stop offset="100%" stopColor="var(--forecast)" stopOpacity="0.8" />
                    </linearGradient>
                    <linearGradient id="flowGradLifestyle" x1="0%" y1="0%" x2="100%" y2="0%">
                      <stop offset="0%" stopColor="var(--primary)" stopOpacity="0.4" />
                      <stop offset="100%" stopColor="var(--ai)" stopOpacity="0.8" />
                    </linearGradient>
                    <linearGradient id="flowGradSavings" x1="0%" y1="0%" x2="100%" y2="0%">
                      <stop offset="0%" stopColor="var(--primary)" stopOpacity="0.4" />
                      <stop offset="100%" stopColor="var(--positive)" stopOpacity="0.8" />
                    </linearGradient>
                  </defs>

                  {/* Level 1: Income -> Middle categories */}
                  {/* To Essentials */}
                  <path 
                    d="M 50 150 C 150 150, 150 60, 300 60" 
                    stroke={activeFlowNode === "essentials" || activeFlowNode === "income" ? "url(#flowGradEssentials)" : "var(--border)"} 
                    strokeWidth={activeFlowNode === "essentials" ? "4.5" : "2"} 
                    strokeDasharray={activeFlowNode === "essentials" ? "6, 4" : "none"}
                    className={cn("transition-all duration-300 fill-none", activeFlowNode === "essentials" ? "opacity-100" : "opacity-35")} 
                  />
                  {/* To Lifestyle */}
                  <path 
                    d="M 50 150 C 150 150, 150 150, 300 150" 
                    stroke={activeFlowNode === "lifestyle" || activeFlowNode === "income" ? "url(#flowGradLifestyle)" : "var(--border)"} 
                    strokeWidth={activeFlowNode === "lifestyle" ? "4.5" : "2"} 
                    strokeDasharray={activeFlowNode === "lifestyle" ? "6, 4" : "none"}
                    className={cn("transition-all duration-300 fill-none", activeFlowNode === "lifestyle" ? "opacity-100" : "opacity-35")} 
                  />
                  {/* To Savings */}
                  <path 
                    d="M 50 150 C 150 150, 150 240, 300 240" 
                    stroke={activeFlowNode === "savings" || activeFlowNode === "income" ? "url(#flowGradSavings)" : "var(--border)"} 
                    strokeWidth={activeFlowNode === "savings" ? "4.5" : "2"} 
                    strokeDasharray={activeFlowNode === "savings" ? "6, 4" : "none"}
                    className={cn("transition-all duration-300 fill-none", activeFlowNode === "savings" ? "opacity-100" : "opacity-35")} 
                  />

                  {/* Level 2: Middle Categories -> Right Sub-categories */}
                  {/* Essentials -> Utilities */}
                  <path 
                    d="M 300 60 C 450 60, 450 25, 650 25" 
                    stroke={activeFlowNode === "essentials" ? "var(--forecast)" : "var(--border)"} 
                    strokeWidth={activeFlowNode === "essentials" ? "3.5" : "1.5"} 
                    className={cn("transition-all duration-300 fill-none", activeFlowNode === "essentials" ? "opacity-90" : "opacity-20")}
                  />
                  {/* Essentials -> Healthcare */}
                  <path 
                    d="M 300 60 C 450 60, 450 75, 650 75" 
                    stroke={activeFlowNode === "essentials" ? "var(--forecast)" : "var(--border)"} 
                    strokeWidth={activeFlowNode === "essentials" ? "3.5" : "1.5"} 
                    className={cn("transition-all duration-300 fill-none", activeFlowNode === "essentials" ? "opacity-90" : "opacity-20")}
                  />
                  {/* Essentials -> Food (Part) */}
                  <path 
                    d="M 300 60 C 450 60, 450 125, 650 125" 
                    stroke={activeFlowNode === "essentials" ? "var(--forecast)" : "var(--border)"} 
                    strokeWidth={activeFlowNode === "essentials" ? "2.5" : "1.5"} 
                    className={cn("transition-all duration-300 fill-none", activeFlowNode === "essentials" ? "opacity-90" : "opacity-20")}
                  />

                  {/* Lifestyle -> Food (Part) */}
                  <path 
                    d="M 300 150 C 450 150, 450 125, 650 125" 
                    stroke={activeFlowNode === "lifestyle" ? "var(--ai)" : "var(--border)"} 
                    strokeWidth={activeFlowNode === "lifestyle" ? "2.5" : "1.5"} 
                    className={cn("transition-all duration-300 fill-none", activeFlowNode === "lifestyle" ? "opacity-90" : "opacity-20")}
                  />
                  {/* Lifestyle -> Travel */}
                  <path 
                    d="M 300 150 C 450 150, 450 175, 650 175" 
                    stroke={activeFlowNode === "lifestyle" ? "var(--ai)" : "var(--border)"} 
                    strokeWidth={activeFlowNode === "lifestyle" ? "3.5" : "1.5"} 
                    className={cn("transition-all duration-300 fill-none", activeFlowNode === "lifestyle" ? "opacity-90" : "opacity-20")}
                  />
                  {/* Lifestyle -> Entertainment */}
                  <path 
                    d="M 300 150 C 450 150, 450 225, 650 225" 
                    stroke={activeFlowNode === "lifestyle" ? "var(--ai)" : "var(--border)"} 
                    strokeWidth={activeFlowNode === "lifestyle" ? "3.5" : "1.5"} 
                    className={cn("transition-all duration-300 fill-none", activeFlowNode === "lifestyle" ? "opacity-90" : "opacity-20")}
                  />
                  {/* Lifestyle -> Shopping */}
                  <path 
                    d="M 300 150 C 450 150, 450 275, 650 275" 
                    stroke={activeFlowNode === "lifestyle" ? "var(--ai)" : "var(--border)"} 
                    strokeWidth={activeFlowNode === "lifestyle" ? "3.5" : "1.5"} 
                    className={cn("transition-all duration-300 fill-none", activeFlowNode === "lifestyle" ? "opacity-90" : "opacity-20")}
                  />
                </svg>

                {/* Nodes Interactive Placement Overlay */}
                {/* 1. LEFT NODE: INCOME */}
                <div 
                  style={{ left: "50px", top: "150px" }}
                  className="absolute -translate-x-1/2 -translate-y-1/2 flex flex-col items-center group cursor-pointer"
                  onMouseEnter={() => setActiveFlowNode("income")}
                  onMouseLeave={() => setActiveFlowNode(null)}
                >
                  <div className="h-14 w-14 rounded-full bg-primary/10 border-2 border-primary flex items-center justify-center shadow-lg group-hover:scale-105 group-hover:shadow-primary/20 transition-all">
                    <DollarSign className="h-6 w-6 text-primary" />
                  </div>
                  <span className="text-[10px] font-heading font-extrabold text-foreground mt-2">INCOME</span>
                  <span className="text-[10px] font-mono font-bold text-foreground-secondary">₹1,20,000</span>
                </div>

                {/* 2. MIDDLE NODES: ESSENTIALS, LIFESTYLE, SAVINGS */}
                {/* ESSENTIALS */}
                <div 
                  style={{ left: "300px", top: "60px" }}
                  className="absolute -translate-x-1/2 -translate-y-1/2 flex flex-col items-center group cursor-pointer"
                  onMouseEnter={() => setActiveFlowNode("essentials")}
                  onMouseLeave={() => setActiveFlowNode(null)}
                >
                  <div className={cn(
                    "h-12 w-12 rounded-full flex items-center justify-center shadow-md transition-all duration-300",
                    activeFlowNode === "essentials" 
                      ? "bg-forecast text-white scale-105 shadow-forecast/25 border-2 border-forecast" 
                      : "bg-surface-elevated text-foreground-secondary border border-border hover:border-forecast/60"
                  )}>
                    <HeartPulse className="h-5 w-5" />
                  </div>
                  <span className="text-[9px] font-heading font-extrabold text-foreground mt-1.5">ESSENTIALS</span>
                  <span className="text-[9px] font-mono font-bold text-foreground-secondary">₹42,000</span>
                </div>

                {/* LIFESTYLE */}
                <div 
                  style={{ left: "300px", top: "150px" }}
                  className="absolute -translate-x-1/2 -translate-y-1/2 flex flex-col items-center group cursor-pointer"
                  onMouseEnter={() => setActiveFlowNode("lifestyle")}
                  onMouseLeave={() => setActiveFlowNode(null)}
                >
                  <div className={cn(
                    "h-12 w-12 rounded-full flex items-center justify-center shadow-md transition-all duration-300",
                    activeFlowNode === "lifestyle" 
                      ? "bg-ai text-white scale-105 shadow-ai/25 border-2 border-ai" 
                      : "bg-surface-elevated text-foreground-secondary border border-border hover:border-ai/60"
                  )}>
                    <ShoppingBag className="h-5 w-5" />
                  </div>
                  <span className="text-[9px] font-heading font-extrabold text-foreground mt-1.5">LIFESTYLE</span>
                  <span className="text-[9px] font-mono font-bold text-foreground-secondary">₹38,000</span>
                </div>

                {/* SAVINGS */}
                <div 
                  style={{ left: "300px", top: "240px" }}
                  className="absolute -translate-x-1/2 -translate-y-1/2 flex flex-col items-center group cursor-pointer"
                  onMouseEnter={() => setActiveFlowNode("savings")}
                  onMouseLeave={() => setActiveFlowNode(null)}
                >
                  <div className={cn(
                    "h-12 w-12 rounded-full flex items-center justify-center shadow-md transition-all duration-300",
                    activeFlowNode === "savings" 
                      ? "bg-positive text-white scale-105 shadow-positive/25 border-2 border-positive" 
                      : "bg-surface-elevated text-foreground-secondary border border-border hover:border-positive/60"
                  )}>
                    <CheckCircle2 className="h-5 w-5" />
                  </div>
                  <span className="text-[9px] font-heading font-extrabold text-foreground mt-1.5">SAVINGS</span>
                  <span className="text-[9px] font-mono font-bold text-foreground-secondary">₹24,000</span>
                </div>

                {/* 3. RIGHT NODES: SUB-CATEGORIES */}
                {/* Utilities */}
                <div style={{ left: "650px", top: "25px" }} className="absolute -translate-y-1/2 flex items-center gap-2">
                  <div className="h-6 w-6 rounded-full bg-forecast/10 flex items-center justify-center text-forecast">
                    <Sliders className="h-3 w-3" />
                  </div>
                  <div className="text-left font-sans leading-none">
                    <span className="text-[9px] font-bold text-foreground block">Utilities</span>
                    <span className="text-[9px] font-mono text-foreground-muted">₹13,000</span>
                  </div>
                </div>

                {/* Healthcare */}
                <div style={{ left: "650px", top: "75px" }} className="absolute -translate-y-1/2 flex items-center gap-2">
                  <div className="h-6 w-6 rounded-full bg-forecast/10 flex items-center justify-center text-forecast">
                    <HeartPulse className="h-3 w-3" />
                  </div>
                  <div className="text-left font-sans leading-none">
                    <span className="text-[9px] font-bold text-foreground block">Healthcare</span>
                    <span className="text-[9px] font-mono text-foreground-muted">₹17,000</span>
                  </div>
                </div>

                {/* Food */}
                <div style={{ left: "650px", top: "125px" }} className="absolute -translate-y-1/2 flex items-center gap-2">
                  <div className="h-6 w-6 rounded-full bg-ai/10 flex items-center justify-center text-ai">
                    <Coffee className="h-3 w-3" />
                  </div>
                  <div className="text-left font-sans leading-none">
                    <span className="text-[9px] font-bold text-foreground block">Food</span>
                    <span className="text-[9px] font-mono text-foreground-muted">₹18,500</span>
                  </div>
                </div>

                {/* Travel */}
                <div style={{ left: "650px", top: "175px" }} className="absolute -translate-y-1/2 flex items-center gap-2">
                  <div className="h-6 w-6 rounded-full bg-ai/10 flex items-center justify-center text-ai">
                    <Car className="h-3 w-3" />
                  </div>
                  <div className="text-left font-sans leading-none">
                    <span className="text-[9px] font-bold text-foreground block">Travel</span>
                    <span className="text-[9px] font-mono text-foreground-muted">₹12,000</span>
                  </div>
                </div>

                {/* Entertainment */}
                <div style={{ left: "650px", top: "225px" }} className="absolute -translate-y-1/2 flex items-center gap-2">
                  <div className="h-6 w-6 rounded-full bg-ai/10 flex items-center justify-center text-ai">
                    <Tv className="h-3 w-3" />
                  </div>
                  <div className="text-left font-sans leading-none">
                    <span className="text-[9px] font-bold text-foreground block">Entertainment</span>
                    <span className="text-[9px] font-mono text-foreground-muted">₹8,200</span>
                  </div>
                </div>

                {/* Shopping */}
                <div style={{ left: "650px", top: "275px" }} className="absolute -translate-y-1/2 flex items-center gap-2">
                  <div className="h-6 w-6 rounded-full bg-ai/10 flex items-center justify-center text-ai">
                    <ShoppingBag className="h-3 w-3" />
                  </div>
                  <div className="text-left font-sans leading-none">
                    <span className="text-[9px] font-bold text-foreground block">Shopping</span>
                    <span className="text-[9px] font-mono text-foreground-muted">₹15,500</span>
                  </div>
                </div>

              </div>
            </div>

          </CardContent>
        </Card>
      </div>

      {/* ==========================================
          CATEGORY INTELLIGENCE GRID
          ========================================== */}
      <div className="space-y-4 my-8 select-none">
        <div className="border-b border-border/60 pb-3">
          <h2 className="text-lg font-heading font-semibold text-foreground flex items-center gap-2">
            <Sliders className="h-5 w-5 text-primary" /> Category Intelligence
          </h2>
          <p className="text-xs text-foreground-secondary">
            Category analysis profile parameters with MoM trends and set budget progress.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
          {categories.map((cat) => {
            const isOverBudget = cat.amount > cat.budget;
            const progressPercentage = Math.min((cat.amount / cat.budget) * 100, 100);

            return (
              <Card key={cat.id} className="hover:border-border-strong transition-all flex flex-col justify-between group">
                <CardContent className="p-5 flex flex-col justify-between gap-4 h-full">
                  <div className="space-y-2.5">
                    <div className="flex justify-between items-start">
                      <div>
                        <span className="text-[10px] font-sans font-bold text-foreground-muted uppercase tracking-wider">
                          Outflow Category
                        </span>
                        <h3 className="text-sm font-heading font-extrabold text-foreground mt-0.5">
                          {cat.name}
                        </h3>
                      </div>
                      <span className={cn(
                        "text-[9px] font-sans font-bold border px-2 py-0.5 rounded-xs flex items-center gap-1",
                        cat.trend > 0 ? "bg-critical/10 text-critical border-critical/20" : "bg-positive/10 text-positive border-positive/20"
                      )}>
                        {cat.trend > 0 ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
                        {cat.trend > 0 ? "+" : ""}{cat.trend}% MoM
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-4 bg-surface-elevated/55 border border-border/60 p-2.5 rounded-xs text-xs font-sans">
                      <div>
                        <span className="text-[9px] font-bold text-foreground-muted block uppercase">Amount spent</span>
                        <span className="font-extrabold text-foreground mt-0.5 block">₹{cat.amount.toLocaleString("en-IN")}</span>
                      </div>
                      <div>
                        <span className="text-[9px] font-bold text-foreground-muted block uppercase">Outflow Share</span>
                        <span className="font-extrabold text-forecast mt-0.5 block">{cat.share}%</span>
                      </div>
                    </div>

                    <p className="text-[11px] text-foreground-secondary leading-relaxed pt-1">
                      {cat.aiObservation}
                    </p>
                  </div>

                  {/* Budget Comparison Slider Progress */}
                  <div className="space-y-1.5 pt-2 border-t border-border/50">
                    <div className="flex justify-between items-center text-[10px] font-sans">
                      <span className="text-foreground-secondary">
                        Budget Cap: <strong>₹{cat.budget.toLocaleString("en-IN")}</strong>
                      </span>
                      <span className={cn(
                        "font-bold uppercase tracking-wider",
                        isOverBudget ? "text-critical" : "text-positive"
                      )}>
                        {isOverBudget ? "Over Limit" : "Within Cap"}
                      </span>
                    </div>

                    <div className="w-full h-1.5 bg-surface-elevated border border-border/30 rounded-full overflow-hidden">
                      <div 
                        style={{ width: `${progressPercentage}%` }}
                        className={cn(
                          "h-full rounded-full transition-all duration-1000",
                          isOverBudget ? "bg-critical" : "bg-positive"
                        )}
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>

      {/* ==========================================
          SPENDING TRENDS CHART
          ========================================== */}
      <div className="my-8">
        <Card className="flex flex-col justify-between overflow-hidden select-none">
          <CardHeader className="pb-3 border-b border-border/60">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <CardTitle className="text-xs uppercase tracking-widest text-foreground-muted font-bold flex items-center gap-1.5">
                  <TrendingUp className="h-4.5 w-4.5 text-forecast" /> Spending Trends
                </CardTitle>
                <p className="text-[11px] text-foreground-secondary">
                  Customizable chart displaying spending totals compared to previous period averages.
                </p>
              </div>

              {/* Chart Controls */}
              <div className="flex flex-wrap items-center gap-3">
                {/* Aggregation select */}
                <div className="flex items-center gap-1 border border-border p-0.5 rounded-sm bg-surface-elevated">
                  {[
                    { id: "daily", label: "Daily" },
                    { id: "weekly", label: "Weekly" },
                    { id: "monthly", label: "Monthly" }
                  ].map(item => (
                    <button
                      key={item.id}
                      onClick={() => setTrendPeriod(item.id as "daily" | "weekly" | "monthly")}
                      className={cn(
                        "text-[10px] font-sans font-semibold px-2.5 py-1 rounded-xs transition-colors cursor-pointer",
                        trendPeriod === item.id 
                          ? "bg-primary text-white" 
                          : "text-foreground-secondary hover:text-foreground hover:bg-surface-hover"
                      )}
                    >
                      {item.label}
                    </button>
                  ))}
                </div>

                {/* Comparison toggle */}
                <button
                  onClick={() => setShowComparison(prev => !prev)}
                  className={cn(
                    "text-[10px] font-sans font-bold px-3 py-1.5 rounded-sm border cursor-pointer transition-colors flex items-center gap-1.5",
                    showComparison 
                      ? "bg-surface-elevated text-primary border-primary" 
                      : "bg-surface border-border text-foreground-secondary hover:bg-surface-hover"
                  )}
                >
                  <Clock className="h-3.5 w-3.5" />
                  <span>Compare Period</span>
                </button>
              </div>
            </div>
          </CardHeader>
          <CardContent className="pt-6">
            
            {/* Category Filter Checkboxes */}
            <div className="flex flex-wrap items-center gap-3.5 mb-5 text-[10px] border-b border-border/40 pb-4 font-sans">
              <span className="text-foreground-muted font-bold uppercase tracking-wider text-[9px]">Plot Categories:</span>
              {Object.keys(chartCategories).map((catName) => (
                <label 
                  key={catName} 
                  className={cn(
                    "flex items-center gap-1.5 px-2.5 py-1 rounded-xs border cursor-pointer select-none transition-colors",
                    chartCategories[catName] 
                      ? "bg-surface-elevated text-foreground border-border-strong font-bold" 
                      : "bg-surface text-foreground-muted border-border/60 hover:text-foreground"
                  )}
                >
                  <input
                    type="checkbox"
                    checked={chartCategories[catName]}
                    onChange={() => toggleChartCategory(catName)}
                    className="sr-only"
                  />
                  <div className={cn(
                    "h-3 w-3 rounded-xs border flex items-center justify-center",
                    chartCategories[catName] ? "bg-primary border-primary text-white" : "border-border-strong"
                  )}>
                    {chartCategories[catName] && <Check className="h-2 w-2 stroke-[3]" />}
                  </div>
                  <span>{catName}</span>
                </label>
              ))}
            </div>

            {/* Recharts Area Chart */}
            <div className="w-full h-[280px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={currentTrendData} margin={{ top: 10, right: 15, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorSpend" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="var(--primary)" stopOpacity={0.2}/>
                      <stop offset="95%" stopColor="var(--primary)" stopOpacity={0}/>
                    </linearGradient>
                    <linearGradient id="colorCompare" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="var(--foreground-muted)" stopOpacity={0.1}/>
                      <stop offset="95%" stopColor="var(--foreground-muted)" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border)" className="opacity-50" />
                  <XAxis 
                    dataKey="dateLabel" 
                    tickLine={false} 
                    axisLine={false} 
                    tick={{ fill: "var(--foreground-secondary)", fontSize: 10, fontWeight: "bold" }} 
                  />
                  <YAxis 
                    tickLine={false} 
                    axisLine={false} 
                    tickFormatter={(v) => `₹${v.toLocaleString("en-IN")}`}
                    tick={{ fill: "var(--foreground-secondary)", fontSize: 10 }} 
                  />
                  <RechartsTooltip 
                    content={({ active, payload }) => {
                      if (active && payload && payload.length) {
                        const data = payload[0].payload;
                        return (
                          <div className="bg-surface-elevated border border-border p-3.5 shadow-lg rounded-sm text-xs font-sans space-y-2">
                            <p className="text-[10px] font-bold text-foreground-muted uppercase tracking-wider">{data.dateLabel} Summary</p>
                            <div className="space-y-1">
                              <p className="font-semibold text-foreground">Active Total: ₹{data.activeTotal.toLocaleString("en-IN")}</p>
                              {showComparison && (
                                <p className="font-semibold text-foreground-secondary">Compare Period: ₹{Math.round(data.activeCompareTotal).toLocaleString("en-IN")}</p>
                              )}
                            </div>
                            <div className="border-t border-border/60 pt-2 mt-1 text-[10px] space-y-0.5 text-foreground-secondary">
                              {Object.entries(chartCategories).map(([cat, enabled]) => enabled && (
                                <div key={cat} className="flex justify-between items-center gap-4">
                                  <span>{cat}</span>
                                  <span className="font-mono font-bold text-foreground">₹{data[cat].toLocaleString("en-IN")}</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                  
                  {/* Actual period area */}
                  <Area 
                    type="monotone" 
                    dataKey="activeTotal" 
                    stroke="var(--primary)" 
                    strokeWidth={2}
                    fillOpacity={1}
                    fill="url(#colorSpend)"
                    activeDot={{ r: 5, strokeWidth: 0, fill: "var(--primary)" }}
                  />

                  {/* Comparison period area */}
                  {showComparison && (
                    <Area 
                      type="monotone" 
                      dataKey="activeCompareTotal" 
                      stroke="var(--foreground-muted)" 
                      strokeWidth={1.5}
                      strokeDasharray="4 4"
                      fillOpacity={1}
                      fill="url(#colorCompare)"
                      activeDot={false}
                    />
                  )}

                </AreaChart>
              </ResponsiveContainer>
            </div>

          </CardContent>
        </Card>
      </div>

      {/* ==========================================
          BEHAVIOR ANALYSIS
          ========================================== */}
      <div className="space-y-4 my-8 select-none">
        <div className="border-b border-border/60 pb-3">
          <h2 className="text-lg font-heading font-semibold text-foreground flex items-center gap-2">
            <Activity className="h-5 w-5 text-ai" /> Behavior & Pattern Analysis
          </h2>
          <p className="text-xs text-foreground-secondary font-sans">
            AI evaluated behavioral parameters isolated from spending habits and card transaction velocity tags.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
          {mockBehavioralMetrics.map((item) => {
            const Icon = getBehaviorIcon(item.iconName);
            return (
              <Card key={item.name} className="hover:border-border-strong transition-all flex flex-col justify-between">
                <CardContent className="p-5 flex flex-col justify-between gap-3 h-full">
                  <div className="space-y-2 text-xs font-sans text-foreground-secondary">
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2 text-foreground font-bold font-heading">
                        <Icon className="h-4.5 w-4.5 text-primary" />
                        <span>{item.name}</span>
                      </div>
                      <span className={cn(
                        "text-[9px] font-sans font-bold border px-2 py-0.5 rounded-full uppercase tracking-wider",
                        item.status === "warning" ? "bg-warning/10 text-warning border-warning/20" :
                        item.status === "positive" ? "bg-positive/10 text-positive border-positive/20" :
                        item.status === "info" ? "bg-forecast/10 text-forecast border-forecast/20" :
                        "bg-surface-elevated text-foreground-secondary border-border"
                      )}>
                        {item.value}
                      </span>
                    </div>
                    <p className="text-[11px] leading-relaxed pt-1">
                      {item.detail}
                    </p>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>

      {/* ==========================================
          MERCHANT ANALYSIS
          ========================================== */}
      <div className="space-y-4 my-8 select-none">
        <div className="border-b border-border/60 pb-3">
          <h2 className="text-lg font-heading font-semibold text-foreground flex items-center gap-2">
            <Search className="h-5 w-5 text-primary" /> Merchant Analysis
          </h2>
          <p className="text-xs text-foreground-secondary">
            Vendor categorization logs sorted by volume metrics, frequency clearings, and spikes.
          </p>
        </div>

        <Card className="bg-surface border border-border/80 overflow-hidden">
          <CardHeader className="pb-0 border-b border-border/60 bg-surface-elevated/45">
            {/* Merchant Tabs */}
            <div className="flex space-x-6 text-xs font-sans font-medium text-foreground-secondary select-none">
              {[
                { id: "top", label: "Top Merchants" },
                { id: "frequent", label: "Most Frequent" },
                { id: "spikes", label: "Largest Increase" },
                { id: "new", label: "New Merchants" }
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setMerchantTab(tab.id as "top" | "frequent" | "spikes" | "new")}
                  className={cn(
                    "relative pb-3 cursor-pointer outline-none focus-visible:outline-2",
                    merchantTab === tab.id ? "text-primary font-bold" : "hover:text-foreground"
                  )}
                >
                  <span>{tab.label}</span>
                  {merchantTab === tab.id && (
                    <motion.div 
                      layoutId="merchantActiveIndicator"
                      className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary" 
                    />
                  )}
                </button>
              ))}
            </div>
          </CardHeader>

          {/* Tab Content Tables */}
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left border-collapse font-sans text-foreground-secondary">
              <thead>
                <tr className="bg-surface-elevated border-b border-border/50 text-[9px] uppercase tracking-wider text-foreground-muted">
                  <th className="p-4 font-bold">Merchant Name</th>
                  <th className="p-4 font-bold">Category</th>
                  <th className="p-4 font-bold text-right">Metric Value</th>
                  <th className="p-4 font-bold text-right">Exposure Ingestion Details</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/40">
                {mockMerchants[merchantTab].map((item, idx) => (
                  <tr key={idx} className="hover:bg-surface-elevated/55 transition-colors">
                    <td className="p-4 font-bold text-foreground">{item.name}</td>
                    <td className="p-4">
                      <span className="px-2 py-0.5 rounded-xs font-semibold text-[10px] border bg-surface-elevated text-foreground-secondary border-border/80">
                        {item.category}
                      </span>
                    </td>
                    <td className="p-4 font-mono font-bold text-foreground text-right">{item.metricValue}</td>
                    <td className="p-4 text-foreground-secondary text-right">{item.subtext}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      </div>

      {/* ==========================================
          AI SAVINGS OPPORTUNITIES
          ========================================== */}
      <div className="space-y-4 my-8 select-none">
        <div className="border-b border-border/60 pb-3">
          <h2 className="text-lg font-heading font-semibold text-foreground flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-ai animate-pulse" /> AI Savings Opportunities
          </h2>
          <p className="text-xs text-foreground-secondary">
            Actionable optimization recommendations targeting discretionary savings goals.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
          
          {/* Left: Recommended opportunity selector cards (4 columns) */}
          <div className="col-span-12 lg:col-span-5 flex flex-col gap-3">
            {mockSavingsOpportunities.map((opp) => (
              <div 
                key={opp.id}
                onClick={() => setActiveOpportunityId(opp.id)}
                className={cn(
                  "p-4 rounded-sm border cursor-pointer transition-all flex flex-col justify-between text-xs font-sans text-foreground-secondary leading-relaxed",
                  activeOpportunityId === opp.id 
                    ? "bg-surface-elevated border-primary shadow-xs" 
                    : "bg-surface border-border hover:bg-surface-hover hover:border-border-strong"
                )}
              >
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-[9px] font-bold text-ai bg-ai/10 border border-ai/20 px-2 py-0.5 rounded-xs uppercase tracking-wider">
                      {opp.category} Target
                    </span>
                    <span className="text-[10px] text-positive font-bold flex items-center gap-0.5">
                      Potential saving
                    </span>
                  </div>
                  <p className="font-bold text-foreground text-[11px] leading-snug">
                    {opp.recommendation}
                  </p>
                </div>
                
                <div className="border-t border-border/50 pt-2 mt-3 flex justify-between items-center text-[10px]">
                  <span className="text-foreground-muted">Monthly Potentials</span>
                  <span className="font-extrabold text-positive text-xs">₹{opp.potentialSaving.toLocaleString("en-IN")}</span>
                </div>
              </div>
            ))}
          </div>

          {/* Right: Focused opportunity detail & CTAs (7 columns) */}
          <div className="col-span-12 lg:col-span-7">
            <Card className="h-full flex flex-col justify-between hover:border-border-strong transition-all">
              <CardContent className="p-6 flex flex-col justify-between gap-6 h-full font-sans text-xs text-foreground-secondary">
                
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-2">
                      <Sparkles className="h-4.5 w-4.5 text-ai" />
                      <span className="text-[10px] font-bold text-ai uppercase tracking-wider">AI Saving Explainer</span>
                    </div>
                    <span className="font-extrabold text-positive text-base bg-positive/10 border border-positive/20 px-2.5 py-1 rounded-sm">
                      Potential Saving: ₹{activeOpp.potentialSaving.toLocaleString("en-IN")} / month
                    </span>
                  </div>

                  <div className="space-y-2">
                    <h3 className="text-sm font-heading font-extrabold text-foreground leading-snug">
                      {activeOpp.recommendation}
                    </h3>
                    <p className="text-xs leading-relaxed">
                      {activeOpp.details}
                    </p>
                  </div>

                  {/* Comparisons box */}
                  <div className="border border-border/80 rounded-sm overflow-hidden text-xs">
                    <div className="grid grid-cols-2 bg-surface-elevated/45 border-b border-border/75 p-2 font-bold uppercase text-[9px] tracking-wider text-foreground-muted">
                      <span>Attribute Indicator</span>
                      <span className="text-right">Value Details</span>
                    </div>
                    <div className="divide-y divide-border/40">
                      {activeOpp.comparisons.map((comp, idx) => (
                        <div key={idx} className="grid grid-cols-2 p-2.5 items-center">
                          <span className="font-semibold text-foreground text-[11px]">{comp.name}</span>
                          <span className="text-right font-mono font-bold text-foreground">{comp.value}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Opportunity CTAs */}
                <div className="border-t border-border/60 pt-4 space-y-4">
                  <div className="flex flex-col sm:flex-row gap-2.5">
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => setIsTxnModalOpen(true)}
                      className="text-[10px] flex-1 py-2 font-semibold border-border hover:bg-surface-hover hover:border-border-strong text-foreground cursor-pointer"
                    >
                      View Transactions
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => {
                        setSavingGoalName(`Cap excess ${activeOpp.category} spending`);
                        setSavingGoalTarget(activeOpp.potentialSaving.toString());
                        setIsGoalModalOpen(true);
                      }}
                      className="text-[10px] flex-1 py-2 font-semibold border-border hover:bg-surface-hover hover:border-border-strong text-foreground cursor-pointer"
                    >
                      Create Saving Goal
                    </Button>
                    <Button 
                      variant="primary" 
                      size="sm"
                      onClick={() => setIsSimModalOpen(true)}
                      className="text-[10px] flex-1 py-2 font-semibold bg-primary hover:bg-primary/85 text-white border-none cursor-pointer"
                    >
                      Simulate Impact
                    </Button>
                  </div>
                </div>

              </CardContent>
            </Card>
          </div>

        </div>
      </div>

      {/* ==========================================
          MODALS IMPLEMENTATION
          ========================================== */}
      {/* 1. VIEW TRANSACTIONS MODAL */}
      <Modal
        isOpen={isTxnModalOpen}
        onClose={() => setIsTxnModalOpen(false)}
        title={`${activeOpp.category} Transactions Audit`}
        className="w-full max-w-lg"
      >
        <div className="space-y-4">
          <p className="text-xs text-foreground-secondary">
            Ingested transactions matching the flagged category opportunity analysis filter.
          </p>
          <div className="border border-border rounded-sm overflow-hidden text-[11px] font-sans">
            <div className="grid grid-cols-3 bg-surface-elevated/45 border-b border-border/60 p-2 font-bold uppercase tracking-wider text-foreground-muted">
              <span>Merchant</span>
              <span className="text-center">Date</span>
              <span className="text-right">Amount</span>
            </div>
            <div className="divide-y divide-border/30 max-h-56 overflow-y-auto">
              {activeOpp.category === "Food" && (
                <>
                  <div className="grid grid-cols-3 p-2.5 items-center">
                    <span className="font-bold text-foreground">Zomato Food Delivery</span>
                    <span className="text-center text-foreground-secondary">Jul 05, 23:14</span>
                    <span className="text-right font-mono font-bold text-foreground">₹1,580</span>
                  </div>
                  <div className="grid grid-cols-3 p-2.5 items-center">
                    <span className="font-bold text-foreground">Swiggy Delivery Hub</span>
                    <span className="text-center text-foreground-secondary">Jul 04, 21:02</span>
                    <span className="text-right font-mono font-bold text-foreground">₹2,100</span>
                  </div>
                  <div className="grid grid-cols-3 p-2.5 items-center">
                    <span className="font-bold text-foreground">Starbucks Coffee</span>
                    <span className="text-center text-foreground-secondary">Jul 03, 10:15</span>
                    <span className="text-right font-mono font-bold text-foreground">₹850</span>
                  </div>
                </>
              )}
              {activeOpp.category === "Travel" && (
                <>
                  <div className="grid grid-cols-3 p-2.5 items-center">
                    <span className="font-bold text-foreground">Uber Ride Cabs</span>
                    <span className="text-center text-foreground-secondary">Jul 05, 14:20</span>
                    <span className="text-right font-mono font-bold text-foreground">₹320</span>
                  </div>
                  <div className="grid grid-cols-3 p-2.5 items-center">
                    <span className="font-bold text-foreground">Ola Ride Share</span>
                    <span className="text-center text-foreground-secondary">Jul 03, 08:30</span>
                    <span className="text-right font-mono font-bold text-foreground">₹180</span>
                  </div>
                </>
              )}
              {activeOpp.category === "Entertainment" && (
                <>
                  <div className="grid grid-cols-3 p-2.5 items-center">
                    <span className="font-bold text-foreground">Netflix Premium Direct</span>
                    <span className="text-center text-foreground-secondary">Jul 05, 01:10</span>
                    <span className="text-right font-mono font-bold text-foreground">₹1,499</span>
                  </div>
                  <div className="grid grid-cols-3 p-2.5 items-center">
                    <span className="font-bold text-foreground">Amazon Prime Video</span>
                    <span className="text-center text-foreground-secondary">Jul 02, 12:00</span>
                    <span className="text-right font-mono font-bold text-foreground">₹599</span>
                  </div>
                </>
              )}
            </div>
          </div>
          <div className="flex justify-end pt-2">
            <Button variant="outline" size="sm" onClick={() => setIsTxnModalOpen(false)} className="text-[10px] px-4 cursor-pointer">
              Close Audit
            </Button>
          </div>
        </div>
      </Modal>

      {/* 2. CREATE SAVING GOAL MODAL */}
      <Modal
        isOpen={isGoalModalOpen}
        onClose={() => setIsGoalModalOpen(false)}
        title="Create Savings Target Goal"
        className="w-full max-w-sm"
      >
        <form onSubmit={handleCreateGoal} className="space-y-4 font-sans text-xs">
          <div className="space-y-1.5">
            <label className="text-foreground-secondary font-bold block">Goal Name</label>
            <input
              type="text"
              value={savingGoalName}
              onChange={(e) => setSavingGoalName(e.target.value)}
              placeholder="e.g. Cap weekend dining out spend"
              className="w-full h-9 px-3 bg-surface-elevated border border-border text-foreground rounded-sm text-xs focus:border-primary focus:outline-none"
            />
          </div>
          
          <div className="space-y-1.5">
            <label className="text-foreground-secondary font-bold block">Target Monthly Savings (₹)</label>
            <input
              type="number"
              value={savingGoalTarget}
              onChange={(e) => setSavingGoalTarget(e.target.value)}
              placeholder="1000"
              className="w-full h-9 px-3 bg-surface-elevated border border-border text-foreground rounded-sm text-xs focus:border-primary focus:outline-none"
            />
          </div>

          <div className="p-3 bg-positive/5 border border-positive/20 rounded-sm text-[11px] text-foreground-secondary leading-relaxed">
            <strong>Estimated Impact:</strong> Limiting expenditures to this cap contributes to structural reserve index scores and improves default probabilities.
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="outline" size="sm" onClick={() => setIsGoalModalOpen(false)} className="text-[10px] cursor-pointer">
              Cancel
            </Button>
            <Button type="submit" variant="primary" size="sm" className="text-[10px] bg-positive hover:bg-positive/85 text-white border-none cursor-pointer">
              Create Goal
            </Button>
          </div>
        </form>
      </Modal>

      {/* 3. SIMULATE IMPACT MODAL */}
      <Modal
        isOpen={isSimModalOpen}
        onClose={() => setIsSimModalOpen(false)}
        title={`What-If ${activeOpp.category} Spend Simulator`}
        className="w-full max-w-sm"
      >
        <div className="space-y-5 font-sans text-xs text-foreground-secondary">
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="font-bold text-foreground">Simulate Reduction Scale</span>
              <span className="font-mono font-bold text-primary bg-primary/10 px-2 py-0.5 rounded-xs">
                {opportunitySavingsSim[activeOpp.id] || 0}% Off
              </span>
            </div>
            
            {/* Range input slider */}
            <input
              type="range"
              min="0"
              max="50"
              step="5"
              value={opportunitySavingsSim[activeOpp.id] || 0}
              onChange={(e) => setOpportunitySavingsSim(prev => ({
                ...prev,
                [activeOpp.id]: Number(e.target.value)
              }))}
              className="w-full h-1 bg-surface-elevated rounded-lg appearance-none cursor-pointer accent-primary border border-border"
            />
            <div className="flex justify-between text-[9px] text-foreground-muted">
              <span>0% (No Impact)</span>
              <span>25% (Moderate)</span>
              <span>50% (Ambitious)</span>
            </div>
          </div>

          {/* Sandbox math updates */}
          <div className="border border-border/80 p-3.5 rounded-sm bg-surface-elevated/45 space-y-2.5">
            <div className="flex justify-between items-center text-[11px]">
              <span>Current {activeOpp.category} Spend</span>
              <span className="font-bold text-foreground">
                ₹{(categories.find(c => c.name === activeOpp.category)?.amount || 10000).toLocaleString("en-IN")}
              </span>
            </div>
            
            <div className="flex justify-between items-center text-[11px] border-b border-border/40 pb-2">
              <span className="text-positive font-bold">Simulated Monthly Savings</span>
              <span className="font-bold text-positive font-mono">- ₹{simulatedSavingValue.toLocaleString("en-IN")}</span>
            </div>

            <div className="flex justify-between items-center font-bold text-xs pt-1">
              <span>New Overall Monthly Outflow</span>
              <span className="text-foreground">₹{(84200 - simulatedSavingValue).toLocaleString("en-IN")}</span>
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t border-border/60">
            <Button variant="outline" size="sm" onClick={() => setIsSimModalOpen(false)} className="text-[10px] cursor-pointer">
              Cancel
            </Button>
            <Button variant="primary" size="sm" onClick={handleApplySimulator} className="text-[10px] cursor-pointer">
              Apply Simulation
            </Button>
          </div>
        </div>
      </Modal>

    </PageContainer>
  );
}
