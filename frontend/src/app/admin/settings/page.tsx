"use client";

import React from "react";
import { StaffPageHeader } from "@/components/layout/staff";
import { Button } from "@/components/ui/button";
import {
  AdminProfileCard,
  SystemStatusCard,
  PlatformConfigCard,
  useAdminProfile,
  useSystemHealth,
} from "@/modules/admin/settings";
import { RefreshCw } from "lucide-react";

export default function AdminSettingsPage() {
  const { refetch: refetchProfile, isFetching: isFetchingProfile } = useAdminProfile();
  const { refetch: refetchHealth, isFetching: isFetchingHealth } = useSystemHealth();

  const isRefreshing = isFetchingProfile || isFetchingHealth;

  const handleRefresh = () => {
    refetchProfile();
    refetchHealth();
  };

  return (
    <div className="space-y-6">
      <StaffPageHeader
        title="Administrative & Platform Configuration"
        description="Inspect authenticated Super Admin credentials, verify backend infrastructure telemetry, and monitor platform integrations."
        actions={
          <Button
            variant="outline"
            size="sm"
            onClick={handleRefresh}
            disabled={isRefreshing}
            className="text-xs h-8"
          >
            <RefreshCw className={`h-3.5 w-3.5 mr-1.5 ${isRefreshing ? "animate-spin" : ""}`} />
            Refresh Telemetry
          </Button>
        }
      />

      <div className="space-y-6">
        {/* Admin Profile */}
        <AdminProfileCard />

        {/* Live System Health */}
        <SystemStatusCard />

        {/* Global Configurations & Backend API Gap Notice */}
        <PlatformConfigCard />
      </div>
    </div>
  );
}
