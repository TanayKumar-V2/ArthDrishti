import * as React from "react";
import { Slot, Slottable } from "@radix-ui/react-slot";
import { cn } from "@/lib/utils";

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "ai" | "outline" | "ghost" | "destructive" | "forecast" | "secondary";
  size?: "sm" | "md" | "lg";
  asChild?: boolean;
  loading?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "primary", size = "md", asChild = false, loading = false, disabled, children, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    
    const baseStyles = "inline-flex items-center justify-center font-sans font-medium rounded-xl transition-all duration-300 ease-[cubic-bezier(0.32,0.72,0,1)] focus-visible:outline-2 focus-visible:outline-offset-2 disabled:opacity-50 disabled:pointer-events-none active:scale-[0.98]";
    
    const variants = {
      primary: "bg-primary text-primary-foreground shadow-[0_2px_8px_color-mix(in_srgb,var(--primary)_18%,transparent)] hover:brightness-[0.96]",
      ai: "bg-ai text-ai-foreground hover:brightness-[0.96]",
      forecast: "bg-forecast text-forecast-foreground hover:brightness-[0.96]",
      secondary: "bg-surface-elevated text-foreground border border-border/80 hover:bg-surface-hover hover:border-border-strong",
      outline: "bg-transparent text-foreground border border-border-strong/80 hover:bg-surface-hover hover:border-border-strong",
      ghost: "bg-transparent text-foreground-secondary hover:text-foreground hover:bg-surface-hover",
      destructive: "bg-critical text-critical-foreground hover:brightness-[0.96]",
    };

    const sizes = {
      sm: "h-9 px-3.5 text-xs gap-1.5",
      md: "h-10 px-4.5 text-[13px] gap-2",
      lg: "h-12 px-5.5 text-sm gap-2.5",
    };

    return (
      <Comp
        className={cn(baseStyles, variants[variant], sizes[size], className)}
        ref={ref}
        disabled={disabled || loading}
        {...props}
      >
        {loading ? (
          <svg className="animate-spin h-4 w-4 text-current" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
          </svg>
        ) : null}
        <Slottable>{children}</Slottable>
      </Comp>
    );
  }
);
Button.displayName = "Button";

export { Button };
export default Button;
