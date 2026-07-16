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
      primary: "bg-primary text-white hover:opacity-95 shadow-xs",
      ai: "bg-ai text-white hover:opacity-95 shadow-xs",
      forecast: "bg-forecast text-white hover:opacity-95 shadow-xs",
      secondary: "bg-surface-elevated text-foreground border border-border hover:bg-surface-hover hover:border-border-strong",
      outline: "bg-transparent text-foreground border border-border hover:bg-surface-hover hover:border-border-strong",
      ghost: "bg-transparent text-foreground hover:bg-surface-hover",
      destructive: "bg-critical text-white hover:opacity-95 shadow-xs",
    };

    const sizes = {
      sm: "h-9 w-9 text-xs",
      md: "h-10 w-10 text-sm",
      lg: "h-11 w-11 text-base",
    };

    const borderRadius = rounded ? "rounded-full" : "rounded-sm";

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
