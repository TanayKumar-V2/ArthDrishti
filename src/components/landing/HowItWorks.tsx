"use client";

import { useState } from "react";
import { Binary, ChevronRight, CloudUpload, LineChart, SearchCheck, Zap } from "lucide-react";
import { cn } from "@/lib/utils";

const steps = [
  {
    title: "Connect data",
    label: "Bring in financial activity",
    description: "Upload transaction files or connect approved data sources for analysis.",
    icon: CloudUpload,
  },
  {
    title: "Prepare signals",
    label: "Make inputs consistent",
    description: "Validate formats and organize transaction activity into reviewable signals.",
    icon: Binary,
  },
  {
    title: "Assess risk",
    label: "Evaluate the full profile",
    description: "Review credit, fraud, and cash flow patterns together in one workspace.",
    icon: LineChart,
  },
  {
    title: "Understand results",
    label: "See what influenced the assessment",
    description: "Trace model outputs to the financial factors that shaped them.",
    icon: SearchCheck,
  },
  {
    title: "Choose next steps",
    label: "Turn findings into action",
    description: "Use scenario tools and recommendations to plan a response.",
    icon: Zap,
  },
];

export function HowItWorks() {
  const [activeStep, setActiveStep] = useState(0);
  const active = steps[activeStep];
  const ActiveIcon = active.icon;

  return (
    <section id="process" className="border-y border-border/70 bg-surface py-20 sm:py-24">
      <div className="mx-auto grid max-w-7xl grid-cols-1 gap-10 px-5 sm:px-8 lg:grid-cols-[0.9fr_1.1fr] lg:gap-20 xl:px-10">
        <div className="max-w-xl">
          <h2 className="text-3xl font-semibold tracking-[-0.04em] text-foreground sm:text-4xl">From financial activity to a considered decision.</h2>
          <p className="mt-4 text-[14px] leading-6 text-foreground-secondary">A straightforward workflow gives lending teams context at each point in the review.</p>
          <div className="mt-10 min-h-56 border-l-2 border-primary/25 pl-6 sm:pl-8">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl border border-primary/20 bg-primary/5 text-primary">
              <ActiveIcon className="h-5 w-5" strokeWidth={1.7} />
            </div>
            <p className="mt-6 text-[11px] font-semibold uppercase tracking-[0.13em] text-primary">{active.label}</p>
            <h3 className="mt-2 text-2xl font-semibold tracking-[-0.03em] text-foreground">{active.title}</h3>
            <p className="mt-3 max-w-md text-[14px] leading-6 text-foreground-secondary">{active.description}</p>
          </div>
        </div>

        <div className="divide-y divide-border/70 border-y border-border/70">
          {steps.map((step, index) => {
            const Icon = step.icon;
            const isActive = activeStep === index;
            return (
              <button
                key={step.title}
                type="button"
                onClick={() => setActiveStep(index)}
                aria-pressed={isActive}
                className={cn(
                  "group flex w-full items-center gap-4 py-4 text-left transition-colors sm:gap-5 sm:py-[1.15rem]",
                  isActive ? "text-foreground" : "text-foreground-secondary hover:text-foreground"
                )}
              >
                <span className={cn("grid h-10 w-10 shrink-0 place-items-center rounded-xl border transition-colors", isActive ? "border-primary/25 bg-primary/8 text-primary" : "border-border bg-background text-foreground-muted group-hover:border-primary/20 group-hover:text-primary")}>
                  <Icon className="h-[18px] w-[18px]" strokeWidth={1.7} />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block text-[14px] font-semibold">{step.title}</span>
                  <span className="mt-1 block text-[12px] leading-5 text-foreground-muted">{step.label}</span>
                </span>
                <ChevronRight className={cn("h-4 w-4 shrink-0 transition-transform", isActive ? "translate-x-0.5 text-primary" : "text-foreground-muted group-hover:translate-x-0.5")} />
              </button>
            );
          })}
        </div>
      </div>
    </section>
  );
}

export default HowItWorks;
