"use client";

import React, { useState, useMemo, useEffect, useRef, useCallback } from "react";
import { useTheme } from "next-themes";
import * as echarts from "echarts";
import {
  Sliders,
  RotateCcw,
  Save,
  TrendingUp,
  TrendingDown,
  Calculator,
  Activity,
  Sparkles,
  ClipboardList
} from "lucide-react";
import { toast } from "sonner";

import PageContainer from "@/components/ui/PageContainer";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils";
import {
  calculateSimulatorResults,
  BASELINE_INPUTS,
  BASELINE_RESULTS,
  SimulatorInputs,
  SimulatorResults
} from "@/lib/simulator_engine";

// ============================================================================
// ANIMATED NUMBER COMPONENT
// ============================================================================
const AnimatedNumber = ({ value }: { value: number }) => {
  const [displayValue, setDisplayValue] = useState(value);
  
  useEffect(() => {
    const start = displayValue;
    const end = value;
    if (start === end) return;
    
    const duration = 300; // ms
    const startTime = performance.now();
    
    let animationFrameId: number;
    
    const updateNumber = (now: number) => {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      
      // easeOutQuad curve
      const easeProgress = progress * (2 - progress);
      const current = Math.round(start + (end - start) * easeProgress);
      setDisplayValue(current);
      
      if (progress < 1) {
        animationFrameId = requestAnimationFrame(updateNumber);
      }
    };
    
    animationFrameId = requestAnimationFrame(updateNumber);
    return () => cancelAnimationFrame(animationFrameId);
  }, [value, displayValue]);
  
  return <span>{displayValue}</span>;
};

// ============================================================================
// SCENARIO PRESETS
// ============================================================================
interface ScenarioPreset {
  name: string;
  inputs: SimulatorInputs;
  description: string;
}

const SCENARIOS: Record<string, ScenarioPreset> = {
  current: {
    name: "Current Profile",
    inputs: BASELINE_INPUTS,
    description: "Your current financial values as registered by model indices."
  },
  scenarioA: {
    name: "Scenario A: Debt Reduction",
    inputs: {
      income: 120000,
      expenses: 74000,     // reduced
      utilization: 25,     // reduced from 68%
      savings: 45000,      // increased
      totalDebt: 320000,   // reduced from 5.4L
      loanAmount: 250000,
      emi: 10000           // reduced
    },
    description: "Low-debt strategy targeting credit card repayment and cutbacks on discretionary bills."
  },
  scenarioB: {
    name: "Scenario B: Savings Surge",
    inputs: {
      income: 150000,      // increased from 1.2L
      expenses: 85000,
      utilization: 45,     // reduced
      savings: 65000,      // increased
      totalDebt: 480000,
      loanAmount: 250000,
      emi: 15000
    },
    description: "Income expansion strategy focused on maximizing emergency cash buffers."
  }
};

export default function WhatIfSimulatorPage() {
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === "dark";

  // Active inputs state
  const [inputs, setInputs] = useState<SimulatorInputs>(BASELINE_INPUTS);
  


  // ECharts Ref
  const radarChartRef = useRef<HTMLDivElement>(null);
  const radarInstance = useRef<echarts.ECharts | null>(null);

  // Results calculation
  const results = useMemo<SimulatorResults>(() => calculateSimulatorResults(inputs), [inputs]);

  // Comparison presets calculation
  const resultsA = useMemo<SimulatorResults>(() => calculateSimulatorResults(SCENARIOS.scenarioA.inputs), []);
  const resultsB = useMemo<SimulatorResults>(() => calculateSimulatorResults(SCENARIOS.scenarioB.inputs), []);

  // Update single factor input
  const handleInputChange = useCallback((key: keyof SimulatorInputs, value: number) => {
    setInputs((prev) => ({
      ...prev,
      [key]: value
    }));
  }, []);

  // Reset single factor back to baseline value
  const handleResetFactor = useCallback((key: keyof SimulatorInputs) => {
    setInputs((prev) => ({
      ...prev,
      [key]: BASELINE_INPUTS[key]
    }));
    toast.success(`Reset ${key.toUpperCase()} to current profile value.`);
  }, []);

  // Reset entire simulator back to baseline
  const handleResetAll = useCallback(() => {
    setInputs(BASELINE_INPUTS);
    toast.success("Reset all inputs to baseline profile.");
  }, []);

  // Save current inputs as a user scenario
  const handleSaveScenario = useCallback(() => {
    const scenarioName = `Custom Scenario (${new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })})`;
    toast.success(`Saved current simulation state as "${scenarioName}"`);
  }, []);

  // Load a scenario preset into inputs
  const handleLoadScenario = useCallback((presetKey: keyof typeof SCENARIOS) => {
    setInputs(SCENARIOS[presetKey].inputs);
    toast.success(`Loaded presets for ${SCENARIOS[presetKey].name}`);
  }, []);

  // Render ECharts Radar comparison chart
  useEffect(() => {
    if (!radarChartRef.current) return;

    if (radarInstance.current) {
      radarInstance.current.dispose();
    }

    const chart = echarts.init(radarChartRef.current);
    radarInstance.current = chart;

    const textColor = isDark ? "#94A3B8" : "#64748B"; // var(--foreground-secondary)
    const gridLineColor = isDark ? "rgba(30, 41, 59, 0.5)" : "rgba(226, 232, 240, 0.7)";

    const option: echarts.EChartsOption = {
      legend: {
        data: ["Current Baseline", "Simulated State"],
        bottom: 0,
        textStyle: { color: textColor, fontSize: 10, fontFamily: "var(--font-sans)" },
        itemWidth: 10,
        itemHeight: 10
      },
      tooltip: {
        trigger: "item"
      },
      radar: {
        shape: "circle",
        indicator: [
          { name: "Default Risk (Lower is Better)", max: 100 },
          { name: "Financial Health", max: 100 },
          { name: "Savings Score", max: 100 },
          { name: "Debt Ratio (Lower is Better)", max: 100 },
          { name: "Savings Rate", max: 60 }
        ],
        axisName: {
          color: textColor,
          fontSize: 9,
          fontFamily: "var(--font-sans)"
        },
        splitLine: {
          lineStyle: { color: gridLineColor }
        },
        splitArea: { show: false }
      },
      series: [
        {
          name: "Profile Comparison",
          type: "radar",
          data: [
            {
              value: [
                BASELINE_RESULTS.defaultRisk,
                BASELINE_RESULTS.financialHealth,
                BASELINE_RESULTS.savingsScore,
                // Normalize debt ratio index (scaled totalDebt/income ratio)
                Math.min(100, Math.round((BASELINE_INPUTS.totalDebt / (BASELINE_INPUTS.income * 12)) * 100)),
                Math.round((BASELINE_INPUTS.savings / BASELINE_INPUTS.income) * 100)
              ],
              name: "Current Baseline",
              itemStyle: { color: "#64748B" },
              lineStyle: { type: "dashed", width: 1.5 },
              areaStyle: { color: "rgba(100, 116, 139, 0.05)" }
            },
            {
              value: [
                results.defaultRisk,
                results.financialHealth,
                results.savingsScore,
                Math.min(100, Math.round((inputs.totalDebt / (inputs.income * 12)) * 100)),
                Math.round((inputs.savings / inputs.income) * 100)
              ],
              name: "Simulated State",
              itemStyle: { color: "#4F7CFF" },
              lineStyle: { width: 2 },
              areaStyle: { color: "rgba(79, 124, 255, 0.15)" }
            }
          ]
        }
      ]
    };

    chart.setOption(option);

    const handleResize = () => {
      chart.resize();
    };
    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
      chart.dispose();
      radarInstance.current = null;
    };
  }, [inputs, results, isDark]);

  // AI narrative assessment generator based on results
  const aiNarrativeText = useMemo(() => {
    const riskDiff = BASELINE_RESULTS.defaultRisk - results.defaultRisk;
    const healthDiff = results.financialHealth - BASELINE_RESULTS.financialHealth;

    if (riskDiff > 10 && healthDiff > 10) {
      return "Excellent! The simulated combination of parameters drops your credit default risk significantly and pushes your financial grade into the highest bracket. Repaying high-interest card accounts produces the largest delta here.";
    }
    if (riskDiff < 0) {
      return "Warning: The simulated parameters increase overall baseline risk. Increasing revolving balances or overhead debt ratios spikes default probabilities. Consider adjusting credit card limits downwards.";
    }
    return "The simulated scenario maintains stable parameters. You can target lowering credit utilization or expanding emergency reserves to unlock further credit health score increases.";
  }, [results]);

  return (
    <PageContainer className="pb-24">

      {/* HEADER SECTION */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between pb-3 border-b border-border/60 select-none">
        <div className="space-y-1">
          <h1 className="text-2xl font-bold font-sans tracking-tight text-foreground flex items-center gap-2.5">
            <Calculator className="h-6.5 w-6.5 text-primary animate-pulse" /> WHAT-IF SIMULATOR
          </h1>
          <p className="text-xs text-foreground-secondary font-sans">
            Interactive financial decision laboratory. Adjust variables to observe live simulated shifts in default risk and cash flow cushions.
          </p>
        </div>

        <div className="flex gap-2 self-start md:self-center">
          <Button
            variant="outline"
            size="sm"
            onClick={handleResetAll}
            className="text-[10px] uppercase font-bold gap-1.5 cursor-pointer select-none"
          >
            <RotateCcw className="h-3.5 w-3.5" /> Reset Scenario
          </Button>
          <Button
            onClick={handleSaveScenario}
            size="sm"
            className="text-[10px] uppercase font-bold gap-1.5 cursor-pointer select-none"
          >
            <Save className="h-3.5 w-3.5" /> Save Scenario
          </Button>
        </div>
      </div>

      {/* CORE WORKSPACE GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mt-6">
        
        {/* LEFT COLUMN: FINANCIAL CONTROLS (5 COLS - 41.6%) */}
        <div className="lg:col-span-5 space-y-6">
          <Card className="border border-border/80 bg-surface p-5 select-none space-y-5">
            <div className="border-b border-border/60 pb-3 mb-2 flex justify-between items-center">
              <h3 className="text-xs uppercase tracking-widest text-foreground-muted font-bold flex items-center gap-1.5">
                Financial Controls <Sliders className="h-3.5 w-3.5 text-primary" />
              </h3>
              <span className="text-[9px] font-sans font-bold text-foreground-muted bg-surface-elevated border border-border px-2 py-0.5 rounded-sm">
                DECISION SLIDERS
              </span>
            </div>

            {/* SLIDERS LIST */}
            <div className="space-y-5">
              {[
                {
                  label: "Monthly Income",
                  key: "income" as const,
                  min: 30000,
                  max: 300000,
                  step: 5000,
                  unit: "₹",
                  suffix: "",
                  healthy: "> ₹75K"
                },
                {
                  label: "Monthly Expenses",
                  key: "expenses" as const,
                  min: 15000,
                  max: 200000,
                  step: 2000,
                  unit: "₹",
                  suffix: "",
                  healthy: "< 60% Income"
                },
                {
                  label: "Credit Card Utilization",
                  key: "utilization" as const,
                  min: 5,
                  max: 100,
                  step: 1,
                  unit: "",
                  suffix: "%",
                  healthy: "< 30%"
                },
                {
                  label: "Monthly Savings",
                  key: "savings" as const,
                  min: 0,
                  max: 100000,
                  step: 2000,
                  unit: "₹",
                  suffix: "",
                  healthy: "> 20% Income"
                },
                {
                  label: "Total Outstanding Debt",
                  key: "totalDebt" as const,
                  min: 0,
                  max: 2000000,
                  step: 25000,
                  unit: "₹",
                  suffix: "",
                  healthy: "< 3x Income"
                },
                {
                  label: "Active Loan Principal",
                  key: "loanAmount" as const,
                  min: 0,
                  max: 1000000,
                  step: 10000,
                  unit: "₹",
                  suffix: "",
                  healthy: "N/A"
                },
                {
                  label: "Monthly Loan EMI",
                  key: "emi" as const,
                  min: 0,
                  max: 80000,
                  step: 1000,
                  unit: "₹",
                  suffix: "",
                  healthy: "< 15% Income"
                }
              ].map((ctrl) => {
                const currentVal = BASELINE_INPUTS[ctrl.key];
                const simVal = inputs[ctrl.key];
                const isChanged = simVal !== currentVal;

                return (
                  <div key={ctrl.key} className="space-y-2 border-b border-border/30 pb-3 last:border-b-0">
                    <div className="flex justify-between items-center text-xs">
                      <span className="font-semibold text-foreground flex items-center gap-1.5">
                        {ctrl.label}
                        {ctrl.healthy !== "N/A" && (
                          <span className="text-[8px] bg-positive/10 text-positive px-1.5 py-0.25 rounded-xs border border-positive/15 font-sans font-bold">
                            {ctrl.healthy}
                          </span>
                        )}
                      </span>
                      
                      <div className="flex items-center gap-1.5">
                        {isChanged && (
                          <button
                            onClick={() => handleResetFactor(ctrl.key)}
                            className="text-[9px] font-sans font-bold text-foreground-muted hover:underline uppercase flex items-center gap-0.5 cursor-pointer"
                          >
                            <RotateCcw className="h-2.5 w-2.5" /> Reset
                          </button>
                        )}
                        <span className="text-[10px] text-foreground-muted">
                          Baseline: {ctrl.unit}{currentVal.toLocaleString()}{ctrl.suffix}
                        </span>
                      </div>
                    </div>

                    {/* Slider and numeric input sync row */}
                    <div className="flex gap-4 items-center">
                      <input
                        type="range"
                        min={ctrl.min}
                        max={ctrl.max}
                        step={ctrl.step}
                        value={simVal}
                        onChange={(e) => handleInputChange(ctrl.key, parseFloat(e.target.value))}
                        className="flex-1 h-1 bg-border rounded-lg appearance-none cursor-pointer accent-primary focus:outline-none"
                      />
                      
                      <div className="relative shrink-0 w-24">
                        {ctrl.unit && <span className="absolute left-2.5 top-2.5 text-[10px] text-foreground-secondary">{ctrl.unit}</span>}
                        <input
                          type="number"
                          min={ctrl.min}
                          max={ctrl.max}
                          step={ctrl.step}
                          value={simVal}
                          onChange={(e) => handleInputChange(ctrl.key, parseFloat(e.target.value) || 0)}
                          className={cn(
                            "w-full bg-surface-elevated border text-xs font-mono rounded-sm py-2 text-right pr-2 focus:outline-none focus:ring-1 focus:ring-primary text-foreground font-bold",
                            ctrl.unit ? "pl-5" : "pl-2",
                            isChanged ? "border-primary text-primary" : "border-border"
                          )}
                        />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </Card>
        </div>

        {/* RIGHT COLUMN: LIVE SIMULATED RESULTS (7 COLS - 58.3%) */}
        <div className="lg:col-span-7 space-y-6">
          <Card className="border border-border/80 bg-surface p-5 md:p-6 select-none space-y-6">
            
            <div className="border-b border-border/60 pb-4 flex justify-between items-center">
              <div className="space-y-0.5">
                <h3 className="text-xs uppercase tracking-widest text-foreground-muted font-bold flex items-center gap-1.5">
                  Live Simulated Results <Activity className="h-4 w-4 text-primary" />
                </h3>
                <p className="text-[10.5px] text-foreground-secondary font-sans">
                  Real-time calculated feedback comparing baseline parameters against Decision adjustments.
                </p>
              </div>
            </div>

            {/* RESULTS METRICS GRID */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              
              {/* Metric 1: Default Risk */}
              <div className="border border-border bg-surface-elevated/40 p-4.5 rounded-sm flex flex-col justify-between min-h-[110px]">
                <span className="text-[9px] font-bold text-foreground-muted uppercase tracking-wider block font-sans">Default Risk</span>
                <div className="my-1.5 flex items-baseline gap-1 font-mono">
                  <span className="text-2xl font-extrabold text-foreground tracking-tight">
                    <AnimatedNumber value={results.defaultRisk} />%
                  </span>
                  <span className="text-[10px] text-foreground-muted font-normal">
                    (was {BASELINE_RESULTS.defaultRisk}%)
                  </span>
                </div>
                <span className={cn(
                  "text-[8px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded-xs self-start border",
                  results.defaultRisk < BASELINE_RESULTS.defaultRisk
                    ? "text-positive bg-positive/10 border-positive/20"
                    : results.defaultRisk > BASELINE_RESULTS.defaultRisk
                    ? "text-critical bg-critical/10 border-critical/20"
                    : "text-foreground-secondary bg-surface-elevated border-border"
                )}>
                  {results.defaultRisk < BASELINE_RESULTS.defaultRisk ? "Risk Dropped" : results.defaultRisk > BASELINE_RESULTS.defaultRisk ? "Risk Spiked" : "No Change"}
                </span>
              </div>

              {/* Metric 2: Financial Health */}
              <div className="border border-border bg-surface-elevated/40 p-4.5 rounded-sm flex flex-col justify-between min-h-[110px]">
                <span className="text-[9px] font-bold text-foreground-muted uppercase tracking-wider block font-sans">Financial Health</span>
                <div className="my-1.5 flex items-baseline gap-1 font-mono">
                  <span className="text-2xl font-extrabold text-foreground tracking-tight">
                    <AnimatedNumber value={results.financialHealth} />
                  </span>
                  <span className="text-[10px] text-foreground-muted font-normal">
                    (was {BASELINE_RESULTS.financialHealth})
                  </span>
                </div>
                <span className={cn(
                  "text-[8px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded-xs self-start border",
                  results.financialHealth > BASELINE_RESULTS.financialHealth
                    ? "text-positive bg-positive/10 border-positive/20"
                    : results.financialHealth < BASELINE_RESULTS.financialHealth
                    ? "text-critical bg-critical/10 border-critical/20"
                    : "text-foreground-secondary bg-surface-elevated border-border"
                )}>
                  {results.financialHealth > BASELINE_RESULTS.financialHealth ? "Improved" : results.financialHealth < BASELINE_RESULTS.financialHealth ? "Reduced" : "No Change"}
                </span>
              </div>

              {/* Metric 3: Savings Score */}
              <div className="border border-border bg-surface-elevated/40 p-4.5 rounded-sm flex flex-col justify-between min-h-[110px]">
                <span className="text-[9px] font-bold text-foreground-muted uppercase tracking-wider block font-sans">Savings Score</span>
                <div className="my-1.5 flex items-baseline gap-1 font-mono">
                  <span className="text-2xl font-extrabold text-foreground tracking-tight">
                    <AnimatedNumber value={results.savingsScore} />
                  </span>
                  <span className="text-[10px] text-foreground-muted font-normal">
                    (was {BASELINE_RESULTS.savingsScore})
                  </span>
                </div>
                <span className={cn(
                  "text-[8px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded-xs self-start border",
                  results.savingsScore > BASELINE_RESULTS.savingsScore
                    ? "text-positive bg-positive/10 border-positive/20"
                    : results.savingsScore < BASELINE_RESULTS.savingsScore
                    ? "text-critical bg-critical/10 border-critical/20"
                    : "text-foreground-secondary bg-surface-elevated border-border"
                )}>
                  {results.savingsScore > BASELINE_RESULTS.savingsScore ? "Improved" : results.savingsScore < BASELINE_RESULTS.savingsScore ? "Reduced" : "No Change"}
                </span>
              </div>

              {/* Metric 4: Cash Flow Risk */}
              <div className="border border-border bg-surface-elevated/40 p-4.5 rounded-sm flex flex-col justify-between min-h-[110px]">
                <span className="text-[9px] font-bold text-foreground-muted uppercase tracking-wider block font-sans">Cash Flow Risk</span>
                <div className="my-1.5 flex items-baseline gap-1 font-mono">
                  <span className="text-2xl font-extrabold text-foreground tracking-tight uppercase">
                    {results.cashFlowRisk}
                  </span>
                  <span className="text-[10px] text-foreground-muted font-normal uppercase">
                    (was {BASELINE_RESULTS.cashFlowRisk})
                  </span>
                </div>
                <span className={cn(
                  "text-[8px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded-xs self-start border",
                  results.cashFlowRisk === "LOW"
                    ? "text-positive bg-positive/10 border-positive/20"
                    : results.cashFlowRisk === "MEDIUM"
                    ? "text-warning bg-warning/10 border-warning/20"
                    : "text-critical bg-critical/10 border-critical/20"
                )}>
                  {results.cashFlowRisk} Risk Grade
                </span>
              </div>

            </div>

            {/* RADAR VISUALIZATION */}
            <div className="h-64 border border-border/50 rounded-sm bg-surface-elevated/10 relative flex flex-col justify-end p-2 overflow-hidden">
              <div ref={radarChartRef} className="w-full h-full min-h-[240px]" />
            </div>

            {/* IMPACT BREAKDOWN */}
            <div className="space-y-2 pt-2 border-t border-border/40">
              <h4 className="text-[11px] font-bold text-foreground-muted uppercase tracking-wider">
                Impact Breakdown
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                {results.impacts.length === 0 ? (
                  <div className="col-span-2 text-xs text-foreground-secondary bg-surface-elevated/55 border border-border border-dashed p-3 rounded-sm text-center">
                    Adjust controls on the left to see computed impact contributions.
                  </div>
                ) : (
                  results.impacts.map((imp, idx) => (
                    <div
                      key={idx}
                      className="bg-surface-elevated/45 border border-border p-3 rounded-xs flex justify-between items-center text-xs"
                    >
                      <span className="font-semibold text-foreground flex items-center gap-1.5">
                        <span className={cn(
                          "h-1.5 w-1.5 rounded-full",
                          imp.isPositive ? "bg-positive" : "bg-critical"
                        )} />
                        {imp.feature}
                      </span>
                      <span className={cn(
                        "font-mono font-bold px-2 py-0.5 rounded-xs",
                        imp.isPositive ? "text-positive bg-positive/10" : "text-critical bg-critical/10"
                      )}>
                        {imp.effect}
                      </span>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* AI SIMULATION SUMMARY */}
            <div className="bg-primary/5 border border-primary/30 p-4.5 rounded-sm space-y-3.5">
              <div className="flex items-start gap-2.5">
                <Sparkles className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <span className="text-[11px] font-bold text-foreground uppercase tracking-wide block">AI Decision assessment</span>
                  <p className="text-xs text-foreground-secondary leading-relaxed font-sans">
                    {aiNarrativeText}
                  </p>
                </div>
              </div>

              {/* Expected Improvement block */}
              {results.defaultRisk < BASELINE_RESULTS.defaultRisk && (
                <div className="border-t border-primary/10 pt-3 flex flex-wrap gap-4 text-[10.5px] font-mono text-foreground-secondary">
                  <div>
                    <span className="text-[9px] font-sans text-foreground-muted block">EXPECTED IMPROVEMENT:</span>
                    <span className="text-positive font-bold flex items-center gap-0.5 mt-0.5">
                      <TrendingDown className="h-3.5 w-3.5" /> Default Risk -{BASELINE_RESULTS.defaultRisk - results.defaultRisk}%
                    </span>
                  </div>
                  {results.financialHealth > BASELINE_RESULTS.financialHealth && (
                    <div>
                      <span className="text-[9px] font-sans text-foreground-muted block">HEALTH MARGIN DELTA:</span>
                      <span className="text-positive font-bold flex items-center gap-0.5 mt-0.5">
                        <TrendingUp className="h-3.5 w-3.5" /> Financial Health +{results.financialHealth - BASELINE_RESULTS.financialHealth}
                      </span>
                    </div>
                  )}
                </div>
              )}

              <div className="flex flex-wrap gap-2.5 pt-1">
                <Button
                  size="sm"
                  onClick={() => {
                    toast.success("Action Action Plan created based on simulated strategy.");
                  }}
                  className="text-[9.5px] font-sans font-bold uppercase cursor-pointer"
                >
                  Create Action Plan
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    toast.success("Scenario saved successfully.");
                  }}
                  className="text-[9.5px] font-sans font-bold uppercase cursor-pointer hover:bg-surface-elevated"
                >
                  Save Scenario
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    toast.info("Generating PDF Simulation Report...");
                  }}
                  className="text-[9.5px] font-sans font-bold uppercase cursor-pointer hover:bg-surface-elevated"
                >
                  Generate Report
                </Button>
              </div>
            </div>

          </Card>
        </div>

      </div>

      {/* SCENARIO COMPARISON PANEL */}
      <div className="mt-8 select-none border-t border-border/80 pt-6">
        <div className="space-y-1 pb-3 mb-6">
          <h3 className="text-xs uppercase tracking-widest text-foreground-muted font-bold flex items-center gap-1.5">
            Scenario Benchmarking <ClipboardList className="h-4 w-4 text-primary" />
          </h3>
          <p className="text-[11px] text-foreground-secondary">
            Benchmark inputs and simulated metrics side-by-side against target profiles.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            {
              key: "current" as const,
              results: BASELINE_RESULTS,
              color: "border-slate-500 bg-slate-500/5",
              chip: "bg-slate-500/10 text-slate-500 border-slate-500/20"
            },
            {
              key: "scenarioA" as const,
              results: resultsA,
              color: "border-primary bg-primary/5",
              chip: "bg-primary/10 text-primary border-primary/20"
            },
            {
              key: "scenarioB" as const,
              results: resultsB,
              color: "border-positive bg-positive/5",
              chip: "bg-positive/10 text-positive border-positive/20"
            }
          ].map((item) => {
            const sc = SCENARIOS[item.key];
            const isLoaded = JSON.stringify(inputs) === JSON.stringify(sc.inputs);
            
            return (
              <Card
                key={item.key}
                className={cn(
                  "border p-4.5 flex flex-col justify-between min-h-[220px] transition-all duration-300",
                  item.color,
                  isLoaded && "ring-1 ring-primary/80"
                )}
              >
                <div className="space-y-3">
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="text-xs font-bold text-foreground">
                        {sc.name}
                      </h4>
                      <p className="text-[10px] text-foreground-secondary mt-0.5 line-clamp-2">
                        {sc.description}
                      </p>
                    </div>
                    {isLoaded && (
                      <span className="text-[8px] bg-primary text-primary-foreground font-sans font-bold px-1.5 py-0.25 rounded-xs uppercase tracking-wider">
                        Active
                      </span>
                    )}
                  </div>

                  {/* Score differences */}
                  <div className="grid grid-cols-2 gap-3 text-xs border-t border-border/30 pt-3">
                    <div>
                      <span className="text-[9px] text-foreground-muted block font-sans">DEFAULT RISK</span>
                      <span className="font-mono text-sm font-bold text-foreground">{item.results.defaultRisk}%</span>
                    </div>
                    <div>
                      <span className="text-[9px] text-foreground-muted block font-sans">HEALTH SCORE</span>
                      <span className="font-mono text-sm font-bold text-foreground">{item.results.financialHealth}</span>
                    </div>
                    <div>
                      <span className="text-[9px] text-foreground-muted block font-sans">SAVINGS SCORE</span>
                      <span className="font-mono text-sm font-bold text-foreground">{item.results.savingsScore}</span>
                    </div>
                    <div>
                      <span className="text-[9px] text-foreground-muted block font-sans">CASH FLOW</span>
                      <span className="font-mono text-sm font-bold text-foreground uppercase">{item.results.cashFlowRisk}</span>
                    </div>
                  </div>
                </div>

                <div className="pt-4 border-t border-border/30 mt-3">
                  <Button
                    variant="outline"
                    onClick={() => handleLoadScenario(item.key)}
                    disabled={isLoaded}
                    className="w-full text-[10px] font-sans font-bold py-1.5 border-border/60 hover:bg-surface-elevated text-foreground uppercase cursor-pointer"
                  >
                    {isLoaded ? "Active State" : "Load Scenario"}
                  </Button>
                </div>
              </Card>
            );
          })}
        </div>
      </div>

    </PageContainer>
  );
}
