"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { Database, Cpu, Brain, Sparkles, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { toast } from "sonner";

export default function OnboardingWelcomePage() {
  const router = useRouter();

  const journeySteps = [
    {
      title: "Connect Data",
      description: "Safely select and upload standard financial statement files (PDF, CSV, Excel).",
      icon: Database,
      color: "text-primary bg-primary/10 border-primary/20"
    },
    {
      title: "AI Analysis",
      description: "Our machine learning pipelines parse transactions to evaluate cash flow stability and anomalies.",
      icon: Cpu,
      color: "text-ai bg-ai/10 border-ai/20"
    },
    {
      title: "Understand Risk",
      description: "Review clear diagnostic indices (Credit Risk, Fraud Probability) backed by explainable SHAP criteria.",
      icon: Brain,
      color: "text-forecast bg-forecast/10 border-forecast/20"
    },
    {
      title: "Receive Recommendations",
      description: "Obtain tailored, automated workflows designed to optimize ledger positions and verify margins.",
      icon: Sparkles,
      color: "text-positive bg-positive/10 border-positive/20"
    }
  ];

  const handleExploreDemo = () => {
    toast.success("Initializing sandbox with mock financial data...");
    router.push("/dashboard");
  };

  return (
    <div className="flex flex-col items-center text-center max-w-2xl mx-auto space-y-8 py-4 sm:py-6">
      
      {/* Title Header */}
      <div className="space-y-3.5">
        <h1 className="text-3xl sm:text-4xl font-heading font-bold text-foreground tracking-tight">
          Welcome to <span className="text-primary">ArthDrishti.</span>
        </h1>
        <p className="text-base text-foreground-secondary leading-relaxed max-w-lg mx-auto">
          Turn your financial data into understandable intelligence. Meticulously analyze credit vectors, spending behaviors, and liquidity projections.
        </p>
      </div>

      {/* Roadmap List */}
      <div className="w-full grid grid-cols-1 sm:grid-cols-2 gap-4 text-left pt-2">
        {journeySteps.map((step) => {
          const Icon = step.icon;
          return (
            <div 
              key={step.title} 
              className="p-4 rounded-sm border border-border bg-surface-elevated/20 flex gap-4 transition-all hover:border-border-strong hover:bg-surface-elevated/40"
            >
              <div className={`h-10 w-10 rounded-sm border flex items-center justify-center shrink-0 ${step.color}`}>
                <Icon className="h-5 w-5" />
              </div>
              <div className="space-y-1">
                <h3 className="text-sm font-semibold text-foreground font-heading">{step.title}</h3>
                <p className="text-xs text-foreground-secondary leading-normal">{step.description}</p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Action Buttons */}
      <div className="w-full flex flex-col sm:flex-row gap-4 justify-center items-center pt-6 max-w-md">
        <Button
          variant="primary"
          onClick={() => router.push("/onboarding/data-source")}
          className="w-full sm:w-auto gap-2 py-5 px-8 font-sans font-bold cursor-pointer"
        >
          Start Financial Analysis
          <ArrowRight className="h-4 w-4" />
        </Button>
        
        <Button
          variant="outline"
          onClick={handleExploreDemo}
          className="w-full sm:w-auto py-5 px-8 font-sans font-bold cursor-pointer"
        >
          Explore Demo Data
        </Button>
      </div>
    </div>
  );
}
