import React from "react";
import { cn } from "@/lib/utils";

interface SectionHeaderProps extends React.HTMLAttributes<HTMLDivElement> {
  title: string;
  description?: string;
  actions?: React.ReactNode;
}

export function SectionHeader({ title, description, actions, className, ...props }: SectionHeaderProps) {
  return (
    <div
      className={cn(
        "flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between pb-6 border-b border-border/80",
        className
      )}
      {...props}
    >
      <div className="space-y-1">
          <h1 className="text-[1.75rem] sm:text-[2.15rem] font-heading font-semibold tracking-[-0.045em] leading-[1.08] text-foreground">
          {title}
        </h1>
        {description && (
          <p className="mt-2 max-w-2xl text-[13px] text-foreground-secondary font-sans leading-relaxed">
            {description}
          </p>
        )}
      </div>
      {actions && (
        <div className="flex flex-wrap items-center gap-2.5 sm:mt-0 flex-shrink-0">
          {actions}
        </div>
      )}
    </div>
  );
}
export default SectionHeader;
