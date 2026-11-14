"use client";

import React from "react";
import { useAuth } from "@/hooks/use-auth";
import { StaffPageHeader } from "@/components/layout/staff";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Clock, CheckCircle2 } from "lucide-react";

export default function SocialMediaManagerDashboardPage() {
  const { user } = useAuth();

  return (
    <div className="space-y-6">
      <StaffPageHeader
        title="Social Media Manager Hub"
        description={`Welcome, ${user?.fullName || user?.email}. Social media broadcast and campaign hub.`}
        badge={
          <Badge variant="deal" className="text-xs">
            SOCIAL_MEDIA_MANAGER
          </Badge>
        }
      />

      <Card className="border-amber-500/30 bg-amber-500/5 shadow-sm">
        <CardHeader>
          <div className="flex items-center gap-2 text-amber-600 dark:text-amber-400">
            <Clock className="h-5 w-5" />
            <CardTitle className="text-lg">Module Deferred — Dashboard Coming Soon</CardTitle>
          </div>
          <CardDescription className="text-xs">
            Authentication and role validation for the Social Media Manager role are fully configured and functional.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
            <div className="rounded-lg bg-background p-3 space-y-1 border">
              <span className="text-muted-foreground block">Display Name</span>
              <span className="font-semibold text-foreground text-sm truncate block">
                {user?.fullName}
              </span>
            </div>
            <div className="rounded-lg bg-background p-3 space-y-1 border">
              <span className="text-muted-foreground block">Work Email</span>
              <span className="font-semibold text-foreground text-sm truncate block">
                {user?.email}
              </span>
            </div>
            <div className="rounded-lg bg-background p-3 space-y-1 border">
              <span className="text-muted-foreground block">Assigned Role</span>
              <span className="font-mono font-semibold text-primary">
                {user?.role}
              </span>
            </div>
            <div className="rounded-lg bg-background p-3 space-y-1 border">
              <span className="text-muted-foreground block">Authentication Status</span>
              <span className="text-emerald-600 font-semibold flex items-center gap-1">
                <CheckCircle2 className="h-3.5 w-3.5" />
                Verified Session
              </span>
            </div>
          </div>

          <div className="rounded-lg border border-border bg-background p-4 text-xs text-muted-foreground space-y-1">
            <p className="font-semibold text-foreground">
              Planned Functionality
            </p>
            <p>
              Campaign tracking, Telegram and WhatsApp deal broadcast automation,
              and affiliate click engagement analytics will be activated when this
              module reaches its dedicated development phase. No unfinished features are exposed.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
