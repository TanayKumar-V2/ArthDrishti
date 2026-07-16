"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Brain, Sliders, Info, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Card, CardHeader, CardContent } from "@/components/ui/Card";
import { ModelConfidence } from "@/components/ui/ValueDisplay";
import { RiskBadge } from "@/components/ui/Badge";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface FactorDetail {
  name: string;
  impact: number; // positive increases risk, negative decreases
  current: string;
  recommended: string;
  details: string;
  tip: string;
}

export function XaiShowcase() {
  const [activeIdx, setActiveIdx] = useState<number>(0);

  const factors: FactorDetail[] = [
    {
      name: "Debt-to-Income Ratio",
      impact: 24,
      current: "42.3%",
      recommended: "Under 35.0%",
      details: "High DTI triggers model alert variables, flagging leverage bounds.",
      tip: "Refinancing the variable interest notes can drop this indicator below 34%."
    },
    {
      name: "Late Payments (Historical)",
      impact: 18,
      current: "3 Occurrences (24mo)",
      recommended: "0 Occurrences",
      details: "Isolated billing lapses in Q3 2025 impact baseline payment velocity scores.",
      tip: "Maintaining automated payments for 6 consecutive cycles reduces impact by half."
    },
    {
      name: "Credit Limit Utilization",
      impact: 15,
      current: "58.2%",
      recommended: "Under 30.0%",
      details: "Intense near-term credit line draws flags liquidity warnings.",
      tip: "Repaying $12K of the SaaS line drops utilization to a healthy 28%."
    },
    {
      name: "Low Savings Buffer",
      impact: 12,
      current: "1.8 Months runway",
      recommended: "Over 3.0 Months",
      details: "Available liquid deposits show low coverage for recurring expenses.",
      tip: "Diverting 8% of monthly income builds a 3.5 months buffer in 90 days."
    },
    {
      name: "Stable Contract Salary",
      impact: -8,
      current: "Verified $12.5K recurring",
      recommended: "Sustained contract base",
      details: "Consistent monthly contract revenue reduces overall default probability.",
      tip: "No action required. Current contract acts as a strong risk cushion."
    }
  ];

  return (
    <section id="intelligence" className="py-24 bg-background select-none">
      <div className="w-full max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          
          {/* Left Column - Explainability pitch */}
          <div className="lg:col-span-5 flex flex-col gap-6 text-center lg:text-left">
            <div className="inline-flex items-center justify-center lg:justify-start">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 text-xs font-sans font-bold tracking-widest text-ai bg-ai/10 border border-ai/20 rounded-full uppercase">
                <Brain className="h-3.5 w-3.5" />
                Explainable Risk Engine
              </span>
            </div>
            
            <h2 className="text-3xl sm:text-4xl font-heading font-bold tracking-tight text-foreground leading-snug">
              Every prediction deserves <br />
              an explanation.
            </h2>
            
            <p className="text-sm sm:text-base text-foreground-secondary font-sans leading-relaxed max-w-lg mx-auto lg:mx-0">
              ArthDrishti does not simply display a single risk rating. Our platform utilizes advanced SHAP attribution frameworks to map exactly which operational factors affected your financial evaluations, and how to improve them.
            </p>

            <div className="pt-2 flex justify-center lg:justify-start">
              <Button 
                variant="outline" 
                size="lg" 
                className="gap-2 cursor-pointer"
                onClick={() => {
                  toast.success("Simulation overlay activated. Navigating to stress simulator.");
                  window.location.href = "/simulator";
                }}
              >
                <Sliders className="h-4 w-4" />
                Simulate Improvement
              </Button>
            </div>
          </div>

          {/* Right Column - Interactive Score Card & Hover Details */}
          <div className="lg:col-span-7 grid grid-cols-1 md:grid-cols-12 gap-6 items-stretch">
            
            {/* The main score sheet (7 Cols) */}
            <Card className="md:col-span-7 border-critical/20 relative shadow-xl shadow-critical/2 flex flex-col h-full justify-between">
              <CardHeader className="pb-3">
                <span className="text-[10px] font-sans font-extrabold uppercase tracking-widest text-foreground-muted">
                  LOAN DEFAULT PROBABILITY
                </span>
                <div className="flex items-center justify-between pt-1">
                  <span className="text-3xl font-mono font-bold text-foreground">82%</span>
                  <RiskBadge rating="High" />
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Progress confidence */}
                <ModelConfidence value={94.2} />

                <div className="h-px bg-border/40 my-2" />

                {/* Factors List */}
                <div className="space-y-2">
                  <span className="text-[10px] font-sans font-extrabold uppercase tracking-widest text-foreground-muted block mb-3">
                    Risk Attributions (SHAP)
                  </span>

                  {factors.map((f, i) => {
                    const isPositive = f.impact > 0;
                    const isActive = activeIdx === i;
                    
                    return (
                      <div
                        key={f.name}
                        onMouseEnter={() => setActiveIdx(i)}
                        onFocus={() => setActiveIdx(i)}
                        className={cn(
                          "p-2.5 rounded-sm border cursor-pointer transition-all flex flex-col gap-1 select-none border-l-2",
                          isActive
                            ? cn("bg-surface-elevated border-border-strong shadow-xs", isPositive ? "border-l-critical" : "border-l-positive")
                            : "bg-transparent border-transparent border-l-transparent hover:bg-surface-hover/50"
                        )}
                        tabIndex={0}
                      >
                        <div className="flex items-center justify-between text-xs font-sans">
                          <span className="font-semibold text-foreground">{f.name}</span>
                          <span className={cn("font-mono font-bold", isPositive ? "text-critical" : "text-positive")}>
                            {isPositive ? "+" : ""}
                            {f.impact}%
                          </span>
                        </div>
                        {/* Contribution visual progress bar */}
                        <div className="h-1 w-full bg-border/30 rounded-full overflow-hidden">
                          <motion.div 
                            initial={{ width: 0 }}
                            animate={{ width: `${Math.abs(f.impact) * 3}%` }}
                            transition={{ duration: 0.8, ease: "easeOut" }}
                            className={cn("h-full rounded-full", isPositive ? "bg-critical" : "bg-positive")} 
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>

            {/* Explanatory Overlay sidecard (5 Cols) */}
            <div className="md:col-span-5 flex flex-col h-full justify-between">
              <AnimatePresence mode="wait">
                <motion.div
                  key={activeIdx}
                  initial={{ opacity: 0, x: 8 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -8 }}
                  transition={{ duration: 0.16 }}
                  className="flex-1 bg-surface-elevated border border-border rounded-md p-5 flex flex-col gap-4 justify-between h-full shadow-lg shadow-black/5"
                >
                  <div className="space-y-3.5">
                    <div className="flex items-center gap-1.5 text-xs text-foreground-secondary font-bold uppercase tracking-wider select-none border-b border-border/40 pb-2.5">
                      <Info className="h-3.5 w-3.5 text-primary" />
                      <span>Diagnostics</span>
                    </div>

                    <div className="space-y-1">
                      <span className="text-[10px] font-sans font-bold text-foreground-muted uppercase tracking-wider block">
                        Metric Scope
                      </span>
                      <h4 className="text-sm font-sans font-bold text-foreground leading-snug">
                        {factors[activeIdx].name}
                      </h4>
                    </div>

                    <div className="grid grid-cols-2 gap-3 pt-1">
                      <div className="space-y-0.5">
                        <span className="text-[9px] font-sans text-foreground-muted uppercase block">Current</span>
                        <span className="font-mono text-xs text-foreground font-semibold">
                          {factors[activeIdx].current}
                        </span>
                      </div>
                      <div className="space-y-0.5">
                        <span className="text-[9px] font-sans text-foreground-muted uppercase block">Target</span>
                        <span className="font-mono text-xs text-positive font-semibold">
                          {factors[activeIdx].recommended}
                        </span>
                      </div>
                    </div>

                    <div className="space-y-1 pt-1.5">
                      <span className="text-[9px] font-sans text-foreground-muted uppercase block">Model Impact</span>
                      <p className="text-xs text-foreground-secondary font-sans leading-relaxed">
                        {factors[activeIdx].details}
                      </p>
                    </div>
                  </div>

                  <div className="p-3 bg-primary/5 border border-primary/20 rounded-sm flex items-start gap-2 text-xs text-foreground-secondary leading-relaxed mt-auto">
                    <CheckCircle2 className="h-4 w-4 text-primary flex-shrink-0 mt-0.5" />
                    <div>
                      <span className="font-bold text-primary block mb-0.5">Action Plan</span>
                      {factors[activeIdx].tip}
                    </div>
                  </div>
                </motion.div>
              </AnimatePresence>
            </div>

          </div>

        </div>
      </div>
    </section>
  );
}
export default XaiShowcase;
