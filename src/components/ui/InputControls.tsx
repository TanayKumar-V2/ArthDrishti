"use client";

import React from "react";
import { useTheme } from "next-themes";
import { Search, Calendar, Sun, Moon, Check, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { IconButton } from "./IconButton";

// ==========================================
// SEARCH INPUT
// ==========================================

export interface SearchInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  onClear?: () => void;
}

export const SearchInput = React.forwardRef<HTMLInputElement, SearchInputProps>(
  ({ className, onClear, value, onChange, ...props }, ref) => {
    return (
      <div className="relative w-full max-w-sm flex items-center">
        <Search className="absolute left-3.5 h-4 w-4 text-foreground-muted pointer-events-none" />
        <input
          ref={ref}
          value={value}
          onChange={onChange}
          className={cn(
            "w-full h-10 pl-10 pr-9 bg-surface-elevated border border-border text-foreground rounded-sm text-sm font-sans placeholder-foreground-muted focus:border-primary focus:outline-none transition-all",
            className
          )}
          {...props}
        />
        {value && onClear && (
          <button
            type="button"
            onClick={onClear}
            className="absolute right-3 text-foreground-muted hover:text-foreground p-0.5 rounded-full hover:bg-surface transition-colors"
          >
            <X className="h-3 w-3" />
          </button>
        )}
      </div>
    );
  }
);
SearchInput.displayName = "SearchInput";

// ==========================================
// FILTER CHIP
// ==========================================

interface FilterChipProps extends React.HTMLAttributes<HTMLButtonElement> {
  label: string;
  selected?: boolean;
  count?: number;
}

export function FilterChip({ label, selected = false, count, className, ...props }: FilterChipProps) {
  return (
    <button
      type="button"
      className={cn(
        "inline-flex items-center gap-1.5 h-8 px-3.5 rounded-full border text-xs font-sans font-medium transition-all select-none cursor-pointer focus-visible:outline-2",
        selected
          ? "bg-primary text-white border-primary shadow-xs"
          : "bg-surface-elevated text-foreground-secondary border-border hover:bg-surface-hover hover:border-border-strong",
        className
      )}
      {...props}
    >
      {selected && <Check className="h-3 w-3 flex-shrink-0" />}
      <span>{label}</span>
      {count !== undefined && (
        <span
          className={cn(
            "inline-flex items-center justify-center px-1.5 py-0.25 rounded-full text-[10px] font-mono",
            selected ? "bg-white/20 text-white" : "bg-surface text-foreground-muted border border-border/40"
          )}
        >
          {count}
        </span>
      )}
    </button>
  );
}

// ==========================================
// DATE RANGE CONTROL
// ==========================================

interface DateRangeControlProps extends React.HTMLAttributes<HTMLDivElement> {
  value?: string;
  onChangeValue?: (val: string) => void;
  options?: string[];
}

export function DateRangeControl({
  value = "Last 30 Days",
  onChangeValue,
  options = ["Last 30 Days", "Last Quarter", "Year to Date", "Custom Range"],
  className,
  ...props
}: DateRangeControlProps) {
  return (
    <div className={cn("flex items-center gap-2 bg-surface-elevated border border-border rounded-sm h-10 px-3", className)} {...props}>
      <Calendar className="h-4 w-4 text-foreground-muted" />
      <select
        value={value}
        onChange={(e) => onChangeValue?.(e.target.value)}
        className="bg-transparent text-sm font-sans text-foreground font-medium border-none outline-none focus:ring-0 cursor-pointer pr-1"
      >
        {options.map((opt) => (
          <option key={opt} value={opt} className="bg-surface text-foreground">
            {opt}
          </option>
        ))}
      </select>
    </div>
  );
}

// ==========================================
// THEME TOGGLE
// ==========================================

export function ThemeToggle({ className, ...props }: React.ComponentPropsWithoutRef<typeof IconButton>) {
  const { resolvedTheme, setTheme } = useTheme();
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <IconButton variant="outline" size="sm" className={className} disabled {...props}>
        <Sun className="h-4 w-4 opacity-50" />
      </IconButton>
    );
  }

  const isDark = resolvedTheme === "dark";

  return (
    <IconButton
      variant="outline"
      size="sm"
      className={cn("text-foreground-secondary hover:text-foreground", className)}
      onClick={() => setTheme(isDark ? "light" : "dark")}
      title={isDark ? "Activate light mode" : "Activate dark mode"}
      {...props}
    >
      {isDark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
    </IconButton>
  );
}
