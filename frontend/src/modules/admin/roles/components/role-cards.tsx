"use client";

import React from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import type { AdminRole } from "../types";
import { Shield, ShieldAlert, Users, CheckCircle2 } from "lucide-react";

interface RoleCardsProps {
  roles: AdminRole[];
  selectedRoleId: string | null;
  onSelectRole: (roleId: string) => void;
  isLoading: boolean;
}

export function RoleCards({
  roles,
  selectedRoleId,
  onSelectRole,
  isLoading,
}: RoleCardsProps) {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Card key={i} className="border shadow-xs p-4 space-y-2">
            <Skeleton className="h-5 w-28" />
            <Skeleton className="h-3 w-40" />
            <Skeleton className="h-4 w-16" />
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {roles.map((role) => {
        const isSelected = role.id === selectedRoleId;
        const isSuperAdmin = role.name === "SUPER_ADMIN";

        return (
          <Card
            key={role.id}
            onClick={() => onSelectRole(role.id)}
            className={`border cursor-pointer transition-all shadow-xs relative overflow-hidden ${
              isSelected
                ? "border-primary ring-2 ring-primary/20 bg-primary/5"
                : "hover:border-primary/40 bg-card"
            }`}
          >
            {isSelected && (
              <div className="absolute top-2 right-2 text-primary">
                <CheckCircle2 className="h-4 w-4" />
              </div>
            )}
            <CardHeader className="p-4 pb-2">
              <div className="flex items-center gap-2">
                <div
                  className={`p-1.5 rounded-md ${
                    isSuperAdmin
                      ? "bg-purple-500/10 text-purple-600"
                      : "bg-blue-500/10 text-blue-600"
                  }`}
                >
                  {isSuperAdmin ? (
                    <ShieldAlert className="h-4 w-4" />
                  ) : (
                    <Shield className="h-4 w-4" />
                  )}
                </div>
                <div>
                  <CardTitle className="text-sm font-semibold text-foreground">
                    {role.name.replace("_", " ")}
                  </CardTitle>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-4 pt-1 space-y-2">
              <p className="text-xs text-muted-foreground line-clamp-2">
                {role.description || "System assigned platform access role."}
              </p>
              <div className="flex items-center gap-2 pt-1">
                <Badge
                  variant={role.isSystem ? "secondary" : "outline"}
                  className="text-[10px] font-mono"
                >
                  {role.isSystem ? "System Protected" : "Customizable"}
                </Badge>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}

