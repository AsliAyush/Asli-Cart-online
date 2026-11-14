"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronRight, Home } from "lucide-react";
import { cn } from "@/lib/utils";

const SEGMENT_NAME_MAP: Record<string, string> = {
  admin: "Admin",
  "product-manager": "Product Manager",
  "social-media-manager": "Social Media Hub",
  dashboard: "Dashboard",
  users: "Users",
  roles: "Roles & Permissions",
  products: "Products",
  offers: "Offers",
  settings: "Settings",
  "audit-logs": "Audit Logs",
  discovery: "Product Discovery",
  pricing: "Pricing",
};

interface StaffBreadcrumbsProps {
  customSegments?: Array<{ label: string; href?: string }>;
  className?: string;
}

export function StaffBreadcrumbs({
  customSegments,
  className,
}: StaffBreadcrumbsProps) {
  const pathname = usePathname();

  // If custom segments are provided, render them
  if (customSegments && customSegments.length > 0) {
    return (
      <nav aria-label="Breadcrumb" className={cn("flex items-center text-xs text-muted-foreground", className)}>
        <ol className="flex items-center gap-1.5 flex-wrap">
          {customSegments.map((item, index) => {
            const isLast = index === customSegments.length - 1;
            return (
              <li key={index} className="flex items-center gap-1.5">
                {index > 0 && <ChevronRight className="h-3 w-3 text-muted-foreground/60" />}
                {isLast || !item.href ? (
                  <span className="font-semibold text-foreground">{item.label}</span>
                ) : (
                  <Link href={item.href} className="hover:text-foreground transition-colors">
                    {item.label}
                  </Link>
                )}
              </li>
            );
          })}
        </ol>
      </nav>
    );
  }

  // Derive from pathname
  const rawSegments = pathname.split("/").filter(Boolean);
  if (rawSegments.length === 0) return null;

  const breadcrumbs = rawSegments.map((seg, idx) => {
    const href = "/" + rawSegments.slice(0, idx + 1).join("/");
    const label = SEGMENT_NAME_MAP[seg] || seg.charAt(0).toUpperCase() + seg.slice(1);
    const isLast = idx === rawSegments.length - 1;
    return { label, href, isLast };
  });

  return (
    <nav aria-label="Breadcrumb" className={cn("flex items-center text-xs text-muted-foreground", className)}>
      <ol className="flex items-center gap-1.5 flex-wrap">
        {breadcrumbs.map((crumb, idx) => (
          <li key={crumb.href} className="flex items-center gap-1.5">
            {idx > 0 && <ChevronRight className="h-3 w-3 text-muted-foreground/60" />}
            {crumb.isLast ? (
              <span className="font-semibold text-foreground">{crumb.label}</span>
            ) : (
              <Link href={crumb.href} className="hover:text-foreground transition-colors">
                {crumb.label}
              </Link>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
}

