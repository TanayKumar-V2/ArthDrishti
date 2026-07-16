"use client";

import React, { useState, useEffect, useMemo, useRef } from "react";
import { useRouter } from "next/navigation";
import * as echarts from "echarts";
import {
  ShieldAlert,
  TrendingUp,
  AlertTriangle,
  ArrowRight,
  Clock,
  Download,
  FileText,
  RefreshCw,
  Search,
  UserCheck,
  SlidersHorizontal
} from "lucide-react";
import { toast } from "sonner";

import PageContainer from "@/components/ui/PageContainer";
import { Card, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Sheet, Modal } from "@/components/ui/Overlays";
import { StatusBadge } from "@/components/ui/Badge";
import { cn } from "@/lib/utils";
import { OFFICER_APPLICANTS, ApplicantDetail } from "@/lib/officer_data";

interface EnrichedApplicant extends ApplicantDetail {
  segment: "Young Investors" | "High-Risk Borrowers" | "Budget Families" | "Luxury Spenders" | "Students" | "Retired Customers";
  region: "North" | "South" | "East" | "West";
  riskLevel: "Low" | "Medium" | "High" | "Critical";
}

// Sparkline SVG helper
function Sparkline({ values, stroke = "#3b82f6" }: { values: number[]; stroke?: string }) {
  if (values.length < 2) return null;
  const max = Math.max(...values);
  const min = Math.min(...values);
  const range = max - min === 0 ? 1 : max - min;
  const width = 60;
  const height = 24;
  const points = values
    .map((val, i) => {
      const x = (i / (values.length - 1)) * width;
      const y = height - ((val - min) / range) * height;
      return `${x},${y}`;
    })
    .join(" ");

  return (
    <svg width={width} height={height} className="overflow-visible select-none">
      <polyline fill="none" stroke={stroke} strokeWidth="1.5" points={points} />
    </svg>
  );
}

export default function OfficerRiskPortfolioPage() {
  const router = useRouter();

  // Loading & Error states
  const [isLoading, setIsLoading] = useState(false);
  const [isError, setIsError] = useState(false);
  const [lastUpdatedTime, setLastUpdatedTime] = useState("");

  // Filter States
  const [searchQuery, setSearchQuery] = useState("");
  const [riskFilter, setRiskFilter] = useState<string>("All");
  const [healthFilter, setHealthFilter] = useState<string>("All");
  const [fraudFilter, setFraudFilter] = useState<string>("All");
  const [regionFilter, setRegionFilter] = useState<string>("All");
  const [segmentFilter, setSegmentFilter] = useState<string>("All");
  const [officerFilter, setOfficerFilter] = useState<string>("All");
  const [statusFilter, setStatusFilter] = useState<string>("All");
  const [minLoanAmount, setMinLoanAmount] = useState<string>("");
  const [maxLoanAmount, setMaxLoanAmount] = useState<string>("");

  // Table Sorting States
  const [sortField, setSortField] = useState<keyof EnrichedApplicant>("name");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");

  // Table Column Visibility States
  const [visibleColumns, setVisibleColumns] = useState<Record<string, boolean>>({
    applicant: true,
    loanAmount: true,
    financialHealth: true,
    defaultProbability: true,
    fraudRisk: true,
    segment: true,
    officer: true,
    status: true,
    createdDate: true,
    actions: true
  });
  const [showColumnDropdown, setShowColumnDropdown] = useState(false);

  // Table Pagination States
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  // Selected Drawer Customer Details state
  const [selectedCustomer, setSelectedCustomer] = useState<EnrichedApplicant | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  // Case Assignment Modal States
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
  const [selectedAssignApps, setSelectedAssignApps] = useState<Record<string, boolean>>({});
  const [assignTargetOfficer, setAssignTargetOfficer] = useState("Officer Rahul");

  // Large Overview Chart configuration tab and time filters
  const [activeOverviewTab, setActiveOverviewTab] = useState<
    "value" | "risk" | "approval" | "health"
  >("value");
  const [overviewTimeframe, setOverviewTimeframe] = useState<"7d" | "30d" | "6m" | "1y">("6m");

  // Set initial last analysis timestamp on load
  useEffect(() => {
    const now = new Date();
    const timer = setTimeout(() => {
      setLastUpdatedTime(
        now.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" })
      );
    }, 0);
    return () => clearTimeout(timer);
  }, []);

  // Enrich applicant record registries with spatial and category markers
  const enrichedList = useMemo<EnrichedApplicant[]>(() => {
    return OFFICER_APPLICANTS.map((app) => {
      // Risk category bounds
      let riskLevel: EnrichedApplicant["riskLevel"] = "Low";
      if (app.defaultProb >= 60 || app.fraudRisk === "High") {
        riskLevel = "Critical";
      } else if (app.defaultProb >= 35 || app.fraudRisk === "Medium") {
        riskLevel = "High";
      } else if (app.defaultProb >= 20) {
        riskLevel = "Medium";
      }

      // Customer Segmentation classifier
      let segment: EnrichedApplicant["segment"] = "Young Investors";
      if (app.age >= 60) {
        segment = "Retired Customers";
      } else if (app.age < 25) {
        segment = "Students";
      } else if (riskLevel === "Critical" || riskLevel === "High") {
        segment = "High-Risk Borrowers";
      } else if (app.loanType === "Home Loan") {
        segment = "Budget Families";
      } else if (app.income >= 150000) {
        segment = "Luxury Spenders";
      }

      // Regional mapping coordinate selectors
      let region: EnrichedApplicant["region"] = "North";
      if (app.id === "app1") region = "East";
      else if (app.id === "app2") region = "South";
      else if (app.id === "app3") region = "North";
      else if (app.id === "app4") region = "West";
      else {
        const regions: EnrichedApplicant["region"][] = ["North", "South", "East", "West"];
        region = regions[parseInt(app.id.replace(/\D/g, "") || "0") % 4];
      }

      return {
        ...app,
        riskLevel,
        segment,
        region
      };
    });
  }, []);

  // Filtered List calculation
  const filteredList = useMemo(() => {
    let result = [...enrichedList];

    // Search query check
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (app) =>
          app.name.toLowerCase().includes(q) ||
          app.id.toLowerCase().includes(q) ||
          app.purpose.toLowerCase().includes(q)
      );
    }

    // Advanced filters matching
    if (riskFilter !== "All") {
      result = result.filter((app) => app.riskLevel === riskFilter);
    }

    if (healthFilter !== "All") {
      if (healthFilter === "Excellent") result = result.filter((app) => app.healthScore >= 80);
      else if (healthFilter === "Good") result = result.filter((app) => app.healthScore >= 65 && app.healthScore < 80);
      else if (healthFilter === "Average") result = result.filter((app) => app.healthScore >= 50 && app.healthScore < 65);
      else if (healthFilter === "Poor") result = result.filter((app) => app.healthScore >= 35 && app.healthScore < 50);
      else if (healthFilter === "Critical") result = result.filter((app) => app.healthScore < 35);
    }

    if (fraudFilter !== "All") {
      result = result.filter((app) => app.fraudRisk === fraudFilter);
    }

    if (regionFilter !== "All") {
      result = result.filter((app) => app.region === regionFilter);
    }

    if (segmentFilter !== "All") {
      result = result.filter((app) => app.segment === segmentFilter);
    }

    if (officerFilter !== "All") {
      result = result.filter((app) => app.officer === officerFilter);
    }

    if (statusFilter !== "All") {
      result = result.filter((app) => app.status === statusFilter);
    }

    if (minLoanAmount) {
      result = result.filter((app) => app.amount >= parseFloat(minLoanAmount));
    }

    if (maxLoanAmount) {
      result = result.filter((app) => app.amount <= parseFloat(maxLoanAmount));
    }

    // Sort order mapping
    result.sort((a, b) => {
      let valA = a[sortField];
      let valB = b[sortField];

      if (typeof valA === "string") {
        valA = (valA as string).toLowerCase();
        valB = (valB as string).toLowerCase();
      }

      if (valA < valB) return sortOrder === "asc" ? -1 : 1;
      if (valA > valB) return sortOrder === "asc" ? 1 : -1;
      return 0;
    });

    return result;
  }, [
    enrichedList,
    searchQuery,
    riskFilter,
    healthFilter,
    fraudFilter,
    regionFilter,
    segmentFilter,
    officerFilter,
    statusFilter,
    minLoanAmount,
    maxLoanAmount,
    sortField,
    sortOrder
  ]);

  // Page index items pagination slice
  const paginatedList = useMemo(() => {
    const startIdx = (currentPage - 1) * itemsPerPage;
    return filteredList.slice(startIdx, startIdx + itemsPerPage);
  }, [filteredList, currentPage]);

  const totalPages = Math.ceil(filteredList.length / itemsPerPage) || 1;

  // Recalculate KPIs
  const portfolioKPIs = useMemo(() => {
    const totalApps = enrichedList.length;
    const valueSum = enrichedList.reduce((acc, curr) => acc + curr.amount, 0);
    const avgHealth = Math.round(enrichedList.reduce((acc, curr) => acc + curr.healthScore, 0) / totalApps) || 0;
    const avgDefault = Math.round(enrichedList.reduce((acc, curr) => acc + curr.defaultProb, 0) / totalApps) || 0;
    const countHighRisk = enrichedList.filter((app) => app.riskLevel === "Critical" || app.riskLevel === "High").length;
    const countPending = enrichedList.filter(
      (app) => app.status === "Pending" || app.status === "Under Review" || app.status === "Manual Review"
    ).length;

    return {
      totalApps,
      valueSum,
      avgHealth,
      avgDefault,
      countHighRisk,
      countPending
    };
  }, [enrichedList]);

  // Live segmentation calculated lists
  const segmentationData = useMemo(() => {
    const segmentsList: EnrichedApplicant["segment"][] = [
      "Young Investors",
      "High-Risk Borrowers",
      "Budget Families",
      "Luxury Spenders",
      "Students",
      "Retired Customers"
    ];

    return segmentsList.map((seg) => {
      const matched = enrichedList.filter((app) => app.segment === seg);
      const count = matched.length;
      const avgRisk = count ? Math.round(matched.reduce((a, c) => a + c.defaultProb, 0) / count) : 0;
      const avgHealth = count ? Math.round(matched.reduce((a, c) => a + c.healthScore, 0) / count) : 0;
      const avgLoan = count ? Math.round(matched.reduce((a, c) => a + c.amount, 0) / count) : 0;

      return {
        name: seg,
        count,
        avgRisk,
        avgHealth,
        avgLoan
      };
    });
  }, [enrichedList]);

  // Priority short-list: highest default probability or critical files requiring reviews
  const priorityQueue = useMemo(() => {
    return [...enrichedList]
      .filter((app) => app.status !== "Completed" && app.status !== "AI Approved")
      .sort((a, b) => b.defaultProb - a.defaultProb)
      .slice(0, 4);
  }, [enrichedList]);

  // Unassigned applications count
  const unassignedApps = useMemo(() => {
    return enrichedList.filter((app) => app.officer === "Unassigned" || !app.officer);
  }, [enrichedList]);

  // ECharts refs
  const overviewChartRef = useRef<HTMLDivElement>(null);
  const riskDonutRef = useRef<HTMLDivElement>(null);
  const healthBarRef = useRef<HTMLDivElement>(null);
  const heatmapRef = useRef<HTMLDivElement>(null);
  const regionalChartRef = useRef<HTMLDivElement>(null);

  // Initialize ECharts with resizing logic
  useEffect(() => {
    if (isLoading || isError) return;

    const chartInstances: echarts.ECharts[] = [];
    const isDark = document.documentElement.classList.contains("dark");
    const labelColor = isDark ? "#94A3B8" : "#64748B";
    const gridLineColor = isDark ? "rgba(255, 255, 255, 0.08)" : "rgba(0, 0, 0, 0.06)";

    const initChart = (ref: React.RefObject<HTMLDivElement | null>, option: echarts.EChartsOption) => {
      if (!ref.current) return null;
      const chart = echarts.init(ref.current);
      chart.setOption(option);
      chartInstances.push(chart);
      return chart;
    };

    // 1. Large Overview Chart Option mapping
    const getTimeframeData = () => {
      if (overviewTimeframe === "7d") {
        return {
          dates: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
          value: [3.4, 3.6, 3.8, 3.5, 4.0, 4.2, 4.5],
          risk: [32, 31, 33, 30, 29, 28, 29],
          approval: [74, 76, 75, 78, 80, 81, 79],
          health: [74, 75, 75, 76, 77, 78, 77]
        };
      }
      return {
        dates: ["Jan", "Feb", "Mar", "Apr", "May", "Jun"],
        value: [2.1, 2.5, 3.2, 3.8, 4.2, 5.0],
        risk: [36, 34, 32, 30, 29, 28],
        approval: [72, 74, 75, 77, 78, 80],
        health: [72, 73, 75, 76, 78, 77]
      };
    };

    const overviewData = getTimeframeData();
    let overviewSeriesData: number[] = [];
    let overviewSeriesName = "Portfolio Value (₹M)";
    let overviewSeriesColor = "#3b82f6";
    let isArea = true;

    if (activeOverviewTab === "risk") {
      overviewSeriesData = overviewData.risk;
      overviewSeriesName = "Avg Default Probability (%)";
      overviewSeriesColor = "#f59e0b";
      isArea = false;
    } else if (activeOverviewTab === "approval") {
      overviewSeriesData = overviewData.approval;
      overviewSeriesName = "Approval Rate (%)";
      overviewSeriesColor = "#22c55e";
    } else if (activeOverviewTab === "health") {
      overviewSeriesData = overviewData.health;
      overviewSeriesName = "Avg Health Score Index";
      overviewSeriesColor = "#8b5cf6";
    } else {
      overviewSeriesData = overviewData.value;
    }

    initChart(overviewChartRef, {
      tooltip: { trigger: "axis" },
      grid: { top: 25, bottom: 25, left: 45, right: 15 },
      xAxis: { type: "category", data: overviewData.dates, axisLabel: { color: labelColor, fontSize: 8.5 } },
      yAxis: { type: "value", splitLine: { lineStyle: { color: gridLineColor } }, axisLabel: { color: labelColor, fontSize: 8.5 } },
      series: [
        {
          name: overviewSeriesName,
          type: "line",
          smooth: true,
          data: overviewSeriesData,
          itemStyle: { color: overviewSeriesColor },
          lineStyle: { width: 2 },
          areaStyle: isArea ? {
            color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
              { offset: 0, color: `${overviewSeriesColor}28` },
              { offset: 1, color: `${overviewSeriesColor}00` }
            ])
          } : undefined
        }
      ]
    });

    // 2. Risk Distribution Donut Chart
    const countLow = enrichedList.filter((app) => app.riskLevel === "Low").length;
    const countMed = enrichedList.filter((app) => app.riskLevel === "Medium").length;
    const countHigh = enrichedList.filter((app) => app.riskLevel === "High").length;
    const countCrit = enrichedList.filter((app) => app.riskLevel === "Critical").length;

    const donutChart = initChart(riskDonutRef, {
      tooltip: { trigger: "item" },
      legend: { show: false },
      series: [
        {
          name: "Risk Classification",
          type: "pie",
          radius: ["40%", "75%"],
          avoidLabelOverlap: false,
          label: {
            show: true,
            position: "outside",
            formatter: "{b}: {c}",
            fontSize: 8.5,
            color: labelColor
          },
          data: [
            { value: countLow, name: "Low Risk", itemStyle: { color: "#22c55e" } },
            { value: countMed, name: "Medium Risk", itemStyle: { color: "#3b82f6" } },
            { value: countHigh, name: "High Risk", itemStyle: { color: "#f59e0b" } },
            { value: countCrit, name: "Critical Risk", itemStyle: { color: "#ef4444" } }
          ]
        }
      ]
    });

    // Donut slice click interaction to filter table
    if (donutChart) {
      donutChart.on("click", (params) => {
        const name = params.name;
        if (name.includes("Low")) setRiskFilter("Low");
        else if (name.includes("Medium")) setRiskFilter("Medium");
        else if (name.includes("High")) setRiskFilter("High");
        else if (name.includes("Critical")) setRiskFilter("Critical");
        toast.success(`Applicant table filtered to: "${name}" profiles.`);
      });
    }

    // 3. Health Distribution Chart (excellent, good, avg, poor, critical)
    const hExcellent = enrichedList.filter((app) => app.healthScore >= 80).length;
    const hGood = enrichedList.filter((app) => app.healthScore >= 65 && app.healthScore < 80).length;
    const hAverage = enrichedList.filter((app) => app.healthScore >= 50 && app.healthScore < 65).length;
    const hPoor = enrichedList.filter((app) => app.healthScore >= 35 && app.healthScore < 50).length;
    const hCritical = enrichedList.filter((app) => app.healthScore < 35).length;

    initChart(healthBarRef, {
      tooltip: { trigger: "axis", axisPointer: { type: "shadow" } },
      grid: { top: 15, bottom: 25, left: 35, right: 15 },
      xAxis: {
        type: "category",
        data: ["Critical", "Poor", "Average", "Good", "Excellent"],
        axisLabel: { color: labelColor, fontSize: 8.5 }
      },
      yAxis: { type: "value", splitLine: { lineStyle: { color: gridLineColor } }, axisLabel: { color: labelColor, fontSize: 8.5 } },
      series: [
        {
          name: "Applicants",
          type: "bar",
          data: [
            { value: hCritical, itemStyle: { color: "#ef4444" } },
            { value: hPoor, itemStyle: { color: "#f97316" } },
            { value: hAverage, itemStyle: { color: "#f59e0b" } },
            { value: hGood, itemStyle: { color: "#3b82f6" } },
            { value: hExcellent, itemStyle: { color: "#22c55e" } }
          ],
          barWidth: "45%"
        }
      ]
    });

    // 4. Heatmap: Risk vs Size vs Volume (visualizing concentration)
    // Hours / Days format in heatmaps: X: Risk (Low, Med, High, Crit); Y: Size Brackets (<5L, 5-10L, >10L)
    const sizeBrackets = ["< ₹5L", "₹5L - ₹10L", "> ₹10L"];
    const riskLevels = ["Low", "Medium", "High", "Critical"];
    
    // Matrix data mapping: [Xindex, Yindex, VolumeValue]
    const heatmapData = [
      [0, 0, 5], [1, 0, 4], [2, 0, 2], [3, 0, 1],
      [0, 1, 3], [1, 1, 6], [2, 1, 3], [3, 1, 2],
      [0, 2, 2], [1, 2, 2], [2, 2, 4], [3, 2, 3]
    ];

    initChart(heatmapRef, {
      tooltip: { position: "top" },
      grid: { top: 15, bottom: 25, left: 60, right: 15 },
      xAxis: { type: "category", data: riskLevels, splitArea: { show: true }, axisLabel: { color: labelColor, fontSize: 8.5 } },
      yAxis: { type: "category", data: sizeBrackets, splitArea: { show: true }, axisLabel: { color: labelColor, fontSize: 8.5 } },
      visualMap: {
        min: 0,
        max: 8,
        calculable: true,
        orient: "horizontal",
        left: "center",
        bottom: "0%",
        show: false,
        inRange: { color: ["#eff6ff", "#bfdbfe", "#2563eb"] }
      },
      series: [
        {
          name: "Applications Count",
          type: "heatmap",
          data: heatmapData,
          label: { show: true, fontSize: 9, formatter: "{c} Files" }
        }
      ]
    });

    // 5. Regional distribution charts
    const regNorth = enrichedList.filter((app) => app.region === "North").length;
    const regSouth = enrichedList.filter((app) => app.region === "South").length;
    const regEast = enrichedList.filter((app) => app.region === "East").length;
    const regWest = enrichedList.filter((app) => app.region === "West").length;

    initChart(regionalChartRef, {
      tooltip: { trigger: "axis", axisPointer: { type: "shadow" } },
      grid: { top: 15, bottom: 25, left: 35, right: 15 },
      xAxis: { type: "category", data: ["North", "South", "East", "West"], axisLabel: { color: labelColor, fontSize: 8.5 } },
      yAxis: { type: "value", splitLine: { lineStyle: { color: gridLineColor } }, axisLabel: { color: labelColor, fontSize: 8.5 } },
      series: [
        {
          name: "Applicants Count",
          type: "bar",
          data: [
            { value: regNorth, itemStyle: { color: "#3b82f6" } },
            { value: regSouth, itemStyle: { color: "#10b981" } },
            { value: regEast, itemStyle: { color: "#a855f7" } },
            { value: regWest, itemStyle: { color: "#f59e0b" } }
          ],
          barWidth: "45%"
        }
      ]
    });

    const handleResize = () => chartInstances.forEach((c) => c.resize());
    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
      chartInstances.forEach((c) => c.dispose());
    };
  }, [isLoading, isError, enrichedList, activeOverviewTab, overviewTimeframe]);

  // Operations callbacks
  const handleRefreshPortfolio = () => {
    setIsLoading(true);
    toast.loading("Refetching active loan portfolios statistics...");
    setTimeout(() => {
      setIsLoading(false);
      const now = new Date();
      setLastUpdatedTime(
        now.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" })
      );
      toast.dismiss();
      toast.success("Risk logs refreshed from registry databases.");
    }, 950);
  };

  const handleExportPortfolio = () => {
    toast.success("Exporting risk portfolio dataset in CSV format.");
  };

  const handleGenerateReport = () => {
    toast.success("Compiling portfolio risk analytics report.");
  };

  // Case Assignment callback
  const handleToggleAssignApp = (id: string) => {
    setSelectedAssignApps((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const handleConfirmAssignment = () => {
    const listToAssign = Object.keys(selectedAssignApps).filter((k) => selectedAssignApps[k]);
    if (listToAssign.length === 0) {
      toast.error("Please check at least one application files to assign.");
      return;
    }

    toast.success(`Assigned ${listToAssign.length} cases to "${assignTargetOfficer}" successfully.`);
    setIsAssignModalOpen(false);
    setSelectedAssignApps({});
  };

  const handleResetFilters = () => {
    setSearchQuery("");
    setRiskFilter("All");
    setHealthFilter("All");
    setFraudFilter("All");
    setRegionFilter("All");
    setSegmentFilter("All");
    setOfficerFilter("All");
    setStatusFilter("All");
    setMinLoanAmount("");
    setMaxLoanAmount("");
    setCurrentPage(1);
    toast.success("Reset all active filter parameters.");
  };

  const toggleColumnVisibility = (col: string) => {
    setVisibleColumns((prev) => ({ ...prev, [col]: !prev[col] }));
  };

  return (
    <PageContainer className="pb-32 text-xs select-none">
      
      {/* 1. PAGE HEADER SECTION */}
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between pb-4 border-b border-border/60">
        <div className="space-y-1.5">
          <div className="flex items-center gap-2.5">
            <ShieldAlert className="h-6.5 w-6.5 text-primary shrink-0" />
            <h1 className="text-xl font-bold font-sans tracking-tight text-foreground">
              Risk Portfolio Analytics
            </h1>
          </div>
          <p className="text-[10.5px] text-foreground-secondary leading-relaxed max-w-2xl font-sans">
            Monitor portfolio health, identify high-risk applicants, analyze trends, and prioritize actions using AI-generated intelligence.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Last updated stats */}
          <div className="flex items-center gap-2 mr-3 font-sans text-[10px]">
            <Clock className="h-3.5 w-3.5 text-primary" />
            <span className="text-foreground-secondary">Refreshed:</span>
            <span className="font-mono font-bold text-foreground">{lastUpdatedTime}</span>
          </div>

          <Button
            onClick={handleRefreshPortfolio}
            variant="outline"
            size="sm"
            className="text-[9.5px] uppercase font-bold gap-1 cursor-pointer"
          >
            <RefreshCw className={cn("h-3 w-3", isLoading && "animate-spin")} /> Refresh Portfolio
          </Button>

          <Button
            onClick={() => setIsAssignModalOpen(true)}
            variant="outline"
            size="sm"
            className="text-[9.5px] uppercase font-bold gap-1 cursor-pointer"
          >
            <UserCheck className="h-3.5 w-3.5" /> Assign Cases
          </Button>

          <Button
            onClick={handleExportPortfolio}
            variant="outline"
            size="sm"
            className="text-[9.5px] uppercase font-bold gap-1 cursor-pointer"
          >
            <Download className="h-3 w-3" /> Export Portfolio
          </Button>

          <Button
            onClick={handleGenerateReport}
            variant="outline"
            size="sm"
            className="text-[9.5px] uppercase font-bold gap-1.5 cursor-pointer"
          >
            <FileText className="h-3 w-3" /> Generate Report
          </Button>

          {/* Trigger connection error simulation */}
          <button
            onClick={() => {
              setIsError(true);
              toast.error("Telemetry server offline alert.");
            }}
            className="text-[8.5px] bg-critical/5 text-critical border border-critical/20 rounded px-2 py-1 uppercase font-bold hover:bg-critical/10"
          >
            Trigger Error State
          </button>
        </div>
      </div>

      {isError ? (
        // SYSTEM ERROR RETRY PANEL
        <div className="mt-8 select-none max-w-md mx-auto">
          <Card className="border border-critical border-dashed bg-critical/5 text-center p-8 rounded">
            <AlertTriangle className="h-10 w-10 text-critical mx-auto mb-3" />
            <h3 className="text-sm font-bold text-foreground">Portfolio Registry Offline</h3>
            <p className="text-xs text-foreground-secondary mt-1.5 mb-5 leading-relaxed">
              We were unable to secure connection to the risk-modeling databases. Verify officer tokens and try again.
            </p>
            <Button
              onClick={() => {
                setIsError(false);
                setIsLoading(true);
                setTimeout(() => {
                  setIsLoading(false);
                  toast.success("Risk-modeling server reconnected.");
                }, 800);
              }}
              size="sm"
              className="text-[10px] uppercase font-sans font-bold cursor-pointer bg-primary text-white"
            >
              Retry Connection
            </Button>
          </Card>
        </div>
      ) : isLoading ? (
        // SKELETON LOADERS OVERLAYS
        <div className="space-y-6 mt-6 select-none animate-pulse">
          <div className="grid grid-cols-2 lg:grid-cols-6 gap-4">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="h-20 bg-surface-elevated border border-border rounded" />
            ))}
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            <div className="lg:col-span-8 h-96 bg-surface-elevated border border-border rounded" />
            <div className="lg:col-span-4 h-96 bg-surface-elevated border border-border rounded" />
          </div>
        </div>
      ) : (
        <>
          {/* 2. PORTFOLIO KPI CARDS (6 PREMIUM CARDS) */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mt-6">
            
            {/* Card 1: Total active apps */}
            <Card className="border border-border/80 bg-surface hover:border-primary/30 transition-all select-none">
              <CardContent className="p-4 space-y-1 relative">
                <span className="text-[8px] text-foreground-muted block uppercase font-bold">Active Applications</span>
                <span className="text-xl font-extrabold font-mono text-foreground block">{portfolioKPIs.totalApps}</span>
                <div className="flex items-center justify-between mt-2.5">
                  <span className="text-[8.5px] text-positive font-bold flex items-center gap-0.5"><TrendingUp className="h-3 w-3" /> +12.4%</span>
                  <Sparkline values={[12, 14, 18, 15, 20, portfolioKPIs.totalApps]} stroke="#3b82f6" />
                </div>
              </CardContent>
            </Card>

            {/* Card 2: Portfolio Value */}
            <Card className="border border-border/80 bg-surface hover:border-primary/30 transition-all select-none">
              <CardContent className="p-4 space-y-1 relative">
                <span className="text-[8px] text-foreground-muted block uppercase font-bold">Portfolio Value</span>
                <span className="text-xl font-extrabold font-mono text-foreground block">₹{(portfolioKPIs.valueSum / 100000).toFixed(1)}L</span>
                <div className="flex items-center justify-between mt-2.5">
                  <span className="text-[8.5px] text-positive font-bold flex items-center gap-0.5"><TrendingUp className="h-3 w-3" /> +8.2%</span>
                  <Sparkline values={[4.2, 4.5, 4.8, 5.1, 5.3, portfolioKPIs.valueSum / 100000]} stroke="#10b981" />
                </div>
              </CardContent>
            </Card>

            {/* Card 3: Avg Health Score */}
            <Card className="border border-border/80 bg-surface hover:border-primary/30 transition-all select-none">
              <CardContent className="p-4 space-y-1 relative">
                <span className="text-[8px] text-foreground-muted block uppercase font-bold">Avg Financial Health</span>
                <span className="text-xl font-extrabold font-mono text-foreground block">{portfolioKPIs.avgHealth}<span className="text-xs text-foreground-muted">/100</span></span>
                <div className="flex items-center justify-between mt-2.5">
                  <span className="text-[8.5px] text-positive font-bold flex items-center gap-0.5"><TrendingUp className="h-3 w-3" /> +2.1%</span>
                  <Sparkline values={[72, 74, 73, 75, 76, portfolioKPIs.avgHealth]} stroke="#8b5cf6" />
                </div>
              </CardContent>
            </Card>

            {/* Card 4: Avg Default Prob */}
            <Card className="border border-border/80 bg-surface hover:border-primary/30 transition-all select-none">
              <CardContent className="p-4 space-y-1 relative">
                <span className="text-[8px] text-foreground-muted block uppercase font-bold">Avg Default Prob</span>
                <span className="text-xl font-extrabold font-mono text-foreground block">{portfolioKPIs.avgDefault}%</span>
                <div className="flex items-center justify-between mt-2.5">
                  <span className="text-[8.5px] text-positive font-bold flex items-center gap-0.5">-3.4% MoM</span>
                  <Sparkline values={[34, 32, 31, 29, 28, portfolioKPIs.avgDefault]} stroke="#f59e0b" />
                </div>
              </CardContent>
            </Card>

            {/* Card 5: High risk applicants */}
            <Card className="border border-border/80 bg-surface hover:border-primary/30 transition-all select-none">
              <CardContent className="p-4 space-y-1 relative">
                <span className="text-[8px] text-foreground-muted block uppercase font-bold">High-Risk Customers</span>
                <span className="text-xl font-extrabold font-mono text-critical block">{portfolioKPIs.countHighRisk}</span>
                <div className="flex items-center justify-between mt-2.5">
                  <span className="text-[8.5px] text-critical font-bold">+1 new</span>
                  <Sparkline values={[3, 4, 2, 3, 4, portfolioKPIs.countHighRisk]} stroke="#ef4444" />
                </div>
              </CardContent>
            </Card>

            {/* Card 6: Pending reviews */}
            <Card className="border border-border/80 bg-surface hover:border-primary/30 transition-all select-none">
              <CardContent className="p-4 space-y-1 relative">
                <span className="text-[8px] text-foreground-muted block uppercase font-bold">Pending Reviews</span>
                <span className="text-xl font-extrabold font-mono text-warning block">{portfolioKPIs.countPending}</span>
                <div className="flex items-center justify-between mt-2.5">
                  <span className="text-[8.5px] text-positive font-bold">-4 days</span>
                  <Sparkline values={[12, 10, 15, 14, 11, portfolioKPIs.countPending]} stroke="#ec4899" />
                </div>
              </CardContent>
            </Card>

          </div>

          {/* 3. CORE ANALYTICS: CHARTS & STICKY ALERTS SPLIT */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mt-6 items-start">
            
            {/* OVERVIEW CHART (8 COLS - 65%) */}
            <div className="lg:col-span-8 space-y-6">
              <Card className="border border-border/80 bg-surface select-none">
                <CardContent className="p-5 space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-border/40 pb-3">
                    
                    {/* Visual switcher tabs */}
                    <div className="flex flex-wrap items-center gap-1">
                      <button
                        onClick={() => setActiveOverviewTab("value")}
                        className={cn("px-3 py-1.5 rounded font-bold uppercase tracking-wider text-[9px] border",
                          activeOverviewTab === "value" ? "bg-primary border-primary text-white" : "border-border text-foreground-secondary hover:bg-surface-hover/40"
                        )}
                      >
                        Portfolio Value
                      </button>
                      <button
                        onClick={() => setActiveOverviewTab("risk")}
                        className={cn("px-3 py-1.5 rounded font-bold uppercase tracking-wider text-[9px] border",
                          activeOverviewTab === "risk" ? "bg-primary border-primary text-white" : "border-border text-foreground-secondary hover:bg-surface-hover/40"
                        )}
                      >
                        Risk Trend
                      </button>
                      <button
                        onClick={() => setActiveOverviewTab("approval")}
                        className={cn("px-3 py-1.5 rounded font-bold uppercase tracking-wider text-[9px] border",
                          activeOverviewTab === "approval" ? "bg-primary border-primary text-white" : "border-border text-foreground-secondary hover:bg-surface-hover/40"
                        )}
                      >
                        Approval Rate
                      </button>
                      <button
                        onClick={() => setActiveOverviewTab("health")}
                        className={cn("px-3 py-1.5 rounded font-bold uppercase tracking-wider text-[9px] border",
                          activeOverviewTab === "health" ? "bg-primary border-primary text-white" : "border-border text-foreground-secondary hover:bg-surface-hover/40"
                        )}
                      >
                        Financial Health
                      </button>
                    </div>

                    {/* Time filters */}
                    <div className="flex items-center gap-1 font-mono text-[9.5px]">
                      {(["7d", "30d", "6m", "1y"] as const).map((t) => (
                        <button
                          key={t}
                          onClick={() => setOverviewTimeframe(t)}
                          className={cn("px-2 py-0.5 rounded border uppercase",
                            overviewTimeframe === t ? "bg-surface-elevated font-extrabold border-border" : "border-transparent text-foreground-muted hover:text-foreground"
                          )}
                        >
                          {t}
                        </button>
                      ))}
                    </div>

                  </div>

                  <div ref={overviewChartRef} className="w-full h-80" />
                </CardContent>
              </Card>
            </div>

            {/* STICKY ALERTS PANEL (4 COLS - 35%) */}
            <div className="lg:col-span-4 lg:sticky lg:top-6 space-y-4 select-none">
              <span className="text-[10px] font-bold text-foreground-muted uppercase tracking-widest block">
                AI Portfolio Alerts Stream
              </span>

              <div className="space-y-3 font-sans text-xs">
                
                {/* Alert 1 */}
                <div className="bg-critical/5 border border-critical/15 p-3.5 rounded flex gap-3 items-start relative hover:bg-critical/10 transition-colors">
                  <ShieldAlert className="h-4.5 w-4.5 text-critical shrink-0 mt-0.5 animate-pulse" />
                  <div className="space-y-0.5">
                    <span className="font-extrabold text-foreground block">New High-Default Applicant Ingested</span>
                    <p className="text-[10.5px] text-foreground-secondary leading-relaxed">
                      Amit Sharma flagged with 72% Default probability under business equipment category.
                    </p>
                    <button
                      onClick={() => {
                        const target = enrichedList.find((a) => a.id === "app3");
                        if (target) {
                          setSelectedCustomer(target);
                          setIsDrawerOpen(true);
                        }
                      }}
                      className="text-primary font-bold hover:underline flex items-center gap-0.5 text-[9px] mt-1.5 uppercase cursor-pointer"
                    >
                      Audit Details <ArrowRight className="h-3 w-3" />
                    </button>
                  </div>
                </div>

                {/* Alert 2 */}
                <div className="bg-warning/5 border border-warning/15 p-3.5 rounded flex gap-3 items-start hover:bg-warning/10 transition-colors">
                  <AlertTriangle className="h-4.5 w-4.5 text-warning shrink-0 mt-0.5" />
                  <div className="space-y-0.5">
                    <span className="font-extrabold text-foreground block">Revolving Credit Exposure Expansion</span>
                    <p className="text-[10.5px] text-foreground-secondary leading-relaxed">
                      Rahul Sen credit card utilization crossed 64% threshold. Active EMI burden expanded by 12%.
                    </p>
                    <button
                      onClick={() => {
                        const target = enrichedList.find((a) => a.id === "app1");
                        if (target) {
                          setSelectedCustomer(target);
                          setIsDrawerOpen(true);
                        }
                      }}
                      className="text-primary font-bold hover:underline flex items-center gap-0.5 text-[9px] mt-1.5 uppercase cursor-pointer"
                    >
                      Audit Details <ArrowRight className="h-3 w-3" />
                    </button>
                  </div>
                </div>

                {/* Alert 3 */}
                <div className="bg-critical/5 border border-critical/15 p-3.5 rounded flex gap-3 items-start hover:bg-critical/10 transition-colors">
                  <ShieldAlert className="h-4.5 w-4.5 text-critical shrink-0 mt-0.5" />
                  <div className="space-y-0.5">
                    <span className="font-extrabold text-foreground block">Identity Geolocation Anomaly Flagged</span>
                    <p className="text-[10.5px] text-foreground-secondary leading-relaxed">
                      Vikram Malhotra login coordinate mismatch logged from multiple parallel device coordination nodes.
                    </p>
                    <button
                      onClick={() => {
                        const target = enrichedList.find((a) => a.id === "app4");
                        if (target) {
                          setSelectedCustomer(target);
                          setIsDrawerOpen(true);
                        }
                      }}
                      className="text-primary font-bold hover:underline flex items-center gap-0.5 text-[9px] mt-1.5 uppercase cursor-pointer"
                    >
                      Audit Details <ArrowRight className="h-3 w-3" />
                    </button>
                  </div>
                </div>

              </div>
            </div>

          </div>

          {/* 4. DONUT & HEATMAP GRID PANEL */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-8">
            
            {/* Risk Distribution Pie donut */}
            <Card className="border border-border/80 bg-surface select-none">
              <CardContent className="p-5 space-y-3.5">
                <div>
                  <span className="text-[10px] font-bold text-foreground-muted uppercase tracking-widest block">Risk Classification Distribution</span>
                  <p className="text-[10px] text-foreground-secondary mt-0.5">Click a sector slice below to filter the main applicant table.</p>
                </div>
                <div ref={riskDonutRef} className="w-full h-56" />
              </CardContent>
            </Card>

            {/* Financial Health bars */}
            <Card className="border border-border/80 bg-surface select-none">
              <CardContent className="p-5 space-y-3.5">
                <span className="text-[10px] font-bold text-foreground-muted uppercase tracking-widest block border-b border-border/40 pb-2.5">
                  Financial Health Distribution range
                </span>
                <div ref={healthBarRef} className="w-full h-56" />
              </CardContent>
            </Card>

            {/* Portfolio Heatmap */}
            <Card className="border border-border/80 bg-surface select-none">
              <CardContent className="p-5 space-y-3.5">
                <span className="text-[10px] font-bold text-foreground-muted uppercase tracking-widest block border-b border-border/40 pb-2.5">
                  Risk vs Loan Size Volume Heatmap
                </span>
                <div ref={heatmapRef} className="w-full h-56" />
              </CardContent>
            </Card>

          </div>

          {/* 5. REGIONAL ANALYTICS PANEL */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
            
            {/* Regional applications distribution */}
            <Card className="md:col-span-2 border border-border/80 bg-surface select-none">
              <CardContent className="p-5 space-y-3.5">
                <span className="text-[10px] font-bold text-foreground-muted uppercase tracking-widest block border-b border-border/40 pb-2.5">
                  Regional Distribution of Loan Files
                </span>
                <div ref={regionalChartRef} className="w-full h-52" />
              </CardContent>
            </Card>

            {/* Regional analytics callout card */}
            <Card className="border border-border/80 bg-surface select-none font-sans text-xs">
              <CardContent className="p-5 space-y-4">
                <span className="text-[10px] font-bold text-foreground-muted uppercase tracking-widest block border-b border-border/40 pb-2.5">
                  Spatial Statistics Summary
                </span>

                <div className="space-y-3">
                  <div className="bg-surface-elevated/45 border border-border p-3.5 rounded flex items-center justify-between">
                    <div>
                      <span className="text-[8.5px] text-foreground-muted uppercase block font-bold">Top Performing Region</span>
                      <span className="text-xs font-extrabold text-foreground mt-0.5 block">South (Bangalore Hub)</span>
                    </div>
                    <span className="text-[9px] bg-positive/10 text-positive border border-positive/20 rounded-xs px-2 py-0.5 font-bold uppercase shrink-0">
                      84 Avg Health
                    </span>
                  </div>

                  <div className="bg-surface-elevated/45 border border-border p-3.5 rounded flex items-center justify-between">
                    <div>
                      <span className="text-[8.5px] text-foreground-muted uppercase block font-bold">Highest Risk Region</span>
                      <span className="text-xs font-extrabold text-foreground mt-0.5 block">North (Delhi Hub)</span>
                    </div>
                    <span className="text-[9px] bg-critical/10 text-critical border border-critical/20 rounded-xs px-2 py-0.5 font-bold uppercase shrink-0">
                      72% Avg Def
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>

          </div>

          {/* 6. PORTFOLIO SEGMENTATION CARDS */}
          <div className="mt-8 select-none">
            <span className="text-[10px] font-bold text-foreground-muted uppercase tracking-widest block mb-4">
              AI Customer Segmentation Cohorts
            </span>

            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
              {segmentationData.map((seg, idx) => (
                <Card key={idx} className="border border-border/80 bg-surface font-sans text-xs select-none">
                  <CardContent className="p-4 space-y-3 flex flex-col justify-between h-40">
                    <div>
                      <span className="font-extrabold text-foreground block truncate">{seg.name}</span>
                      <span className="text-[9px] font-mono text-foreground-muted block mt-0.5 uppercase font-bold">
                        {seg.count} Customer Accounts
                      </span>
                    </div>

                    <div className="space-y-1 text-[10.5px]">
                      <div className="flex justify-between">
                        <span className="text-foreground-secondary">Avg Default:</span>
                        <span className="font-bold text-foreground font-mono">{seg.avgRisk}%</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-foreground-secondary">Avg Health:</span>
                        <span className="font-bold text-foreground font-mono">{seg.avgHealth}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-foreground-secondary">Avg Loan:</span>
                        <span className="font-bold text-foreground font-mono truncate">₹{(seg.avgLoan / 1000).toFixed(0)}K</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* 7. HIGH-RISK PRIORITY QUEUE CHECKLIST */}
          <div className="mt-8 select-none">
            <Card className="border border-border/80 bg-surface">
              <CardContent className="p-5 space-y-4">
                <span className="text-[10px] font-bold text-foreground-muted uppercase tracking-widest block border-b border-border/40 pb-2.5">
                  Critical High-Risk Cases Queue
                </span>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 font-sans text-xs select-none">
                  {priorityQueue.map((app) => (
                    <div
                      key={app.id}
                      onClick={() => router.push(`/officer/applicants/${app.id}`)}
                      className="border border-border/80 rounded bg-surface hover:border-primary/20 cursor-pointer p-4 space-y-3.5 hover:shadow-xs transition-all relative"
                    >
                      <div className="flex justify-between items-start">
                        <div className="space-y-0.5">
                          <span className="font-bold text-foreground block">{app.name}</span>
                          <span className="text-[8px] text-foreground-muted font-mono block">ID: {app.id}</span>
                        </div>

                        <span className="text-[8.5px] font-bold bg-critical/10 text-critical border border-critical/20 rounded px-1.5 py-0.25 uppercase">
                          {app.priority}
                        </span>
                      </div>

                      <div className="space-y-1.5 text-[10.5px]">
                        <div className="flex justify-between">
                          <span className="text-foreground-secondary">Default Risk:</span>
                          <span className="font-extrabold text-critical font-mono">{app.defaultProb}%</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-foreground-secondary">Financial Health:</span>
                          <span className="font-bold text-foreground font-mono">{app.healthScore}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-foreground-secondary">Requested Size:</span>
                          <span className="font-extrabold text-foreground font-mono">₹{app.amount.toLocaleString("en-IN")}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* 8. ENTERPRISE APPLICATIONS TABLE */}
          <div className="mt-8">
            <Card className="border border-border/80 bg-surface">
              <CardContent className="p-5 space-y-4">
                
                {/* Search & filters controls bar */}
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 select-none pb-4 border-b border-border/40">
                  <div className="relative flex-1">
                    <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-foreground-muted" />
                    <input
                      type="text"
                      placeholder="Search applicant name, ID, purpose..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full pl-8 pr-3 py-1.5 rounded border border-border bg-surface text-foreground font-sans text-xs focus:outline-none focus:border-primary"
                    />
                  </div>

                  <div className="flex flex-wrap items-center gap-2">
                    <select
                      value={riskFilter}
                      onChange={(e) => setRiskFilter(e.target.value)}
                      className="px-2.5 py-1.5 rounded border border-border bg-surface text-foreground text-xs font-sans focus:outline-none"
                    >
                      <option value="All">All Risks</option>
                      <option value="Low">Low Risk</option>
                      <option value="Medium">Medium Risk</option>
                      <option value="High">High Risk</option>
                      <option value="Critical">Critical Risk</option>
                    </select>

                    <select
                      value={segmentFilter}
                      onChange={(e) => setSegmentFilter(e.target.value)}
                      className="px-2.5 py-1.5 rounded border border-border bg-surface text-foreground text-xs font-sans focus:outline-none"
                    >
                      <option value="All">All Segments</option>
                      <option value="Young Investors">Young Investors</option>
                      <option value="High-Risk Borrowers">High-Risk Borrowers</option>
                      <option value="Budget Families">Budget Families</option>
                      <option value="Luxury Spenders">Luxury Spenders</option>
                      <option value="Students">Students</option>
                      <option value="Retired Customers">Retired Customers</option>
                    </select>

                    <select
                      value={statusFilter}
                      onChange={(e) => setStatusFilter(e.target.value)}
                      className="px-2.5 py-1.5 rounded border border-border bg-surface text-foreground text-xs font-sans focus:outline-none"
                    >
                      <option value="All">All Statuses</option>
                      <option value="Pending">Pending</option>
                      <option value="Under Review">Under Review</option>
                      <option value="AI Approved">AI Approved</option>
                      <option value="AI Rejected">AI Rejected</option>
                      <option value="Manual Review">Manual Review</option>
                      <option value="Documents Requested">Documents Requested</option>
                    </select>

                    {/* Column Dropdown Toggle */}
                    <div className="relative">
                      <Button
                        variant="outline"
                        onClick={() => setShowColumnDropdown(!showColumnDropdown)}
                        className="text-[9.5px] uppercase font-bold gap-1 cursor-pointer"
                      >
                        <SlidersHorizontal className="h-3 w-3" /> Columns
                      </Button>

                      {showColumnDropdown && (
                        <div className="absolute right-0 mt-1.5 w-44 border border-border bg-surface rounded shadow-lg p-2.5 z-40 space-y-2">
                          <span className="text-[8px] font-bold text-foreground-muted block uppercase">Visible Columns</span>
                          <div className="space-y-1.5 max-h-48 overflow-y-auto">
                            {Object.keys(visibleColumns).map((col) => (
                              <label key={col} className="flex items-center gap-2 cursor-pointer text-xs font-sans">
                                <input
                                  type="checkbox"
                                  checked={visibleColumns[col]}
                                  onChange={() => toggleColumnVisibility(col)}
                                  className="rounded border-border text-primary focus:ring-primary h-3 w-3"
                                />
                                <span className="capitalize">{col.replace(/([A-Z])/g, " $1")}</span>
                              </label>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>

                    <Button
                      variant="outline"
                      onClick={handleResetFilters}
                      className="text-[9.5px] uppercase font-bold cursor-pointer"
                    >
                      Reset
                    </Button>
                  </div>
                </div>

                {/* Applications Table */}
                {filteredList.length === 0 ? (
                  <div className="py-12 select-none font-sans text-xs text-center border border-border border-dashed rounded bg-surface-elevated/10">
                    <ShieldAlert className="h-8 w-8 text-foreground-muted mx-auto mb-2" />
                    <h3 className="font-bold text-foreground">No Portfolio Data Available</h3>
                    <p className="text-foreground-secondary mt-0.5 max-w-xs mx-auto">
                      Adjust your active filter coordinates or search search query.
                    </p>
                    <div className="flex gap-2 justify-center mt-4">
                      <Button
                        onClick={handleRefreshPortfolio}
                        size="sm"
                        className="text-[9px] uppercase font-bold cursor-pointer"
                      >
                        Refresh Data
                      </Button>
                      <Button
                        variant="outline"
                        onClick={() => toast.success("Importing sample datasets...")}
                        size="sm"
                        className="text-[9px] uppercase font-bold cursor-pointer border-border"
                      >
                        Import Data
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="overflow-x-auto border border-border rounded">
                    <table className="w-full text-xs text-left border-collapse">
                      <thead className="bg-surface-elevated text-[9px] font-bold text-foreground-secondary uppercase tracking-wider sticky top-0 border-b border-border z-10 select-none">
                        <tr>
                          {visibleColumns.applicant && (
                            <th
                              onClick={() => {
                                setSortField("name");
                                setSortOrder((p) => (p === "asc" ? "desc" : "asc"));
                              }}
                              className="py-2.5 px-3 cursor-pointer hover:bg-surface-hover/60"
                            >
                              Applicant Name
                            </th>
                          )}
                          {visibleColumns.loanAmount && (
                            <th
                              onClick={() => {
                                setSortField("amount");
                                setSortOrder((p) => (p === "asc" ? "desc" : "asc"));
                              }}
                              className="py-2.5 px-3 text-right cursor-pointer hover:bg-surface-hover/60"
                            >
                              Loan Amount
                            </th>
                          )}
                          {visibleColumns.financialHealth && (
                            <th
                              onClick={() => {
                                setSortField("healthScore");
                                setSortOrder((p) => (p === "asc" ? "desc" : "asc"));
                              }}
                              className="py-2.5 px-3 text-center cursor-pointer hover:bg-surface-hover/60"
                            >
                              Health Score
                            </th>
                          )}
                          {visibleColumns.defaultProbability && (
                            <th
                              onClick={() => {
                                setSortField("defaultProb");
                                setSortOrder((p) => (p === "asc" ? "desc" : "asc"));
                              }}
                              className="py-2.5 px-3 text-center cursor-pointer hover:bg-surface-hover/60"
                            >
                              Default Risk
                            </th>
                          )}
                          {visibleColumns.fraudRisk && (
                            <th
                              onClick={() => {
                                setSortField("fraudRisk");
                                setSortOrder((p) => (p === "asc" ? "desc" : "asc"));
                              }}
                              className="py-2.5 px-3 text-center cursor-pointer hover:bg-surface-hover/60"
                            >
                              Fraud Risk
                            </th>
                          )}
                          {visibleColumns.segment && <th className="py-2.5 px-3">Segment</th>}
                          {visibleColumns.officer && <th className="py-2.5 px-3">Officer</th>}
                          {visibleColumns.status && <th className="py-2.5 px-3">Status</th>}
                          {visibleColumns.createdDate && <th className="py-2.5 px-3">Created Date</th>}
                          {visibleColumns.actions && <th className="py-2.5 px-3 text-center">Actions</th>}
                        </tr>
                      </thead>
                      <tbody>
                        {paginatedList.map((app) => (
                          <tr
                            key={app.id}
                            onClick={() => {
                              setSelectedCustomer(app);
                              setIsDrawerOpen(true);
                            }}
                            className="border-b border-border/30 last:border-0 hover:bg-surface-hover/30 cursor-pointer transition-colors"
                          >
                            {visibleColumns.applicant && (
                              <td className="py-3 px-3 font-bold text-foreground">
                                {app.name} <span className="text-[8px] text-foreground-muted font-normal font-mono block">ID: {app.id}</span>
                              </td>
                            )}
                            {visibleColumns.loanAmount && (
                              <td className="py-3 px-3 text-right font-mono font-extrabold text-foreground">
                                ₹{app.amount.toLocaleString("en-IN")}
                              </td>
                            )}
                            {visibleColumns.financialHealth && (
                              <td className="py-3 px-3 text-center font-mono font-bold text-foreground">
                                {app.healthScore}
                              </td>
                            )}
                            {visibleColumns.defaultProbability && (
                              <td className="py-3 px-3 text-center font-mono">
                                <span className={cn("font-bold",
                                  app.defaultProb >= 50 ? "text-critical" : "text-positive"
                                )}>
                                  {app.defaultProb}%
                                </span>
                              </td>
                            )}
                            {visibleColumns.fraudRisk && (
                              <td className="py-3 px-3 text-center font-bold">
                                <span className={cn("px-2 py-0.5 rounded font-mono text-[9px]",
                                  app.fraudRisk === "High" ? "bg-critical/10 text-critical" : app.fraudRisk === "Medium" ? "bg-warning/10 text-warning" : "bg-positive/10 text-positive"
                                )}>
                                  {app.fraudRisk}
                                </span>
                              </td>
                            )}
                            {visibleColumns.segment && (
                              <td className="py-3 px-3 text-foreground-secondary">{app.segment}</td>
                            )}
                            {visibleColumns.officer && (
                              <td className="py-3 px-3 text-foreground-secondary">{app.officer}</td>
                            )}
                            {visibleColumns.status && (
                              <td className="py-3 px-3">
                                <StatusBadge status={app.status === "Pending" ? "pending" : app.status === "Under Review" ? "under_review" : "completed"} />
                              </td>
                            )}
                            {visibleColumns.createdDate && (
                              <td className="py-3 px-3 text-foreground-secondary font-mono">{app.date}</td>
                            )}
                            {visibleColumns.actions && (
                              <td
                                className="py-3 px-3 text-center"
                                onClick={(e) => e.stopPropagation()}
                              >
                                <button
                                  onClick={() => router.push(`/officer/applicants/${app.id}`)}
                                  className="text-primary font-bold uppercase hover:underline text-[9.5px] cursor-pointer"
                                >
                                  Profile
                                </button>
                              </td>
                            )}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}

                {/* Pagination Controls */}
                {filteredList.length > 0 && (
                  <div className="flex items-center justify-between select-none pt-4 border-t border-border/30">
                    <span className="text-[10px] text-foreground-muted font-sans font-medium">
                      Showing {(currentPage - 1) * itemsPerPage + 1} - {Math.min(currentPage * itemsPerPage, filteredList.length)} of {filteredList.length} files
                    </span>

                    <div className="flex items-center gap-1.5 font-mono text-[9.5px]">
                      <Button
                        variant="outline"
                        disabled={currentPage === 1}
                        onClick={() => setCurrentPage((p) => p - 1)}
                        className="py-1 px-2.5 uppercase font-bold cursor-pointer disabled:opacity-50"
                      >
                        Prev
                      </Button>
                      <span className="px-2 font-bold">
                        Page {currentPage} of {totalPages}
                      </span>
                      <Button
                        variant="outline"
                        disabled={currentPage === totalPages}
                        onClick={() => setCurrentPage((p) => p + 1)}
                        className="py-1 px-2.5 uppercase font-bold cursor-pointer disabled:opacity-50"
                      >
                        Next
                      </Button>
                    </div>
                  </div>
                )}

              </CardContent>
            </Card>
          </div>
        </>
      )}

      {/* ==========================================
          PORTFOLIO INTELLIGENCE DRAWER (RADIX SHEET)
         ========================================== */}
      <Sheet
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        title="Portfolio Intelligence Check"
      >
        {selectedCustomer && (
          <div className="space-y-5 font-sans text-xs select-none">
            
            {/* Header info */}
            <div className="border-b border-border/40 pb-4">
              <span className="text-[9px] bg-primary/10 text-primary border border-primary/20 rounded px-2 py-0.5 font-mono font-bold uppercase block w-max mb-2">
                {selectedCustomer.segment}
              </span>
              <h3 className="text-sm font-extrabold text-foreground">{selectedCustomer.name}</h3>
              <span className="text-[10px] text-foreground-secondary block mt-0.5 font-mono">ID: {selectedCustomer.id} • Region: {selectedCustomer.region}</span>
            </div>

            {/* Risk indices meters */}
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-surface-elevated/45 border border-border p-3 rounded">
                <span className="text-[8.5px] text-foreground-muted block uppercase font-bold">Default Prob.</span>
                <span className={cn("text-base font-extrabold font-mono block mt-1",
                  selectedCustomer.defaultProb >= 50 ? "text-critical" : "text-positive"
                )}>
                  {selectedCustomer.defaultProb}%
                </span>
              </div>
              <div className="bg-surface-elevated/45 border border-border p-3 rounded">
                <span className="text-[8.5px] text-foreground-muted block uppercase font-bold">Financial Health</span>
                <span className="text-base font-extrabold font-mono text-foreground block mt-1">
                  {selectedCustomer.healthScore} <span className="text-[10px] text-foreground-muted">/100</span>
                </span>
              </div>
            </div>

            {/* Financial summary snapshot */}
            <div className="space-y-2 border-y border-border/40 py-3 text-xs">
              <span className="text-[9.5px] font-bold text-foreground-secondary uppercase block">Financial Summary</span>
              <div className="space-y-1.5">
                <div className="flex justify-between">
                  <span className="text-foreground-secondary">Monthly Income:</span>
                  <span className="font-bold text-foreground font-mono">₹{selectedCustomer.income.toLocaleString("en-IN")}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-foreground-secondary">Monthly Expenses:</span>
                  <span className="font-bold text-foreground-secondary font-mono">₹{selectedCustomer.expenses.toLocaleString("en-IN")}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-foreground-secondary">Outstanding Debt:</span>
                  <span className="font-bold text-foreground font-mono">₹{selectedCustomer.debt.toLocaleString("en-IN")}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-foreground-secondary">Emergency Savings:</span>
                  <span className="font-bold text-foreground font-mono">₹{selectedCustomer.savings.toLocaleString("en-IN")}</span>
                </div>
              </div>
            </div>

            {/* AI Proposal Recommendation */}
            <div className="space-y-2">
              <span className="text-[9.5px] font-bold text-foreground-secondary uppercase block">AI Decision Proposal</span>
              <div className={cn("border p-3 rounded text-center font-bold",
                selectedCustomer.aiRec === "Approve" ? "bg-positive/5 border-positive/10 text-positive" :
                selectedCustomer.aiRec === "Deny" ? "bg-critical/5 border-critical/10 text-critical" : "bg-warning/5 border-warning/10 text-warning"
              )}>
                <span className="text-sm tracking-wider uppercase block">
                  {selectedCustomer.aiRec === "Approve" ? "APPROVE" : selectedCustomer.aiRec === "Deny" ? "REJECT" : "MANUAL REVIEW"}
                </span>
                <span className="text-[9px] block mt-0.5 font-mono opacity-85">
                  Model Confidence: {selectedCustomer.confidence}%
                </span>
              </div>
            </div>

            {/* Inbound route navigation links */}
            <div className="flex flex-col gap-2 pt-4 border-t border-border/40 select-none">
              <Button
                onClick={() => {
                  setIsDrawerOpen(false);
                  router.push(`/officer/applicants/${selectedCustomer.id}`);
                }}
                className="w-full text-[9.5px] font-extrabold uppercase justify-center cursor-pointer py-2"
              >
                View Full Profile
              </Button>
              <Button
                variant="outline"
                onClick={() => {
                  setIsDrawerOpen(false);
                  router.push(`/officer/underwriting/${selectedCustomer.id}`);
                }}
                className="w-full text-[9.5px] font-bold uppercase justify-center border-border/80 hover:bg-surface-hover cursor-pointer py-2"
              >
                Open Underwriting Workspace
              </Button>
            </div>

          </div>
        )}
      </Sheet>

      {/* ==========================================
          CASE ASSIGNMENT MODAL OVERLAY
         ========================================== */}
      <Modal
        isOpen={isAssignModalOpen}
        onClose={() => setIsAssignModalOpen(false)}
        title="Bulk Case Assignment Dashboard"
      >
        <div className="space-y-4 font-sans text-xs">
          
          <div className="space-y-1.5 select-none">
            <span className="font-extrabold text-foreground block">Select Target Underwriter Officer</span>
            <select
              value={assignTargetOfficer}
              onChange={(e) => setAssignTargetOfficer(e.target.value)}
              className="w-full border border-border bg-surface rounded p-2 text-xs focus:outline-none"
            >
              <option value="Officer Rahul">Officer Rahul</option>
              <option value="Officer Priya">Officer Priya</option>
              <option value="Officer Sinha">Officer Sinha</option>
              <option value="Senior Manager Priya">Senior Manager Priya</option>
            </select>
          </div>

          <div className="space-y-2">
            <span className="font-extrabold text-foreground block select-none">Unassigned Applications ({unassignedApps.length})</span>
            
            {unassignedApps.length === 0 ? (
              <div className="py-6 text-center text-foreground-secondary border border-border rounded bg-surface-elevated/10 select-none">
                All portfolios are fully assigned.
              </div>
            ) : (
              <div className="space-y-2 max-h-48 overflow-y-auto border border-border p-2.5 rounded bg-surface-elevated/5">
                {unassignedApps.map((app) => (
                  <div key={app.id} className="flex items-center justify-between border-b border-border/30 last:border-0 pb-1.5 last:pb-0">
                    <label className="flex items-center gap-2 cursor-pointer flex-1 py-0.5">
                      <input
                        type="checkbox"
                        checked={!!selectedAssignApps[app.id]}
                        onChange={() => handleToggleAssignApp(app.id)}
                        className="rounded border-border text-primary focus:ring-primary h-3.5 w-3.5"
                      />
                      <div>
                        <span className="font-bold text-foreground block">{app.name}</span>
                        <span className="text-[8.5px] text-foreground-muted font-mono block">₹{app.amount.toLocaleString("en-IN")} • {app.loanType}</span>
                      </div>
                    </label>

                    <span className="text-[8px] font-bold bg-critical/10 text-critical border border-critical/20 rounded px-1.5 py-0.25 uppercase font-mono">
                      {app.defaultProb}% Default
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="flex justify-end gap-2.5 pt-2 border-t border-border/40 select-none">
            <Button
              variant="outline"
              onClick={() => {
                setIsAssignModalOpen(false);
                setSelectedAssignApps({});
              }}
              size="sm"
              className="text-[9.5px] uppercase font-bold cursor-pointer"
            >
              Cancel
            </Button>
            <Button
              onClick={handleConfirmAssignment}
              disabled={unassignedApps.length === 0}
              size="sm"
              className="text-[9.5px] uppercase font-extrabold cursor-pointer bg-primary text-white disabled:opacity-50"
            >
              Assign Selected Cases
            </Button>
          </div>

        </div>
      </Modal>

    </PageContainer>
  );
}
