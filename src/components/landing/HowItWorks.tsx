"use client";

import React, { useEffect, useState, useRef } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { 
  CloudLightning, 
  Binary, 
  LineChart, 
  HelpCircle, 
  Zap,
  ChevronRight,
  ChevronDown
} from "lucide-react";
import { cn } from "@/lib/utils";

export function HowItWorks() {
  const prefersReducedMotion = useReducedMotion();
  const [hasAnimated, setHasAnimated] = useState(false);
  const sectionRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !hasAnimated) {
          setHasAnimated(true);
        }
      },
      { threshold: 0.1 }
    );

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }

    return () => observer.disconnect();
  }, [hasAnimated]);

  const steps = [
    {
      num: "01",
      title: "CONNECT",
      label: "Upload ledger data",
      desc: "Connect bankStatement databases, ledger CSV files, or API links securely.",
      icon: CloudLightning,
      color: "text-primary border-primary/20 bg-primary/5",
      pulseColor: "var(--primary)",
    },
    {
      num: "02",
      title: "UNDERSTAND",
      label: "Feature engineering",
      desc: "Validate balance formats, parse velocities, and isolate anomaly categories.",
      icon: Binary,
      color: "text-forecast border-forecast/20 bg-forecast/5",
      pulseColor: "var(--forecast)",
    },
    {
      num: "03",
      title: "PREDICT",
      label: "Execute risk models",
      desc: "Evaluate default ratios and threat scores using ensemble ML algorithms.",
      icon: LineChart,
      color: "text-ai border-ai/20 bg-ai/5",
      pulseColor: "var(--ai)",
    },
    {
      num: "04",
      title: "EXPLAIN",
      label: "Attribution audits",
      desc: "Uncover exactly which financial inputs influenced model predictions.",
      icon: HelpCircle,
      color: "text-primary border-primary/20 bg-primary/5",
      pulseColor: "var(--primary)",
    },
    {
      num: "05",
      title: "ACT",
      label: "Prescriptive actions",
      desc: "Deploy automated recommendations to optimize runways and hedge risk.",
      icon: Zap,
      color: "text-warning border-warning/20 bg-warning/5",
      pulseColor: "var(--warning)",
    },
  ];

  const [activeStep, setActiveStep] = useState(0);

  useEffect(() => {
    if (!hasAnimated) return;
    const interval = setInterval(() => {
      setActiveStep((prev) => (prev + 1) % 5);
    }, 2800);
    return () => clearInterval(interval);
  }, [hasAnimated]);

  return (
    <section 
      ref={sectionRef} 
      id="process"
      className="py-24 bg-surface border-y border-border select-none"
    >
      <div className="w-full max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 space-y-16">
        
        {/* Section Title */}
        <div className="text-center max-w-3xl mx-auto space-y-3">
          <h2 className="text-3xl sm:text-4xl font-heading font-bold tracking-tight text-foreground">
            How ArthDrishti Works
          </h2>
          <p className="text-sm sm:text-base text-foreground-secondary font-sans leading-relaxed">
            A pipeline designed to convert complex transaction ledger details into explainable financial clarity.
          </p>
        </div>

        {/* Pipeline Layout */}
        <div className="relative">
          {/* Horizontal Connection Pipeline for Desktop */}
          <div className="absolute top-[38px] left-[10%] right-[10%] h-[2px] bg-border/40 hidden lg:block z-0 overflow-hidden">
            {hasAnimated && !prefersReducedMotion && (
              <motion.div
                initial={{ left: "-100%" }}
                animate={{ left: "100%" }}
                transition={{
                  duration: 4,
                  repeat: Infinity,
                  ease: "linear",
                }}
                className="absolute top-0 bottom-0 w-1/3 bg-gradient-to-r from-transparent via-primary to-transparent"
              />
            )}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 lg:gap-6 relative z-10">
            {steps.map((step, idx) => {
              const Icon = step.icon;
              const isActive = activeStep === idx;
              return (
                <div 
                  key={step.num} 
                  className={cn(
                    "flex flex-col items-center lg:items-start text-center lg:text-left group relative transition-all duration-500",
                    isActive ? "opacity-100 scale-[1.02]" : "opacity-60 hover:opacity-85"
                  )}
                >
                  
                  {/* Step Icon / Circle */}
                  <div className="relative flex items-center justify-center mb-6">
                    <div className={cn(
                      "h-20 w-20 rounded-full border flex items-center justify-center transition-all duration-500 shadow-md",
                      step.color,
                      isActive ? "ring-2 ring-primary/40 ring-offset-2 ring-offset-background scale-105" : ""
                    )}>
                      <Icon className={cn("h-8 w-8 transition-transform duration-500", isActive ? "rotate-[360deg] scale-110" : "")} />
                    </div>
                    {/* Floating Step Number */}
                    <span className="absolute -top-2 -right-2 text-[10px] font-mono font-bold text-foreground bg-surface-elevated border border-border px-1.5 py-0.5 rounded-full select-none shadow-xs">
                      {step.num}
                    </span>
                  </div>

                  {/* Horizontal indicator arrow (Desktop) */}
                  {idx < steps.length - 1 && (
                    <div className="absolute top-8 left-[75%] right-0 hidden lg:flex items-center justify-center text-foreground-muted pointer-events-none">
                      <ChevronRight className="h-5 w-5 animate-pulse" />
                    </div>
                  )}

                  {/* Vertical connector line & indicator (Mobile) */}
                  {idx < steps.length - 1 && (
                    <div className="flex lg:hidden items-center justify-center py-4 text-foreground-muted">
                      <ChevronDown className="h-5 w-5 animate-pulse" />
                    </div>
                  )}

                  {/* Step Details */}
                  <div className="space-y-2 max-w-xs">
                    <span className="text-[10px] font-sans font-extrabold uppercase tracking-widest text-primary block leading-none">
                      {step.title}
                    </span>
                    <h3 className="text-base font-heading font-semibold text-foreground tracking-tight leading-snug">
                      {step.label}
                    </h3>
                    <p className="text-xs text-foreground-secondary font-sans leading-relaxed">
                      {step.desc}
                    </p>
                  </div>

                </div>
              );
            })}
          </div>
        </div>

      </div>
    </section>
  );
}
export default HowItWorks;
