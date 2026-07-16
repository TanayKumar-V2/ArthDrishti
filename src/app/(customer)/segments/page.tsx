"use client";

import React, { useState, useMemo, useEffect, useRef, useCallback } from "react";
import { useTheme } from "next-themes";
import * as echarts from "echarts";
import {
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  Tooltip as RechartsTooltip,
  ResponsiveContainer
} from "recharts";
import {
  CheckCircle2,
  SlidersHorizontal,
  TrendingUp,
  Brain,
  User,
  Users,
  Percent
} from "lucide-react";
import { toast } from "sonner";

import PageContainer from "@/components/ui/PageContainer";
import { Card, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";

import { SectionHeader } from "@/components/ui/SectionHeader";
import { cn } from "@/lib/utils";
import {
  mockRadarData,
  mockScatterPoints,
  mockSegmentProfiles,
  RadarDimensionData,
  ScatterPointData,
  SegmentProfile
} from "@/lib/segments_data";

// Custom type definitions for Tooltips
interface CustomRadarTooltipProps {
  active?: boolean;
  payload?: Array<{
    name: string;
    value: number;
    color?: string;
    payload: RadarDimensionData;
  }>;
}

const CustomRadarTooltip = ({ active, payload }: CustomRadarTooltipProps) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div className="bg-surface-elevated border border-border p-3 shadow-xl rounded-sm text-xs font-sans space-y-1.5 min-w-[170px] select-none">
        <p className="font-bold text-foreground border-b border-border/60 pb-1.5 mb-1.5 uppercase tracking-wider text-[9px] text-foreground-muted">
          {data.subject}
        </p>
        <div className="space-y-1 font-mono">
          <div className="flex justify-between items-center gap-4">
            <span className="text-foreground-secondary font-sans">You (Rahul):</span>
            <span className="font-bold text-primary">{data.userValue}/100</span>
          </div>
          <div className="flex justify-between items-center gap-4">
            <span className="text-foreground-muted font-sans">Segment Avg:</span>
            <span className="font-semibold text-foreground-secondary">{data.segmentAverage}/100</span>
          </div>
          <div className="flex justify-between items-center gap-4 border-t border-border/40 pt-1.5 mt-1.5 text-[10px]">
            <span className="text-foreground-muted font-sans">Benchmark Delta:</span>
            <span className={cn(
              "font-bold",
              data.userValue >= data.segmentAverage ? "text-positive" : "text-critical"
            )}>
              {data.userValue >= data.segmentAverage ? "+" : ""}{data.userValue - data.segmentAverage}
            </span>
          </div>
        </div>
      </div>
    );
  }
  return null;
};

// Colors mapping for clusters
const CLUSTER_COLORS = {
  luxury: "#a855f7", // purple
  young_investor: "#6366f1", // indigo
  borrower: "#ef4444", // red
  family: "#f97316", // orange
  student: "#3b82f6", // blue
  retired: "#22c55e" // green
};

export default function CustomerRiskSegmentsPage() {
  const { resolvedTheme } = useTheme();
  const scatterRef = useRef<HTMLDivElement>(null);
  const scatterInstanceRef = useRef<echarts.ECharts | null>(null);

  // Initialize ECharts scatter plot on mount
  useEffect(() => {
    if (!scatterRef.current) return;
    
    const chart = echarts.init(scatterRef.current);
    scatterInstanceRef.current = chart;

    const handleResize = () => {
      chart.resize();
    };
    
    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
      chart.dispose();
      scatterInstanceRef.current = null;
    };
  }, []);

  const [selectedClusterId, setSelectedClusterId] = useState<string>("young_investor");
  const [isLoading, setIsLoading] = useState(true);
  const [isUserProfileOpen, setIsUserProfileOpen] = useState(false);

  // Initial loading pulse simulation
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 550);
    return () => clearTimeout(timer);
  }, []);

  const handleClusterSelect = useCallback((clusterId: string) => {
    setSelectedClusterId(clusterId);
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
    }, 400);
  }, []);

  const legendNameMap = useMemo<Record<string, string>>(() => ({
    "Students": "student",
    "Retired Customers": "retired",
    "Young Investors": "young_investor",
    "Luxury Spenders": "luxury",
    "Budget Families": "family",
    "High-Risk Borrowers": "borrower",
    "You (Rahul)": "young_investor"
  }), []);

  const getClusterOpacity = useCallback((clusterId: string) => {
    if (selectedClusterId === "all") return 0.85;
    return selectedClusterId === clusterId ? 0.95 : 0.15;
  }, [selectedClusterId]);

  const handleUserClick = useCallback(() => {
    setIsUserProfileOpen(true);
    handleClusterSelect("young_investor");
    toast.success("Rahul Chahar's structural audit profile loaded.");
  }, [handleClusterSelect]);

  // Scatter points are always fully visible for cluster explorer
  const filteredScatterPoints = mockScatterPoints;

  // Derive dynamic zoom bounds based on active cluster selection
  const chartDomains = useMemo(() => {
    switch (selectedClusterId) {
      case "student":
        return { x: [0, 5], y: [0, 25] };
      case "retired":
        return { x: [3, 9], y: [40, 70] };
      case "young_investor":
        return { x: [8, 18], y: [30, 55] };
      case "luxury":
        return { x: [15, 35], y: [5, 30] };
      case "family":
        return { x: [6, 13], y: [20, 40] };
      case "borrower":
        return { x: [2, 8], y: [0, 15] };
      case "all":
      default:
        return { x: [0, 35], y: [0, 70] };
    }
  }, [selectedClusterId]);

  // Extract separate scatter series to feed Recharts legend properly
  const clusterSeries = useMemo(() => {
    const points = filteredScatterPoints;
    
    // Group all non-user points by clusterId
    const students = points.filter((p) => p.clusterId === "student" && !p.isCurrentUser);
    const retired = points.filter((p) => p.clusterId === "retired" && !p.isCurrentUser);
    const investors = points.filter((p) => p.clusterId === "young_investor" && !p.isCurrentUser);
    const luxury = points.filter((p) => p.clusterId === "luxury" && !p.isCurrentUser);
    const family = points.filter((p) => p.clusterId === "family" && !p.isCurrentUser);
    const borrowers = points.filter((p) => p.clusterId === "borrower" && !p.isCurrentUser);
    
    // User point is always isolated for premium pulsing custom marker shape
    const userPoint = mockScatterPoints.find((p) => p.isCurrentUser);

    return {
      student: students,
      retired: retired,
      young_investor: investors,
      luxury: luxury,
      family: family,
      borrower: borrowers,
      user: userPoint ? [userPoint] : []
    };
  }, [filteredScatterPoints]);

  // Active Segment Profile details
  const activeProfile = useMemo<SegmentProfile>(() => {
    // If 'all' is selected, default details show the user's actual persona
    const profileKey = selectedClusterId === "all" ? "young_investor" : selectedClusterId;
    return mockSegmentProfiles[profileKey];
  }, [selectedClusterId]);
  // Update ECharts loading state
  useEffect(() => {
    const chart = scatterInstanceRef.current;
    if (!chart) return;

    if (isLoading) {
      chart.showLoading({
        text: "",
        color: "#4F7CFF",
        textColor: resolvedTheme === "dark" ? "#F8FAFC" : "#0F172A",
        maskColor: resolvedTheme === "dark" ? "rgba(14, 20, 33, 0.45)" : "rgba(255, 255, 255, 0.45)",
        zlevel: 0
      });
    } else {
      chart.hideLoading();
    }
  }, [isLoading, resolvedTheme]);

  // Update ECharts options when active cluster selection, zoom domains or theme changes
  useEffect(() => {
    const chart = scatterInstanceRef.current;
    if (!chart || isLoading) return;

    const isDark = resolvedTheme === "dark";
    const textColor = isDark ? "#94A3B8" : "#64748B"; // var(--foreground-secondary)
    const gridLineColor = isDark ? "rgba(30, 41, 59, 0.6)" : "rgba(226, 232, 240, 0.6)";

    // Setup options
    const option: echarts.EChartsOption = {
      animation: true,
      animationDuration: 550,
      grid: {
        top: 35,
        right: 25,
        bottom: 45,
        left: 45,
        containLabel: false
      },
      toolbox: {
        right: 10,
        top: 5,
        feature: {
          restore: {
            title: "Reset View"
          }
        },
        iconStyle: {
          borderColor: isDark ? "#94A3B8" : "#64748B"
        }
      },
      dataZoom: [
        {
          type: "inside",
          xAxisIndex: 0,
          yAxisIndex: 0,
          filterMode: "none"
        }
      ],
      legend: {
        show: true,
        top: 0,
        left: "center",
        itemWidth: 8,
        itemHeight: 8,
        textStyle: {
          color: textColor,
          fontSize: 9,
          fontFamily: "var(--font-sans)"
        },
        selectedMode: true,
        data: [
          "Students",
          "Retired Customers",
          "Young Investors",
          "Luxury Spenders",
          "Budget Families",
          "High-Risk Borrowers",
          "You (Rahul)"
        ]
      },
      tooltip: {
        trigger: "item",
        formatter: (params: unknown) => {
          const paramObj = params as { data: { value: [number, number]; customData: ScatterPointData } };
          const data = paramObj.data?.customData;
          if (!data) return "";

          const formattedIncome = data.x.toFixed(1);
          const isCurrentUser = data.isCurrentUser;
          
          const html = `
            <div style="background-color: ${isDark ? "#131B2B" : "#F8FAFC"}; border: 1px solid ${isDark ? "#1E293B" : "#E2E8F0"}; padding: 14px; border-radius: 4px; font-family: var(--font-sans), sans-serif; min-width: 190px; color: ${isDark ? "#F8FAFC" : "#0F172A"}; font-size: 12px; box-shadow: 0 10px 15px -3px rgba(0,0,0,0.1), 0 4px 6px -4px rgba(0,0,0,0.1); select: none;">
              <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid ${isDark ? "rgba(30, 41, 59, 0.6)" : "rgba(226, 232, 240, 0.6)"}; padding-bottom: 6px; margin-bottom: 6px;">
                <span style="font-weight: bold; font-size: 11px;">${data.label}</span>
                ${isCurrentUser ? `
                  <span style="font-size: 8px; font-weight: bold; text-transform: uppercase; padding: 1px 6px; border-radius: 2px; color: #f59e0b; background-color: rgba(245, 158, 11, 0.1); border: 1px solid rgba(245, 158, 11, 0.25);">Current User</span>
                ` : ""}
              </div>
              
              <div style="font-family: var(--font-mono), monospace; font-size: 11.5px; line-height: 1.6;">
                <div style="display: flex; justify-content: space-between;">
                  <span style="font-family: var(--font-sans), sans-serif; color: ${isDark ? "#64748B" : "#94A3B8"};">Group:</span>
                  <span style="font-weight: 500;">${data.clusterName}</span>
                </div>
                <div style="display: flex; justify-content: space-between;">
                  <span style="font-family: var(--font-sans), sans-serif; color: ${isDark ? "#64748B" : "#94A3B8"};">Annual Income:</span>
                  <span style="font-weight: bold;">₹${formattedIncome} Lakhs</span>
                </div>
                <div style="display: flex; justify-content: space-between;">
                  <span style="font-family: var(--font-sans), sans-serif; color: ${isDark ? "#64748B" : "#94A3B8"};">Savings Rate:</span>
                  <span style="font-weight: bold;">${data.y}%</span>
                </div>
              </div>
            </div>
          `;
          return html;
        }
      },
      xAxis: {
        type: "value",
        name: "Annual Income (₹ Lakhs)",
        nameLocation: "middle",
        nameGap: 24,
        nameTextStyle: {
          color: textColor,
          fontSize: 9,
          fontWeight: "bold",
          fontFamily: "var(--font-sans)"
        },
        min: chartDomains.x[0],
        max: chartDomains.x[1],
        axisLine: { show: false },
        axisTick: { show: false },
        splitLine: {
          lineStyle: {
            color: gridLineColor
          }
        },
        axisLabel: {
          color: textColor,
          fontSize: 10,
          fontFamily: "var(--font-sans)",
          formatter: "{value} L"
        }
      },
      yAxis: {
        type: "value",
        name: "Savings Rate (%)",
        nameLocation: "middle",
        nameGap: 26,
        nameTextStyle: {
          color: textColor,
          fontSize: 9,
          fontWeight: "bold",
          fontFamily: "var(--font-sans)"
        },
        min: chartDomains.y[0],
        max: chartDomains.y[1],
        axisLine: { show: false },
        axisTick: { show: false },
        splitLine: {
          lineStyle: {
            color: gridLineColor
          }
        },
        axisLabel: {
          color: textColor,
          fontSize: 10,
          fontFamily: "var(--font-sans)",
          formatter: "{value}%"
        }
      },
      series: [
        {
          name: "Students",
          type: "scatter",
          data: clusterSeries.student.map((p) => ({
            value: [p.x, p.y],
            customData: p
          })),
          symbolSize: 8,
          itemStyle: {
            color: CLUSTER_COLORS.student,
            opacity: getClusterOpacity("student")
          },
          emphasis: {
            scale: 1.25,
            itemStyle: { opacity: 1.0 }
          }
        },
        {
          name: "Retired Customers",
          type: "scatter",
          data: clusterSeries.retired.map((p) => ({
            value: [p.x, p.y],
            customData: p
          })),
          symbolSize: 8,
          itemStyle: {
            color: CLUSTER_COLORS.retired,
            opacity: getClusterOpacity("retired")
          },
          emphasis: {
            scale: 1.25,
            itemStyle: { opacity: 1.0 }
          }
        },
        {
          name: "Young Investors",
          type: "scatter",
          data: clusterSeries.young_investor.map((p) => ({
            value: [p.x, p.y],
            customData: p
          })),
          symbolSize: 8,
          itemStyle: {
            color: CLUSTER_COLORS.young_investor,
            opacity: getClusterOpacity("young_investor")
          },
          emphasis: {
            scale: 1.25,
            itemStyle: { opacity: 1.0 }
          }
        },
        {
          name: "Luxury Spenders",
          type: "scatter",
          data: clusterSeries.luxury.map((p) => ({
            value: [p.x, p.y],
            customData: p
          })),
          symbolSize: 8,
          itemStyle: {
            color: CLUSTER_COLORS.luxury,
            opacity: getClusterOpacity("luxury")
          },
          emphasis: {
            scale: 1.25,
            itemStyle: { opacity: 1.0 }
          }
        },
        {
          name: "Budget Families",
          type: "scatter",
          data: clusterSeries.family.map((p) => ({
            value: [p.x, p.y],
            customData: p
          })),
          symbolSize: 8,
          itemStyle: {
            color: CLUSTER_COLORS.family,
            opacity: getClusterOpacity("family")
          },
          emphasis: {
            scale: 1.25,
            itemStyle: { opacity: 1.0 }
          }
        },
        {
          name: "High-Risk Borrowers",
          type: "scatter",
          data: clusterSeries.borrower.map((p) => ({
            value: [p.x, p.y],
            customData: p
          })),
          symbolSize: 8,
          itemStyle: {
            color: CLUSTER_COLORS.borrower,
            opacity: getClusterOpacity("borrower")
          },
          emphasis: {
            scale: 1.25,
            itemStyle: { opacity: 1.0 }
          }
        },
        {
          name: "You (Rahul)",
          type: "scatter",
          data: clusterSeries.user.map((p) => ({
            value: [p.x, p.y],
            customData: p
          })),
          symbolSize: 13,
          itemStyle: {
            color: "#f59e0b",
            borderColor: "#ffffff",
            borderWidth: 2,
            shadowBlur: 8,
            shadowColor: "rgba(245, 158, 11, 0.8)",
            opacity: 1.0
          },
          z: 10,
          emphasis: {
            scale: 1.3
          }
        }
      ]
    };

    chart.setOption(option, true);

    // Setup interactive event listeners
    const handlePointClick = (params: unknown) => {
      const paramObj = params as { seriesName: string; data: { value: [number, number]; customData: ScatterPointData } };
      if (paramObj.seriesName === "You (Rahul)" || (paramObj.data && paramObj.data.customData?.isCurrentUser)) {
        handleUserClick();
      } else if (paramObj.data && paramObj.data.customData) {
        const pObj = paramObj.data.customData;
        handleClusterSelect(pObj.clusterId);
        toast.success(`Selected customer point: ${pObj.label} (${pObj.clusterName})`);
      }
    };

    chart.off("click");
    chart.on("click", handlePointClick);

  }, [clusterSeries, resolvedTheme, chartDomains, selectedClusterId, isLoading, getClusterOpacity, handleUserClick, handleClusterSelect]);

  // Intercept legend clicks to select clusters instead of hiding series
  useEffect(() => {
    const chart = scatterInstanceRef.current;
    if (!chart) return;

    const handleLegendSelectChanged = (params: unknown) => {
      const paramObj = params as { name: string };
      chart.dispatchAction({
        type: "legendAllSelect"
      });

      const clusterId = legendNameMap[paramObj.name];
      if (clusterId) {
        handleClusterSelect(clusterId);
      }
    };

    chart.off("legendselectchanged");
    chart.on("legendselectchanged", handleLegendSelectChanged);
  }, [legendNameMap, handleClusterSelect]);
  return (
    <PageContainer className="pb-24">
      
      {/* Page Header */}
      <SectionHeader
        title="Customer Risk Segmentation"
        description="Review financial behavioral persona mappings, compare metrics against segment averages, and explore customer clusters."
        actions={
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              toast.info("Opening ML Segmentation model configuration settings...");
            }}
            className="gap-2 cursor-pointer font-semibold select-none"
          >
            <SlidersHorizontal className="h-4 w-4" />
            Model Configuration
          </Button>
        }
      />

      {/* 1. HERO - FINANCIAL PERSONA MAPPING */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6 select-none">
        
        {/* Persona Header Card */}
        <Card className="col-span-12 md:col-span-8 bg-surface border border-border/80 relative overflow-hidden flex flex-col justify-between">
          <CardContent className="p-5 md:p-6 space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-xs font-sans font-medium text-foreground-secondary uppercase tracking-wider">
                Assigned Financial Persona
              </span>
              <Brain className="h-5 w-5 text-primary" />
            </div>

            <div className="space-y-2">
              <h2 className="text-2xl sm:text-3xl font-semibold font-sans tracking-tight text-foreground">
                YOUNG INVESTOR
              </h2>
              <p className="text-xs text-foreground-secondary leading-relaxed max-w-2xl font-sans">
                You demonstrate strong systematic investment activity, stable professional salary credits, low debt exposure ratios, and long-term saving patterns.
              </p>
            </div>
          </CardContent>
          <div className="h-1.5 bg-primary w-full" />
        </Card>

        {/* Confidence Card */}
        <Card className="col-span-12 md:col-span-4 bg-surface border border-border/80 relative overflow-hidden flex flex-col justify-between">
          <CardContent className="p-5 md:p-6 space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-xs font-sans font-medium text-foreground-secondary uppercase tracking-wider">
                Model Confidence
              </span>
              <CheckCircle2 className="h-5 w-5 text-ai" />
            </div>

            <div className="space-y-3">
              <div className="flex items-baseline gap-1.5">
                <span className="text-2xl sm:text-3xl font-semibold font-mono tracking-tight text-foreground block">
                  89%
                </span>
                <span className="text-[10px] font-sans font-bold uppercase tracking-wider text-ai bg-ai/10 border border-ai/20 px-1.5 py-0.25 rounded-xs">
                  Active
                </span>
              </div>
              <p className="text-[10px] text-foreground-muted leading-relaxed font-sans">
                Behavioral vectors show high mathematical affinity to the cluster centroid.
              </p>
            </div>
          </CardContent>
          <div className="h-1.5 bg-ai w-full" />
        </Card>
      </div>

      {/* 2. PERSONA VISUALIZATION & COMPARISON GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Radar Chart (7 Columns) */}
        <Card className="col-span-12 lg:col-span-7 border border-border/80 bg-surface p-5 md:p-6 flex flex-col justify-between min-h-[380px]">
          <div className="border-b border-border/60 pb-3 select-none">
            <h3 className="text-xs font-sans font-bold text-foreground-muted uppercase tracking-widest">
              Behavioral Radar Attribution
            </h3>
            <p className="text-[11px] text-foreground-secondary mt-0.5">
              Vector coordinates mapping User attributes overlaying segment averages.
            </p>
          </div>

          <div className="flex-1 w-full min-h-[250px] flex items-center justify-center">
            {isLoading ? (
              <div className="flex flex-col items-center justify-center gap-3">
                <div className="h-28 w-28 rounded-full border-4 border-border border-t-primary animate-spin" />
                <span className="text-[10px] text-foreground-muted uppercase font-sans">Recalculating radar bounds...</span>
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={260}>
                <RadarChart cx="50%" cy="50%" outerRadius="75%" data={mockRadarData}>
                  <PolarGrid stroke="var(--border)" className="opacity-70" />
                  <PolarAngleAxis
                    dataKey="subject"
                    tick={{ fill: "var(--foreground-secondary)", fontSize: 9, fontWeight: "medium" }}
                  />
                  <PolarRadiusAxis
                    angle={30}
                    domain={[0, 100]}
                    tick={{ fill: "var(--foreground-muted)", fontSize: 8 }}
                    axisLine={false}
                  />
                  <RechartsTooltip content={<CustomRadarTooltip />} />
                  
                  {/* Segment Average Radar (Dashed Line, subtle) */}
                  <Radar
                    name="Young Investor Average"
                    dataKey="segmentAverage"
                    stroke="var(--foreground-muted)"
                    fill="var(--foreground-muted)"
                    fillOpacity={0.06}
                    strokeWidth={1.5}
                    strokeDasharray="4 4"
                  />
                  {/* User Radar (Solid Area, primary color) */}
                  <Radar
                    name="You (Rahul)"
                    dataKey="userValue"
                    stroke="var(--primary)"
                    fill="var(--primary)"
                    fillOpacity={0.2}
                    strokeWidth={2}
                  />
                </RadarChart>
              </ResponsiveContainer>
            )}
          </div>
        </Card>

        {/* You vs Segment average benchmark list (5 Columns) */}
        <Card className="col-span-12 lg:col-span-5 border border-border/80 bg-surface p-5 md:p-6 select-none flex flex-col justify-between">
          <div className="border-b border-border/60 pb-3">
            <h3 className="text-xs font-sans font-bold text-foreground-muted uppercase tracking-widest">
              You vs Segment Benchmark
            </h3>
            <p className="text-[11px] text-foreground-secondary mt-0.5">
              Detailed dimension delta audit analysis.
            </p>
          </div>

          <div className="flex-1 divide-y divide-border/50 overflow-y-auto max-h-[260px] pr-1 py-1 space-y-3 pt-3">
            {mockRadarData.map((dim) => {
              const delta = dim.userValue - dim.segmentAverage;
              const isPositive = delta >= 0;
              return (
                <div key={dim.subject} className="flex justify-between items-center py-2.5 text-xs first:pt-0">
                  <div className="space-y-0.5 font-sans">
                    <span className="font-semibold text-foreground block">{dim.subject}</span>
                    <span className="text-[10px] text-foreground-muted">Segment Average: {dim.segmentAverage}</span>
                  </div>
                  
                  <div className="flex items-center gap-3 font-mono">
                    <span className="font-bold text-foreground">{dim.userValue}</span>
                    <span className={cn(
                      "text-[10px] font-bold px-1.5 py-0.5 rounded-xs border w-12 text-center",
                      isPositive ? "bg-positive/10 text-positive border-positive/20" : "bg-critical/10 text-critical border-critical/20"
                    )}>
                      {isPositive ? "+" : ""}{delta}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </Card>
      </div>

      {/* 3. INTERACTIVE CLUSTER EXPLORER */}
      <Card className="border border-border/80 bg-surface p-5 md:p-6 flex flex-col justify-between gap-5 min-h-[460px]">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between border-b border-border/60 pb-4 select-none">
          <div className="space-y-1">
            <h3 className="text-xs uppercase tracking-widest text-foreground-muted font-bold">
              Interactive Cluster Explorer
            </h3>
            <p className="text-[11px] text-foreground-secondary">
              Scatter projection mapping individual customer records across Income (X-axis) and Savings Rate (Y-axis).
            </p>
          </div>

          {/* Cluster Selection dropdown */}
          <div className="flex items-center gap-2 self-end sm:self-center">
            <span className="text-[10px] font-sans font-bold text-foreground-muted uppercase">Focus Cluster:</span>
            <select
              value={selectedClusterId}
              onChange={(e) => handleClusterSelect(e.target.value)}
              className="bg-surface-elevated text-xs border border-border px-3 py-1.5 rounded-sm font-sans focus:outline-none focus:ring-1 focus:ring-primary text-foreground cursor-pointer"
            >
              <option value="all">All Clusters (Show Overview)</option>
              <option value="young_investor">Young Investors (Your Cohort)</option>
              <option value="luxury">Luxury Spenders</option>
              <option value="borrower">High-Risk Borrowers</option>
              <option value="family">Budget Families</option>
              <option value="student">Students</option>
              <option value="retired">Retired Customers</option>
            </select>
          </div>
        </div>

        {/* Scatter Chart View */}
        <div className="flex-1 min-h-[310px] w-full flex flex-col justify-end relative">
          <div ref={scatterRef} className="w-full h-full min-h-[310px]" />
        </div>
      </Card>

      {/* 4. SEGMENT CHARACTERISTICS & AI INSIGHTS GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 select-none">
        
        {/* Segment Characteristics (6 Columns) */}
        <div className="col-span-12 lg:col-span-6 space-y-4">
          <div className="border-b border-border/60 pb-3">
            <h3 className="text-lg font-heading font-semibold text-foreground flex items-center gap-2">
              <Users className="h-5 w-5 text-primary" /> Segment Characteristics
            </h3>
            <p className="text-xs text-foreground-secondary">
              Numerical averages and behavior summaries for the selected cohort: <span className="font-bold text-foreground">{activeProfile.name}</span>.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Typical Income */}
            <Card className="bg-surface border border-border/80 p-4 space-y-1">
              <span className="text-[10px] font-sans font-bold uppercase tracking-wider text-foreground-muted block">Typical Income</span>
              <span className="font-mono text-sm font-bold text-foreground block pt-1">{activeProfile.typicalIncome}</span>
            </Card>

            {/* Savings Rate */}
            <Card className="bg-surface border border-border/80 p-4 space-y-1">
              <span className="text-[10px] font-sans font-bold uppercase tracking-wider text-foreground-muted block">Savings Rate</span>
              <span className="font-mono text-sm font-bold text-foreground block pt-1">{activeProfile.savingsRate}</span>
            </Card>

            {/* Debt Level */}
            <Card className="bg-surface border border-border/80 p-4 space-y-1">
              <span className="text-[10px] font-sans font-bold uppercase tracking-wider text-foreground-muted block">Debt Level</span>
              <span className="font-sans text-sm font-bold text-foreground block pt-1">{activeProfile.debtLevel}</span>
            </Card>

            {/* Investment Activity */}
            <Card className="bg-surface border border-border/80 p-4 space-y-1">
              <span className="text-[10px] font-sans font-bold uppercase tracking-wider text-foreground-muted block">Investment Activity</span>
              <span className="font-sans text-sm font-bold text-foreground block pt-1 truncate">{activeProfile.investmentActivity}</span>
            </Card>

            {/* Risk Profile */}
            <Card className="bg-surface border border-border/80 p-4 space-y-1">
              <span className="text-[10px] font-sans font-bold uppercase tracking-wider text-foreground-muted block">Risk Profile</span>
              <div className="pt-1">
                <span className={cn(
                  "text-[10px] font-sans font-bold uppercase px-2 py-0.5 border rounded-xs select-none",
                  activeProfile.riskProfile === "Low" ? "bg-positive/10 text-positive border-positive/20" :
                  activeProfile.riskProfile === "Medium" ? "bg-primary/10 text-primary border-primary/20" :
                  "bg-critical/10 text-critical border-critical/20"
                )}>
                  {activeProfile.riskProfile}
                </span>
              </div>
            </Card>

            {/* Spending Behavior */}
            <Card className="bg-surface border border-border/80 p-4 space-y-1">
              <span className="text-[10px] font-sans font-bold uppercase tracking-wider text-foreground-muted block">Spending Behavior</span>
              <span className="font-sans text-sm font-bold text-foreground block pt-1">{activeProfile.spendingBehavior}</span>
            </Card>
          </div>
          
          {/* Accessible Alternative description block */}
          <Card className="bg-surface border border-border/80 p-4 space-y-2 select-none">
            <span className="text-[10px] font-sans font-bold uppercase tracking-wider text-foreground-muted block">Accessible Segment Description</span>
            <p className="text-xs text-foreground-secondary leading-relaxed font-sans">
              {activeProfile.description}
            </p>
          </Card>
        </div>

        {/* AI Insights (6 Columns) */}
        <div className="col-span-12 lg:col-span-6 space-y-4">
          <div className="border-b border-border/60 pb-3">
            <h3 className="text-lg font-heading font-semibold text-foreground flex items-center gap-2">
              <Brain className="h-5 w-5 text-ai" /> AI Behavioral Diagnostics
            </h3>
            <p className="text-xs text-foreground-secondary">
              Explains affinity vectors, segment boundary drivers, and recommendations.
            </p>
          </div>

          <div className="space-y-4 text-xs font-sans text-foreground-secondary leading-relaxed">
            
            {/* Why belongs & differentiators */}
            <Card className="bg-surface border border-border/80 p-4 space-y-3">
              <div className="space-y-1">
                <span className="font-bold text-foreground block flex items-center gap-1.5">
                  <User className="h-4 w-4 text-primary" /> Behavioral Affinity Drivers
                </span>
                <p className="text-foreground-secondary">
                  {activeProfile.whyBelongs}
                </p>
              </div>
              <div className="space-y-1 pt-2 border-t border-border/40">
                <span className="font-bold text-foreground block flex items-center gap-1.5">
                  <Percent className="h-4 w-4 text-primary" /> Key Benchmark Differentiators
                </span>
                <p className="text-foreground-secondary">
                  {activeProfile.differentiators}
                </p>
              </div>
            </Card>

            {/* Future movement */}
            <Card className="bg-surface border border-border/80 p-4 space-y-1">
              <span className="font-bold text-foreground block flex items-center gap-1.5">
                <TrendingUp className="h-4 w-4 text-ai" /> Predicted Migration Runway
              </span>
              <p className="text-foreground-secondary">
                {activeProfile.futureMovement}
              </p>
            </Card>

            {/* Recommended Checklist */}
            <Card className="bg-surface border border-border/80 p-4 space-y-2.5">
              <span className="font-bold text-foreground block flex items-center gap-1.5">
                <CheckCircle2 className="h-4 w-4 text-positive" /> Recommended Actions Checklist
              </span>
              <ul className="list-disc pl-5 space-y-1.5 text-foreground-secondary">
                {activeProfile.recommendedActions.map((action, idx) => (
                  <li key={idx}>{action}</li>
                ))}
              </ul>
            </Card>

          </div>
        </div>

      </div>

      {/* CURRENT USER AUDIT PROFILE MODAL OVERLAY */}
      {isUserProfileOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs select-none">
          <div className="bg-surface-elevated border border-border max-w-md w-full p-6 rounded-sm shadow-2xl relative animate-in fade-in zoom-in duration-200">
            <button 
              onClick={() => setIsUserProfileOpen(false)}
              className="absolute top-4 right-4 text-foreground-muted hover:text-foreground cursor-pointer text-base animate-pulse"
              title="Close modal overlay"
            >
              ✕
            </button>
            <div className="space-y-4">
              <div className="flex items-center gap-3 border-b border-border/60 pb-3">
                <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-lg">
                  RC
                </div>
                <div>
                  <h3 className="font-heading font-semibold text-lg text-foreground">Rahul Chahar</h3>
                  <span className="text-[10px] uppercase font-mono font-bold text-foreground-muted">Account Ref: AC-8902-IN</span>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4 text-xs">
                <div>
                  <span className="text-foreground-muted block text-[9px] uppercase font-sans">Financial Persona</span>
                  <span className="font-semibold text-foreground block mt-0.5">Young Investor</span>
                </div>
                <div>
                  <span className="text-foreground-muted block text-[9px] uppercase font-sans">Segment Affinity</span>
                  <span className="font-semibold text-ai block mt-0.5">89% Match</span>
                </div>
                <div>
                  <span className="text-foreground-muted block text-[9px] uppercase font-sans">Annual Income</span>
                  <span className="font-mono font-bold text-foreground block mt-0.5">₹14.0 Lakhs</span>
                </div>
                <div>
                  <span className="text-foreground-muted block text-[9px] uppercase font-sans">Savings Rate</span>
                  <span className="font-mono font-bold text-foreground block mt-0.5">42%</span>
                </div>
                <div>
                  <span className="text-foreground-muted block text-[9px] uppercase font-sans">DTI Leverage Ratio</span>
                  <span className="font-mono font-bold text-foreground block mt-0.5">24%</span>
                </div>
                <div>
                  <span className="text-foreground-muted block text-[9px] uppercase font-sans">Investment Index</span>
                  <span className="font-mono font-bold text-foreground block mt-0.5">90/100</span>
                </div>
              </div>

              <div className="border-t border-border/60 pt-3.5 space-y-2">
                <span className="font-bold text-xs text-foreground block flex items-center gap-1.5">
                  <Brain className="h-4 w-4 text-ai animate-pulse" /> Persona Vector Analysis
                </span>
                <p className="text-[11.5px] text-foreground-secondary leading-relaxed font-sans">
                  Rahul falls squarely within the Young Investor cluster centroid. High stability in monthly salary deposits coupled with automatic SIP investment sweeps outweighs small discretionary spikes. Repayments (DTI 24%) are fully hedged by liquid runway buffers.
                </p>
              </div>

              <div className="flex justify-end pt-2">
                <Button variant="primary" size="sm" onClick={() => setIsUserProfileOpen(false)} className="cursor-pointer font-semibold">
                  Dismiss Audit Profile
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

    </PageContainer>
  );
}
