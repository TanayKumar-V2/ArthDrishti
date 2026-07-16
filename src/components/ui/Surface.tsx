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
          "rounded-md border text-foreground",
          variant === "flat" && "bg-surface border-border",
          variant === "elevated" && "bg-surface-elevated border-border-strong/50 shadow-md",
          variant === "sidebar" && "bg-sidebar border-border",
          interactive && "cursor-pointer transition-all hover:bg-surface-hover hover:border-border-strong hover:-translate-y-0.5",
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
