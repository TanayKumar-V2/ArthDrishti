"use client";

import React, { useEffect, useState, useRef } from "react";
import { cn } from "@/lib/utils";
import { TrendIndicator } from "@/components/ui/Badge";

interface CounterProps {
  value: number;
  duration?: number;
  prefix?: string;
  suffix?: string;
  decimals?: number;
}

function AnimatedCounter({ value, duration = 1000, prefix = "", suffix = "", decimals = 0 }: CounterProps) {
  const [count, setCount] = useState(0);
  const elementRef = useRef<HTMLSpanElement>(null);
  const [hasAnimated, setHasAnimated] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !hasAnimated) {
          setHasAnimated(true);
          let startTimestamp: number | null = null;
          const step = (timestamp: number) => {
            if (!startTimestamp) startTimestamp = timestamp;
            const progress = Math.min((timestamp - startTimestamp) / duration, 1);
            setCount(progress * value);
            if (progress < 1) {
              window.requestAnimationFrame(step);
            }
          };
          window.requestAnimationFrame(step);
        }
      },
      { threshold: 0.1 }
    );

    if (elementRef.current) {
      observer.observe(elementRef.current);
    }

    return () => observer.disconnect();
  }, [value, duration, hasAnimated]);

  return (
    <span ref={elementRef} className="font-mono">
      {prefix}
      {count.toLocaleString("en-IN", {
        minimumFractionDigits: decimals,
        maximumFractionDigits: decimals,
      })}
      {suffix}
    </span>
  );
}

export function LiveIntelligenceStrip() {
  const metrics = [
    {
      label: "Net Worth Ingested",
      value: 1870000,
      prefix: "₹",
      suffix: "",
      decimals: 0,
      trend: 4.8,
      sparkline: "M 5 18 Q 20 8 35 15 T 65 5 T 95 12 T 115 3"
    },
    {
      label: "Financial Health Score",
      value: 82,
      prefix: "",
      suffix: " / 100",
      decimals: 0,
      trend: 3.5,
      sparkline: "M 5 20 Q 25 15 45 8 T 85 18 T 115 5"
    },
    {
      label: "Default Risk Probability",
      value: 18,
      prefix: "",
      suffix: "%",
      decimals: 0,
      trend: -1.2, // lower is better
      sparkline: "M 5 5 Q 25 12 45 20 T 85 8 T 115 22"
    },
    {
      label: "Active Fraud Alerts",
      value: 2,
      prefix: "",
      suffix: "",
      decimals: 0,
      isCritical: true,
      sparkline: "M 5 12 Q 25 5 45 18 T 85 10 T 115 12"
    },
    {
      label: "Monthly Savings Rate",
      value: 21500,
      prefix: "+₹",
      suffix: "",
      decimals: 0,
      trend: 8.4,
      sparkline: "M 5 22 Q 25 10 45 15 T 85 5 T 115 2"
    },
  ];

  return (
    <section className="bg-surface border-y border-border select-none py-6 overflow-hidden">
      <div className="w-full max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-y-6 gap-x-8 items-center justify-between divide-y md:divide-y-0 md:divide-x divide-border/40">
          
          {metrics.map((m, idx) => {
            const isGreenTrend = m.isCritical ? false : m.trend === undefined || m.trend > 0 || m.label.includes("Risk");
            return (
              <div 
                key={m.label} 
                className={cn(
                  "flex flex-col items-center lg:items-start text-center lg:text-left gap-1.5 p-2 lg:px-6 first:border-t-0 border-border/40",
                  idx >= 2 ? "pt-6 md:pt-0" : ""
                )}
              >
                <span className="text-[10px] font-sans font-bold tracking-widest text-foreground-secondary uppercase leading-none block">
                  {m.label}
                </span>
                <div className="flex items-center justify-between gap-4 w-full mt-1">
                  <div className="flex items-baseline gap-2">
                    <span className={cn(
                      "text-2xl sm:text-3xl font-mono font-bold tracking-tight",
                      m.isCritical ? "text-critical animate-pulse" : "text-foreground"
                    )}>
                      <AnimatedCounter 
                        value={m.value} 
                        prefix={m.prefix} 
                        suffix={m.suffix} 
                        decimals={m.decimals} 
                      />
                    </span>
                    {m.trend !== undefined && <TrendIndicator value={m.trend} />}
                  </div>
                  {/* Mini Sparkline Chart */}
                  <div className="h-6 w-14 opacity-75 hidden sm:block">
                    <svg className="h-full w-full overflow-visible" viewBox="0 0 120 24" fill="none">
                      <path 
                        d={m.sparkline} 
                        stroke={isGreenTrend ? "var(--positive)" : "var(--critical)"} 
                        strokeWidth="2.5" 
                        strokeLinecap="round" 
                        strokeLinejoin="round" 
                      />
                    </svg>
                  </div>
                </div>
              </div>
            );
          })}

        </div>
      </div>
    </section>
  );
}
export default LiveIntelligenceStrip;
