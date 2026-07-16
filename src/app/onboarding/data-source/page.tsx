"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { 
  Landmark, 
  CreditCard, 
  History, 
  Briefcase, 
  FileCheck, 
  Link as LinkIcon, 
  Smartphone, 
  Check, 
  ArrowLeft, 
  ArrowRight 
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

interface SourceOption {
  id: string;
  name: string;
  description: string;
  formats?: string[];
  comingSoon?: boolean;
  icon: React.ComponentType<{ className?: string }>;
}

export default function DataSourceSelectionPage() {
  const router = useRouter();
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  // Load selection from localStorage if present
  useEffect(() => {
    const saved = localStorage.getItem("onboarding-selected-sources");
    if (saved) {
      try {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setSelectedIds(JSON.parse(saved));
      } catch (e) {
        console.error("Failed to parse saved onboarding sources", e);
      }
    }
  }, []);

  const sources: SourceOption[] = [
    {
      id: "bank-statement",
      name: "Bank Statement",
      description: "Extract core cash flow metrics from ledger statements.",
      formats: ["CSV", "Excel", "PDF"],
      icon: Landmark
    },
    {
      id: "credit-card",
      name: "Credit Card Statement",
      description: "Analyze debt vectors, utilization caps, and limits.",
      formats: ["CSV", "Excel", "PDF"],
      icon: CreditCard
    },
    {
      id: "transaction-history",
      name: "Transaction History",
      description: "Process raw credit/debit transaction logs.",
      formats: ["CSV", "Excel"],
      icon: History
    },
    {
      id: "salary-slip",
      name: "Salary Slip",
      description: "Verify recurrent income deposits and source taxes.",
      formats: ["PDF"],
      icon: Briefcase
    },
    {
      id: "income-proof",
      name: "Income Proof",
      description: "Submit supplementary tax audits or business returns.",
      formats: ["PDF"],
      icon: FileCheck
    },
    {
      id: "direct-bank",
      name: "Connect Bank Account",
      description: "Sync active balances automatically via direct API portals.",
      comingSoon: true,
      icon: LinkIcon
    },
    {
      id: "upi-history",
      name: "UPI History",
      description: "Verify digital micro-transactions from wallet apps.",
      comingSoon: true,
      icon: Smartphone
    }
  ];

  const handleToggle = (id: string, comingSoon?: boolean) => {
    if (comingSoon) {
      toast.info("This integration is coming soon! Try uploading raw statements instead.");
      return;
    }
    
    setSelectedIds((prev) => {
      const next = prev.includes(id) 
        ? prev.filter((item) => item !== id) 
        : [...prev, id];
      localStorage.setItem("onboarding-selected-sources", JSON.stringify(next));
      return next;
    });
  };

  const handleKeyDown = (e: React.KeyboardEvent, option: SourceOption) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      handleToggle(option.id, option.comingSoon);
    }
  };

  const handleContinue = () => {
    if (selectedIds.length === 0) {
      toast.error("Please select at least one data source to proceed.");
      return;
    }
    router.push("/onboarding/upload");
  };

  return (
    <div className="space-y-8 flex flex-col justify-between h-full min-h-0">
      
      {/* Title Header */}
      <div className="space-y-2.5">
        <h1 className="text-2xl sm:text-3xl font-heading font-semibold text-foreground tracking-tight">
          Connect your financial data.
        </h1>
        <p className="text-sm text-foreground-secondary leading-relaxed max-w-xl">
          Select one or more statements to upload. Our AI engine will sanitize and map these records to compute diagnostic indexes.
        </p>
      </div>

      {/* Grid of Large Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 py-2">
        {sources.map((option) => {
          const isSelected = selectedIds.includes(option.id);
          const Icon = option.icon;

          return (
            <div
              key={option.id}
              tabIndex={option.comingSoon ? -1 : 0}
              onClick={() => handleToggle(option.id, option.comingSoon)}
              onKeyDown={(e) => handleKeyDown(e, option)}
              className={cn(
                "p-5 rounded-sm border transition-all text-left flex flex-col justify-between h-[160px] relative select-none",
                option.comingSoon
                  ? "opacity-45 bg-surface-elevated/20 border-border/40 cursor-not-allowed"
                  : "cursor-pointer bg-surface hover:bg-surface-elevated/40 outline-none",
                isSelected
                  ? "border-primary bg-primary/5 ring-1 ring-primary shadow-xs"
                  : "border-border hover:border-border-strong",
                "focus-visible:outline-2 focus-visible:outline-offset-2"
              )}
              role={option.comingSoon ? undefined : "checkbox"}
              aria-checked={option.comingSoon ? undefined : isSelected}
              aria-label={`${option.name} source option`}
            >
              {/* Top Row: Icon & Status */}
              <div className="flex items-start justify-between">
                <div className={cn(
                  "h-10 w-10 rounded-sm border flex items-center justify-center shrink-0",
                  isSelected 
                    ? "bg-primary/10 border-primary/20 text-primary" 
                    : "bg-surface-elevated border-border text-foreground-secondary"
                )}>
                  <Icon className="h-5 w-5" />
                </div>

                {option.comingSoon ? (
                  <span className="text-[9px] font-sans font-bold uppercase tracking-wider text-foreground-muted border border-border/60 px-2 py-0.5 rounded-xs select-none bg-surface-elevated">
                    Soon
                  </span>
                ) : isSelected ? (
                  <div className="h-5 w-5 rounded-full bg-primary flex items-center justify-center text-white scale-105 shadow-sm shadow-primary/20 transition-all">
                    <Check className="h-3.5 w-3.5 stroke-[3.5px]" />
                  </div>
                ) : null}
              </div>

              {/* Bottom Row: Text description & formats */}
              <div className="space-y-1 mt-3">
                <h3 className="text-sm font-semibold text-foreground font-heading">{option.name}</h3>
                <p className="text-[11px] text-foreground-secondary leading-snug line-clamp-2">
                  {option.description}
                </p>
                {option.formats && (
                  <div className="flex flex-wrap gap-1 pt-1.5">
                    {option.formats.map((fmt) => (
                      <span key={fmt} className="text-[9px] font-mono font-bold bg-background text-foreground-muted border border-border px-1.5 py-0.25 rounded-xs">
                        {fmt}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Bottom Nav Controls */}
      <div className="flex items-center justify-between pt-6 border-t border-border/80">
        <Button
          variant="outline"
          onClick={() => router.push("/onboarding")}
          className="gap-2 cursor-pointer"
        >
          <ArrowLeft className="h-4 w-4" />
          Back
        </Button>

        <Button
          variant="primary"
          onClick={handleContinue}
          disabled={selectedIds.length === 0}
          className="gap-2 cursor-pointer font-sans font-bold"
        >
          Continue to Upload
          <ArrowRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
