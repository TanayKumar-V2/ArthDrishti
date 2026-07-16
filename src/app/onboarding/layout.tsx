"use client";

import React, { useMemo } from "react";
import { usePathname, useRouter } from "next/navigation";
import { Check, LogOut, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";
import AppLogo from "@/components/ui/AppLogo";
import { toast } from "sonner";

interface OnboardingLayoutProps {
  children: React.ReactNode;
}

export default function OnboardingLayout({ children }: OnboardingLayoutProps) {
  const pathname = usePathname();
  const router = useRouter();

  // Define steps for onboarding flow
  const steps = useMemo(() => [
    { number: 1, label: "Welcome", path: "/onboarding" },
    { number: 2, label: "Connect Data", path: "/onboarding/data-source" },
    { number: 3, label: "Verify Data", path: "/onboarding/upload" },
    { number: 4, label: "AI Analysis", path: "/onboarding/processing" },
    { number: 5, label: "Intelligence Ready", path: "/onboarding/complete" }
  ], []);

  // Determine current active step index (0-based)
  const currentStepIdx = useMemo(() => {
    const idx = steps.findIndex(step => pathname === step.path);
    // Fallback if dynamic subpath or undefined
    if (idx !== -1) return idx;
    if (pathname?.startsWith("/onboarding/upload")) return 2;
    if (pathname?.startsWith("/onboarding/data-source")) return 1;
    return 0;
  }, [pathname, steps]);

  const handleQuit = () => {
    toast.success("Exited onboarding. Redirecting...");
    router.push("/");
  };

  return (
    <div className="min-h-screen bg-background flex flex-col font-sans select-none">
      {/* Header Bar */}
      <header className="h-[72px] border-b border-border/80 bg-surface flex items-center justify-between px-4 sm:px-8 shrink-0">
        <div className="flex items-center gap-3">
          <AppLogo size="sm" showWordmark={true} />
          <span className="hidden sm:inline-flex text-[10px] font-sans font-bold uppercase tracking-wider text-primary bg-primary/10 px-2 py-0.5 rounded-xs border border-primary/20">
            Setup Wizard
          </span>
        </div>

        <button
          onClick={handleQuit}
          className="flex items-center gap-2 text-xs font-semibold text-foreground-secondary hover:text-critical transition-colors px-3 py-2 rounded-sm hover:bg-surface-hover outline-none cursor-pointer focus-visible:outline-2"
          aria-label="Quit onboarding flow"
        >
          <LogOut className="h-4 w-4" />
          <span className="hidden xs:inline">Quit Wizard</span>
        </button>
      </header>

      {/* Main progress and contents area */}
      <div className="flex-1 flex flex-col items-center py-8 sm:py-12 px-4 max-w-5xl mx-auto w-full gap-8 sm:gap-12 overflow-y-auto">
        
        {/* Premium Progress Indicator */}
        <div className="w-full max-w-3xl flex flex-col items-center" aria-label="Progress tracker">
          <div className="w-full relative flex items-center justify-between">
            
            {/* Background connecting line segments */}
            <div className="absolute left-0 right-0 top-1/2 -translate-y-1/2 h-0.5 bg-border -z-10" />

            {/* Glowing active line segment */}
            <div 
              className="absolute left-0 top-1/2 -translate-y-1/2 h-0.5 bg-gradient-to-r from-primary to-ai transition-all duration-500 ease-out -z-10" 
              style={{ width: `${(currentStepIdx / (steps.length - 1)) * 100}%` }}
            />

            {/* Steps renders */}
            {steps.map((step, idx) => {
              const isActive = idx === currentStepIdx;
              const isCompleted = idx < currentStepIdx;

              return (
                <div key={step.number} className="flex flex-col items-center relative group">
                  {/* Step bubble */}
                  <div
                    className={cn(
                      "h-9 w-9 rounded-full flex items-center justify-center font-heading font-bold text-xs transition-all duration-300 border",
                      isCompleted 
                        ? "bg-positive text-white border-positive shadow-sm shadow-positive/20"
                        : isActive
                          ? "bg-primary text-white border-primary shadow-md shadow-primary/20 scale-110"
                          : "bg-surface text-foreground-secondary border-border hover:border-border-strong"
                    )}
                  >
                    {isCompleted ? (
                      <Check className="h-4 w-4 stroke-[3px]" />
                    ) : isActive && idx === 4 ? (
                      <Sparkles className="h-4 w-4 animate-pulse text-white" />
                    ) : (
                      <span>{step.number}</span>
                    )}
                  </div>

                  {/* Step Description Label (hidden on super small screens, absolute layout to avoid layout shifts) */}
                  <span
                    className={cn(
                      "absolute top-11 text-[11px] font-sans font-bold whitespace-nowrap tracking-tight transition-all duration-300 uppercase",
                      isActive
                        ? "text-primary scale-105"
                        : isCompleted
                          ? "text-positive"
                          : "text-foreground-muted"
                    )}
                  >
                    {step.label}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Dynamic page contents nested inside layout */}
        <main className="w-full mt-6 sm:mt-8 flex flex-col flex-1 min-h-0">
          <div className="w-full bg-surface border border-border/80 rounded-md shadow-xl p-5 sm:p-8 md:p-10 flex flex-col min-h-0 relative overflow-hidden">
            {/* Aesthetic top boundary line */}
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-primary via-ai to-forecast" />
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
