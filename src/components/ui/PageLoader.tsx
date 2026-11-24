import React from "react";
import { cn } from "@/lib/utils";
import { Skeleton } from "./FeedbackState";
import { Card, CardContent, CardHeader } from "./Card";

interface BrandLoaderProps {
  label?: string;
  fullScreen?: boolean;
  className?: string;
}

/**
 * Refined geometric loader using the ArthDrishti orbital glyph and smooth progress track.
 */
export function BrandLoader({ label, fullScreen = false, className }: BrandLoaderProps) {
  return (
    <div
      role="status"
      aria-live="polite"
      aria-label={label || "Loading"}
      className={cn(
        "flex flex-col items-center justify-center gap-4 px-6 select-none animate-in fade-in duration-200",
        fullScreen ? "min-h-screen w-full bg-background" : "min-h-[260px] w-full py-12",
        className
      )}
    >
      <div className="relative flex items-center justify-center">
        {/* Soft ambient halo */}
        <span className="absolute h-14 w-14 rounded-full bg-primary/10 animate-ping [animation-duration:2.2s]" />

        {/* Orbital ArthDrishti Glyph */}
        <svg
          className="relative h-10 w-10 text-primary fill-none"
          viewBox="0 0 24 24"
          strokeWidth="1.8"
          stroke="currentColor"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <circle cx="12" cy="12" r="2.5" className="fill-primary text-primary animate-pulse" />
          <circle cx="12" cy="12" r="9" className="opacity-15" strokeWidth="1.2" />
          <path d="M12 4.5c4.5 0 8 4.5 9.5 7.5-1.5 3-5 7.5-9.5 7.5S4 15 2.5 12c1.5-3 5-7.5 9.5-7.5Z" className="opacity-25" strokeWidth="1.4" />
          <path d="M5.5 12a6.5 6.5 0 0 1 11.4-4.2" className="animate-orbit" strokeWidth="2.1" />
        </svg>
      </div>

      {/* Minimal sliding track */}
      <div className="h-[3px] w-28 overflow-hidden rounded-full bg-border/80">
        <div className="h-full w-1/2 rounded-full bg-primary animate-progress-indeterminate" />
      </div>

      {label && (
        <p className="text-xs font-medium tracking-wide text-foreground-secondary">{label}</p>
      )}
    </div>
  );
}

/**
 * Structured workspace skeleton rendered during dashboard/portal page transitions.
 */
export function WorkspaceSkeleton({ className }: { className?: string }) {
  return (
    <div
      role="status"
      aria-label="Loading workspace"
      className={cn("mx-auto w-full max-w-7xl space-y-6 p-4 sm:p-6 lg:p-8 page-enter", className)}
    >
      {/* Header placeholder */}
      <div className="flex flex-col gap-3 border-b border-border/70 pb-6 sm:flex-row sm:items-end sm:justify-between">
        <div className="space-y-2.5">
          <Skeleton className="h-3 w-28" />
          <Skeleton className="h-8 w-64 sm:w-80" />
          <Skeleton className="h-4 w-72 sm:w-96" />
        </div>
        <div className="flex gap-2">
          <Skeleton className="h-9 w-28 rounded-full" />
          <Skeleton className="h-9 w-32 rounded-full" />
        </div>
      </div>

      {/* KPI Row */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, index) => (
          <Card key={index} className="border-border/70">
            <CardContent className="space-y-3 p-5">
              <div className="flex items-center justify-between">
                <Skeleton className="h-3.5 w-24" />
                <Skeleton variant="circle" className="h-7 w-7" />
              </div>
              <Skeleton className="h-8 w-32" />
              <Skeleton className="h-3 w-20" />
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Primary Content Grid */}
      <div className="grid gap-5 lg:grid-cols-12">
        <Card className="border-border/70 lg:col-span-7">
          <CardHeader className="space-y-2 pb-2">
            <Skeleton className="h-4 w-44" />
            <Skeleton className="h-3 w-64" />
          </CardHeader>
          <CardContent className="p-5 pt-2">
            <Skeleton className="h-[260px] w-full rounded-md" />
          </CardContent>
        </Card>

        <Card className="border-border/70 lg:col-span-5">
          <CardHeader className="space-y-2 pb-2">
            <Skeleton className="h-4 w-36" />
            <Skeleton className="h-3 w-52" />
          </CardHeader>
          <CardContent className="space-y-4 p-5 pt-2">
            {Array.from({ length: 4 }).map((_, index) => (
              <div key={index} className="flex items-center justify-between gap-3 border-b border-border/50 pb-3 last:border-0 last:pb-0">
                <div className="flex items-center gap-3">
                  <Skeleton variant="circle" className="h-9 w-9 shrink-0" />
                  <div className="space-y-1.5">
                    <Skeleton className="h-3.5 w-32" />
                    <Skeleton className="h-3 w-20" />
                  </div>
                </div>
                <Skeleton className="h-4 w-16" />
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
