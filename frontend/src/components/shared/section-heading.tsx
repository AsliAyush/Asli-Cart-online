import React from "react";
import { cn } from "@/lib/utils";

interface SectionHeadingProps {
  badge?: string;
  title: string;
  subtitle?: string;
  action?: React.ReactNode;
  centered?: boolean;
  className?: string;
}

export function SectionHeading({
  badge,
  title,
  subtitle,
  action,
  centered = false,
  className,
}: SectionHeadingProps) {
  return (
    <div
      className={cn(
        "flex flex-col gap-2 md:flex-row md:items-end md:justify-between",
        centered && "text-center md:flex-col md:items-center",
        className
      )}
    >
      <div className={cn("space-y-1.5", centered && "mx-auto max-w-2xl")}>
        {badge && (
          <span className="inline-block text-xs font-semibold uppercase tracking-wider text-primary">
            {badge}
          </span>
        )}
        <h2 className="text-2xl font-bold tracking-tight text-foreground md:text-3xl">
          {title}
        </h2>
        {subtitle && (
          <p className="text-sm text-muted-foreground md:text-base">
            {subtitle}
          </p>
        )}
      </div>
      {action && <div className="mt-2 shrink-0 md:mt-0">{action}</div>}
    </div>
  );
}

