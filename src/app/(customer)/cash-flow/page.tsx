"use client";

import React, { useState, useMemo, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { useTheme } from "next-themes";
import * as echarts from "echarts";
import {
  Calendar,
  TrendingDown,
  ShieldCheck,
  Info,
  CheckCircle2,
  SlidersHorizontal,
  ShieldAlert,
  ArrowUpRight,
  Wallet,
  Zap,
  Coffee,
  Briefcase,
  Home,
  HelpCircle,
  Clock,
  ChevronDown,
  Download
} from "lucide-react";
import { toast } from "sonner";

import PageContainer from "@/components/ui/PageContainer";
import { Card, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Popover } from "@/components/ui/Overlays";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { cn } from "@/lib/utils";
import { 
  mock7DaysCashFlow, 
  mock30DaysCashFlow, 
  mock6MonthsCashFlow, 
  mockFutureEvents, 
  mockExpenseForecast
} from "@/lib/cash_flow_data";

export default function CashFlowForecastPage() {
  const router = useRouter();
  const { resolvedTheme } = useTheme();
  const chartRef = useRef<HTMLDivElement>(null);
  const chartInstanceRef = useRef<echarts.ECharts | null>(null);

  // Initialize ECharts instance on mount
  useEffect(() => {
    if (!chartRef.current) return;
    
    const chart = echarts.init(chartRef.current);
    chartInstanceRef.current = chart;

    const handleResize = () => {
      chart.resize();
    };
    
    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
      chart.dispose();
      chartInstanceRef.current = null;
    };
  }, []);


  // Period filter states: '7D' | '30D' | '6M'
  const [activePeriod, setActivePeriod] = useState<"7D" | "30D" | "6M">("30D");
  const [isLoading, setIsLoading] = useState(true);

  // Initial loading pulse simulation
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 550);
    return () => clearTimeout(timer);
  }, []);

  const handlePeriodChange = (period: "7D" | "30D" | "6M") => {
    setActivePeriod(period);
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
    }, 450);
  };

  // Derive active dataset and values based on selected period
  const periodConfig = useMemo(() => {
    switch (activePeriod) {
      case "7D":
        return {
          data: mock7DaysCashFlow,
          expectedBalance: 506000,
          confidence: 95,
          status: "STABLE",
          dateRangeText: "NEXT 7 DAYS",
          todayX: "Jul 09",
          lowestBalance: 506000,
          expectedIncome: 0,
          expectedExpenses: 5000,
          expectedSavings: -5000,
          savingsPercent: "N/A",
          risk: "LOW RISK"
        };
      case "6M":
        return {
          data: mock6MonthsCashFlow,
          expectedBalance: 510000,
          confidence: 88,
          status: "POSITIVE",
          dateRangeText: "NEXT 6 MONTHS",
          todayX: "Jul 26",
          lowestBalance: 320000,
          expectedIncome: 2210000,
          expectedExpenses: 1540000,
          expectedSavings: 670000,
          savingsPercent: "+30.3%",
          risk: "LOW RISK"
        };
      case "30D":
      default:
        return {
          data: mock30DaysCashFlow,
          expectedBalance: 424000,
          confidence: 91,
          status: "POSITIVE",
          dateRangeText: "NEXT 30 DAYS",
          todayX: "Jul 09",
          lowestBalance: 37000,
          expectedIncome: 400000,
          expectedExpenses: 82000,
          expectedSavings: 318000,
          savingsPercent: "+79.5%",
          risk: "MODERATE RISK"
        };
    }
  }, [activePeriod]);

  // Format Recharts data points to smoothly connect solid historical and dashed forecast lines
  const chartData = useMemo(() => {
    const rawData = periodConfig.data;
    const todayIndex = rawData.findIndex((d) => d.date === periodConfig.todayX);
    
    return rawData.map((d, idx) => {
      // Connect at Today point to avoid gap
      const isTransitionPoint = idx === todayIndex;
      return {
        ...d,
        historical: !d.isForecast || isTransitionPoint ? d.balance : null,
        forecast: d.isForecast || isTransitionPoint ? d.balance : null,
        confidenceRange: d.isForecast && d.confidenceLower && d.confidenceUpper
          ? [d.confidenceLower, d.confidenceUpper]
          : null
      };
    });
  }, [periodConfig]);

  // Filter timeline events based on the selected period
  const filteredEvents = useMemo(() => {
    if (activePeriod === "7D") {
      // 7-day view runs Jul 9 to Jul 15. Show only Jul 15 SIP event.
      return mockFutureEvents.filter((e) => e.date.includes("July 15"));
    }
    return mockFutureEvents;
  }, [activePeriod]);

  // Update ECharts loading state
  useEffect(() => {
    const chart = chartInstanceRef.current;
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

  // Update ECharts options when data, theme, or configuration changes
  useEffect(() => {
    const chart = chartInstanceRef.current;
    if (!chart) return;

    const isDark = resolvedTheme === "dark";
    const primaryColor = "#4F7CFF"; // var(--primary)
    const forecastColor = "#06B6D4"; // var(--forecast)
    const criticalColor = "#EF4444"; // var(--critical)
    const textColor = isDark ? "#94A3B8" : "#64748B"; // var(--foreground-secondary)
    const gridLineColor = isDark ? "rgba(30, 41, 59, 0.6)" : "rgba(226, 232, 240, 0.6)";

    const dates = chartData.map((d) => d.date);
    const historicalSeries = chartData.map((d) => d.historical);
    const forecastSeries = chartData.map((d) => d.forecast);
    
    // Series 1: Lower confidence bounds (invisible area)
    const confidenceLowerSeries = chartData.map((d) => d.isForecast && d.confidenceLower ? d.confidenceLower : null);
    // Series 2: Range difference (translucent area)
    const confidenceDiffSeries = chartData.map((d) => {
      if (d.isForecast && d.confidenceLower && d.confidenceUpper) {
        return d.confidenceUpper - d.confidenceLower;
      }
      return null;
    });

    const eventPoints = chartData
      .map((d, index) => ({
        index,
        date: d.date,
        balance: d.balance,
        event: d.event,
        eventAmount: d.eventAmount,
        eventType: d.eventType,
        isRiskEvent: d.isRiskEvent,
        isForecast: d.isForecast,
        confidenceLower: d.confidenceLower,
        confidenceUpper: d.confidenceUpper
      }))
      .filter((d) => !!d.event);

    const option: echarts.EChartsOption = {
      animation: true,
      animationDuration: 550,
      grid: {
        top: 25,
        right: 15,
        bottom: 25,
        left: 55,
        containLabel: false
      },
      tooltip: {
        trigger: "axis",
        axisPointer: {
          type: "line",
          lineStyle: {
            color: isDark ? "rgba(148, 163, 184, 0.3)" : "rgba(100, 116, 139, 0.3)",
            width: 1.5,
            type: "dashed"
          }
        },
        formatter: (params: unknown) => {
          const paramsList = params as { dataIndex: number }[];
          if (!paramsList || paramsList.length === 0) return "";
          
          const dataIndex = paramsList[0].dataIndex;
          const data = chartData[dataIndex];
          if (!data) return "";

          const formattedBalance = data.balance.toLocaleString("en-IN");
          const dateText = `${data.date}, 2026`;
          const badgeText = data.isForecast ? "Forecast" : "Actual";
          const badgeClass = data.isForecast
            ? "color: #06B6D4; background-color: rgba(6, 182, 212, 0.1); border: 1px solid rgba(6, 182, 212, 0.25);"
            : "color: #4F7CFF; background-color: rgba(79, 124, 255, 0.1); border: 1px solid rgba(79, 124, 255, 0.25);";

          let html = `
            <div style="background-color: ${isDark ? "#131B2B" : "#F8FAFC"}; border: 1px solid ${isDark ? "#1E293B" : "#E2E8F0"}; padding: 14px; border-radius: 4px; font-family: var(--font-sans), sans-serif; min-width: 190px; color: ${isDark ? "#F8FAFC" : "#0F172A"}; font-size: 12px; box-shadow: 0 10px 15px -3px rgba(0,0,0,0.1), 0 4px 6px -4px rgba(0,0,0,0.1); select: none;">
              <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid ${isDark ? "rgba(30, 41, 59, 0.6)" : "rgba(226, 232, 240, 0.6)"}; padding-bottom: 6px; margin-bottom: 6px;">
                <span style="font-size: 9px; font-weight: bold; color: ${isDark ? "#64748B" : "#94A3B8"}; text-transform: uppercase; letter-spacing: 0.1em;">${dateText}</span>
                <span style="font-size: 9px; font-weight: bold; text-transform: uppercase; padding: 1px 6px; border-radius: 2px; ${badgeClass}">${badgeText}</span>
              </div>
              <div style="margin-bottom: 4px;">
                <span style="font-size: 10px; color: ${isDark ? "#94A3B8" : "#64748B"}; display: block; margin-bottom: 2px;">Projected Cash Balance</span>
                <span style="font-family: var(--font-mono), monospace; font-size: 14px; font-weight: bold; display: block;">₹${formattedBalance}</span>
              </div>
          `;

          if (data.isForecast && data.confidenceLower && data.confidenceUpper) {
            html += `
              <div style="font-size: 9px; color: ${isDark ? "#94A3B8" : "#64748B"}; border-top: 1px solid ${isDark ? "rgba(30, 41, 59, 0.4)" : "rgba(226, 232, 240, 0.4)"}; padding-top: 6px; margin-top: 6px;">
                <span style="font-weight: 600; display: block; color: ${isDark ? "#64748B" : "#94A3B8"}; margin-bottom: 1px;">90% Confidence Interval:</span>
                <span style="font-family: var(--font-mono), monospace; font-weight: 500;">
                  ₹${data.confidenceLower.toLocaleString("en-IN")} - ₹${data.confidenceUpper.toLocaleString("en-IN")}
                </span>
              </div>
            `;
          }

          if (data.event) {
            const eventColor = data.isRiskEvent ? "#EF4444" : "#4F7CFF";
            html += `
              <div style="font-size: 10px; font-weight: bold; border-top: 1px solid ${isDark ? "rgba(30, 41, 59, 0.6)" : "rgba(226, 232, 240, 0.6)"}; padding-top: 6px; margin-top: 6px; display: flex; align-items: flex-start; gap: 6px; color: ${eventColor};">
                <span style="display: inline-block; margin-top: 1px;">✦</span>
                <div>
                  <span style="display: block; font-family: var(--font-sans), sans-serif; color: ${isDark ? "#F8FAFC" : "#0F172A"}; font-weight: 500;">${data.event}</span>
                  <span style="display: block; font-family: var(--font-mono), monospace; font-size: 9px;">
                    ${data.eventType === "inflow" ? "+" : "-"}₹${data.eventAmount?.toLocaleString("en-IN")}
                  </span>
                </div>
              </div>
            `;
          }

          html += `</div>`;
          return html;
        }
      },
      xAxis: {
        type: "category",
        boundaryGap: false,
        data: dates,
        axisLine: { show: false },
        axisTick: { show: false },
        axisLabel: {
          color: textColor,
          fontSize: 10,
          fontFamily: "var(--font-sans)",
          margin: 10
        }
      },
      yAxis: {
        type: "value",
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
          formatter: (value: number) => `₹${(value / 1000).toFixed(0)}k`
        }
      },
      series: [
        {
          name: "Confidence Lower Limit",
          type: "line",
          data: confidenceLowerSeries,
          stack: "confidence",
          lineStyle: { opacity: 0 },
          showSymbol: false,
          connectNulls: true
        },
        {
          name: "90% Confidence Interval",
          type: "line",
          data: confidenceDiffSeries,
          stack: "confidence",
          lineStyle: { opacity: 0 },
          areaStyle: {
            color: forecastColor,
            opacity: 0.12
          },
          showSymbol: false,
          connectNulls: true
        },
        {
          name: "Actual Balance",
          type: "line",
          data: historicalSeries,
          lineStyle: {
            color: primaryColor,
            width: 2.5
          },
          itemStyle: {
            color: primaryColor
          },
          symbol: "circle",
          symbolSize: 0,
          showSymbol: false,
          connectNulls: true,
          emphasis: {
            disabled: false,
            scale: true,
            itemStyle: {
              borderWidth: 0,
              color: primaryColor
            }
          }
        },
        {
          name: "Projected Balance",
          type: "line",
          data: forecastSeries,
          lineStyle: {
            color: forecastColor,
            width: 2.5,
            type: "dashed"
          },
          itemStyle: {
            color: forecastColor
          },
          symbol: "circle",
          symbolSize: 0,
          showSymbol: false,
          connectNulls: true,
          emphasis: {
            disabled: false,
            scale: true,
            itemStyle: {
              borderWidth: 0,
              color: forecastColor
            }
          }
        },
        {
          name: "Timeline Events",
          type: "scatter",
          data: eventPoints.map((p) => ({
            value: [p.date, p.balance],
            itemStyle: {
              color: isDark ? "#0E1421" : "#FFFFFF",
              borderColor: p.isRiskEvent ? criticalColor : primaryColor,
              borderWidth: 2
            }
          })),
          symbolSize: 11,
          emphasis: {
            scale: 1.2
          }
        }
      ]
    };

    if (option.series && Array.isArray(option.series) && option.series[2]) {
      const histSeriesOpt = option.series[2] as Record<string, unknown>;
      histSeriesOpt.markLine = {
        symbol: ["none", "none"],
        label: {
          show: true,
          position: "end",
          formatter: "Today",
          color: primaryColor,
          fontWeight: "bold",
          fontSize: 9
        },
        lineStyle: {
          type: "dashed",
          color: primaryColor,
          width: 1.5
        },
        data: [
          { xAxis: periodConfig.todayX }
        ]
      };
    }

    chart.setOption(option);
  }, [chartData, resolvedTheme, periodConfig, isLoading]);

  // Dynamic status styling
  const getStatusColor = (status: string) => {
    if (status === "POSITIVE") return "text-positive bg-positive/10 border-positive/20";
    if (status === "STABLE") return "text-primary bg-primary/10 border-primary/20";
    return "text-warning bg-warning/10 border-warning/20";
  };



  // Timeline Event styling maps
  const getEventTagStyles = (status: string) => {
    switch (status) {
      case "scheduled": return "bg-surface-elevated text-foreground-secondary border-border";
      case "predicted": return "bg-ai/10 text-ai border-ai/20 font-bold";
      case "risk": return "bg-critical/10 text-critical border-critical/20 font-bold animate-pulse";
      default: return "bg-surface-elevated border-border";
    }
  };

  // Category Icon maps
  const getCategoryIcon = (cat: string) => {
    switch (cat) {
      case "housing": return <Home className="h-4 w-4 text-primary" />;
      case "utilities": return <Zap className="h-4 w-4 text-forecast" />;
      case "leisure": return <Coffee className="h-4 w-4 text-purple-500" />;
      case "business": return <Briefcase className="h-4 w-4 text-ai" />;
      default: return <HelpCircle className="h-4 w-4 text-foreground-muted" />;
    }
  };

  return (
    <PageContainer className="pb-24">
      {/* Section Header */}
      <SectionHeader
        title="Cash Flow Forecast Intelligence"
        description="Verify expected balance runways, simulate scenarios, and review upcoming cash receipts or payments."
        actions={
          <div className="flex items-center gap-3 select-none">
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                toast.info("Generating full forecast PDF assessment report...");
              }}
              className="gap-2 cursor-pointer font-semibold"
            >
              <Download className="h-4 w-4" />
              Generate Forecast Report
            </Button>
            <Button
              variant="primary"
              onClick={() => {
                toast.info("Loading Scenario Simulator workspace...");
                router.push("/simulator");
              }}
              className="gap-2 cursor-pointer font-semibold"
            >
              <SlidersHorizontal className="h-4 w-4" />
              Scenario Simulator
            </Button>
          </div>
        }
      />

      {/* 1. HERO - DEFAULT DIAGNOSTIC METRICS CARD PANEL */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 select-none">
        {/* EXPECTED BALANCE */}
        <Card className="bg-surface border border-border/80 relative overflow-hidden flex flex-col justify-between">
          <CardContent className="p-5 md:p-6 space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-xs font-sans font-medium text-foreground-secondary uppercase tracking-wider">
                Expected Balance
              </span>
              <Wallet className="h-5 w-5 text-foreground-muted" />
            </div>
            
            <div className="space-y-1">
              <span className="text-2xl sm:text-3xl font-semibold font-mono tracking-tight text-foreground block">
                ₹{periodConfig.expectedBalance.toLocaleString("en-IN")}
              </span>
              <span className="text-[11px] text-foreground-muted block font-sans">
                Computed ending balance for the period
              </span>
            </div>
          </CardContent>
          <div className="h-1.5 bg-primary w-full" />
        </Card>

        {/* MODEL CONFIDENCE */}
        <Card className="bg-surface border border-border/80 relative overflow-hidden flex flex-col justify-between">
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
                  {periodConfig.confidence}%
                </span>
                <span className="text-xs font-sans font-medium text-ai bg-ai/10 border border-ai/20 px-1.5 py-0.25 rounded-xs uppercase">
                  Bureau Verified
                </span>
              </div>
              
              {/* Progress Confidence bar */}
              <div className="space-y-1">
                <div className="h-1.5 bg-border rounded-full overflow-hidden w-full">
                  <div className="h-full bg-ai rounded-full transition-all duration-500" style={{ width: `${periodConfig.confidence}%` }} />
                </div>
                <div className="flex justify-between text-[9px] text-foreground-muted">
                  <span>Margin of Error: ±{(100 - periodConfig.confidence) / 2}%</span>
                  <span>Confidence rating: High</span>
                </div>
              </div>
            </div>
          </CardContent>
          <div className="h-1.5 bg-ai w-full" />
        </Card>

        {/* FORECAST STATUS */}
        <Card className="bg-surface border border-border/80 relative overflow-hidden flex flex-col justify-between">
          <CardContent className="p-5 md:p-6 space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-xs font-sans font-medium text-foreground-secondary uppercase tracking-wider">
                Forecast Status
              </span>
              <ShieldCheck className="h-5 w-5 text-positive" />
            </div>
            
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <span className={cn("text-sm font-semibold font-sans border px-2.5 py-0.5 rounded-xs uppercase tracking-wider", getStatusColor(periodConfig.status))}>
                  {periodConfig.status}
                </span>
              </div>
              <p className="text-[11px] text-foreground-muted leading-relaxed font-sans mt-1">
                Cash runway remains healthy with zero critical deficit default projections within the {periodConfig.dateRangeText.toLowerCase()} timeframe.
              </p>
            </div>
          </CardContent>
          <div className="h-1.5 bg-positive w-full" />
        </Card>
      </div>

      {/* 2. PRIMARY FORECAST CHART CARD */}
      <Card className="border border-border/80 bg-surface p-5 md:p-6 flex flex-col justify-between gap-5 min-h-[460px]">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between border-b border-border/60 pb-4 select-none">
          <div className="space-y-1">
            <h2 className="text-xs uppercase tracking-widest text-foreground-muted font-bold">
              Liquidity Projections
            </h2>
            <p className="text-[11px] text-foreground-secondary">
              Plots projected asset runways, confidence boundaries, and transaction checkpoints.
            </p>
          </div>

          {/* Time controls */}
          <div className="flex items-center gap-1 border border-border p-1 rounded-sm bg-surface-elevated/45 self-end sm:self-center">
            {(["7D", "30D", "6M"] as const).map((period) => (
              <button
                key={period}
                onClick={() => handlePeriodChange(period)}
                className={cn(
                  "text-[10px] font-sans font-bold px-3 py-1.5 rounded-xs transition-colors cursor-pointer select-none",
                  activePeriod === period
                    ? "bg-primary text-white"
                    : "text-foreground-secondary hover:text-foreground hover:bg-surface-hover"
                )}
              >
                {period === "7D" ? "7 DAYS" : period === "30D" ? "30 DAYS" : "6 MONTHS"}
              </button>
            ))}
          </div>
        </div>

        {/* Chart View Content area */}
        <div className="flex-1 min-h-[300px] w-full flex flex-col justify-end relative">
          <div ref={chartRef} className="w-full h-full min-h-[300px]" />
        </div>
      </Card>

      {/* 3. FORECAST SUMMARY INFO GRID */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6 select-none">
        {/* EXPECTED INCOME */}
        <Card className="border border-border/80 bg-surface p-5">
          <span className="text-[10px] font-sans font-bold uppercase tracking-wider text-foreground-muted block">Expected Income</span>
          <span className="font-mono text-lg font-bold text-positive block mt-1.5">
            +₹{periodConfig.expectedIncome.toLocaleString("en-IN")}
          </span>
          <span className="text-[10px] text-foreground-secondary block mt-1">tranche & invoice credits</span>
        </Card>
        
        {/* EXPECTED EXPENSES */}
        <Card className="border border-border/80 bg-surface p-5">
          <span className="text-[10px] font-sans font-bold uppercase tracking-wider text-foreground-muted block">Expected Expenses</span>
          <span className="font-mono text-lg font-bold text-foreground block mt-1.5">
            -₹{periodConfig.expectedExpenses.toLocaleString("en-IN")}
          </span>
          <span className="text-[10px] text-foreground-secondary block mt-1">EMIs, Rent, and operations</span>
        </Card>

        {/* EXPECTED SAVINGS */}
        <Card className="border border-border/80 bg-surface p-5">
          <span className="text-[10px] font-sans font-bold uppercase tracking-wider text-foreground-muted block">Expected Savings</span>
          <span className={cn("font-mono text-lg font-bold block mt-1.5", periodConfig.expectedSavings >= 0 ? "text-positive" : "text-critical")}>
            {periodConfig.expectedSavings >= 0 ? "+" : ""}₹{periodConfig.expectedSavings.toLocaleString("en-IN")}
          </span>
          <span className="text-[10px] text-foreground-secondary block mt-1">Savings rate: {periodConfig.savingsPercent}</span>
        </Card>

        {/* LOWEST BALANCE */}
        <Card className="border border-border/80 bg-surface p-5">
          <span className="text-[10px] font-sans font-bold uppercase tracking-wider text-foreground-muted block">Lowest Balance</span>
          <span className={cn("font-mono text-lg font-bold block mt-1.5", periodConfig.lowestBalance < 40000 ? "text-critical" : "text-foreground")}>
            ₹{periodConfig.lowestBalance.toLocaleString("en-IN")}
          </span>
          <span className="text-[10px] text-foreground-secondary block mt-1">
            {periodConfig.lowestBalance < 40000 ? "Alert: Bottoms out" : "Healthy cash buffer"}
          </span>
        </Card>

        {/* CASH FLOW RISK */}
        <Card className="border border-border/80 bg-surface p-5">
          <span className="text-[10px] font-sans font-bold uppercase tracking-wider text-foreground-muted block">Cash Flow Risk</span>
          <span className={cn("text-xs font-bold uppercase px-2 py-0.5 rounded-xs border inline-block mt-2", 
            periodConfig.risk === "LOW RISK" ? "text-positive bg-positive/10 border-positive/20" : "text-warning bg-warning/10 border-warning/20"
          )}>
            {periodConfig.risk}
          </span>
          <span className="text-[10px] text-foreground-secondary block mt-1">Based on category sweeps</span>
        </Card>
      </div>

      {/* 4. SCENARIO WARNING CARD */}
      {activePeriod === "30D" && (
        <Card className="border border-critical/30 bg-critical/5 select-none">
          <CardContent className="p-5 md:p-6 flex flex-col md:flex-row gap-5 items-start md:items-center justify-between">
            <div className="flex gap-3.5 items-start">
              <div className="h-10 w-10 rounded-full border border-critical/20 bg-critical/10 flex items-center justify-center text-critical shrink-0">
                <ShieldAlert className="h-5 w-5 animate-pulse" />
              </div>
              <div className="space-y-1">
                <h3 className="font-heading font-semibold text-base text-foreground">Scenario Alert: Projected Low Balance</h3>
                <p className="text-xs text-foreground-secondary leading-relaxed max-w-2xl font-sans">
                  Your balance is projected to fall below the ₹40,000 threshold, bottoming out at <span className="font-bold text-critical font-mono">₹38,000</span> in 18 days (July 27) if current discretionary spending rates continue.
                </p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2 shrink-0 w-full md:w-auto mt-3 md:mt-0">
              {/* View Cause Popover details */}
              <Popover
                trigger={
                  <Button variant="outline" size="sm" className="text-xs py-1.5 h-9 font-semibold cursor-pointer border-critical/30 text-critical hover:bg-critical/10">
                    View Cause
                  </Button>
                }
                className="w-72 bg-surface-elevated border border-border rounded-sm shadow-xl p-4 text-xs select-none"
              >
                <div className="space-y-2 font-sans">
                  <span className="font-bold text-foreground block border-b border-border/60 pb-1.5 mb-1.5 flex items-center gap-1.5">
                    <Info className="h-4 w-4 text-critical" /> Anomaly Driver Breakdown
                  </span>
                  <p className="leading-relaxed text-foreground-secondary">
                    The dip is triggered by the scheduling overlap of the quarterly co-working Rent sweep (₹32k) and vehicle Loan EMI (₹45k) on July 18, occurring prior to the predicted client invoice milestone credit (₹400k) on July 30.
                  </p>
                </div>
              </Popover>

              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  toast.info("Redirecting to Cash Flow Simulator workspace...");
                  router.push("/simulator");
                }}
                className="text-xs py-1.5 h-9 font-semibold cursor-pointer"
              >
                Run Simulation
              </Button>

              <Button
                variant="primary"
                size="sm"
                onClick={() => {
                  toast.success("Recommendation Plan drafted: Discounting options prepared for the TCS invoice. View recommendations tab.");
                }}
                className="text-xs py-1.5 h-9 font-semibold cursor-pointer font-sans"
              >
                Create Recommendation Plan
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* 5. FUTURE EVENTS TIMELINE & EXPENSE CATEGORY FORECAST GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 select-none">
        
        {/* Timeline (7 Columns) */}
        <div className="col-span-12 lg:col-span-7 space-y-4">
          <div className="border-b border-border/60 pb-3">
            <h2 className="text-lg font-heading font-semibold text-foreground flex items-center gap-2">
              <Clock className="h-5 w-5 text-primary" /> Future Scheduled & Predicted Events
            </h2>
            <p className="text-xs text-foreground-secondary">
              Calendar of scheduled payments and AI-predicted invoices for the period.
            </p>
          </div>

          <div className="relative pl-6 flex flex-col gap-6 pt-2 pb-4">
            <div className="absolute left-9.5 top-0 bottom-0 w-[2px] bg-border/80" />
            
            {filteredEvents.map((evt) => {
              const isCredit = evt.type === "credit";
              return (
                <div key={evt.id} className="flex gap-4 relative items-start group">
                  {/* Timeline Node Icon */}
                  <div className={cn(
                    "h-8 w-8 rounded-full border bg-surface shrink-0 flex items-center justify-center relative z-10",
                    evt.status === "risk" ? "border-critical/40 text-critical" : isCredit ? "border-positive/40 text-positive" : "border-primary/20 text-primary"
                  )}>
                    <Calendar className="h-4 w-4" />
                  </div>

                  <div className="p-4 bg-surface border border-border/80 hover:border-border-strong rounded-sm flex-1 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 transition-colors">
                    <div className="space-y-1 min-w-0 font-sans">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="text-[9px] font-mono font-bold text-foreground-muted">{evt.date}</span>
                        <span className="font-bold text-foreground block truncate max-w-[200px]">{evt.name}</span>
                      </div>
                      <p className="text-[11px] text-foreground-secondary leading-relaxed">
                        {evt.description}
                      </p>
                    </div>

                    <div className="flex sm:flex-col items-center sm:items-end gap-3 sm:gap-1.5 shrink-0 self-end sm:self-center">
                      <span className={cn(
                        "text-[9px] font-sans font-bold uppercase tracking-wider px-2 py-0.5 border rounded-xs select-none",
                        getEventTagStyles(evt.status)
                      )}>
                        {evt.status}
                      </span>
                      <span className={cn("font-mono font-bold text-xs tracking-tight", isCredit ? "text-positive" : "text-foreground")}>
                        {isCredit ? "+" : "-"}₹{evt.amount.toLocaleString("en-IN")}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Expense Forecast (5 Columns) */}
        <div className="col-span-12 lg:col-span-5 space-y-4">
          <div className="border-b border-border/60 pb-3">
            <h2 className="text-lg font-heading font-semibold text-foreground flex items-center gap-2">
              <TrendingDown className="h-5 w-5 text-critical" /> Expense Category Forecasts
            </h2>
            <p className="text-xs text-foreground-secondary">
              Expected change margins by spend category over the next 30 days.
            </p>
          </div>

          <div className="space-y-4">
            {mockExpenseForecast.map((exp) => {
              const isUp = exp.trend === "up";
              const isDown = exp.trend === "down";
              return (
                <Card key={exp.category} className="bg-surface border border-border/80">
                  <CardContent className="p-4 space-y-3">
                    {/* Header info */}
                    <div className="flex justify-between items-center text-xs">
                      <div className="flex items-center gap-2 capitalize font-bold text-foreground">
                        {getCategoryIcon(exp.category)}
                        {exp.category.replace("_", " ")}
                      </div>
                      
                      <span className={cn(
                        "inline-flex items-center gap-0.5 font-mono font-bold text-[11px]",
                        isUp ? "text-critical" : isDown ? "text-positive" : "text-foreground-secondary"
                      )}>
                        {isUp ? <ArrowUpRight className="h-3.5 w-3.5" /> : isDown ? <ChevronDown className="h-3.5 w-3.5" /> : null}
                        {isUp ? "+" : ""}{exp.percentChange.toFixed(1)}%
                      </span>
                    </div>

                    <p className="text-[11px] text-foreground-secondary leading-normal font-sans">
                      {exp.description}
                    </p>

                    {/* Numeric actuals breakdown */}
                    <div className="flex justify-between items-center text-[10px] border-t border-border/40 pt-2.5 mt-1 font-mono text-foreground-secondary">
                      <div>
                        <span className="text-foreground-muted block text-[9px] uppercase font-sans">Historical Avg</span>
                        <span className="font-semibold mt-0.5 block">₹{exp.currentAverage.toLocaleString("en-IN")}</span>
                      </div>
                      <div className="text-right">
                        <span className="text-foreground-muted block text-[9px] uppercase font-sans">Projected Avg</span>
                        <span className="font-semibold text-foreground mt-0.5 block">₹{exp.expectedAverage.toLocaleString("en-IN")}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>

      </div>

      {/* 6. MODEL FORECAST EXPLANATION AUDIT CARD */}
      <Card className="border border-border/80 bg-surface p-5 md:p-6 select-none mt-4">
        <div className="space-y-4">
          <h3 className="text-sm font-heading font-semibold text-foreground flex items-center gap-1.5 border-b border-border/60 pb-3">
            <Info className="h-4.5 w-4.5 text-primary" /> Forecast Attribution & Diagnostics
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 text-xs text-foreground-secondary leading-relaxed font-sans">
            <div className="space-y-3">
              <h4 className="font-bold text-foreground">Model Input Parameters</h4>
              <p>
                The forecast trajectory is computed utilizing 48 months of historical bank statementActuals, parsed invoice schedules, contract milestones, and categorical spending seasonality metrics.
              </p>
              <h4 className="font-bold text-foreground mt-4">Uncertainty Bounds Attribution</h4>
              <p>
                The 90% confidence interval expands over the forecast range, reflecting variables like variable credit invoice clearance times (margin variance of ±12.4%) and card sweeps timings.
              </p>
            </div>
            
            <div className="space-y-3">
              <h4 className="font-bold text-foreground">Forecast Drivers</h4>
              <ul className="list-disc pl-4 space-y-1.5">
                <li><span className="font-bold text-foreground">Invoice Receipts:</span> High correlation with historical client payment delay distributions (TCS milestone expected +₹4,00,000 on July 30).</li>
                <li><span className="font-bold text-foreground">Discretionary Runways:</span> Utilities and SaaS commitments are fixed, whereas leisure categoricals show expected contraction (↓12%).</li>
                <li><span className="font-bold text-foreground">Repayments Sweep:</span> Vehicle loan EMIs and credit card balances sweep automatically on fixed days.</li>
              </ul>
            </div>
          </div>
        </div>
      </Card>

    </PageContainer>
  );
}
