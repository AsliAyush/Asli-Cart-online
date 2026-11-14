"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronRight, Home } from "lucide-react";
import { cn } from "@/lib/utils";

const STOREFRONT_SEGMENT_MAP: Record<string, string> = {
  products: "Products",
  categories: "Categories",
  offers: "Deals & Offers",
  customer: "Customer",
  dashboard: "Dashboard",
  profile: "Profile",
  cart: "Cart",
  wishlist: "Wishlist",
  "privacy-policy": "Privacy Policy",
  terms: "Terms of Service",
};

interface StorefrontBreadcrumbsProps {
  customSegments?: Array<{ label: string; href?: string }>;
  className?: string;
}

export function StorefrontBreadcrumbs({
  customSegments,
  className,
}: StorefrontBreadcrumbsProps) {
  const pathname = usePathname();

  // If on home page, do not render breadcrumbs
  if (pathname === "/") return null;

  if (customSegments && customSegments.length > 0) {
    return (
      <nav aria-label="Breadcrumb" className={cn("flex items-center text-xs text-muted-foreground py-3", className)}>
        <ol className="flex items-center gap-1.5 flex-wrap">
          <li className="flex items-center gap-1.5">
            <Link href="/" className="hover:text-foreground transition-colors flex items-center gap-1">
              <Home className="h-3 w-3" />
              <span>Home</span>
            </Link>
          </li>
          {customSegments.map((item, idx) => {
            const isLast = idx === customSegments.length - 1;
            return (
              <li key={idx} className="flex items-center gap-1.5">
                <ChevronRight className="h-3 w-3 text-muted-foreground/60" />
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

  const rawSegments = pathname.split("/").filter(Boolean);
  const breadcrumbs = rawSegments.map((seg, idx) => {
    const href = "/" + rawSegments.slice(0, idx + 1).join("/");
    const label = STOREFRONT_SEGMENT_MAP[seg] || seg.charAt(0).toUpperCase() + seg.slice(1);
    const isLast = idx === rawSegments.length - 1;
    return { label, href, isLast };
  });

  return (
    <nav aria-label="Breadcrumb" className={cn("flex items-center text-xs text-muted-foreground py-3", className)}>
      <ol className="flex items-center gap-1.5 flex-wrap">
        <li className="flex items-center gap-1.5">
          <Link href="/" className="hover:text-foreground transition-colors flex items-center gap-1">
            <Home className="h-3 w-3" />
            <span>Home</span>
          </Link>
        </li>
        {breadcrumbs.map((crumb) => (
          <li key={crumb.href} className="flex items-center gap-1.5">
            <ChevronRight className="h-3 w-3 text-muted-foreground/60" />
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

