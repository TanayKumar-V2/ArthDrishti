"use client";

import React, { useState, useEffect, useRef } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { 
  Database, 
  FileSpreadsheet, 
  CreditCard, 
  TrendingUp, 
  Zap
} from "lucide-react";
import { FinancialValue } from "@/components/ui/ValueDisplay";
import { TrendIndicator } from "@/components/ui/Badge";

export function FinancialNetwork() {
  const prefersReducedMotion = useReducedMotion();
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [mounted, setMounted] = useState(false);
  const [scale, setScale] = useState(1);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!containerRef.current) return;

    const handleResize = (entries: ResizeObserverEntry[]) => {
      if (!entries || entries.length === 0) return;
      const width = entries[0].contentRect.width;
      setScale(Math.min(1, width / 800));
    };

    const observer = new ResizeObserver(handleResize);
    observer.observe(containerRef.current);

    return () => observer.disconnect();
  }, []);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (prefersReducedMotion || !containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = (e.clientX - rect.left - rect.width / 2) / 45; // subtle tilt
    const y = (e.clientY - rect.top - rect.height / 2) / 45;
    setMousePos({ x, y });
  };

  const handleMouseLeave = () => {
    setMousePos({ x: 0, y: 0 });
  };

  // Node structures
  const inputs = [
    { id: "in-1", label: "Transactions", icon: CreditCard, pos: { x: 120, y: 90, top: "18%", left: "15%" } },
    { id: "in-2", label: "Bank Statements", icon: FileSpreadsheet, pos: { x: 120, y: 180, top: "36%", left: "15%" } },
    { id: "in-3", label: "Credit History", icon: Database, pos: { x: 120, y: 270, top: "54%", left: "15%" } },
    { id: "in-4", label: "Income Stream", icon: TrendingUp, pos: { x: 120, y: 360, top: "72%", left: "15%" } },
  ];

  const centerNode = { x: 400, y: 230 };

  const outputs = [
    { 
      id: "out-1", 
      title: "Credit Risk", 
      value: 18, 
      badge: "Low", 
      isPercent: true, 
      pos: { x: 680, y: 55, top: "11%", right: "15%" } 
    },
    { 
      id: "out-2", 
      title: "Fraud Engine", 
      value: 2, 
      badge: "Anomalies", 
      isCount: true, 
      pos: { x: 680, y: 125, top: "25%", right: "15%" } 
    },
    { 
      id: "out-3", 
      title: "Health Index", 
      value: 82, 
      isScore: true, 
      pos: { x: 680, y: 195, top: "39%", right: "15%" } 
    },
    { 
      id: "out-4", 
      title: "Cash Forecast", 
      value: 420000, 
      currency: "INR", 
      pos: { x: 680, y: 265, top: "53%", right: "15%" } 
    },
    { 
      id: "out-5", 
      title: "Spending Velocity", 
      value: 12.4, 
      trend: 12.4, 
      pos: { x: 680, y: 335, top: "67%", right: "15%" } 
    },
    { 
      id: "out-6", 
      title: "Risk Actions", 
      value: 3, 
      badge: "Actions", 
      pos: { x: 680, y: 405, top: "81%", right: "15%" } 
    },
  ];

  // SVG dimensions: viewBox="0 0 800 480"
  return (
    <div
      ref={containerRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className="relative w-full aspect-[8/5.2] max-w-[800px] bg-background/40 border border-border/40 rounded-lg overflow-hidden select-none shadow-2xl flex items-center justify-center"
      style={{ height: mounted ? `${520 * scale}px` : undefined }}
    >
      <div
        className="relative w-[800px] h-[520px] flex-shrink-0 p-4"
        style={{
          transform: `scale(${scale})`,
          transformOrigin: "center center",
        }}
      >
      <motion.div
        animate={
          mounted && !prefersReducedMotion
            ? { x: mousePos.x, y: mousePos.y, rotateX: -mousePos.y * 0.4, rotateY: mousePos.x * 0.4 }
            : { x: 0, y: 0 }
        }
        transition={{ type: "spring", stiffness: 120, damping: 25 }}
        className="relative w-full h-full"
        style={{ transformStyle: "preserve-3d", perspective: 1000 }}
      >
        {/* Connection paths and animated pulses */}
        <svg className="absolute inset-0 w-full h-full z-0 pointer-events-none" viewBox="0 0 800 480">
          {/* Gradients */}
          <defs>
            <linearGradient id="lineGrad" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="var(--border)" stopOpacity={0.3} />
              <stop offset="50%" stopColor="var(--primary)" stopOpacity={0.45} />
              <stop offset="100%" stopColor="var(--border-strong)" stopOpacity={0.3} />
            </linearGradient>
            <radialGradient id="glowGrad" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="var(--ai)" stopOpacity={0.3} />
              <stop offset="100%" stopColor="var(--ai)" stopOpacity={0} />
            </radialGradient>
          </defs>

          {/* Central AI Engine Glow */}
          <circle cx={centerNode.x} cy={centerNode.y} r={120} fill="url(#glowGrad)" />

          {/* Static Connection Lines */}
          {inputs.map((inNode) => (
            <line
              key={`line-${inNode.id}`}
              x1={inNode.pos.x}
              y1={inNode.pos.y}
              x2={centerNode.x}
              y2={centerNode.y}
              stroke="url(#lineGrad)"
              strokeWidth={1.5}
            />
          ))}

          {outputs.map((outNode) => (
            <line
              key={`line-${outNode.id}`}
              x1={centerNode.x}
              y1={centerNode.y}
              x2={outNode.pos.x}
              y2={outNode.pos.y}
              stroke="url(#lineGrad)"
              strokeWidth={1.5}
            />
          ))}

          {/* Glowing Data Pulses */}
          {mounted && !prefersReducedMotion && (
            <>
              {/* Inputs -> AI Engine */}
              {inputs.map((inNode, i) => (
                <motion.circle
                  key={`pulse-${inNode.id}`}
                  r={3.5}
                  fill="var(--primary)"
                  className="shadow-sm shadow-primary"
                  animate={{
                    cx: [inNode.pos.x, centerNode.x],
                    cy: [inNode.pos.y, centerNode.y],
                    opacity: [0, 1, 1, 0]
                  }}
                  transition={{
                    duration: 3 + i * 0.4,
                    repeat: Infinity,
                    ease: "easeInOut",
                    delay: i * 0.6
                  }}
                />
              ))}

              {/* AI Engine -> Outputs */}
              {outputs.map((outNode, i) => (
                <motion.circle
                  key={`pulse-${outNode.id}`}
                  r={3.5}
                  fill="var(--ai)"
                  animate={{
                    cx: [centerNode.x, outNode.pos.x],
                    cy: [centerNode.y, outNode.pos.y],
                    opacity: [0, 1, 1, 0]
                  }}
                  transition={{
                    duration: 2.8 + i * 0.3,
                    repeat: Infinity,
                    ease: "easeInOut",
                    delay: i * 0.5 + 0.8
                  }}
                />
              ))}
            </>
          )}
        </svg>

        {/* ==========================================
            INPUT NODES (LEFT SIDE)
            ========================================== */}
        <div className="absolute inset-y-0 left-0 w-1/3 flex flex-col justify-around z-10 pointer-events-none">
          {inputs.map((node) => {
            const Icon = node.icon;
            return (
              <div
                key={node.id}
                className="absolute transform -translate-y-1/2 flex items-center pointer-events-auto cursor-pointer"
                style={{ top: node.pos.top, left: "5%" }}
              >
                <div className="flex items-center gap-2.5 px-3 py-2 bg-surface-elevated/95 border border-border/80 rounded-sm hover:border-primary/50 transition-all hover:bg-surface shadow-md">
                  <div className="h-6 w-6 rounded-xs bg-primary/10 border border-primary/20 flex items-center justify-center text-primary">
                    <Icon className="h-3.5 w-3.5" />
                  </div>
                  <span className="text-[11px] font-sans font-medium text-foreground tracking-wide">
                    {node.label}
                  </span>
                </div>
              </div>
            );
          })}
        </div>

        {/* ==========================================
            CENTRAL AI NODE (MIDPOINT)
            ========================================== */}
        <div 
          className="absolute transform -translate-x-1/2 -translate-y-1/2 z-10 text-center flex flex-col items-center pointer-events-auto"
          style={{ left: "50%", top: "48%" }}
        >
          <motion.div
            animate={{ scale: [1, 1.04, 1] }}
            transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
            className="p-5 bg-surface border border-ai/30 rounded-full shadow-lg shadow-ai/10 flex flex-col items-center justify-center w-28 h-28 border-2"
          >
            <div className="h-10 w-10 rounded-full bg-ai/10 border border-ai/20 flex items-center justify-center text-ai mb-1.5 animate-pulse">
              <Zap className="h-5 w-5" />
            </div>
            <span className="text-[9px] font-sans font-extrabold uppercase tracking-widest text-ai leading-none block">
              ARTHDRISHTI
            </span>
            <span className="text-[7px] font-sans font-semibold text-foreground-secondary tracking-wider block mt-1 uppercase">
              AI ENGINE
            </span>
          </motion.div>
        </div>

        {/* ==========================================
            OUTPUT NODES (RIGHT SIDE)
            ========================================== */}
        <div className="absolute inset-y-0 right-0 w-1/3 flex flex-col justify-around z-10 pointer-events-none">
          {outputs.map((node) => {
            return (
              <div
                key={node.id}
                className="absolute transform -translate-y-1/2 flex items-center pointer-events-auto cursor-pointer"
                style={{ top: node.pos.top, right: "5%" }}
              >
                <div className="flex flex-col gap-1 px-3 py-2 bg-surface-elevated/95 border border-border/80 rounded-sm hover:border-ai/40 transition-all hover:bg-surface shadow-md min-w-[132px]">
                  <span className="text-[9px] font-sans font-bold text-foreground-muted tracking-wider uppercase">
                    {node.title}
                  </span>
                  <div className="flex items-center justify-between gap-2.5">
                    {/* Render standard types */}
                    {node.isPercent && (
                      <span className="font-mono text-[13px] text-foreground font-semibold">
                        {node.value}%
                      </span>
                    )}
                    {node.isScore && (
                      <span className="font-mono text-[13px] text-foreground font-semibold">
                        {node.value} / 100
                      </span>
                    )}
                    {node.isCount && (
                      <span className="font-mono text-[13px] text-critical font-bold">
                        {node.value} Anomalies
                      </span>
                    )}
                    {node.currency && (
                      <FinancialValue value={node.value} currency={node.currency} notation="compact" className="text-[13px] font-semibold text-foreground" />
                    )}
                    {node.trend && (
                      <TrendIndicator value={node.trend} showPercent />
                    )}
                    {node.badge === "Low" && (
                      <span className="text-[8px] font-sans font-bold text-positive bg-positive/10 border border-positive/25 px-1.5 py-0.25 rounded-xs uppercase tracking-wide">
                        Low Risk
                      </span>
                    )}
                    {node.badge === "Anomalies" && (
                      <span className="text-[8px] font-sans font-bold text-critical bg-critical/10 border border-critical/25 px-1.5 py-0.25 rounded-xs uppercase tracking-wide animate-pulse">
                        Threat
                      </span>
                    )}
                    {node.badge === "Actions" && (
                      <span className="text-[8px] font-sans font-bold text-ai bg-ai/10 border border-ai/25 px-1.5 py-0.25 rounded-xs uppercase tracking-wide">
                        3 Actions
                      </span>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </motion.div>
      </div>
    </div>
  );
}
export default FinancialNetwork;
