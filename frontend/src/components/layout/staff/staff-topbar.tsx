"use client";

import React from "react";
import { useUiStore } from "@/stores/ui-store";
import { useAuth } from "@/hooks/use-auth";
import { StaffBreadcrumbs } from "./staff-breadcrumbs";
import { StaffUserMenu } from "./staff-user-menu";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Menu, PanelLeftClose, PanelLeftOpen } from "lucide-react";

export function StaffTopbar() {
  const {
    isSidebarCollapsed,
    toggleSidebar,
    setStaffMobileSidebarOpen,
  } = useUiStore();
  const { user } = useAuth();

  return (
    <header className="sticky top-0 z-30 flex h-16 w-full items-center justify-between border-b border-border bg-background/95 px-4 backdrop-blur supports-[backdrop-filter]:bg-background/70 sm:px-6">
      {/* Left: Toggles & Breadcrumbs */}
      <div className="flex items-center gap-3">
        {/* Mobile menu hamburger */}
        <Button
          variant="ghost"
          size="icon"
          className="md:hidden"
          onClick={() => setStaffMobileSidebarOpen(true)}
          aria-label="Open staff navigation drawer"
        >
          <Menu className="h-5 w-5" />
        </Button>

        {/* Desktop sidebar toggle icon */}
        <Button
          variant="ghost"
          size="icon"
          className="hidden md:inline-flex h-8 w-8 text-muted-foreground hover:text-foreground"
          onClick={toggleSidebar}
          aria-label={isSidebarCollapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          {isSidebarCollapsed ? (
            <PanelLeftOpen className="h-4 w-4" />
          ) : (
            <PanelLeftClose className="h-4 w-4" />
          )}
        </Button>

        {/* Dynamic Breadcrumbs */}
        <div className="hidden sm:block">
          <StaffBreadcrumbs />
        </div>
      </div>

      {/* Right: Role indicator & User Menu */}
      <div className="flex items-center gap-3">
        {user?.role && (
          <Badge
            variant="outline"
            className="hidden md:inline-flex text-[10px] font-semibold tracking-wider text-muted-foreground"
          >
            {user.role}
          </Badge>
        )}

        <StaffUserMenu />
      </div>
    </header>
  );
}

