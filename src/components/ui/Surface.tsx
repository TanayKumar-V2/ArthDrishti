import * as React from "react";
import { cn } from "@/lib/utils";

export interface SurfaceProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "flat" | "elevated" | "sidebar";
  interactive?: boolean;
}

const Surface = React.forwardRef<HTMLDivElement, SurfaceProps>(
  ({ className, variant = "flat", interactive = false, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          "rounded-2xl border text-foreground shadow-[0_1px_2px_rgba(24,39,31,0.035),inset_0_1px_0_rgba(255,255,255,0.7)]",
          variant === "flat" && "bg-surface border-border/80",
          variant === "elevated" && "bg-surface-elevated border-border/80 shadow-[0_8px_24px_rgba(24,39,31,0.045)]",
          variant === "sidebar" && "bg-sidebar border-border/70",
          interactive && "cursor-pointer transition-all duration-300 ease-[cubic-bezier(0.32,0.72,0,1)] hover:bg-surface-hover hover:border-border-strong hover:-translate-y-0.5 hover:shadow-[0_8px_24px_rgba(24,39,31,0.07)]",
          className
        )}
        {...props}
      />
    );
  }
);
Surface.displayName = "Surface";

export { Surface };
export default Surface;
