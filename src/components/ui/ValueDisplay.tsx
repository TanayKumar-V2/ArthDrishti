import React from "react";
import { cn } from "@/lib/utils";
import { Card, CardContent } from "./Card";
import { TrendIndicator } from "./Badge";

// ==========================================
// FINANCIAL VALUE
// ==========================================

interface FinancialValueProps extends React.HTMLAttributes<HTMLSpanElement> {
  value: number;
  currency?: string;
  notation?: "standard" | "compact";
  maximumFractionDigits?: number;
}

export function FinancialValue({
  value,
  currency = "USD",
  notation = "standard",
  maximumFractionDigits = 2,
  className,
  ...props
}: FinancialValueProps) {
  const formatter = React.useMemo(() => {
    const options: Intl.NumberFormatOptions = {
      notation,
      maximumFractionDigits,
    };
    if (currency && currency.trim() !== "") {
      options.style = "currency";
      options.currency = currency;
    } else {
      options.style = "decimal";
    }
    return new Intl.NumberFormat("en-US", options);
  }, [currency, notation, maximumFractionDigits]);

  return (
    <span className={cn("font-mono tracking-tight text-foreground", className)} {...props}>
      {formatter.format(value)}
    </span>
  );
}

// ==========================================
// MODEL CONFIDENCE
// ==========================================

interface ModelConfidenceProps extends React.HTMLAttributes<HTMLDivElement> {
  value: number; // 0 to 1, or 0 to 100
  showLabel?: boolean;
}

export function ModelConfidence({
  value,
  showLabel = true,
  className,
  ...props
}: ModelConfidenceProps) {
  // Normalize to percentage
  const percentage = value <= 1 ? value * 100 : value;
  const rounded = percentage.toFixed(1);

  return (
    <div className={cn("flex flex-col gap-1.5 w-full", className)} {...props}>
      {showLabel && (
        <div className="flex items-center justify-between text-xs font-sans">
          <span className="text-foreground-secondary">Confidence Score</span>
          <span className="font-mono text-ai font-semibold">{rounded}%</span>
        </div>
      )}
      <div className="h-1.5 w-full bg-border rounded-full overflow-hidden">
        <div
          className="h-full bg-ai rounded-full transition-all duration-500 ease-out"
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
}

// ==========================================
// METRIC CARD SHELL
// ==========================================

interface MetricCardProps extends React.ComponentPropsWithoutRef<typeof Card> {
  title: string;
  value: number | string;
  currency?: string;
  trend?: number; // optional delta percentage
  description?: string;
  notation?: "standard" | "compact";
  aiPowered?: boolean; // wraps indicator in AI violet accent
  icon?: React.ComponentType<{ className?: string }>;
}

export function MetricCardShell({
  title,
  value,
  currency = "USD",
  trend,
  description,
  notation = "standard",
  aiPowered = false,
  icon: Icon,
  className,
  ...props
}: MetricCardProps) {
  return (
    <Card className={cn("relative overflow-hidden", aiPowered && "border-ai/30", className)} {...props}>
      {aiPowered && (
        <div className="absolute top-0 right-0 w-16 h-16 pointer-events-none overflow-hidden">
          <div className="absolute top-[-8px] right-[-32px] w-20 h-6 bg-ai/20 border border-ai/30 rotate-45 flex items-center justify-center text-[8px] text-ai font-bold select-none uppercase tracking-wider">
            AI
          </div>
        </div>
      )}
      <div className="pt-6 px-5 md:px-6 flex flex-col gap-3">
        {/* KPI Header flex container with min-h 48px */}
        <div className="flex items-center justify-between min-h-[48px]">
          <div className="flex items-center gap-3">
            {Icon && (
              <div className="h-10 w-10 rounded-sm bg-surface-elevated border border-border flex items-center justify-center text-foreground-secondary shrink-0">
                <Icon className="h-5 w-5" />
              </div>
            )}
            <span className="text-xs sm:text-sm font-sans font-medium text-foreground-secondary tracking-wide select-none">
              {title}
            </span>
          </div>
          {trend !== undefined && <TrendIndicator value={trend} />}
        </div>

        <div className="flex flex-col gap-1 pb-5 md:pb-6">
          {typeof value === "number" ? (
            <FinancialValue
              value={value}
              currency={currency}
              notation={notation}
              className="text-xl sm:text-2xl md:text-3xl font-semibold font-mono"
            />
          ) : (
            <span className="text-xl sm:text-2xl md:text-3xl font-semibold font-mono tracking-tight text-foreground">
              {value}
            </span>
          )}
          {description && (
            <p className="text-xs text-foreground-muted font-sans font-normal leading-normal">
              {description}
            </p>
          )}
        </div>
      </div>
    </Card>
  );
}
