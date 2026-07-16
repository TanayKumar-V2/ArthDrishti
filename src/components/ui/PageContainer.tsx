import React from "react";
import { cn } from "@/lib/utils";

interface PageContainerProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
}

export function PageContainer({ children, className, ...props }: PageContainerProps) {
  return (
    <div
      className={cn(
        "w-full max-w-[1600px] mx-auto px-8 lg:px-10 xl:px-12 pt-14 pb-8 flex flex-col gap-8",
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}
export default PageContainer;
