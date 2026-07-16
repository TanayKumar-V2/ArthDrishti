"use client";

import React, { useState, useMemo, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
  Sparkles,
  TrendingDown,
  TrendingUp,
  CheckCircle2,
  Sliders,
  Calendar,
  ClipboardList,
  Target,
  Bell,
  CheckSquare,
  Award,
  ChevronDown
} from "lucide-react";
import { toast } from "sonner";

import PageContainer from "@/components/ui/PageContainer";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Sheet } from "@/components/ui/Overlays";
import { cn } from "@/lib/utils";
import { INITIAL_RECOMMENDATIONS, RecommendationCard } from "@/lib/recommendations_data";

export default function RecommendationsCenterPage() {
  const router = useRouter();

  // Active Recommendations state
  const [recommendations, setRecommendations] = useState<RecommendationCard[]>(INITIAL_RECOMMENDATIONS);
  
  // Selected filter tag state
  const [activeFilter, setActiveFilter] = useState<string>("All");

  // Selected sorting option state
  const [activeSort, setActiveSort] = useState<string>("Priority");

  // Loading animation state (brief skeleton trigger on filter change)
  const [isLoading, setIsLoading] = useState<boolean>(false);

  // Active drawer recommendation item
  const [selectedRec, setSelectedRec] = useState<RecommendationCard | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState<boolean>(false);
  const [remindersEnabled, setRemindersEnabled] = useState<Record<string, boolean>>({});

  // Simulate data fetch skeleton on filter changes
  const handleFilterChange = useCallback((filter: string) => {
    setActiveFilter(filter);
    setIsLoading(true);
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 450);
    return () => clearTimeout(timer);
  }, []);

  // Filter + Sort application logic
  const filteredAndSortedList = useMemo(() => {
    let result = [...recommendations];

    // Apply filters
    if (activeFilter === "Urgent") {
      result = result.filter((r) => r.priority === "Urgent");
    } else if (activeFilter === "Completed") {
      result = result.filter((r) => r.priority === "Completed");
    } else if (activeFilter !== "All") {
      result = result.filter((r) => r.category === activeFilter);
    }

    // Apply sorting
    if (activeSort === "Highest Impact") {
      result.sort((a, b) => {
        const aImpact = a.impactDefaultRisk ? parseFloat(a.impactDefaultRisk) : 0;
        const bImpact = b.impactDefaultRisk ? parseFloat(b.impactDefaultRisk) : 0;
        return aImpact - bImpact; // negative numbers, lower means higher drop (better impact)
      });
    } else if (activeSort === "Lowest Effort") {
      const difficultyWeights = { Easy: 1, Medium: 2, Hard: 3 };
      result.sort((a, b) => difficultyWeights[a.difficulty] - difficultyWeights[b.difficulty]);
    } else if (activeSort === "Newest") {
      result.sort((a, b) => b.id.localeCompare(a.id));
    } else if (activeSort === "Priority") {
      const priorityWeights = { Urgent: 1, "High-Impact": 2, Active: 3, Completed: 4 };
      result.sort((a, b) => priorityWeights[a.priority] - priorityWeights[b.priority]);
    }

    return result;
  }, [recommendations, activeFilter, activeSort]);

  // Compute live progress summary details
  const progressStats = useMemo(() => {
    const completedCount = recommendations.filter((r) => r.priority === "Completed").length;
    const activeCount = recommendations.length - completedCount;
    const urgentCount = recommendations.filter((r) => r.priority === "Urgent").length;
    const totalImpactHealth = completedCount * 5 + 8; // mock accumulated

    return {
      completedCount,
      activeCount,
      urgentCount,
      totalImpactHealth
    };
  }, [recommendations]);

  // Open Action Plan sliding Drawer
  const handleOpenActionPlan = useCallback((rec: RecommendationCard) => {
    setSelectedRec(rec);
    setIsDrawerOpen(true);
  }, []);

  // Handle checking a step inside the Action Plan checklists
  const handleStepToggle = useCallback((recId: string, stepIndex: number) => {
    setRecommendations((prev) =>
      prev.map((rec) => {
        if (rec.id !== recId) return rec;

        // Clone steps array and update completed state
        const updatedSteps = rec.steps.map((step, idx) =>
          idx === stepIndex ? { ...step, completed: !step.completed } : step
        );

        // Recalculate progress percentage
        const completedCount = updatedSteps.filter((s) => s.completed).length;
        const progressPercent = Math.round((completedCount / updatedSteps.length) * 100);

        // Update priority status if completed
        let priority = rec.priority;
        if (progressPercent === 100) {
          priority = "Completed";
        } else if (rec.priority === "Completed") {
          // Revert back to original priorities if unchecked
          priority = rec.id === "rec1" || rec.id === "rec2" || rec.id === "rec3" ? "Urgent" : "High-Impact";
        }

        const updatedRec = {
          ...rec,
          steps: updatedSteps,
          progressPercent,
          priority
        };

        // Sync local selected drawer reference
        if (selectedRec && selectedRec.id === recId) {
          setSelectedRec(updatedRec);
        }

        return updatedRec;
      })
    );
  }, [selectedRec]);

  // Toggle reminders
  const handleToggleReminder = useCallback((recId: string) => {
    setRemindersEnabled((prev) => {
      const active = !prev[recId];
      toast.success(active ? "Enabled autopay notifications for this goal." : "Disabled goal alerts.");
      return {
        ...prev,
        [recId]: active
      };
    });
  }, []);

  // Filter Categories chips helper
  const filterCategories = [
    "All",
    "Urgent",
    "Credit Risk",
    "Savings",
    "Spending",
    "Debt",
    "Cash Flow",
    "Completed"
  ];

  return (
    <PageContainer className="pb-24">
      
      {/* HEADER SECTION */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between pb-3 border-b border-border/60 select-none">
        <div className="space-y-1">
          <h1 className="text-2xl font-bold font-sans tracking-tight text-foreground flex items-center gap-2.5">
            <Sparkles className="h-6.5 w-6.5 text-primary" /> AI RECOMMENDATIONS
          </h1>
          <p className="text-xs text-foreground-secondary font-sans">
            Personalized, actionable optimization plans dynamically generated based on your real-time risk logs.
          </p>
        </div>

        {/* Summary Counter Stats badges */}
        <div className="flex flex-wrap gap-2 text-[10px] font-sans font-bold uppercase tracking-wider self-start md:self-center">
          <span className="bg-critical/10 text-critical border border-critical/20 px-2.5 py-1 rounded-sm">
            {progressStats.urgentCount} Urgent Actions
          </span>
          <span className="bg-primary/10 text-primary border border-primary/20 px-2.5 py-1 rounded-sm">
            6 High-Impact Goals
          </span>
          <span className="bg-surface-elevated text-foreground-secondary border border-border px-2.5 py-1 rounded-sm">
            {progressStats.activeCount} Active Plans
          </span>
        </div>
      </div>

      {/* PROGRESS TRACKER PANEL */}
      <div className="mt-6 bg-surface border border-border/80 p-4.5 rounded-sm select-none grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
        
        {/* Progress stats (Left col) */}
        <div className="md:col-span-4 space-y-1">
          <span className="text-[10px] font-sans font-bold uppercase tracking-widest text-foreground-muted block">
            ACHIEVEMENTS METRICS
          </span>
          <h3 className="text-sm font-extrabold text-foreground flex items-center gap-1.5">
            <Award className="h-4.5 w-4.5 text-primary" /> {progressStats.completedCount} / 6 RECOMMENDATIONS SECURED
          </h3>
          <p className="text-xs text-foreground-secondary font-sans leading-relaxed">
            Raise completed recommendations to unlock additional credit score health credits.
          </p>
        </div>

        {/* Live progress slider (Center col) */}
        <div className="md:col-span-5 space-y-2">
          <div className="flex justify-between text-[10px] font-sans font-bold uppercase text-foreground-muted">
            <span>Overall Optimization Completion</span>
            <span className="font-mono text-foreground font-extrabold">
              {Math.round((progressStats.completedCount / recommendations.length) * 100)}%
            </span>
          </div>
          <div className="w-full bg-border rounded-full h-1.5 overflow-hidden">
            <div
              className="bg-primary h-full rounded-full transition-all duration-500"
              style={{ width: `${(progressStats.completedCount / recommendations.length) * 100}%` }}
            />
          </div>
        </div>

        {/* Health impact achieved (Right col) */}
        <div className="md:col-span-3 bg-surface-elevated/50 border border-border/60 p-3 rounded-xs flex justify-between items-center text-xs">
          <span className="font-semibold text-foreground-secondary">
            Health Index Gain
          </span>
          <span className="font-mono font-bold text-positive text-sm flex items-center gap-0.5">
            <TrendingUp className="h-4 w-4" /> +{progressStats.totalImpactHealth} Points
          </span>
        </div>
      </div>

      {/* FILTER & SORT TOOLBAR */}
      <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center select-none bg-surface-elevated/40 border border-border p-3 rounded-sm">
        
        {/* Horizontal filters tags */}
        <div className="flex flex-wrap gap-1.5">
          {filterCategories.map((cat) => (
            <button
              key={cat}
              onClick={() => handleFilterChange(cat)}
              className={cn(
                "px-3 py-1.5 rounded-xs text-[10.5px] uppercase font-sans font-bold transition-all cursor-pointer",
                activeFilter === cat
                  ? "bg-primary text-primary-foreground shadow-xs"
                  : "text-foreground-secondary hover:text-foreground hover:bg-surface-elevated"
              )}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Sort selector dropdown */}
        <div className="flex items-center gap-2 text-xs self-end sm:self-center">
          <span className="text-foreground-muted">Sort by:</span>
          <div className="relative inline-block text-left">
            <select
              value={activeSort}
              onChange={(e) => setActiveSort(e.target.value)}
              className="bg-surface border border-border rounded-sm py-1.5 pl-2.5 pr-8 text-xs font-semibold text-foreground focus:outline-none focus:ring-1 focus:ring-primary cursor-pointer appearance-none"
            >
              <option value="Priority">Priority</option>
              <option value="Highest Impact">Highest Impact</option>
              <option value="Lowest Effort">Lowest Effort</option>
              <option value="Newest">Newest</option>
            </select>
            <ChevronDown className="h-3.5 w-3.5 absolute right-2.5 top-2.5 text-foreground-muted pointer-events-none" />
          </div>
        </div>

      </div>

      {/* SKELETON LOADER FEEDBACK */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="border border-border/80 bg-surface p-5 rounded-sm space-y-4 animate-pulse select-none">
              <div className="flex justify-between items-center">
                <div className="h-3.5 bg-border rounded-xs w-1/2" />
                <div className="h-3 bg-border rounded-xs w-1/4" />
              </div>
              <div className="space-y-2">
                <div className="h-3 bg-border rounded-xs w-full" />
                <div className="h-3 bg-border rounded-xs w-5/6" />
              </div>
              <div className="h-8 bg-border rounded-xs w-full" />
            </div>
          ))}
        </div>
      ) : filteredAndSortedList.length === 0 ? (
        <div className="mt-8 select-none text-center border border-border border-dashed p-12 rounded-sm bg-surface">
          <ClipboardList className="h-10 w-10 text-foreground-muted mx-auto mb-3" />
          <h3 className="text-sm font-bold text-foreground">No recommendations match filter</h3>
          <p className="text-xs text-foreground-secondary mt-1 max-w-sm mx-auto font-sans">
            Adjust your filter criteria tags above or run a fresh AI credit intelligence query inside the AI Advisor dashboard.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6 select-none">
          {filteredAndSortedList.map((rec) => {
            const isCompleted = rec.priority === "Completed";
            return (
              <Card
                key={rec.id}
                className={cn(
                  "border p-5 flex flex-col justify-between transition-all duration-300 relative overflow-hidden",
                  isCompleted ? "border-positive/40 bg-positive/5" : "border-border/80 bg-surface",
                  rec.priority === "Urgent" && "border-critical/30"
                )}
              >
                <div className="space-y-4">
                  
                  {/* Card Title & Tags header */}
                  <div className="flex justify-between items-start gap-4">
                    <div className="space-y-0.5">
                      <span className="text-[9px] font-sans font-extrabold uppercase tracking-widest text-foreground-muted">
                        {rec.category}
                      </span>
                      <h4 className="text-sm font-extrabold text-foreground leading-tight">
                        {rec.title}
                      </h4>
                    </div>

                    <span className={cn(
                      "text-[8px] font-sans font-bold px-2 py-0.5 rounded-xs uppercase tracking-wider border",
                      rec.priority === "Urgent"
                        ? "text-critical bg-critical/15 border-critical/20"
                        : rec.priority === "High-Impact"
                        ? "text-primary bg-primary/10 border-primary/20"
                        : isCompleted
                        ? "text-positive bg-positive/15 border-positive/20"
                        : "text-foreground-secondary bg-surface-elevated border-border"
                    )}>
                      {rec.priority === "High-Impact" ? "High Impact" : rec.priority}
                    </span>
                  </div>

                  {/* Current vs Target displays */}
                  <div className="grid grid-cols-2 gap-2 text-xs border-y border-border/40 py-3.5 bg-surface-elevated/15 px-3 rounded-xs font-mono">
                    <div>
                      <span className="text-[9px] text-foreground-muted block font-sans font-medium uppercase">Current Value</span>
                      <span className="font-extrabold text-foreground">{rec.currentValue}</span>
                    </div>
                    <div>
                      <span className="text-[9px] text-foreground-muted block font-sans font-medium uppercase font-semibold text-primary">Target Goal</span>
                      <span className="font-extrabold text-primary">{rec.targetValue}</span>
                    </div>
                  </div>

                  {/* Why description */}
                  <div className="space-y-1">
                    <span className="text-[9px] font-sans font-bold text-foreground-muted uppercase tracking-wider block">Why?</span>
                    <p className="text-xs text-foreground-secondary leading-relaxed font-sans">
                      {rec.whyText}
                    </p>
                  </div>

                  {/* Potential Impact blocks */}
                  <div className="space-y-1.5">
                    <span className="text-[9px] font-sans font-bold text-foreground-muted uppercase tracking-wider block">Potential Impact</span>
                    <div className="flex flex-wrap gap-2">
                      {rec.impactDefaultRisk && (
                        <span className="text-[10.5px] font-mono text-positive bg-positive/10 border border-positive/15 px-2 py-0.5 rounded-xs flex items-center gap-0.5 font-bold">
                          <TrendingDown className="h-3.5 w-3.5" /> Default Risk {rec.impactDefaultRisk}
                        </span>
                      )}
                      {rec.impactFinancialHealth && (
                        <span className="text-[10.5px] font-mono text-positive bg-positive/10 border border-positive/15 px-2 py-0.5 rounded-xs flex items-center gap-0.5 font-bold">
                          <TrendingUp className="h-3.5 w-3.5" /> Health {rec.impactFinancialHealth}
                        </span>
                      )}
                      {rec.impactSavingsScore && (
                        <span className="text-[10.5px] font-mono text-positive bg-positive/10 border border-positive/15 px-2 py-0.5 rounded-xs flex items-center gap-0.5 font-bold">
                          <TrendingUp className="h-3.5 w-3.5" /> Savings Score {rec.impactSavingsScore}
                        </span>
                      )}
                      {rec.impactCashFlow && (
                        <span className="text-[10.5px] font-mono text-positive bg-positive/10 border border-positive/15 px-2 py-0.5 rounded-xs flex items-center gap-0.5 font-bold">
                          <TrendingUp className="h-3.5 w-3.5" /> Cash Flow {rec.impactCashFlow}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Timeline & Effort metadata */}
                  <div className="flex flex-wrap gap-3.5 text-[10.5px] text-foreground-secondary pt-1.5 font-mono">
                    <span className="flex items-center gap-1">
                      <Calendar className="h-3.5 w-3.5 text-foreground-muted" /> Time: {rec.timeframe}
                    </span>
                    <span className="flex items-center gap-1">
                      <Sliders className="h-3.5 w-3.5 text-foreground-muted" /> Difficulty: {rec.difficulty}
                    </span>
                    {rec.progressPercent > 0 && rec.progressPercent < 100 && (
                      <span className="flex items-center gap-1 font-sans font-bold text-primary">
                        <CheckSquare className="h-3.5 w-3.5" /> Progress: {rec.progressPercent}%
                      </span>
                    )}
                  </div>

                </div>

                {/* Card Action Buttons */}
                <div className="pt-5 border-t border-border/40 mt-4 flex gap-2.5">
                  <Button
                    onClick={() => handleOpenActionPlan(rec)}
                    size="sm"
                    className="flex-1 text-[9.5px] uppercase font-sans font-extrabold py-2 cursor-pointer"
                  >
                    {isCompleted ? "View Action Plan" : rec.progressPercent > 0 ? "Resume Action Plan" : "Create Action Plan"}
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => {
                      toast.info(`Redirecting parameters to Simulator...`);
                      router.push("/simulator");
                    }}
                    size="sm"
                    className="text-[9.5px] uppercase font-sans font-extrabold py-2 hover:bg-surface-elevated border-border/80 cursor-pointer"
                  >
                    Simulate Impact
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => {
                      toast.info(`Redirecting parameters to Explanations center...`);
                      router.push("/explainable-ai");
                    }}
                    size="sm"
                    className="text-[9.5px] uppercase font-sans font-bold py-2 hover:bg-surface-elevated border-border/80 cursor-pointer"
                  >
                    Why?
                  </Button>
                </div>
              </Card>
            );
          })}
        </div>
      )}

      {/* ACTION PLAN SHEET DRAWER */}
      <Sheet
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        title="Action Plan Workspace"
        side="right"
        className="w-full max-w-md font-sans text-xs select-none"
      >
        {selectedRec && (
          <div className="space-y-6 py-4">
            
            {/* Header info */}
            <div className="space-y-1">
              <span className="text-[9px] font-sans font-bold text-foreground-muted uppercase tracking-wider block">
                {selectedRec.category} ACTION PLAN
              </span>
              <h3 className="text-base font-extrabold text-foreground leading-snug">
                {selectedRec.title}
              </h3>
              <p className="text-[11px] text-foreground-secondary leading-relaxed font-sans">
                Follow these automated sequential checkpoints designed by ArthDrishti credit engines to optimize this financial factor.
              </p>
            </div>

            {/* Target Goals displays */}
            <div className="bg-surface-elevated/45 border border-border p-3.5 rounded-xs grid grid-cols-2 gap-4 text-xs font-mono">
              <div>
                <span className="text-[9px] text-foreground-muted block font-sans font-semibold uppercase">Current Value</span>
                <span className="font-bold text-foreground">{selectedRec.currentValue}</span>
              </div>
              <div>
                <span className="text-[9px] text-foreground-muted block font-sans font-semibold uppercase text-primary">Target Goal</span>
                <span className="font-bold text-primary">{selectedRec.targetValue}</span>
              </div>
            </div>

            {/* Live Progress Bar inside Drawer */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-[10px] font-bold uppercase text-foreground-secondary">
                <span>Goal Progress</span>
                <span className="font-mono text-primary font-bold">
                  {selectedRec.progressPercent}%
                </span>
              </div>
              <div className="w-full bg-border rounded-full h-1.5 overflow-hidden">
                <div
                  className="bg-primary h-full rounded-full transition-all duration-300"
                  style={{ width: `${selectedRec.progressPercent}%` }}
                />
              </div>
            </div>

            {/* Checklist items */}
            <div className="space-y-3.5">
              <span className="text-[10px] font-bold text-foreground-muted uppercase tracking-wider block">
                Action Checkpoints Steps
              </span>
              <div className="space-y-2.5">
                {selectedRec.steps.map((step, idx) => (
                  <div
                    key={idx}
                    onClick={() => handleStepToggle(selectedRec.id, idx)}
                    className={cn(
                      "flex items-center gap-3 p-3 rounded-xs border transition-all cursor-pointer",
                      step.completed
                        ? "bg-positive/5 border-positive/30 text-foreground-secondary"
                        : "bg-surface-elevated/35 border-border hover:bg-surface-elevated text-foreground"
                    )}
                  >
                    <button
                      type="button"
                      className={cn(
                        "h-4.5 w-4.5 rounded-xs border flex items-center justify-center shrink-0 transition-all cursor-pointer",
                        step.completed
                          ? "bg-positive border-positive text-white"
                          : "border-border bg-surface"
                      )}
                    >
                      {step.completed && <CheckCircle2 className="h-3 w-3 stroke-[3]" />}
                    </button>
                    <span className={cn("text-[11px] font-medium leading-tight font-sans", step.completed && "line-through")}>
                      {step.text}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Additional parameters (Due date, related metrics, alerts) */}
            <div className="border-t border-border/60 pt-4 space-y-4 font-sans text-xs">
              
              <div className="flex justify-between items-center py-1">
                <span className="font-semibold text-foreground-secondary flex items-center gap-1.5">
                  <Calendar className="h-4 w-4 text-foreground-muted" /> Target Due Date
                </span>
                <span className="font-mono font-bold text-foreground">{selectedRec.dueDate}</span>
              </div>

              <div className="flex justify-between items-center py-1">
                <span className="font-semibold text-foreground-secondary flex items-center gap-1.5">
                  <Target className="h-4 w-4 text-foreground-muted" /> Related Indicators
                </span>
                <span className="text-[11px] font-semibold text-foreground-secondary truncate max-w-[200px]" title={selectedRec.relatedMetrics}>
                  {selectedRec.relatedMetrics}
                </span>
              </div>

              <div className="flex justify-between items-center py-1">
                <span className="font-semibold text-foreground-secondary flex items-center gap-1.5">
                  <Bell className="h-4 w-4 text-foreground-muted" /> Autopay Statement Reminders
                </span>
                <button
                  type="button"
                  onClick={() => handleToggleReminder(selectedRec.id)}
                  className={cn(
                    "w-10 h-5.5 rounded-full p-0.75 transition-all cursor-pointer flex items-center",
                    remindersEnabled[selectedRec.id] ? "bg-primary justify-end" : "bg-border justify-start"
                  )}
                >
                  <span className="h-4 w-4 bg-white rounded-full shadow-xs" />
                </button>
              </div>

            </div>

            {/* Closing banner */}
            <div className="pt-2 border-t border-border/40 flex justify-end">
              <Button
                onClick={() => setIsDrawerOpen(false)}
                className="w-full text-[10px] font-sans font-bold uppercase cursor-pointer"
              >
                Done
              </Button>
            </div>

          </div>
        )}
      </Sheet>

    </PageContainer>
  );
}
