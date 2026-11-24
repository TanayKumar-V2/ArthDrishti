import React from "react";
import { Loader2, AlertCircle, Inbox, RotateCcw } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "./Button";
import { Card } from "./Card";

// ==========================================
// SKELETON PULSE
// ==========================================

export interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "rectangle" | "circle";
}

export function Skeleton({ className, variant = "rectangle", ...props }: SkeletonProps) {
  return (
    <div
      className={cn(
        "skeleton-shimmer bg-border/60",
        variant === "circle" ? "rounded-full" : "rounded-sm",
        className
      )}
      {...props}
    />
  );
}

// ==========================================
// SPINNER
// ==========================================

export function Spinner({ className, ...props }: React.HTMLAttributes<SVGElement>) {
  return (
    <Loader2 className={cn("h-6 w-6 animate-spin text-primary", className)} {...props} />
  );
}

// ==========================================
// LOADING STATE CARD
// ==========================================

interface LoadingStateProps extends React.HTMLAttributes<HTMLDivElement> {
  message?: string;
}

export function LoadingState({ message = "Loading data...", className, ...props }: LoadingStateProps) {
  return (
    <div className={cn("flex flex-col items-center justify-center p-8 text-center min-h-[220px] gap-4 select-none", className)} {...props}>
      <div className="relative flex items-center justify-center">
        <span className="absolute h-12 w-12 rounded-full bg-primary/10 animate-ping [animation-duration:2.2s]" />
        <svg
          className="relative h-9 w-9 text-primary fill-none"
          viewBox="0 0 24 24"
          strokeWidth="1.8"
          stroke="currentColor"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <circle cx="12" cy="12" r="2.2" className="fill-primary text-primary animate-pulse" />
          <circle cx="12" cy="12" r="9" className="opacity-15" strokeWidth="1.2" />
          <path d="M5.5 12a6.5 6.5 0 0 1 11.4-4.2" className="animate-orbit" strokeWidth="2.1" />
        </svg>
      </div>
      <div className="h-[2.5px] w-24 overflow-hidden rounded-full bg-border/80">
        <div className="h-full w-1/2 rounded-full bg-primary animate-progress-indeterminate" />
      </div>
      {message && (
        <p className="text-xs text-foreground-secondary font-sans font-medium tracking-wide">{message}</p>
      )}
    </div>
  );
}

// ==========================================
// EMPTY STATE
// ==========================================

interface EmptyStateProps extends React.HTMLAttributes<HTMLDivElement> {
  title: string;
  description: string;
  icon?: React.ComponentType<{ className?: string }>;
  actionLabel?: string;
  onAction?: () => void;
}

export function EmptyState({
  title,
  description,
  icon: Icon = Inbox,
  actionLabel,
  onAction,
  className,
  ...props
}: EmptyStateProps) {
  return (
    <Card className={cn("border border-dashed border-border/80 bg-surface/50", className)} {...props}>
      <div className="flex flex-col items-center justify-center text-center p-8 md:p-12 max-w-md mx-auto">
        <div className="flex items-center justify-center h-12 w-12 rounded-full bg-surface-elevated border border-border text-foreground-muted mb-4">
          <Icon className="h-6 w-6" />
        </div>
        <h3 className="font-heading font-semibold text-base sm:text-lg text-foreground mb-1.5">{title}</h3>
        <p className="font-sans text-xs sm:text-sm text-foreground-secondary leading-relaxed mb-6">{description}</p>
        {actionLabel && onAction && (
          <Button variant="secondary" size="sm" onClick={onAction}>
            {actionLabel}
          </Button>
        )}
      </div>
    </Card>
  );
}

// ==========================================
// ERROR STATE
// ==========================================

interface ErrorStateProps extends React.HTMLAttributes<HTMLDivElement> {
  title?: string;
  description?: string;
  onRetry?: () => void;
  retryLabel?: string;
}

export function ErrorState({
  title = "Secure Sync Failure",
  description = "An error occurred while communicating with the risk compliance engine. Please refresh or retry.",
  onRetry,
  retryLabel = "Retry compliance check",
  className,
  ...props
}: ErrorStateProps) {
  return (
    <Card className={cn("border-critical/30 bg-critical/5", className)} {...props}>
      <div className="flex flex-col items-center justify-center text-center p-8 md:p-12 max-w-md mx-auto">
        <div className="flex items-center justify-center h-12 w-12 rounded-full bg-critical/10 text-critical mb-4 border border-critical/20">
          <AlertCircle className="h-6 w-6" />
        </div>
        <h3 className="font-heading font-semibold text-base sm:text-lg text-foreground mb-1.5">{title}</h3>
        <p className="font-sans text-xs sm:text-sm text-foreground-secondary leading-relaxed mb-6">{description}</p>
        {onRetry && (
          <Button variant="destructive" size="sm" onClick={onRetry} className="gap-2">
            <RotateCcw className="h-3.5 w-3.5" />
            {retryLabel}
          </Button>
        )}
      </div>
    </Card>
  );
}
