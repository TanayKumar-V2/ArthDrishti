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
        "flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between pb-5 border-b border-border",
        className
      )}
      {...props}
    >
      <div className="space-y-1">
        <h1 className="text-2xl sm:text-3xl font-heading font-semibold tracking-tight text-foreground">
          {title}
        </h1>
        {description && (
          <p className="text-sm text-foreground-secondary font-sans leading-relaxed">
            {description}
          </p>
        )}
      </div>
      {actions && (
        <div className="flex flex-wrap items-center gap-3 mt-2 sm:mt-0 flex-shrink-0">
          {actions}
        </div>
      )}
    </div>
  );
}
export default SectionHeader;
