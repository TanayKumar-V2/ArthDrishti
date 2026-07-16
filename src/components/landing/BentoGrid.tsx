"use client";

import React from "react";
import { 
  Brain, 
  PieChart, 
  Sparkles,
  ArrowRight
} from "lucide-react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/Card";
import { RiskBadge } from "@/components/ui/Badge";
import { ModelConfidence } from "@/components/ui/ValueDisplay";
import { Button } from "@/components/ui/Button";
import Link from "next/link";
import { motion } from "framer-motion";

export function BentoGrid() {
  return (
    <section id="platform" className="py-24 bg-[radial-gradient(ellipse_at_bottom_left,var(--surface-elevated)_0%,transparent_60%)] select-none">
      <div className="w-full max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto space-y-3">
          <h2 className="text-3xl sm:text-4xl font-heading font-bold tracking-tight text-foreground">
            Platform Capabilities
          </h2>
          <p className="text-sm sm:text-base text-foreground-secondary font-sans leading-relaxed">
            Enterprise intelligence pipelines monitoring operational security, cash runway forecasts, and risk attribution factors.
          </p>
        </div>

        {/* Bento Box Structure */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-stretch">
          
          {/* Card 1: Credit Risk (col-span-4) */}
          <Card className="md:col-span-6 lg:col-span-4 group hover:border-primary/45 transition-all">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-sans font-bold uppercase tracking-widest text-primary">
                  Credit Risk
                </span>
                <RiskBadge rating="Low" />
              </div>
              <CardTitle className="text-lg pt-1 group-hover:text-primary transition-colors">
                Credit Diagnostics
              </CardTitle>
              <CardDescription>
                Calculates real-time default probability indices.
              </CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col items-center justify-center py-6 gap-5">
              {/* Circular Gauge visualizer */}
              <div className="relative h-32 w-32 flex items-center justify-center">
                <svg className="absolute inset-0 w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                  {/* Outer rail */}
                  <circle cx="50" cy="50" r="42" fill="transparent" stroke="var(--border)" strokeWidth="6" opacity={0.3} />
                  {/* Inner fill */}
                  <motion.circle 
                    cx="50" 
                    cy="50" 
                    r="42" 
                    fill="transparent" 
                    stroke="var(--positive)" 
                    strokeWidth="6" 
                    strokeDasharray={263.8} 
                    initial={{ strokeDashoffset: 263.8 }}
                    animate={{ strokeDashoffset: 263.8 * (1 - 0.18) }} // 18% filled
                    transition={{ duration: 1.2, ease: "easeOut" }}
                    strokeLinecap="round" 
                  />
                </svg>
                <div className="text-center">
                  <span className="font-mono text-2xl font-bold text-foreground">18%</span>
                  <span className="block text-[8px] font-sans text-foreground-secondary uppercase tracking-wider">
                    Default Prob
                  </span>
                </div>
              </div>
              
              <div className="w-full space-y-1 mt-auto">
                <ModelConfidence value={94.2} />
              </div>
            </CardContent>
          </Card>

          {/* Card 2: Fraud Intelligence (col-span-4) */}
          <Card className="md:col-span-6 lg:col-span-4 group hover:border-critical/45 transition-all">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-sans font-bold uppercase tracking-widest text-critical">
                  Fraud Detection
                </span>
                <span className="text-[8px] font-sans font-bold text-critical bg-critical/10 border border-critical/20 px-1.5 py-0.5 rounded-xs uppercase tracking-wide animate-pulse">
                  2 Active Alerts
                </span>
              </div>
              <CardTitle className="text-lg pt-1 group-hover:text-critical transition-colors">
                Anomaly Interception
              </CardTitle>
              <CardDescription>
                Detects out-of-pattern spikes and location jumps.
              </CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col gap-4 py-4 justify-between h-full">
              {/* Timeline list */}
              <div className="space-y-3">
                <div className="p-3 bg-surface-elevated/70 border border-border/80 hover:border-critical/30 hover:bg-surface-hover/80 rounded-xs flex items-start gap-2.5 transition-all duration-250 cursor-pointer">
                  <div className="h-2 w-2 rounded-full bg-critical animate-ping mt-1.5 flex-shrink-0" />
                  <div className="space-y-0.5">
                    <span className="font-sans font-semibold text-xs text-foreground block">Geography VPN Mismatch</span>
                    <span className="text-[10px] text-foreground-secondary font-mono">Confidence: 94% | 15:20 GMT</span>
                  </div>
                </div>
                <div className="p-3 bg-surface-elevated/70 border border-border/80 hover:border-warning/30 hover:bg-surface-hover/80 rounded-xs flex items-start gap-2.5 transition-all duration-250 cursor-pointer">
                  <div className="h-2 w-2 rounded-full bg-warning mt-1.5 flex-shrink-0" />
                  <div className="space-y-0.5">
                    <span className="font-sans font-semibold text-xs text-foreground block">High Velocity Debit Cycle</span>
                    <span className="text-[10px] text-foreground-secondary font-mono">Confidence: 78% | 10:14 GMT</span>
                  </div>
                </div>
              </div>
              
              <span className="text-[10px] font-sans text-foreground-secondary text-center leading-normal">
                Continuous ML transaction screening active.
              </span>
            </CardContent>
          </Card>

          {/* Card 3: Cash Flow (col-span-4) */}
          <Card className="md:col-span-12 lg:col-span-4 group hover:border-forecast/45 transition-all">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-sans font-bold uppercase tracking-widest text-forecast">
                  Cash Flow
                </span>
                <span className="text-[8px] font-sans font-bold text-forecast bg-forecast/10 border border-forecast/20 px-1.5 py-0.5 rounded-xs uppercase tracking-wide">
                  90-Day Runway
                </span>
              </div>
              <CardTitle className="text-lg pt-1 group-hover:text-forecast transition-colors">
                Liquidity Forecasts
              </CardTitle>
              <CardDescription>
                Plots projected asset runways and expense thresholds.
              </CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col gap-4 py-4">
              {/* Mini SVG path chart for performant preview */}
              <div className="h-24 w-full border-b border-border/30 relative mt-4">
                <svg className="w-full h-full overflow-visible" viewBox="0 0 200 80" preserveAspectRatio="none">
                  {/* Confidence Interval translucent area */}
                  <path d="M 0,40 Q 50,20 100,50 T 200,30 L 200,60 Q 150,75 100,65 T 0,55 Z" fill="var(--forecast)" fillOpacity={0.1} />
                  {/* Today vertical divider line */}
                  <line x1="100" y1="0" x2="100" y2="80" stroke="var(--border)" strokeDasharray="3 3" opacity={0.5} />
                  {/* Historical Solid Line */}
                  <path d="M 0,45 Q 25,35 50,48 T 100,58" fill="none" stroke="var(--primary)" strokeWidth="2.5" />
                  {/* Future Forecast Dashed Line */}
                  <path d="M 100,58 Q 125,52 150,38 T 200,45" fill="none" stroke="var(--forecast)" strokeWidth="2" strokeDasharray="4 4" />
                  {/* Today indicator dot */}
                  <circle cx="100" cy="58" r="3.5" fill="var(--primary)" />
                  <circle cx="100" cy="58" r="8" fill="var(--primary)" className="animate-ping" opacity={0.3} />
                </svg>
                {/* Visual Anchors */}
                <span className="absolute left-1 top-1 text-[9px] text-foreground-muted uppercase">Past</span>
                <span className="absolute right-1 top-1 text-[9px] text-forecast uppercase font-bold">Projected</span>
                <span className="absolute left-[52%] bottom-1 text-[8px] text-foreground-muted font-sans">Today</span>
              </div>
              <div className="flex justify-between items-center text-xs mt-auto">
                <span className="text-foreground-secondary">Estimated Runway</span>
                <span className="font-mono text-foreground font-semibold">14.2 Months</span>
              </div>
            </CardContent>
          </Card>

          {/* Card 4: Explainable AI (col-span-7) */}
          <Card className="md:col-span-6 lg:col-span-7 group hover:border-ai/45 transition-all">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-sans font-bold uppercase tracking-widest text-ai">
                  Explainable AI
                </span>
                <div className="flex items-center gap-1 text-[10px] text-foreground-secondary">
                  <Brain className="h-3.5 w-3.5" />
                  <span>SHAP Feature Attribution</span>
                </div>
              </div>
              <CardTitle className="text-lg pt-1 group-hover:text-ai transition-colors">
                Prediction Explanations
              </CardTitle>
              <CardDescription>
                Renders absolute influence factors backing ML model decisions.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3.5 py-4">
              {/* Horizontal SHAP bar indicators */}
              <div className="space-y-2">
                <div className="flex justify-between text-xs font-sans">
                  <span className="text-foreground-secondary">Debt-to-Income Ratio</span>
                  <span className="font-mono font-semibold text-critical">+24.0%</span>
                </div>
                <div className="h-1.5 w-full bg-border/40 rounded-full overflow-hidden">
                  <div className="h-full bg-critical rounded-full" style={{ width: "72%" }} />
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between text-xs font-sans">
                  <span className="text-foreground-secondary">Late Ledger Payments</span>
                  <span className="font-mono font-semibold text-critical">+18.0%</span>
                </div>
                <div className="h-1.5 w-full bg-border/40 rounded-full overflow-hidden">
                  <div className="h-full bg-critical rounded-full" style={{ width: "54%" }} />
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between text-xs font-sans">
                  <span className="text-foreground-secondary">Credit Limit Utilization</span>
                  <span className="font-mono font-semibold text-critical">+15.0%</span>
                </div>
                <div className="h-1.5 w-full bg-border/40 rounded-full overflow-hidden">
                  <div className="h-full bg-critical rounded-full" style={{ width: "45%" }} />
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between text-xs font-sans">
                  <span className="text-foreground-secondary">Stable Revenue Base</span>
                  <span className="font-mono font-semibold text-positive">-8.0%</span>
                </div>
                <div className="h-1.5 w-full bg-border/40 rounded-full overflow-hidden">
                  <div className="h-full bg-positive rounded-full" style={{ width: "24%" }} />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Card 5: Spending (col-span-5) */}
          <Card className="md:col-span-6 lg:col-span-5 group hover:border-primary/45 transition-all">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-sans font-bold uppercase tracking-widest text-primary">
                  Flow Analytics
                </span>
                <span className="text-[10px] text-foreground-secondary flex items-center gap-1">
                  <PieChart className="h-3.5 w-3.5" />
                  <span>Spending Class</span>
                </span>
              </div>
              <CardTitle className="text-lg pt-1 group-hover:text-primary transition-colors">
                Outflow Profiling
              </CardTitle>
              <CardDescription>
                Categorizes expenditure velocities to flag overhead leakages.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 py-4">
              <div className="space-y-2.5">
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <div className="h-2 w-2 rounded-full bg-primary" />
                    <span className="text-foreground-secondary">Cloud SaaS Infrastructure</span>
                  </div>
                  <span className="font-mono font-medium text-foreground">38.4%</span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <div className="h-2 w-2 rounded-full bg-forecast" />
                    <span className="text-foreground-secondary">HQ Workspace Lease</span>
                  </div>
                  <span className="font-mono font-medium text-foreground">22.1%</span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <div className="h-2 w-2 rounded-full bg-ai" />
                    <span className="text-foreground-secondary">M&A Debt Repayments</span>
                  </div>
                  <span className="font-mono font-medium text-foreground">18.5%</span>
                </div>
              </div>
              
              <div className="p-3 bg-primary/5 border border-primary/20 rounded-sm flex items-center justify-between text-xs mt-auto">
                <span className="text-foreground-secondary font-medium">Hedged Cloud Savings</span>
                <span className="font-mono text-primary font-bold">Save $18.4K</span>
              </div>
            </CardContent>
          </Card>

          {/* Card 6: AI Financial Advisor (col-span-12) */}
          <Card className="md:col-span-12 lg:col-span-12 border-ai/25 group hover:border-ai/50 transition-all bg-[radial-gradient(ellipse_at_bottom_right,rgba(139,92,246,0.06)_0%,transparent_50%)]">
            <CardContent className="p-6 sm:p-8 flex flex-col md:flex-row gap-6 items-center justify-between">
              <div className="space-y-3 max-w-2xl text-center md:text-left">
                <div className="inline-flex items-center gap-2">
                  <div className="h-6 w-6 rounded-full bg-ai/10 border border-ai/20 flex items-center justify-center text-ai animate-bounce">
                    <Sparkles className="h-3.5 w-3.5" />
                  </div>
                  <span className="text-[10px] font-sans font-bold uppercase tracking-widest text-ai">
                    Generative Advisor
                  </span>
                </div>
                <h3 className="text-xl sm:text-2xl font-heading font-semibold text-foreground">
                  AI Financial Advisor Insight
                </h3>
                {/* Chat Bubble Layout */}
                <div className="relative p-4 bg-surface-elevated border border-border/80 rounded-sm text-sm font-sans text-foreground-secondary leading-relaxed italic border-l-2 border-l-ai">
                  “Your credit limit utilization decreased by 8% over the past 30 days. This stabilizes your liquidity runway, decreasing your default risk profile to Low Risk and improving model credit diagnostics by +2.4%.”
                </div>
              </div>
              
              <div className="flex-shrink-0 w-full sm:w-auto text-center md:text-right mt-4 md:mt-0">
                <Button variant="ai" size="lg" asChild className="w-full sm:w-auto cursor-pointer">
                  <Link href="/login" className="gap-2 justify-center">
                    Consult Advisor
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>

        </div>
      </div>
    </section>
  );
}
export default BentoGrid;
