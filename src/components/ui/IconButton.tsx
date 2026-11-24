import * as React from "react";
import { cn } from "@/lib/utils";

export interface IconButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "ai" | "outline" | "ghost" | "destructive" | "forecast" | "secondary";
  size?: "sm" | "md" | "lg";
  rounded?: boolean;
}

const IconButton = React.forwardRef<HTMLButtonElement, IconButtonProps>(
  ({ className, variant = "outline", size = "md", rounded = false, ...props }, ref) => {
    const baseStyles = "inline-flex items-center justify-center transition-all focus-visible:outline-2 focus-visible:outline-offset-2 disabled:opacity-50 disabled:pointer-events-none active:scale-[0.95]";
    
    const variants = {
      primary: "bg-primary text-primary-foreground hover:brightness-[0.96]",
      ai: "bg-ai text-ai-foreground hover:brightness-[0.96]",
      forecast: "bg-forecast text-forecast-foreground hover:brightness-[0.96]",
      secondary: "bg-surface-elevated text-foreground border border-border/80 hover:bg-surface-hover hover:border-border-strong",
      outline: "bg-transparent text-foreground border border-border/80 hover:bg-surface-hover hover:border-border-strong",
      ghost: "bg-transparent text-foreground-secondary hover:text-foreground hover:bg-surface-hover",
      destructive: "bg-critical text-critical-foreground hover:brightness-[0.96]",
    };

    const sizes = {
      sm: "h-9 w-9 text-xs",
      md: "h-10 w-10 text-sm",
      lg: "h-11 w-11 text-base",
    };

    const borderRadius = rounded ? "rounded-full" : "rounded-xl";

    return (
      <button
        ref={ref}
        className={cn(baseStyles, variants[variant], sizes[size], borderRadius, className)}
        {...props}
      />
    );
  }
);
IconButton.displayName = "IconButton";

export { IconButton };
export default IconButton;
