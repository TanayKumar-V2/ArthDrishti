import React from "react";
import { cn } from "@/lib/utils";

interface PageContainerProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
}

export function PageContainer({ children, className, ...props }: PageContainerProps) {
  return (
    <div
      className={cn(
        "page-enter w-full max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-9 pt-7 sm:pt-9 pb-10 flex flex-col gap-7",
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}
export default PageContainer;
