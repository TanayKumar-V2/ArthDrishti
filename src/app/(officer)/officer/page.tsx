"use client";

import React, { useState, useEffect, useRef, useMemo, useCallback } from "react";
import { useRouter } from "next/navigation";
import * as echarts from "echarts";
import {
  ClipboardList,
  Users,
  ChevronDown,
  AlertTriangle,
  ThumbsUp,
  ThumbsDown,
  Clock
} from "lucide-react";
import { toast } from "sonner";

import PageContainer from "@/components/ui/PageContainer";
import { Card } from "@/components/ui/Card";
import { cn } from "@/lib/utils";

// ============================================================================
// APPLICANTS TYPE DEFINITIONS
// ============================================================================
interface ApplicantReview {
  id: string;
  name: string;
  avatar: string;
  age: number;
  amount: number;
  defaultProb: number;
  healthScore: number;
  fraudRisk: "Low" | "Medium" | "High";
  aiRec: "Approve" | "Deny" | "Manual Review";
  confidence: number;
  waitTime: string;
}

interface DecisionHistory {
  id: string;
  name: string;
  decision: "Approved" | "Denied";
  officer: string;
  aiRec: "Approve" | "Deny" | "Manual Review";
  confidence: number;
  timestamp: string;
}

const MOCK_APPLICANTS: ApplicantReview[] = [
  {
    id: "app1",
    name: "Rahul Sen",
    avatar: "RS",
    age: 34,
    amount: 650000,
    defaultProb: 42,
    healthScore: 68,
    fraudRisk: "Low",
    aiRec: "Manual Review",
    confidence: 94.2,
    waitTime: "4 Hours"
  },
  {
    id: "app2",
    name: "Priyanka Roy",
    avatar: "PR",
    age: 29,
    amount: 820000,
    defaultProb: 18,
    healthScore: 84,
    fraudRisk: "Low",
    aiRec: "Approve",
    confidence: 96.5,
    waitTime: "8 Hours"
  },
  {
    id: "app3",
    name: "Amit Sharma",
    avatar: "AS",
    age: 42,
    amount: 1200000,
    defaultProb: 72,
    healthScore: 45,
    fraudRisk: "Medium",
    aiRec: "Deny",
    confidence: 91.8,
    waitTime: "1 Day"
  },
  {
    id: "app4",
    name: "Vikram Malhotra",
    avatar: "VM",
    age: 38,
    amount: 450000,
    defaultProb: 28,
    healthScore: 75,
    fraudRisk: "High",
    aiRec: "Manual Review",
    confidence: 89.4,
    waitTime: "2 Days"
  }
];

const INITIAL_DECISIONS: DecisionHistory[] = [
  { id: "d1", name: "Suresh Gupta", decision: "Approved", officer: "Rahul Chahar", aiRec: "Approve", confidence: 95.8, timestamp: "10 mins ago" },
  { id: "d2", name: "Ananya Misra", decision: "Denied", officer: "Rahul Chahar", aiRec: "Deny", confidence: 93.4, timestamp: "1 hour ago" },
  { id: "d3", name: "Karan Johar", decision: "Approved", officer: "Rahul Chahar", aiRec: "Approve", confidence: 91.2, timestamp: "Yesterday" }
];

export default function LoanOfficerCommandCenterPage() {
  const router = useRouter();

  // Applicants & decisions state logs
  const [applicants, setApplicants] = useState<ApplicantReview[]>(MOCK_APPLICANTS);
  const [decisions, setDecisions] = useState<DecisionHistory[]>(INITIAL_DECISIONS);

  // Filters state
  const [searchTerm, setSearchTerm] = useState("");
  const [riskFilter, setRiskFilter] = useState("All");

  // ECharts refs
  const riskChartRef = useRef<HTMLDivElement>(null);
  const funnelChartRef = useRef<HTMLDivElement>(null);
  const densityChartRef = useRef<HTMLDivElement>(null);
  const approvalChartRef = useRef<HTMLDivElement>(null);
  const trendChartRef = useRef<HTMLDivElement>(null);

  // Active chart instances
  const chartInstances = useRef<Record<string, echarts.ECharts | null>>({});

  // Filter application
  const filteredApplicants = useMemo(() => {
    return applicants.filter((a) => {
      const matchSearch = a.name.toLowerCase().includes(searchTerm.toLowerCase());
      const matchRisk =
        riskFilter === "All" ||
        (riskFilter === "High" && a.defaultProb >= 50) ||
        (riskFilter === "Medium" && a.defaultProb >= 25 && a.defaultProb < 50) ||
        (riskFilter === "Low" && a.defaultProb < 25);
      return matchSearch && matchRisk;
    });
  }, [applicants, searchTerm, riskFilter]);

  // Command handlers
  const handleApprove = useCallback((id: string) => {
    const target = applicants.find((a) => a.id === id);
    if (!target) return;

    setApplicants((prev) => prev.filter((a) => a.id !== id));
    setDecisions((prev) => [
      {
        id: `d_${Date.now()}`,
        name: target.name,
        decision: "Approved",
        officer: "Rahul Chahar",
        aiRec: target.aiRec,
        confidence: target.confidence,
        timestamp: "Just Now"
      },
      ...prev
    ]);
    toast.success(`Application for "${target.name}" approved.`);
  }, [applicants]);

  const handleDeny = useCallback((id: string) => {
    const target = applicants.find((a) => a.id === id);
    if (!target) return;

    setApplicants((prev) => prev.filter((a) => a.id !== id));
    setDecisions((prev) => [
      {
        id: `d_${Date.now()}`,
        name: target.name,
        decision: "Denied",
        officer: "Rahul Chahar",
        aiRec: target.aiRec,
        confidence: target.confidence,
        timestamp: "Just Now"
      },
      ...prev
    ]);
    toast.success(`Application for "${target.name}" denied.`);
  }, [applicants]);

  const handleUnderwrite = useCallback((id: string) => {
    toast.info("Entering dedicated AI Underwriting console...");
    router.push(`/officer/underwriting/${id}`);
  }, [router]);

  // Initialize ECharts instances inside workspace
  useEffect(() => {
    const isDark = document.documentElement.classList.contains("dark") || false;
    const gridLineColor = isDark ? "rgba(30, 41, 59, 0.4)" : "rgba(226, 232, 240, 0.6)";
    const textColor = isDark ? "#94A3B8" : "#64748B";

    const disposeAllCharts = () => {
      Object.keys(chartInstances.current).forEach((key) => {
        if (chartInstances.current[key]) {
          chartInstances.current[key]?.dispose();
          chartInstances.current[key] = null;
        }
      });
    };

    disposeAllCharts();

    // 1. RISK DISTRIBUTION (Pie Chart)
    if (riskChartRef.current) {
      const chart = echarts.init(riskChartRef.current);
      chartInstances.current.risk = chart;
      chart.setOption({
        tooltip: { trigger: "item", formatter: "{b}: {c} ({d}%)" },
        series: [
          {
            type: "pie",
            radius: ["40%", "70%"],
            center: ["50%", "50%"],
            avoidLabelOverlap: false,
            itemStyle: { borderRadius: 3 },
            label: { show: false },
            data: [
              { value: 748, name: "Low Risk", itemStyle: { color: "#22c55e" } },
              { value: 376, name: "Medium Risk", itemStyle: { color: "#f97316" } },
              { value: 124, name: "High Risk", itemStyle: { color: "#ef4444" } }
            ]
          }
        ]
      });
    }

    // 2. APPLICATION FUNNEL (Funnel)
    if (funnelChartRef.current) {
      const chart = echarts.init(funnelChartRef.current);
      chartInstances.current.funnel = chart;
      chart.setOption({
        tooltip: { trigger: "item" },
        grid: { top: 10, bottom: 10, left: 10, right: 10 },
        series: [
          {
            type: "funnel",
            left: "10%",
            width: "80%",
            minSize: "10%",
            sort: "descending",
            label: {
              show: true,
              position: "inside",
              fontSize: 8,
              fontFamily: "var(--font-sans)",
              formatter: "{b}"
            },
            data: [
              { value: 1248, name: "Applied", itemStyle: { color: "#4f7cff" } },
              { value: 950, name: "Screened", itemStyle: { color: "#3b82f6" } },
              { value: 680, name: "Credit Checked", itemStyle: { color: "#60a5fa" } },
              { value: 240, name: "Underwriting", itemStyle: { color: "#93c5fd" } },
              { value: 82, name: "Require Review", itemStyle: { color: "#f97316" } }
            ]
          }
        ]
      });
    }

    // 3. DEFAULT PROBABILITY DENSITY (Line)
    if (densityChartRef.current) {
      const chart = echarts.init(densityChartRef.current);
      chartInstances.current.density = chart;
      chart.setOption({
        grid: { top: 15, right: 15, bottom: 20, left: 35 },
        xAxis: {
          type: "category",
          data: ["0-10%", "10-25%", "25-50%", "50-75%", "75-100%"],
          axisLabel: { color: textColor, fontSize: 8 }
        },
        yAxis: {
          type: "value",
          splitLine: { lineStyle: { color: gridLineColor } },
          axisLabel: { color: textColor, fontSize: 8 }
        },
        series: [
          {
            data: [420, 328, 376, 84, 40],
            type: "line",
            smooth: true,
            itemStyle: { color: "#4f7cff" },
            areaStyle: {
              color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
                { offset: 0, color: "rgba(79, 124, 255, 0.15)" },
                { offset: 1, color: "rgba(79, 124, 255, 0)" }
              ])
            }
          }
        ]
      });
    }

    // 4. APPROVAL RATE (Gauge)
    if (approvalChartRef.current) {
      const chart = echarts.init(approvalChartRef.current);
      chartInstances.current.approval = chart;
      chart.setOption({
        series: [
          {
            type: "gauge",
            startAngle: 180,
            endAngle: 0,
            center: ["50%", "75%"],
            radius: "95%",
            min: 0,
            max: 100,
            splitNumber: 5,
            axisLine: {
              lineStyle: {
                width: 6,
                color: [
                  [0.4, "#ef4444"],
                  [0.7, "#f97316"],
                  [1, "#22c55e"]
                ]
              }
            },
            pointer: { show: false },
            axisTick: { show: false },
            splitLine: { show: false },
            axisLabel: { color: textColor, fontSize: 7, distance: -32 },
            detail: {
              fontSize: 16,
              offsetCenter: [0, "-10%"],
              formatter: "{value}%",
              color: isDark ? "#f8fafc" : "#0f172a",
              fontWeight: "bold"
            },
            data: [{ value: 78.4, name: "Approval Rate" }]
          }
        ]
      });
    }

    // 5. PORTFOLIO RISK TREND (Line)
    if (trendChartRef.current) {
      const chart = echarts.init(trendChartRef.current);
      chartInstances.current.trend = chart;
      chart.setOption({
        grid: { top: 15, right: 15, bottom: 20, left: 35 },
        xAxis: {
          type: "category",
          data: ["Feb", "Mar", "Apr", "May", "Jun", "Jul"],
          axisLabel: { color: textColor, fontSize: 8 }
        },
        yAxis: {
          type: "value",
          splitLine: { lineStyle: { color: gridLineColor } },
          axisLabel: { color: textColor, fontSize: 8 }
        },
        series: [
          {
            data: [12.4, 11.8, 14.2, 13.5, 15.8, 14.8],
            type: "line",
            smooth: true,
            itemStyle: { color: "#ef4444" },
            lineStyle: { width: 1.5 }
          }
        ]
      });
    }

    const handleResize = () => {
      Object.keys(chartInstances.current).forEach((key) => {
        chartInstances.current[key]?.resize();
      });
    };

    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
      disposeAllCharts();
    };
  }, []);

  return (
    <PageContainer className="pb-24">
      
      {/* HEADER SUMMARY SECTION */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between pb-3 border-b border-border/60 select-none">
        <div className="space-y-1">
          <h1 className="text-2xl font-bold font-sans tracking-tight text-foreground flex items-center gap-2.5">
            <ClipboardList className="h-6.5 w-6.5 text-primary" /> LOAN INTELLIGENCE CENTER
          </h1>
          <p className="text-xs text-foreground-secondary font-sans">
            Underwriter dashboard auditing active credit pipelines, location anomaly diagnostics, and machine learning underwriting recommendations.
          </p>
        </div>
      </div>

      {/* SUMMARY STATS TILES GRID */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4.5 mt-6 select-none">
        
        {/* Active Applicants */}
        <div className="border border-border bg-surface p-4 rounded-sm flex flex-col justify-between min-h-[95px]">
          <span className="text-[9px] font-bold text-foreground-muted uppercase tracking-wider block">Active Applicants</span>
          <div className="my-1.5 flex items-baseline gap-1.5 font-mono">
            <span className="text-2xl font-extrabold text-foreground tracking-tight">1,248</span>
            <span className="text-[9.5px] text-positive font-sans font-bold flex items-center gap-0.5">
              +4.8%
            </span>
          </div>
          <span className="text-[8.5px] text-foreground-secondary font-sans leading-none">
            Active credit evaluations
          </span>
        </div>

        {/* High Risk Cases */}
        <div className="border border-border bg-surface p-4 rounded-sm flex flex-col justify-between min-h-[95px]">
          <span className="text-[9px] font-bold text-foreground-muted uppercase tracking-wider block">High Risk Cases</span>
          <div className="my-1.5 flex items-baseline gap-1.5 font-mono">
            <span className="text-2xl font-extrabold text-critical tracking-tight">124</span>
            <span className="text-[9.5px] text-critical font-sans font-bold flex items-center gap-0.5">
              +2.1%
            </span>
          </div>
          <span className="text-[8.5px] text-foreground-secondary font-sans leading-none">
            Revolving dues overruns flags
          </span>
        </div>

        {/* Require Review */}
        <div className="border border-border bg-surface p-4 rounded-sm flex flex-col justify-between min-h-[95px]">
          <span className="text-[9px] font-bold text-foreground-muted uppercase tracking-wider block">Requires Review</span>
          <div className="my-1.5 flex items-baseline gap-1.5 font-mono">
            <span className="text-2xl font-extrabold text-warning tracking-tight">82</span>
            <span className="text-[8.5px] bg-warning/10 text-warning px-1.5 py-0.25 rounded-xs border border-warning/15 font-sans font-bold uppercase tracking-wider ml-1">
              URGENT
            </span>
          </div>
          <span className="text-[8.5px] text-foreground-secondary font-sans leading-none">
            Awaiting manual underwriter sign-off
          </span>
        </div>

        {/* Model Confidence */}
        <div className="border border-border bg-surface p-4 rounded-sm flex flex-col justify-between min-h-[95px]">
          <span className="text-[9px] font-bold text-foreground-muted uppercase tracking-wider block">AI Decision Confidence</span>
          <div className="my-1.5 flex items-baseline gap-1.5 font-mono">
            <span className="text-2xl font-extrabold text-positive tracking-tight">91%</span>
            <span className="text-[8.5px] bg-positive/10 text-positive px-1.5 py-0.25 rounded-xs border border-positive/15 font-sans font-bold uppercase tracking-wider ml-1">
              STABLE
            </span>
          </div>
          <span className="text-[8.5px] text-foreground-secondary font-sans leading-none">
            Average ensemble attribution certainty
          </span>
        </div>

      </div>

      {/* ANALYTICS SECTION PANELS GRID (5 CHARTS) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6 mt-6 select-none">
        
        {/* Panel 1: Risk Distribution */}
        <div className="border border-border bg-surface p-4.5 rounded-sm space-y-3">
          <span className="text-[9.5px] font-bold text-foreground-muted uppercase tracking-wider block border-b border-border/40 pb-2">
            Risk Distribution
          </span>
          <div ref={riskChartRef} className="w-full h-32" />
        </div>

        {/* Panel 2: Application Funnel */}
        <div className="border border-border bg-surface p-4.5 rounded-sm space-y-3">
          <span className="text-[9.5px] font-bold text-foreground-muted uppercase tracking-wider block border-b border-border/40 pb-2">
            Application Funnel
          </span>
          <div ref={funnelChartRef} className="w-full h-32" />
        </div>

        {/* Panel 3: Probability Distribution */}
        <div className="border border-border bg-surface p-4.5 rounded-sm space-y-3">
          <span className="text-[9.5px] font-bold text-foreground-muted uppercase tracking-wider block border-b border-border/40 pb-2">
            Probability Distribution
          </span>
          <div ref={densityChartRef} className="w-full h-32" />
        </div>

        {/* Panel 4: Approval Rate */}
        <div className="border border-border bg-surface p-4.5 rounded-sm space-y-3">
          <span className="text-[9.5px] font-bold text-foreground-muted uppercase tracking-wider block border-b border-border/40 pb-2">
            Approval Rate
          </span>
          <div ref={approvalChartRef} className="w-full h-32" />
        </div>

        {/* Panel 5: Portfolio Risk Trend */}
        <div className="border border-border bg-surface p-4.5 rounded-sm space-y-3">
          <span className="text-[9.5px] font-bold text-foreground-muted uppercase tracking-wider block border-b border-border/40 pb-2">
            Portfolio Risk Trend
          </span>
          <div ref={trendChartRef} className="w-full h-32" />
        </div>

      </div>

      {/* CORE WORK GRID (TABLE & SIDEBARS) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mt-6">
        
        {/* COMPACT DATA TABLE AREA (LEFT - 8 COLS) */}
        <div className="lg:col-span-8 space-y-4">
          <Card className="border border-border/80 bg-surface p-5 select-none space-y-5">
            
            <div className="border-b border-border/60 pb-3 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <h3 className="text-xs uppercase tracking-widest text-foreground-muted font-bold flex items-center gap-1.5">
                Awaiting Underwriter Review ({filteredApplicants.length})
              </h3>
              
              {/* Compact table filters */}
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Filter name..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="bg-surface-elevated border border-border rounded-sm py-1.5 px-2.5 text-[10.5px] focus:outline-none focus:ring-1 focus:ring-primary text-foreground font-semibold"
                />
                
                <div className="relative">
                  <select
                    value={riskFilter}
                    onChange={(e) => setRiskFilter(e.target.value)}
                    className="bg-surface-elevated border border-border rounded-sm py-1.5 pl-2.5 pr-8 text-[10.5px] font-semibold text-foreground focus:outline-none focus:ring-1 focus:ring-primary cursor-pointer appearance-none"
                  >
                    <option value="All">All Risks</option>
                    <option value="High">High Risk (&gt;=50%)</option>
                    <option value="Medium">Medium Risk (25-50%)</option>
                    <option value="Low">Low Risk (&lt;25%)</option>
                  </select>
                  <ChevronDown className="h-3 w-3 absolute right-2.5 top-2.5 text-foreground-muted pointer-events-none" />
                </div>
              </div>
            </div>
            {filteredApplicants.length === 0 ? (
              <div className="text-center border border-border border-dashed p-8 rounded-sm bg-surface">
                <Users className="h-8 w-8 text-foreground-muted mx-auto mb-2" />
                <h3 className="text-xs font-bold text-foreground">No applicants found</h3>
                <p className="text-[10px] text-foreground-secondary mt-1">Adjust search parameters above.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-[10.5px] text-left border-collapse">
                  <thead>
                    <tr className="bg-surface-elevated/45 text-[9px] font-bold text-foreground-muted uppercase tracking-wider border-b border-border/60">
                      <th className="py-2.5 px-3">Applicant</th>
                      <th className="py-2.5 px-3 text-right">Loan Amount</th>
                      <th className="py-2.5 px-3 text-right">Default Risk</th>
                      <th className="py-2.5 px-3 text-right">Health Score</th>
                      <th className="py-2.5 px-3">Fraud Risk</th>
                      <th className="py-2.5 px-3">AI Rec</th>
                      <th className="py-2.5 px-3 text-right">Confidence</th>
                      <th className="py-2.5 px-3">Wait Time</th>
                      <th className="py-2.5 px-3 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredApplicants.map((app) => (
                      <tr
                        key={app.id}
                        className="border-b border-border/30 last:border-b-0 hover:bg-surface-elevated/25 font-sans"
                      >
                        <td className="py-3 px-3">
                          <div className="flex items-center gap-2">
                            <div className="h-7 w-7 rounded-full bg-primary/10 border border-primary/25 text-primary flex items-center justify-center font-extrabold text-[10px]">
                              {app.avatar}
                            </div>
                            <div>
                              <span className="font-extrabold text-foreground block">{app.name}</span>
                              <span className="text-[9px] text-foreground-muted block">Age {app.age}</span>
                            </div>
                          </div>
                        </td>
                        <td className="py-3 px-3 text-right font-mono font-bold text-foreground">
                          ₹{app.amount.toLocaleString("en-IN")}
                        </td>
                        <td className={cn(
                          "py-3 px-3 text-right font-mono font-bold",
                          app.defaultProb >= 50 ? "text-critical" : app.defaultProb >= 25 ? "text-warning" : "text-positive"
                        )}>
                          {app.defaultProb}%
                        </td>
                        <td className="py-3 px-3 text-right font-mono font-bold text-foreground">
                          {app.healthScore}
                        </td>
                        <td className="py-3 px-3">
                          <span className={cn(
                            "text-[8px] font-sans font-bold px-1.5 py-0.25 rounded-xs uppercase border",
                            app.fraudRisk === "High"
                              ? "text-critical bg-critical/10 border-critical/20"
                              : app.fraudRisk === "Medium"
                              ? "text-warning bg-warning/10 border-warning/20"
                              : "text-positive bg-positive/10 border-positive/20"
                          )}>
                            {app.fraudRisk}
                          </span>
                        </td>
                        <td className="py-3 px-3">
                          <span className={cn(
                            "text-[8px] font-sans font-bold px-1.5 py-0.25 rounded-xs uppercase border",
                            app.aiRec === "Approve"
                              ? "text-positive bg-positive/15 border-positive/20"
                              : app.aiRec === "Deny"
                              ? "text-critical bg-critical/15 border-critical/20"
                              : "text-warning bg-warning/15 border-warning/20"
                          )}>
                            {app.aiRec}
                          </span>
                        </td>
                        <td className="py-3 px-3 text-right font-mono font-bold text-foreground-secondary">
                          {app.confidence}%
                        </td>
                        <td className="py-3 px-3 font-semibold text-foreground-secondary flex items-center gap-1 mt-1 border-none">
                          <Clock className="h-3 w-3 text-foreground-muted" /> {app.waitTime}
                        </td>
                        <td className="py-3 px-3 text-right">
                          <div className="flex gap-1.5 justify-end">
                            <button
                              onClick={() => handleUnderwrite(app.id)}
                              className="text-[9px] font-bold bg-primary text-primary-foreground px-2 py-1 rounded-xs hover:bg-primary/95 cursor-pointer uppercase font-sans"
                            >
                              Underwrite
                            </button>
                            <button
                              onClick={() => handleApprove(app.id)}
                              className="p-1 rounded-xs border border-border hover:bg-positive/5 hover:text-positive text-foreground-secondary cursor-pointer"
                              title="Approve"
                            >
                              <ThumbsUp className="h-3 w-3" />
                            </button>
                            <button
                              onClick={() => handleDeny(app.id)}
                              className="p-1 rounded-xs border border-border hover:bg-critical/5 hover:text-critical text-foreground-secondary cursor-pointer"
                              title="Deny"
                            >
                              <ThumbsDown className="h-3 w-3" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

          </Card>
        </div>

        {/* AI ALERTS & AUDIT TRAIL AREA (RIGHT - 4 COLS) */}
        <div className="lg:col-span-4 space-y-6 flex flex-col justify-start">
          
          {/* AI Alerts Card */}
          <div className="border border-border bg-surface p-4.5 rounded-sm space-y-3.5 select-none">
            <span className="text-[10px] font-bold text-foreground-muted uppercase tracking-widest block border-b border-border/40 pb-2.5">
              AI Security alerts
            </span>
            <div className="space-y-3 text-xs">
              {[
                { title: "Location mismatch anomaly", text: "Applicant Vikram Malhotra: Swipes velocity location IP does not match cell coordinates.", priority: "High" },
                { title: "Ensemble model discrepancy", text: "Applicant Rahul Sen: LightGBM reports Low risk (18%), but isolation forest signals High fraud risk (78%).", priority: "High" },
                { title: "Asset records check error", text: "Applicant Amit Sharma: Active checking logs display negative balance duration vectors.", priority: "Medium" }
              ].map((al, idx) => (
                <div
                  key={idx}
                  className="bg-surface-elevated/40 border border-border p-3 rounded-xs flex gap-2.5 items-start"
                >
                  <AlertTriangle className="h-4 w-4 text-critical shrink-0 mt-0.5" />
                  <div className="space-y-0.5">
                    <span className="font-bold text-foreground block">{al.title}</span>
                    <p className="text-[10px] text-foreground-secondary leading-relaxed font-sans">{al.text}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Recent Decisions Audit Trail */}
          <div className="border border-border bg-surface p-4.5 rounded-sm space-y-3.5 select-none">
            <span className="text-[10px] font-bold text-foreground-muted uppercase tracking-widest block border-b border-border/40 pb-2.5">
              Recent decisions audit trail
            </span>
            
            <div className="space-y-3 text-xs">
              {decisions.map((dec) => (
                <div
                  key={dec.id}
                  className="bg-surface-elevated/20 border border-border p-3 rounded-xs flex items-center justify-between gap-4 font-sans"
                >
                  <div className="space-y-0.5">
                    <span className="font-extrabold text-foreground block leading-tight">{dec.name}</span>
                    <span className="text-[9px] text-foreground-muted block leading-none">By {dec.officer} • {dec.timestamp}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={cn(
                      "text-[8px] font-bold px-1.5 py-0.25 rounded-xs uppercase border",
                      dec.decision === "Approved"
                        ? "text-positive bg-positive/10 border-positive/20"
                        : "text-critical bg-critical/10 border-critical/20"
                    )}>
                      {dec.decision}
                    </span>
                    <span className="text-[9px] font-mono text-foreground-muted font-bold">
                      {dec.confidence}%
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>

      </div>

    </PageContainer>
  );
}
