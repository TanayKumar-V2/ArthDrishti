import * as React from "react";
import { 
  ShieldCheck, 
  AlertTriangle, 
  AlertCircle, 
  Octagon,
  ArrowUpRight, 
  ArrowDownRight, 
  Minus,
  CheckCircle2,
  Clock,
  XCircle
} from "lucide-react";
import { cn } from "@/lib/utils";

// ==========================================
// STANDARD BADGE
// ==========================================

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: "default" | "primary" | "ai" | "forecast" | "success" | "warning" | "destructive" | "outline";
}

export function Badge({ className, variant = "default", ...props }: BadgeProps) {
  const baseStyles = "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium font-sans border transition-colors select-none";
  
  const variants = {
    default: "bg-surface-elevated text-foreground border-border",
    primary: "bg-primary/10 text-primary border-primary/20",
    ai: "bg-ai/10 text-ai border-ai/20",
    forecast: "bg-forecast/10 text-forecast border-forecast/20",
    success: "bg-positive/10 text-positive border-positive/20",
    warning: "bg-warning/10 text-warning border-warning/20",
    destructive: "bg-critical/10 text-critical border-critical/20",
    outline: "bg-transparent text-foreground border-border",
  };

  return (
    <span className={cn(baseStyles, variants[variant], className)} {...props} />
  );
}

// ==========================================
// STATUS BADGE
// ==========================================

export interface StatusBadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  status: "completed" | "pending" | "failed" | "active" | "shadow" | "retired" | "submitted" | "under_review" | "approved" | "rejected";
}

export function StatusBadge({ status, className, ...props }: StatusBadgeProps) {
  const baseStyles = "inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium font-sans border select-none";
  
  const config = {
    completed: {
      styles: "bg-positive/10 text-positive border-positive/25",
      dot: "bg-positive",
      icon: CheckCircle2,
      label: "Completed"
    },
    approved: {
      styles: "bg-positive/10 text-positive border-positive/25",
      dot: "bg-positive",
      icon: CheckCircle2,
      label: "Approved"
    },
    active: {
      styles: "bg-positive/10 text-positive border-positive/25",
      dot: "bg-positive",
      icon: CheckCircle2,
      label: "Active"
    },
    pending: {
      styles: "bg-warning/10 text-warning border-warning/25",
      dot: "bg-warning",
      icon: Clock,
      label: "Pending"
    },
    submitted: {
      styles: "bg-warning/10 text-warning border-warning/25",
      dot: "bg-warning",
      icon: Clock,
      label: "Submitted"
    },
    under_review: {
      styles: "bg-forecast/10 text-forecast border-forecast/25",
      dot: "bg-forecast",
      icon: Clock,
      label: "Under Review"
    },
    shadow: {
      styles: "bg-ai/10 text-ai border-ai/25",
      dot: "bg-ai",
      icon: Clock,
      label: "Shadow"
    },
    failed: {
      styles: "bg-critical/10 text-critical border-critical/25",
      dot: "bg-critical",
      icon: XCircle,
      label: "Failed"
    },
    rejected: {
      styles: "bg-critical/10 text-critical border-critical/25",
      dot: "bg-critical",
      icon: XCircle,
      label: "Rejected"
    },
    retired: {
      styles: "bg-surface-elevated text-foreground-secondary border-border",
      dot: "bg-foreground-muted",
      icon: XCircle,
      label: "Retired"
    }
  };

  const current = config[status] || {
    styles: "bg-surface-elevated text-foreground border-border",
    dot: "bg-foreground-secondary",
    icon: Clock,
    label: status
  };

  const IconComponent = current.icon;

  return (
    <span className={cn(baseStyles, current.styles, className)} {...props}>
      <IconComponent className="h-3 w-3 flex-shrink-0" />
      <span>{current.label}</span>
    </span>
  );
}

// ==========================================
// RISK BADGE (MUST USE: COLOR + ICON + TEXT)
// ==========================================

export interface RiskBadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  rating: "Low" | "Medium" | "High" | "Critical";
}

export function RiskBadge({ rating, className, ...props }: RiskBadgeProps) {
  const baseStyles = "inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold font-sans border tracking-wide select-none";

  const config = {
    Low: {
      styles: "bg-positive/10 text-positive border-positive/30 shadow-xs shadow-positive/5",
      icon: ShieldCheck,
      text: "Low Risk"
    },
    Medium: {
      styles: "bg-warning/10 text-warning border-warning/30 shadow-xs shadow-warning/5",
      icon: AlertTriangle,
      text: "Medium Risk"
    },
    High: {
      styles: "bg-critical/10 text-critical border-critical/30 shadow-xs shadow-critical/5",
      icon: AlertCircle,
      text: "High Risk"
    },
    Critical: {
      styles: "bg-critical/20 text-critical border-critical border-2 animate-pulse shadow-md shadow-critical/10",
      icon: Octagon,
      text: "CRITICAL RISK"
    }
  };

  const current = config[rating] || config.Low;
  const IconComponent = current.icon;

  return (
    <span className={cn(baseStyles, current.styles, className)} {...props}>
      <IconComponent className="h-3.5 w-3.5 flex-shrink-0" />
      <span>{current.text}</span>
    </span>
  );
}

// ==========================================
// TREND INDICATOR
// ==========================================

export interface TrendIndicatorProps extends React.HTMLAttributes<HTMLSpanElement> {
  value: number; // percentage value, e.g. +3.4 or -1.2
  showPercent?: boolean;
}

export function TrendIndicator({ value, showPercent = true, className, ...props }: TrendIndicatorProps) {
  const isPositive = value > 0;
  const isNegative = value < 0;

  let colorClass = "text-foreground-secondary";
  let IconComponent = Minus;
  let prefix = "";

  if (isPositive) {
    colorClass = "text-positive";
    IconComponent = ArrowUpRight;
    prefix = "+";
  } else if (isNegative) {
    colorClass = "text-critical";
    IconComponent = ArrowDownRight;
    prefix = "";
  }

  return (
    <span className={cn("inline-flex items-center gap-1 font-mono text-xs font-medium select-none", colorClass, className)} {...props}>
      <IconComponent className="h-3.5 w-3.5 flex-shrink-0" />
      {showPercent && (
        <span>
          {prefix}
          {value.toFixed(2)}%
        </span>
      )}
    </span>
  );
}
