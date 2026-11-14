"use client";

import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Info, Settings, Key, Globe, ShieldCheck } from "lucide-react";
import { APP_CONFIG } from "@/lib/constants";

export function PlatformConfigCard() {
  return (
    <Card className="border shadow-xs">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-base font-semibold">Global Platform Configurations</CardTitle>
            <CardDescription>System runtime variables, affiliate network keys, and integration status</CardDescription>
          </div>
          <Badge variant="secondary" className="text-xs">
            Read-Only Architecture
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Runtime config parameters */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
          <div className="p-3 rounded-lg border bg-card space-y-1">
            <span className="text-muted-foreground block text-[11px]">Centralized API Base Endpoint</span>
            <p className="font-mono text-xs font-semibold text-foreground truncate">
              {process.env.NEXT_PUBLIC_API_BASE_URL || APP_CONFIG.defaultApiBaseUrl}
            </p>
          </div>

          <div className="p-3 rounded-lg border bg-card space-y-1">
            <span className="text-muted-foreground block text-[11px]">Primary Affiliate Network Provider</span>
            <p className="font-mono text-xs font-semibold text-foreground">
              CUELINKS (Configured via Backend Environment)
            </p>
          </div>

          <div className="p-3 rounded-lg border bg-card space-y-1">
            <span className="text-muted-foreground block text-[11px]">Authentication Mechanism</span>
            <p className="font-mono text-xs font-semibold text-foreground">
              Dual JWT (HttpOnly Access & Refresh Token Rotation)
            </p>
          </div>

          <div className="p-3 rounded-lg border bg-card space-y-1">
            <span className="text-muted-foreground block text-[11px]">RBAC Authorization Mode</span>
            <p className="font-mono text-xs font-semibold text-foreground">
              Granular Role-Module Permission Matrix (10 Core Modules)
            </p>
          </div>
        </div>

        {/* Backend Persistence Gap Informational Notice */}
        <div className="p-4 rounded-lg bg-blue-500/10 border border-blue-500/20 text-blue-700 dark:text-blue-300 space-y-1.5 text-xs">
          <div className="flex items-center gap-2 font-semibold">
            <Info className="h-4 w-4 shrink-0" />
            <span>Platform Settings Persistence API Gap</span>
          </div>
          <p className="text-[11px] leading-relaxed">
            Per strict engineering specifications, Asli Cart never generates nonfunctional or unpersisted form controls.
            The backend defines the module constant <code className="font-mono">MODULES.SETTINGS</code>, but dedicated database persistence tables and endpoints (e.g., SMTP host configuration, affiliate network webhook secrets, and custom fee thresholds) are pending implementation.
            Global configurations currently load safely from verified backend environment secrets (<code className="font-mono">.env</code>).
          </p>
        </div>
      </CardContent>
    </Card>
  );
}

