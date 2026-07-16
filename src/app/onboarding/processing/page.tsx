"use client";

import React, { useState, useEffect, useRef, useMemo } from "react";
import { useRouter } from "next/navigation";
import { 
  Check, 
  AlertTriangle, 
  X, 
  Terminal as TerminalIcon, 
  Activity, 
  Cpu, 
  ArrowRight, 
  ListTodo
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import { Sheet } from "@/components/ui/Overlays";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

// Define log interface
interface LogEntry {
  time: string;
  type: "info" | "warning" | "error" | "success";
  message: string;
}

// Define model state interface
interface ModelRun {
  id: string;
  name: string;
  status: "waiting" | "active" | "completed";
  progress: number;
  records: number;
  time: number;
}

// Define stages
interface PipelineStep {
  id: string;
  name: string;
  label: string;
}

export default function AIProcessingPage() {
  const router = useRouter();
  const consoleEndRef = useRef<HTMLDivElement>(null);
  
  const [currentStageIdx, setCurrentStageIdx] = useState(0);
  const [scaleFailed, setScaleFailed] = useState(false);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [showSuccess, setShowSuccess] = useState(false);
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [summaryOpen, setSummaryOpen] = useState(false);

  // Model States
  const [models, setModels] = useState<ModelRun[]>([
    { id: "credit-risk", name: "Credit Risk Model", status: "waiting", progress: 0, records: 12482, time: 0 },
    { id: "fraud-detect", name: "Fraud Detection", status: "waiting", progress: 0, records: 12482, time: 0 },
    { id: "segmentation", name: "Customer Segmentation", status: "waiting", progress: 0, records: 12482, time: 0 },
    { id: "forecast", name: "Cash Flow Forecast", status: "waiting", progress: 0, records: 12482, time: 0 }
  ]);

  // Static pipeline steps definition
  const steps: PipelineStep[] = useMemo(() => [
    { id: "ingest", name: "DATA RECEIVED", label: "Ledger pipeline connected" },
    { id: "validate", name: "VALIDATION", label: "Checksum mapping check" },
    { id: "cleaning", name: "DATA CLEANING", label: "PII field obfuscation" },
    { id: "impute", name: "MISSING VALUE HANDLING", label: "Median ledger imputations" },
    { id: "outlier", name: "OUTLIER DETECTION", label: "Spend velocity anomaly scan" },
    { id: "features", name: "FEATURE ENGINEERING", label: "Ratios & Cash Burn markers" },
    { id: "scaling", name: "SCALING & ENCODING", label: "Input matrices normalization" },
    { id: "models", name: "MODEL SUITE RUN", label: "Concurrent risk neural nets" },
    { id: "shap", name: "EXPLAINABILITY ENGINE", label: "SHAP importance indices" },
    { id: "recs", name: "GENERATING RECOMMENDATIONS", label: "Tactical cash suggestions" },
    { id: "ready", name: "INTELLIGENCE READY", label: "Workspace compilation finished" }
  ], []);

  // Pre-configured simulation timeline logs
  const logTimeline = useMemo(() => [
    // DATA_RECEIVED (0s - 1s)
    { tick: 0, type: "info", stage: 0, message: "Initializing connection pipelines..." },
    { tick: 2, type: "info", stage: 0, message: "Parsed 3 uploaded statement documents." },
    { tick: 5, type: "success", stage: 0, message: "Read 12,482 total ledger transaction records." },
    // VALIDATION (1s - 2s)
    { tick: 10, type: "info", stage: 1, message: "Validating column mappings against standard ledger schemas..." },
    { tick: 14, type: "info", stage: 1, message: "Verification: checking header hashes..." },
    { tick: 18, type: "success", stage: 1, message: "Checksum matches. Source signatures validated." },
    // DATA_CLEANING (2s - 3s)
    { tick: 20, type: "info", stage: 2, message: "Obfuscating customer personal details (PII)..." },
    { tick: 24, type: "info", stage: 2, message: "Scrubbed tax identifiers and banking account numerals." },
    { tick: 28, type: "success", stage: 2, message: "PII scrubbing complete. Standardizing text descriptions." },
    // MISSING_VALUE_HANDLING (3s - 4.2s)
    { tick: 30, type: "info", stage: 3, message: "Checking transaction records for empty parameters..." },
    { tick: 35, type: "warning", stage: 3, message: "Warning: Found 47 missing balance fields. Imputing values." },
    { tick: 39, type: "success", stage: 3, message: "Resolved 47 missing values via running median interpolation." },
    // OUTLIER_DETECTION (4.2s - 5.4s)
    { tick: 42, type: "info", stage: 4, message: "Scanning for spend outliers and high-frequency deposits..." },
    { tick: 48, type: "warning", stage: 4, message: "Warning: Flagged 14 transaction velocity anomalies." },
    { tick: 52, type: "success", stage: 4, message: "14 anomalies isolated and mapped to fraud modeling vectors." },
    // FEATURE_ENGINEERING (5.4s - 6.6s)
    { tick: 55, type: "info", stage: 5, message: "Engineering core analytical features..." },
    { tick: 59, type: "info", stage: 5, message: "Computed monthly burn rates, leverage levels, and credit limits." },
    { tick: 63, type: "success", stage: 5, message: "Generated 26 financial features. Pushed to neural network store." },
    // SCALING_ENCODING (6.6s - 9.0s)
    { tick: 66, type: "info", stage: 6, message: "Normalizing continuous scaling variables..." },
    { tick: 70, type: "error", stage: 6, message: "Error: Matrix node timed out on encoding categorical codes." },
    { tick: 76, type: "info", stage: 6, message: "Retrying scaler job on auxiliary node matrix..." },
    { tick: 84, type: "success", stage: 6, message: "Scaler node recovered. Encoding and vector normalizations complete." },
    // MODELS (9.0s - 12.0s)
    { tick: 90, type: "info", stage: 7, message: "Spawning independent model threads concurrently..." },
    { tick: 92, type: "info", stage: 7, message: "Launched Credit Risk deep network." },
    { tick: 94, type: "info", stage: 7, message: "Launched Fraud Isolation cluster." },
    { tick: 96, type: "info", stage: 7, message: "Launched Cash Flow regression models." },
    { tick: 98, type: "info", stage: 7, message: "Launched Customer Segmentation clustering." },
    { tick: 104, type: "success", stage: 7, message: "Customer Segmentation completed. Assigned to High Growth." },
    { tick: 108, type: "success", stage: 7, message: "Fraud Detection completed: 2 anomaly spikes recorded." },
    { tick: 112, type: "success", stage: 7, message: "Credit Risk completed: Computed score 820 (Grade A)." },
    { tick: 118, type: "success", stage: 7, message: "Cash Flow Forecast completed: 12-month projections built." },
    // EXPLAINABILITY (12.0s - 13.5s)
    { tick: 121, type: "info", stage: 8, message: "Computing SHAP explanation arrays..." },
    { tick: 126, type: "info", stage: 8, message: "Extracting top 5 risk indicators for explainable matrices..." },
    { tick: 132, type: "success", stage: 8, message: "SHAP explanation values generated and cached." },
    // RECOMMENDATIONS (13.5s - 15.0s)
    { tick: 136, type: "info", stage: 9, message: "Parsing model scores against recommendation rules..." },
    { tick: 142, type: "success", stage: 9, message: "Compiled 18 data-backed cash optimization suggestions." },
    { tick: 148, type: "info", stage: 9, message: "Packaging indicators and committing changes to client ledger..." },
    // READY (15.0s)
    { tick: 150, type: "success", stage: 10, message: "Onboarding analysis compiled. Intelligence workspace ready." }
  ], []);

  // Main Simulation Effect Loop
  useEffect(() => {
    let tickCount = 0;
    
    // Interval runs every 100ms
    const interval = setInterval(() => {
      tickCount += 1;
      setElapsedTime(parseFloat((tickCount / 10).toFixed(1)));

      // 1. Process Activity Logs in Sync with ticks
      const matchingLogs = logTimeline.filter(log => log.tick === tickCount);
      if (matchingLogs.length > 0) {
        // Format timestamp
        const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
        const newEntries: LogEntry[] = matchingLogs.map(log => ({
          time: timeStr,
          type: log.type as LogEntry["type"],
          message: log.message
        }));

        setLogs(prev => [...prev, ...newEntries]);

        // 2. Advance active pipeline stage idx
        const latestStage = matchingLogs[matchingLogs.length - 1].stage;
        setCurrentStageIdx(latestStage);
        
        // 3. Trigger Scaling transient failure state
        if (tickCount >= 70 && tickCount < 84) {
          setScaleFailed(true);
        } else {
          setScaleFailed(false);
        }
      }

      // 4. Concurrent Model Execution Progress Bars (Stage 7 is index 7: Models)
      // Active from tick 90 to 118
      if (tickCount >= 90 && tickCount <= 120) {
        setModels(prev => prev.map(m => {
          let progress = m.progress;
          let status = m.status;
          let time = m.time;

          if (m.id === "segmentation") {
            if (tickCount < 104) {
              status = "active";
              progress = Math.min(Math.round(((tickCount - 90) / 14) * 100), 99);
              time = parseFloat(((tickCount - 90) / 10).toFixed(1));
            } else {
              status = "completed";
              progress = 100;
              time = 1.4;
            }
          } else if (m.id === "fraud-detect") {
            if (tickCount < 108) {
              status = "active";
              progress = Math.min(Math.round(((tickCount - 90) / 18) * 100), 99);
              time = parseFloat(((tickCount - 90) / 10).toFixed(1));
            } else {
              status = "completed";
              progress = 100;
              time = 1.8;
            }
          } else if (m.id === "credit-risk") {
            if (tickCount < 112) {
              status = "active";
              progress = Math.min(Math.round(((tickCount - 90) / 22) * 100), 99);
              time = parseFloat(((tickCount - 90) / 10).toFixed(1));
            } else {
              status = "completed";
              progress = 100;
              time = 2.2;
            }
          } else if (m.id === "forecast") {
            if (tickCount < 118) {
              status = "active";
              progress = Math.min(Math.round(((tickCount - 90) / 28) * 100), 99);
              time = parseFloat(((tickCount - 90) / 10).toFixed(1));
            } else {
              status = "completed";
              progress = 100;
              time = 2.8;
            }
          }

          return { ...m, status, progress, time };
        }));
      }

      // 5. Complete trigger (Tick 150)
      if (tickCount >= 150) {
        clearInterval(interval);
        // Delay transition slightly to let the user feel the calm completion state
        setTimeout(() => {
          setShowSuccess(true);
        }, 800);
      }

    }, 100);

    return () => clearInterval(interval);
  }, [logTimeline]);

  // Scroll console container to the bottom
  useEffect(() => {
    consoleEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [logs]);

  const handleOpenDashboard = () => {
    toast.success("Opening Command Center...");
    router.push("/dashboard");
  };

  // Helper mappings for step statuses
  const getStepStatus = (idx: number) => {
    // Stage 3 (impute) has Warning status when completed
    if (idx === 3 && currentStageIdx > 3) return "warning";
    // Stage 6 (scaling) has Failed status transiently
    if (idx === 6 && scaleFailed) return "failed";
    
    if (idx < currentStageIdx) return "completed";
    if (idx === currentStageIdx) return "active";
    return "waiting";
  };

  const getStepColors = (status: string) => {
    const maps = {
      completed: {
        bubble: "bg-positive text-white border-positive shadow-sm shadow-positive/10",
        icon: Check,
        line: "bg-positive"
      },
      active: {
        bubble: "bg-primary text-white border-primary shadow-md shadow-primary/20 scale-105 animate-pulse",
        icon: Activity,
        line: "bg-gradient-to-b from-primary to-border"
      },
      warning: {
        bubble: "bg-warning text-white border-warning shadow-xs shadow-warning/10",
        icon: AlertTriangle,
        line: "bg-positive" // Connected line stays positive as the flow is complete
      },
      failed: {
        bubble: "bg-critical text-white border-critical shadow-md shadow-critical/25 scale-105 animate-bounce",
        icon: X,
        line: "bg-gradient-to-b from-critical to-border"
      },
      waiting: {
        bubble: "bg-surface border-border text-foreground-secondary",
        icon: null,
        line: "bg-border"
      }
    };
    return maps[status as keyof typeof maps];
  };

  if (showSuccess) {
    return (
      <div className="flex flex-col items-center justify-center max-w-xl mx-auto space-y-8 py-8 sm:py-12 text-center select-none">
        
        {/* Glow Success Glyphs */}
        <div className="relative flex items-center justify-center">
          <div className="absolute h-20 w-20 rounded-full bg-positive/10 animate-ping border border-positive/30" />
          <div className="h-16 w-16 rounded-full bg-positive text-white border border-positive/35 flex items-center justify-center shadow-lg shadow-positive/30 relative">
            <Check className="h-8 w-8 stroke-[3.5px]" />
          </div>
        </div>

        {/* Heading Panel */}
        <div className="space-y-3">
          <span className="text-[10px] font-sans font-bold uppercase tracking-widest text-positive bg-positive/10 border border-positive/20 px-3 py-1 rounded-xs">
            Diagnostics Complete
          </span>
          <h1 className="text-2xl sm:text-3xl font-heading font-bold text-foreground tracking-tight uppercase">
            Your Financial Intelligence is Ready
          </h1>
          <p className="text-xs text-foreground-secondary leading-relaxed max-w-sm mx-auto">
            All statement files ingested, verified, and mapped. Core indicators computed and resolved.
          </p>
        </div>

        {/* Summary Card */}
        <Card className="w-full bg-surface-elevated/40 border border-border/80 text-left">
          <CardHeader className="pb-3 border-b border-border/60">
            <CardTitle className="text-xs font-sans font-bold uppercase tracking-wider text-foreground-secondary flex items-center gap-2">
              <ListTodo className="h-4 w-4 text-primary" /> Intelligence Summary
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-4 space-y-3 text-xs text-foreground-secondary font-medium">
            <div className="flex items-center justify-between border-b border-border/40 pb-2">
              <span>Financial Health Score</span>
              <span className="text-positive font-bold flex items-center gap-1">Generated (820/A+)</span>
            </div>
            <div className="flex items-center justify-between border-b border-border/40 pb-2">
              <span>Credit Default Probability</span>
              <span className="text-positive font-bold">Resolved (Low - 3.1%)</span>
            </div>
            <div className="flex items-center justify-between border-b border-border/40 pb-2">
              <span>Fraud Anomalies Spikes</span>
              <span className="text-warning font-bold">2 Found (Scrubbed)</span>
            </div>
            <div className="flex items-center justify-between border-b border-border/40 pb-2">
              <span>Cash Flow Projections</span>
              <span className="text-primary font-bold">Generated (12 Months)</span>
            </div>
            <div className="flex items-center justify-between pb-1">
              <span>AI Decision Recommendations</span>
              <span className="text-ai font-bold">18 Action Items Generated</span>
            </div>
          </CardContent>
        </Card>

        {/* Navigation CTAs */}
        <div className="w-full flex flex-col sm:flex-row gap-3.5 pt-4 justify-center items-center">
          <Button
            variant="primary"
            onClick={handleOpenDashboard}
            className="w-full sm:w-auto gap-2 py-4.5 px-8 font-sans font-bold cursor-pointer"
          >
            Open Financial Command Center
            <ArrowRight className="h-4 w-4" />
          </Button>

          <Button
            variant="outline"
            onClick={() => setSummaryOpen(true)}
            className="w-full sm:w-auto py-4.5 px-8 font-sans font-bold cursor-pointer"
          >
            View Processing Summary
          </Button>
        </div>

        {/* Diagnostics Summary logs Sheet drawer overlay */}
        <Sheet
          isOpen={summaryOpen}
          onClose={() => setSummaryOpen(false)}
          title="Onboarding Log diagnostics"
          className="w-full max-w-lg"
        >
          <div className="space-y-4 font-sans text-xs">
            <p className="text-foreground-secondary leading-relaxed">
              Below is the raw execution log compiled by the ingestion pipeline during processing.
            </p>
            <div className="space-y-2.5 font-mono text-[10px] bg-background border border-border p-4 rounded-sm max-h-[70vh] overflow-y-auto">
              {logs.map((log, idx) => (
                <div key={idx} className="border-b border-border/40 pb-2">
                  <span className="text-foreground-muted">[{log.time}]</span>{" "}
                  <span className={cn(
                    "font-bold",
                    log.type === "success" ? "text-positive" :
                    log.type === "warning" ? "text-warning" :
                    log.type === "error" ? "text-critical" : "text-primary"
                  )}>
                    {log.type.toUpperCase()}:
                  </span>{" "}
                  <span className="text-foreground-secondary">{log.message}</span>
                </div>
              ))}
            </div>
            <Button variant="outline" size="sm" onClick={() => setSummaryOpen(false)} className="w-full">
              Dismiss Summary
            </Button>
          </div>
        </Sheet>

      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start min-h-0 select-none">
      
      {/* LEFT PANEL: ANIMATED PIPELINE */}
      <div className="col-span-12 lg:col-span-7 space-y-6">
        <div className="space-y-1.5 border-b border-border/60 pb-4">
          <h2 className="text-xl sm:text-2xl font-heading font-semibold text-foreground tracking-tight">
            AI Ingestion Pipeline
          </h2>
          <p className="text-xs text-foreground-secondary leading-relaxed">
            Running matrix sanitizations, features mapping, and risk models. Total elapsed time:{" "}
            <span className="font-mono font-bold text-primary">{elapsedTime}s</span>.
          </p>
        </div>

        {/* Pipeline vertical timeline flow */}
        <div className="relative flex flex-col gap-6.5 pl-2 max-h-[60vh] overflow-y-auto scrollbar-none pr-1 py-1">
          {steps.map((step, idx) => {
            const stepStatus = getStepStatus(idx);
            const style = getStepColors(stepStatus);
            const Icon = style.icon;

            return (
              <div key={step.id} className="flex gap-4 relative items-start group">
                
                {/* Connecting Line (drawn downwards from bubble) */}
                {idx < steps.length - 1 && (
                  <div 
                    className={cn(
                      "absolute top-8 left-4.5 w-[3px] -translate-x-[1.5px] bottom-0 -mb-6.5 transition-all duration-300",
                      style.line
                    )}
                  />
                )}

                {/* Step bubble */}
                <div
                  className={cn(
                    "h-9 w-9 rounded-full flex items-center justify-center font-heading font-bold text-xs shrink-0 transition-all duration-300 border",
                    style.bubble
                  )}
                >
                  {Icon ? (
                    <Icon className={cn("h-4 w-4", stepStatus === "active" ? "animate-spin" : "")} />
                  ) : (
                    <span>{idx + 1}</span>
                  )}
                </div>

                {/* Step details text labels */}
                <div className="space-y-0.5 mt-1.5">
                  <h4 className={cn(
                    "text-xs font-bold font-heading uppercase tracking-wide transition-colors",
                    stepStatus === "active" ? "text-primary font-extrabold" :
                    stepStatus === "completed" ? "text-foreground" :
                    stepStatus === "warning" ? "text-warning" :
                    stepStatus === "failed" ? "text-critical font-extrabold" : "text-foreground-muted"
                  )}>
                    {step.name}
                  </h4>
                  <p className="text-[10px] text-foreground-secondary leading-tight">
                    {step.label}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* RIGHT PANEL: MODELS STATUS & ACTIVITY CONSOLE */}
      <div className="col-span-12 lg:col-span-5 space-y-6">
        
        {/* Model execution panel grid */}
        <div className="space-y-4">
          <h3 className="text-xs font-sans font-bold uppercase tracking-wider text-foreground-secondary flex items-center gap-1.5">
            <Cpu className="h-4 w-4 text-primary" /> Active Model Suites
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {models.map((model) => {
              return (
                <Card 
                  key={model.id} 
                  className={cn(
                    "transition-all border bg-surface-elevated/20",
                    model.status === "active" ? "border-primary/50 shadow-sm" : 
                    model.status === "completed" ? "border-positive/20" : "border-border/60"
                  )}
                >
                  <CardContent className="p-4 space-y-2.5">
                    <div className="flex items-center justify-between gap-1 text-[11px] font-bold">
                      <span className="text-foreground truncate">{model.name}</span>
                      <span className={cn(
                        "text-[9px] uppercase tracking-wider",
                        model.status === "active" ? "text-primary animate-pulse" :
                        model.status === "completed" ? "text-positive" : "text-foreground-muted"
                      )}>
                        {model.status}
                      </span>
                    </div>

                    {/* Progress Loader */}
                    <div className="w-full bg-border rounded-full h-1 overflow-hidden">
                      <div 
                        className={cn(
                          "h-1 rounded-full transition-all duration-100",
                          model.status === "completed" ? "bg-positive" : "bg-primary"
                        )}
                        style={{ width: `${model.progress}%` }}
                      />
                    </div>

                    <div className="flex justify-between items-center text-[9px] text-foreground-muted font-mono">
                      <span>{model.records.toLocaleString()} Recs</span>
                      <span>{model.time.toFixed(1)}s</span>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>

        {/* Activity Live console logs terminal */}
        <div className="space-y-3">
          <h3 className="text-xs font-sans font-bold uppercase tracking-wider text-foreground-secondary flex items-center gap-1.5">
            <TerminalIcon className="h-4 w-4 text-primary" /> Diagnostic Engine Console
          </h3>
          <div 
            className="bg-[#070A12] text-[#A6B2C8] font-mono text-[10px] leading-relaxed p-4 rounded-sm border border-border/80 h-60 overflow-y-auto flex flex-col gap-2 scrollbar-none"
            aria-live="polite"
          >
            {logs.length === 0 ? (
              <div className="text-foreground-muted italic flex items-center gap-2">
                <span className="h-1.5 w-1.5 bg-primary rounded-full animate-ping" />
                Listening for incoming diagnostic statements...
              </div>
            ) : (
              logs.map((log, idx) => (
                <div key={idx} className="flex gap-2 items-start shrink-0">
                  <span className="text-foreground-muted shrink-0">[{log.time}]</span>
                  <span className={cn(
                    "font-bold shrink-0",
                    log.type === "success" ? "text-positive" :
                    log.type === "warning" ? "text-warning" :
                    log.type === "error" ? "text-critical" : "text-primary"
                  )}>
                    {log.type.toUpperCase()}:
                  </span>
                  <span className="break-all">{log.message}</span>
                </div>
              ))
            )}
            <div ref={consoleEndRef} />
          </div>
        </div>

      </div>
    </div>
  );
}
