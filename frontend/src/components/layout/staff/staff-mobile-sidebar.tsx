"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/hooks/use-auth";
import { useUiStore } from "@/stores/ui-store";
import { getStaffNavItems } from "./staff-nav-config";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import { LogOut, ExternalLink } from "lucide-react";

export function StaffMobileSidebar() {
  const pathname = usePathname();
  const { user, logout } = useAuth();
  const { isStaffMobileSidebarOpen, setStaffMobileSidebarOpen } = useUiStore();

  const navItems = getStaffNavItems(user?.role);

  return (
    <Sheet
      open={isStaffMobileSidebarOpen}
      onOpenChange={setStaffMobileSidebarOpen}
    >
      <SheetContent side="left" className="w-[280px] p-0 flex flex-col">
        {/* Header */}
        <SheetHeader className="p-4 border-b border-border text-left">
          <SheetTitle className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-primary text-primary-foreground font-black text-base shadow">
              AC
            </div>
            <div className="flex flex-col">
              <span className="font-extrabold text-base tracking-tight leading-none text-foreground">
                Asli<span className="text-primary">Cart</span>
              </span>
              <span className="text-[10px] uppercase font-bold tracking-wider text-muted-foreground mt-0.5">
                Staff Portal
              </span>
            </div>
          </SheetTitle>
        </SheetHeader>

        {/* User Info Bar */}
        {user && (
          <div className="px-4 py-3 bg-secondary/40 border-b border-border space-y-1">
            <p className="text-xs font-semibold text-foreground truncate">
              {user.fullName}
            </p>
            <p className="text-[11px] text-muted-foreground truncate">
              {user.email}
            </p>
            <Badge variant="deal" className="text-[9px] py-0 px-2 font-bold uppercase mt-1">
              {user.role?.replace("_", " ")}
            </Badge>
          </div>
        )}

        {/* Navigation list */}
        <nav className="flex-1 overflow-y-auto p-3 space-y-1" aria-label="Mobile Staff Navigation">
          <p className="text-[10px] uppercase font-semibold text-muted-foreground px-2 py-1">
            Portal Navigation
          </p>
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive =
              pathname === item.href ||
              (item.href !== "/admin/dashboard" &&
                item.href !== "/product-manager/dashboard" &&
                item.href !== "/social-media-manager/dashboard" &&
                pathname.startsWith(item.href));

            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setStaffMobileSidebarOpen(false)}
                className={cn(
                  "flex items-center justify-between rounded-lg px-3 py-2 text-xs font-medium transition-colors",
                  isActive
                    ? "bg-primary text-primary-foreground font-semibold shadow-sm"
                    : "text-muted-foreground hover:bg-secondary hover:text-foreground"
                )}
              >
                <div className="flex items-center gap-3">
                  <Icon className="h-4 w-4" />
                  <span>{item.title}</span>
                </div>
                {item.badge && (
                  <Badge
                    variant="outline"
                    className={cn(
                      "text-[9px] px-1.5 py-0 font-normal",
                      isActive
                        ? "border-primary-foreground/40 text-primary-foreground"
                        : "text-muted-foreground"
                    )}
                  >
                    {item.badge}
                  </Badge>
                )}
              </Link>
            );
          })}
        </nav>

        <Separator />

        {/* Footer actions */}
        <div className="p-3 space-y-2">
          <Button
            variant="outline"
            size="sm"
            className="w-full justify-start gap-2 text-xs"
            asChild
            onClick={() => setStaffMobileSidebarOpen(false)}
          >
            <Link href="/" target="_blank">
              <ExternalLink className="h-3.5 w-3.5" />
              <span>Public Storefront</span>
            </Link>
          </Button>

          <Button
            variant="ghost"
            size="sm"
            className="w-full justify-start gap-2 text-xs text-destructive hover:bg-destructive/10"
            onClick={() => {
              setStaffMobileSidebarOpen(false);
              logout("/staff-login");
            }}
          >
            <LogOut className="h-3.5 w-3.5" />
            <span>Sign Out</span>
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
}

