"use client";

import React from "react";
import { AuthGuard } from "@/components/shared/auth-guard";
import { StaffSidebar } from "./staff-sidebar";
import { StaffMobileSidebar } from "./staff-mobile-sidebar";
import { StaffTopbar } from "./staff-topbar";
import type { UserRole } from "@/types/auth";

interface StaffLayoutProps {
  children: React.ReactNode;
  allowedRoles?: UserRole[];
}

const DEFAULT_STAFF_ROLES: UserRole[] = [
  "SUPER_ADMIN",
  "PRODUCT_MANAGER",
  "SOCIAL_MEDIA_MANAGER",
];

export function StaffLayout({
  children,
  allowedRoles = DEFAULT_STAFF_ROLES,
}: StaffLayoutProps) {
  return (
    <AuthGuard allowedRoles={allowedRoles} portalType="staff">
      <div className="flex h-screen w-full overflow-hidden bg-background">
        {/* Desktop Collapsible Sidebar */}
        <StaffSidebar />

        {/* Mobile Slide-Out Drawer */}
        <StaffMobileSidebar />

        {/* Main Content Area */}
        <div className="flex flex-1 flex-col min-w-0 overflow-hidden">
          <StaffTopbar />
          <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
            <div className="mx-auto max-w-7xl space-y-6">{children}</div>
          </main>
        </div>
      </div>
    </AuthGuard>
  );
}

