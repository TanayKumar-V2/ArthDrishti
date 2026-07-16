"use client";

import React from "react";
import Link from "next/link";
import { ArrowRight, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/Button";

interface FinalCTAProps {
  onRequestDemo?: () => void;
}

export function FinalCTA({ onRequestDemo }: FinalCTAProps) {
  return (
    <section className="py-24 bg-background relative overflow-hidden select-none">
      {/* Restrained Blue-Violet Illumination background gradient */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(139,92,246,0.06)_0%,rgba(79,124,255,0.04)_40%,transparent_70%)] pointer-events-none" />

      <div className="w-full max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="max-w-4xl mx-auto text-center space-y-8">
          
          <div className="inline-flex items-center gap-1.5 px-3 py-1 text-xs font-sans font-bold tracking-widest text-ai bg-ai/10 border border-ai/20 rounded-full uppercase">
            <Sparkles className="h-3.5 w-3.5" />
            Decision Intelligence
          </div>

          <h2 className="text-3xl sm:text-4xl lg:text-[46px] font-heading font-extrabold tracking-tight text-foreground leading-tight">
            Turn Financial Data Into <br />
            Intelligent Decisions.
          </h2>

          <p className="text-sm sm:text-base text-foreground-secondary font-sans leading-relaxed max-w-xl mx-auto">
            Understand default risk, isolate anomaly threats, forecast liquidity horizons, and gain deep predictive confidence with explainable AI.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
            <Button variant="primary" size="lg" asChild className="w-full sm:w-auto cursor-pointer shadow-lg shadow-primary/10">
              <Link href="/dashboard" className="gap-2">
                Launch Platform
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
            <Button 
              variant="outline" 
              size="lg" 
              className="w-full sm:w-auto cursor-pointer gap-2"
              onClick={onRequestDemo}
            >
              Request Demo
            </Button>
          </div>

        </div>
      </div>
    </section>
  );
}
export default FinalCTA;
