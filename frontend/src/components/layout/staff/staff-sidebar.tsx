"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/hooks/use-auth";
import { useUiStore } from "@/stores/ui-store";
import { getStaffNavItems } from "./staff-nav-config";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  ChevronLeft,
  ChevronRight,
  ShieldCheck,
  ExternalLink,
} from "lucide-react";

export function StaffSidebar() {
  const pathname = usePathname();
  const { user } = useAuth();
  const { isSidebarCollapsed, toggleSidebar } = useUiStore();

  const navItems = getStaffNavItems(user?.role);

  return (
    <aside
      className={cn(
        "hidden md:flex flex-col border-r border-border bg-card text-card-foreground transition-all duration-300 ease-in-out shrink-0 select-none",
        isSidebarCollapsed ? "w-20" : "w-64"
      )}
    >
      {/* Brand Header */}
      <div className="flex h-16 items-center justify-between border-b border-border px-4">
        <Link href="/" className="flex items-center gap-2.5 overflow-hidden">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-primary text-primary-foreground font-black text-base shadow">
            AC
          </div>
          {!isSidebarCollapsed && (
            <div className="flex flex-col min-w-0">
              <span className="font-extrabold text-base tracking-tight leading-none text-foreground">
                Asli<span className="text-primary">Cart</span>
              </span>
              <span className="text-[10px] uppercase font-bold tracking-wider text-muted-foreground mt-0.5">
                Staff Portal
              </span>
            </div>
          )}
        </Link>
      </div>

      {/* Role Pill Banner */}
      {!isSidebarCollapsed && (
        <div className="px-4 py-3 border-b border-border/60 bg-secondary/30">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-medium text-muted-foreground">
              Portal Mode
            </span>
            <Badge variant="deal" className="text-[10px] py-0 px-2 font-bold uppercase">
              {user?.role?.replace("_", " ") || "STAFF"}
            </Badge>
          </div>
        </div>
      )}

      {/* Navigation Links */}
      <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-1.5" aria-label="Staff Sidebar">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive =
            pathname === item.href ||
            (item.href !== "/admin/dashboard" &&
              item.href !== "/product-manager/dashboard" &&
              item.href !== "/social-media-manager/dashboard" &&
              pathname.startsWith(item.href));

          return (
            <div key={item.href} className="relative group">
              <Link
                href={item.href}
                className={cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2.5 text-xs font-medium transition-colors",
                  isActive
                    ? "bg-primary text-primary-foreground shadow-sm font-semibold"
                    : "text-muted-foreground hover:bg-secondary hover:text-foreground",
                  isSidebarCollapsed && "justify-center px-0 h-10 w-10 mx-auto"
                )}
              >
                <Icon
                  className={cn(
                    "h-4 w-4 shrink-0",
                    isActive ? "text-primary-foreground" : "text-muted-foreground group-hover:text-foreground"
                  )}
                />
                {!isSidebarCollapsed && (
                  <span className="flex-1 truncate">{item.title}</span>
                )}
                {!isSidebarCollapsed && item.badge && (
                  <Badge
                    variant="outline"
                    className={cn(
                      "text-[9px] px-1.5 py-0 font-normal shrink-0",
                      isActive ? "border-primary-foreground/40 text-primary-foreground" : "text-muted-foreground"
                    )}
                  >
                    {item.badge}
                  </Badge>
                )}
              </Link>

              {/* Tooltip for collapsed mode */}
              {isSidebarCollapsed && (
                <div className="pointer-events-none absolute left-full top-1/2 -translate-y-1/2 ml-3 hidden rounded-md bg-popover px-2.5 py-1.5 text-xs text-popover-foreground shadow-lg border border-border group-hover:block z-50 whitespace-nowrap">
                  <p className="font-semibold">{item.title}</p>
                  {item.badge && (
                    <p className="text-[10px] text-muted-foreground">{item.badge}</p>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </nav>

      {/* Bottom Footer Actions */}
      <div className="border-t border-border p-3 space-y-2">
        <Button
          variant="ghost"
          size="sm"
          onClick={toggleSidebar}
          className={cn(
            "w-full justify-center gap-2 text-xs text-muted-foreground hover:text-foreground",
            !isSidebarCollapsed && "justify-between px-3"
          )}
          aria-label={isSidebarCollapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          {!isSidebarCollapsed && <span>Collapse Sidebar</span>}
          {isSidebarCollapsed ? (
            <ChevronRight className="h-4 w-4" />
          ) : (
            <ChevronLeft className="h-4 w-4" />
          )}
        </Button>
      </div>
    </aside>
  );
}

