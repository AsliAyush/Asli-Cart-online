"use client";

import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { useAdminProfile } from "../hooks/use-admin-settings";
import { ShieldCheck, Mail, CheckCircle2, UserCheck } from "lucide-react";

export function AdminProfileCard() {
  const { data: profile, isLoading } = useAdminProfile();

  if (isLoading) {
    return (
      <Card className="border shadow-xs">
        <CardHeader>
          <Skeleton className="h-5 w-36" />
          <Skeleton className="h-3 w-56" />
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-4">
            <Skeleton className="h-12 w-12 rounded-full" />
            <div className="space-y-2">
              <Skeleton className="h-4 w-40" />
              <Skeleton className="h-3 w-48" />
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!profile) return null;

  const initials = profile.fullName
    .split(" ")
    .map((n: string) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <Card className="border shadow-xs">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-base font-semibold">Super Admin Profile</CardTitle>
            <CardDescription>Authenticated administrative session parameters</CardDescription>
          </div>
          <Badge variant="deal" className="text-xs">
            SUPER_ADMIN
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/40 border">
          <Avatar className="h-12 w-12 border">
            <AvatarFallback className="bg-primary/10 text-primary font-bold">
              {initials}
            </AvatarFallback>
          </Avatar>
          <div className="min-w-0 flex-1">
            <h4 className="text-sm font-semibold text-foreground truncate">{profile.fullName}</h4>
            <p className="text-xs text-muted-foreground truncate">{profile.email}</p>
            <div className="flex items-center gap-2 mt-1">
              <Badge variant="outline" className="text-[10px] font-mono">
                ID: {profile.id}
              </Badge>
              {profile.emailVerified && (
                <span className="inline-flex items-center gap-1 text-[11px] font-medium text-emerald-600">
                  <CheckCircle2 className="h-3 w-3" />
                  Verified Admin
                </span>
              )}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
          <div className="p-3 rounded-md border bg-card space-y-1">
            <span className="text-muted-foreground block text-[11px]">Assigned Role Scope</span>
            <div className="flex items-center gap-1.5 font-semibold text-foreground">
              <ShieldCheck className="h-4 w-4 text-purple-600" />
              <span>Full Governance & RBAC Immunity</span>
            </div>
          </div>
          <div className="p-3 rounded-md border bg-card space-y-1">
            <span className="text-muted-foreground block text-[11px]">Security Credentials</span>
            <p className="font-medium text-foreground">
              Direct environment bootstrap / Salted Argon2-grade hash
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
