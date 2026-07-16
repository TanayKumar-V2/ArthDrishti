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
        "animate-pulse bg-border/50",
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

export function LoadingState({ message = "Retrieving secure financial records...", className, ...props }: LoadingStateProps) {
  return (
    <div className={cn("flex flex-col items-center justify-center p-8 text-center min-h-[200px]", className)} {...props}>
      <Spinner className="mb-3 h-8 w-8" />
      <p className="text-sm text-foreground-secondary font-sans font-medium">{message}</p>
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
