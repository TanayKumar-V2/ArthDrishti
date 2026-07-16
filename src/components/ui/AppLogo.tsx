import React from "react";
import { cn } from "@/lib/utils";

interface AppLogoProps extends React.HTMLAttributes<HTMLDivElement> {
  size?: "sm" | "md" | "lg";
  showWordmark?: boolean;
}

export function AppLogo({ size = "md", showWordmark = true, className, ...props }: AppLogoProps) {
  const iconSize = {
    sm: "h-4 w-4", // 16px
    md: "h-6 w-6", // 24px
    lg: "h-8 w-8", // 32px
  };

  const textSize = {
    sm: "text-sm",
    md: "text-lg",
    lg: "text-xl",
  };

  return (
    <div className={cn("flex items-center gap-2.5 select-none", className)} {...props}>
      {/* Geometric Glyph */}
      <svg
        className={cn(iconSize[size], "text-primary flex-shrink-0 fill-none")}
        viewBox="0 0 24 24"
        strokeWidth="2"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        {/* Core Node of Intelligence */}
        <circle cx="12" cy="12" r="2.5" className="fill-primary text-primary" />
        
        {/* Precision Insight Curve / Focus (Horizontal flow and vertical boundaries) */}
        <path d="M12 4.5c4.5 0 8 4.5 9.5 7.5-1.5 3-5 7.5-9.5 7.5S4 15 2.5 12c1.5-3 5-7.5 9.5-7.5Z" className="opacity-30" strokeWidth="1.5" />
        
        {/* Data flow sweep (Orbiting sweep) */}
        <path d="M6 12c0-3.3 2.7-6 6-6s6 2.7 6 6" strokeWidth="2" />
        
        {/* Focus indicators */}
        <circle cx="12" cy="12" r="9" className="opacity-15" strokeWidth="1" />
      </svg>
      {showWordmark && (
        <span className={cn("font-heading font-semibold tracking-tight text-foreground", textSize[size])}>
          Arth<span className="text-primary font-bold">Drishti</span>
        </span>
      )}
    </div>
  );
}
export default AppLogo;
