"use client";

import React from "react";
import Link from "next/link";
import { ArrowRight, Play, Shield, Cpu, RefreshCcw } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { FinancialNetwork } from "./FinancialNetwork";

interface HeroProps {
  onViewDemo?: () => void;
}

export function Hero({ onViewDemo }: HeroProps) {
  return (
    <section className="relative min-h-[850px] flex items-center justify-center pt-28 pb-16 overflow-hidden bg-[radial-gradient(ellipse_at_top_right,var(--surface-elevated)_0%,transparent_60%)] select-none">
      <div className="w-full max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          
          {/* Left Column - Core Pitch (48%) */}
          <div className="lg:col-span-5 flex flex-col gap-6 text-center lg:text-left">
            {/* Category Pill */}
            <div className="inline-flex items-center justify-center lg:justify-start">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 text-xs font-sans font-bold tracking-widest text-primary bg-primary/10 border border-primary/20 rounded-full uppercase">
                <Cpu className="h-3.5 w-3.5" />
                AI-Powered Financial Intelligence
              </span>
            </div>

            {/* Headline */}
            <h1 className="text-4xl sm:text-5xl lg:text-[54px] font-heading font-extrabold tracking-tight text-foreground leading-[1.08]">
              Understand Risk. <br className="hidden sm:inline" />
              Detect Fraud. <br />
              <span className="bg-gradient-to-r from-primary via-[#748CFF] to-ai bg-clip-text text-transparent">
                {"Predict What's Next."}
              </span>
            </h1>

            {/* Description */}
            <p className="text-base sm:text-lg text-foreground-secondary font-sans leading-relaxed max-w-xl mx-auto lg:mx-0">
              Transform complex financial data into explainable risk intelligence, real-time fraud alerts, predictive cash forecasts, and actionable financial decisions.
            </p>

            {/* CTAs */}
            <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 pt-2">
              <Button variant="primary" size="lg" asChild className="w-full sm:w-auto cursor-pointer">
                <Link href="/dashboard" className="gap-2">
                  Explore Platform
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
              <Button 
                variant="outline" 
                size="lg" 
                className="w-full sm:w-auto cursor-pointer gap-2"
                onClick={onViewDemo}
              >
                <Play className="h-4 w-4 fill-current" />
                View Live Demo
              </Button>
            </div>

            {/* Trust Bullet Checkmarks */}
            <div className="flex flex-wrap items-center justify-center lg:justify-start gap-x-8 gap-y-3 pt-6 border-t border-border/40 text-xs font-sans font-semibold text-foreground-secondary uppercase tracking-wider">
              <div className="flex items-center gap-2">
                <Shield className="h-4 w-4 text-primary" />
                <span>Explainable AI</span>
              </div>
              <div className="flex items-center gap-2">
                <RefreshCcw className="h-4 w-4 text-forecast" />
                <span>Real-Time Intelligence</span>
              </div>
              <div className="flex items-center gap-2">
                <Cpu className="h-4 w-4 text-ai" />
                <span>Enterprise Ready</span>
              </div>
            </div>
          </div>

          {/* Right Column - Custom Network Visual (52%) */}
          <div className="lg:col-span-7 flex justify-center lg:justify-end">
            <FinancialNetwork />
          </div>

        </div>
      </div>
    </section>
  );
}
export default Hero;
