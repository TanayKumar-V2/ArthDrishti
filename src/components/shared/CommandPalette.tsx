"use client";

import React, { useState, useEffect, useRef, useMemo } from "react";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { 
  Search, 
  Bot, 
  SlidersHorizontal, 
  HeartPulse, 
  ShieldAlert, 
  Fingerprint, 
  PieChart, 
  TrendingUp, 
  Brain, 
  FileText, 
  Upload, 
  ArrowRight,
  Sparkles,
  Command
} from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
}

interface CommandItem {
  id: string;
  name: string;
  group: "AI ACTIONS" | "NAVIGATION" | "DATA" | "ACTIONS";
  icon: React.ComponentType<{ className?: string }>;
  shortcut?: string;
  action: () => void;
}

export function CommandPalette({ isOpen, onClose }: CommandPaletteProps) {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [selectedIndex, setSelectedIndex] = useState(0);
  
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  // Focus input when opened
  useEffect(() => {
    if (isOpen) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setQuery("");
      setSelectedIndex(0);
      // Timeout to ensure modal animation has started and DOM element is active
      const timer = setTimeout(() => {
        inputRef.current?.focus();
      }, 50);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  const commandItems: CommandItem[] = useMemo(() => [
    // AI ACTIONS
    {
      id: "ask-ai",
      name: "Ask Financial AI",
      group: "AI ACTIONS",
      icon: Bot,
      shortcut: "AI",
      action: () => {
        toast.info("Opening Financial AI chat assistant...");
        router.push("/ai-advisor");
        onClose();
      }
    },
    {
      id: "run-simulation",
      name: "Run What-if Simulation",
      group: "AI ACTIONS",
      icon: SlidersHorizontal,
      shortcut: "SIM",
      action: () => {
        router.push("/simulator");
        onClose();
      }
    },
    // NAVIGATION
    {
      id: "nav-health",
      name: "Financial Health",
      group: "NAVIGATION",
      icon: HeartPulse,
      action: () => {
        router.push("/financial-health");
        onClose();
      }
    },
    {
      id: "nav-risk",
      name: "Credit Risk",
      group: "NAVIGATION",
      icon: ShieldAlert,
      action: () => {
        router.push("/credit-risk");
        onClose();
      }
    },
    {
      id: "nav-fraud",
      name: "Fraud Intelligence",
      group: "NAVIGATION",
      icon: Fingerprint,
      action: () => {
        router.push("/fraud");
        onClose();
      }
    },
    {
      id: "nav-spending",
      name: "Spending",
      group: "NAVIGATION",
      icon: PieChart,
      action: () => {
        router.push("/spending");
        onClose();
      }
    },
    {
      id: "nav-cashflow",
      name: "Cash Flow",
      group: "NAVIGATION",
      icon: TrendingUp,
      action: () => {
        router.push("/cash-flow");
        onClose();
      }
    },
    {
      id: "nav-explainable-ai",
      name: "Explainable AI",
      group: "NAVIGATION",
      icon: Brain,
      action: () => {
        router.push("/explainable-ai");
        onClose();
      }
    },
    {
      id: "nav-reports",
      name: "Reports",
      group: "NAVIGATION",
      icon: FileText,
      action: () => {
        router.push("/reports");
        onClose();
      }
    },
    // DATA
    {
      id: "data-transactions",
      name: "Search Transactions",
      group: "DATA",
      icon: Search,
      action: () => {
        router.push("/transactions");
        onClose();
      }
    },
    {
      id: "data-upload",
      name: "Upload Financial Data",
      group: "DATA",
      icon: Upload,
      action: () => {
        router.push("/data-sources");
        onClose();
      }
    },
    // ACTIONS
    {
      id: "act-generate-report",
      name: "Generate Report",
      group: "ACTIONS",
      icon: Sparkles,
      shortcut: "⌘G",
      action: () => {
        toast.promise(
          new Promise((resolve) => setTimeout(resolve, 1500)),
          {
            loading: "Synthesizing real-time analytics report...",
            success: "Report generated successfully! Download started.",
            error: "Failed to compile metrics."
          }
        );
        onClose();
      }
    },
    {
      id: "act-view-alerts",
      name: "View Fraud Alerts",
      group: "ACTIONS",
      icon: ShieldAlert,
      shortcut: "⌘A",
      action: () => {
        router.push("/fraud");
        toast.info("Routing to Fraud Risk Dashboard alerts");
        onClose();
      }
    }
  ], [router, onClose]);

  // Filter items based on search query
  const filteredItems = useMemo(() => {
    if (!query) return commandItems;
    return commandItems.filter(item => 
      item.name.toLowerCase().includes(query.toLowerCase()) ||
      item.group.toLowerCase().includes(query.toLowerCase())
    );
  }, [query, commandItems]);

  // Reset selection index when query changes
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setSelectedIndex(0);
  }, [query]);

  // Handle keyboard events inside the palette
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return;

      if (e.key === "Escape") {
        e.preventDefault();
        onClose();
      } else if (e.key === "ArrowDown") {
        e.preventDefault();
        setSelectedIndex((prev) => 
          filteredItems.length === 0 ? 0 : (prev + 1) % filteredItems.length
        );
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        setSelectedIndex((prev) => 
          filteredItems.length === 0 ? 0 : (prev - 1 + filteredItems.length) % filteredItems.length
        );
      } else if (e.key === "Enter") {
        e.preventDefault();
        if (filteredItems[selectedIndex]) {
          filteredItems[selectedIndex].action();
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, filteredItems, selectedIndex, onClose]);

  // Scroll active item into view
  useEffect(() => {
    if (listRef.current) {
      const activeEl = listRef.current.querySelector('[data-active="true"]');
      if (activeEl) {
        activeEl.scrollIntoView({
          block: "nearest",
        });
      }
    }
  }, [selectedIndex]);

  // Group items for display
  const groupedItems = useMemo(() => {
    const groups: { [key: string]: typeof filteredItems } = {
      "AI ACTIONS": [],
      "NAVIGATION": [],
      "DATA": [],
      "ACTIONS": []
    };
    
    filteredItems.forEach(item => {
      groups[item.group].push(item);
    });

    return Object.entries(groups).filter(([, items]) => items.length > 0);
  }, [filteredItems]);

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-start justify-center pt-[10vh] px-4 md:px-0">
          {/* Overlay Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-background/80 backdrop-blur-md"
          />

          {/* Dialog Body */}
          <motion.div
            initial={{ opacity: 0, scale: 0.97, y: -8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.97, y: -8 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            ref={containerRef}
            className="relative w-full max-w-2xl bg-surface border border-border shadow-2xl rounded-md overflow-hidden flex flex-col max-h-[75vh]"
            role="combobox"
            aria-expanded={isOpen}
          >
            {/* Search Input Bar */}
            <div className="flex items-center px-4 py-4 border-b border-border/80 gap-3">
              <Search className="h-5 w-5 text-foreground-muted flex-shrink-0" />
              <input
                ref={inputRef}
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search transactions, reports, insights..."
                className="w-full bg-transparent border-0 text-foreground placeholder-foreground-muted outline-none focus:ring-0 text-sm font-sans"
              />
              <button
                onClick={onClose}
                className="text-[10px] font-sans font-bold border border-border px-2 py-1 rounded-sm text-foreground-secondary hover:text-foreground hover:bg-surface-hover transition-colors hidden sm:block cursor-pointer"
              >
                ESC
              </button>
            </div>

            {/* Results Panel */}
            <div 
              ref={listRef}
              className="flex-1 overflow-y-auto p-2 scrollbar-none"
            >
              {filteredItems.length === 0 ? (
                <div className="py-12 text-center flex flex-col items-center justify-center">
                  <Command className="h-8 w-8 text-foreground-muted mb-3 animate-pulse" />
                  <p className="text-sm text-foreground-secondary font-medium">No results found for &ldquo;{query}&rdquo;</p>
                  <p className="text-xs text-foreground-muted mt-1">Try searching for other transactions, simulator settings, or diagnostic views.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {/* Track current flat item index relative to visual render order */}
                  {(() => {
                    let globalIdx = 0;
                    return groupedItems.map(([groupName, items]) => (
                      <div key={groupName} className="space-y-1">
                        <h4 className="text-[10px] font-sans font-bold tracking-wider text-foreground-muted uppercase px-3 py-1 select-none">
                          {groupName}
                        </h4>
                        <div className="space-y-0.5">
                          {items.map((item) => {
                            const isSelected = globalIdx === selectedIndex;
                            const currentIdx = globalIdx;
                            globalIdx += 1;
                            const Icon = item.icon;

                            return (
                              <button
                                key={item.id}
                                data-active={isSelected}
                                onClick={item.action}
                                onMouseEnter={() => setSelectedIndex(currentIdx)}
                                className={cn(
                                  "w-full flex items-center justify-between px-3 py-2.5 rounded-sm transition-all text-left outline-none cursor-pointer group",
                                  isSelected 
                                    ? "bg-surface-elevated text-foreground border-l-[3px] border-primary pl-2.25 shadow-xs" 
                                    : "text-foreground-secondary hover:text-foreground hover:bg-surface-hover border-l-[3px] border-transparent"
                                )}
                              >
                                <div className="flex items-center gap-3">
                                  <Icon className={cn(
                                    "h-4.5 w-4.5 flex-shrink-0 transition-transform", 
                                    isSelected ? "text-primary translate-x-[2px]" : "text-foreground-muted group-hover:translate-x-[2px]"
                                  )} />
                                  <span className={cn(
                                    "text-sm font-sans font-medium",
                                    isSelected ? "text-foreground font-semibold" : ""
                                  )}>
                                    {item.name}
                                  </span>
                                </div>
                                
                                <div className="flex items-center gap-2">
                                  {item.shortcut && (
                                    <span className="text-[10px] font-sans font-bold bg-background text-foreground-muted border border-border px-1.5 py-0.5 rounded-sm">
                                      {item.shortcut}
                                    </span>
                                  )}
                                  {isSelected && (
                                    <ArrowRight className="h-3.5 w-3.5 text-primary" />
                                  )}
                                </div>
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    ));
                  })()}
                </div>
              )}
            </div>

            {/* Interactive Legend Footer */}
            <div className="px-4 py-3 bg-surface-elevated border-t border-border/80 flex items-center justify-between text-[11px] text-foreground-secondary select-none">
              <div className="flex items-center gap-4">
                <span className="flex items-center gap-1.5">
                  <kbd className="bg-background border border-border px-1 rounded-sm text-foreground-muted">↑↓</kbd> Navigate
                </span>
                <span className="flex items-center gap-1.5">
                  <kbd className="bg-background border border-border px-1 rounded-sm text-foreground-muted">↵</kbd> Select
                </span>
                <span className="flex items-center gap-1.5">
                  <kbd className="bg-background border border-border px-1.5 rounded-sm text-foreground-muted">ESC</kbd> Close
                </span>
              </div>
              <span className="text-foreground-muted font-medium flex items-center gap-1">
                <Command className="h-3 w-3" /> Search Command Engine
              </span>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
