"use client";

import React, { Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useAuth } from "@/hooks/use-auth";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ShieldAlert, ArrowLeft, Home, LayoutDashboard } from "lucide-react";
import { getRoleDashboardPath } from "@/lib/auth-helpers";
import { StorefrontLayout } from "@/components/layout/storefront";

function UnauthorizedContent() {
  const searchParams = useSearchParams();
  const requiredRole = searchParams.get("requiredRole");
  const { user, isAuthenticated, logout } = useAuth();

  return (
    <div className="flex min-h-[70vh] items-center justify-center p-4">
      <Card className="w-full max-w-md border-destructive/30 shadow-lg">
        <CardHeader className="text-center">
          <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-destructive/10 text-destructive">
            <ShieldAlert className="h-8 w-8" />
          </div>
          <CardTitle className="text-2xl font-bold tracking-tight">
            Unauthorized Access
          </CardTitle>
          <CardDescription className="text-xs text-muted-foreground mt-1">
            {requiredRole ? (
              <span>
                This section strictly requires administrative privileges for{" "}
                <span className="font-semibold text-foreground">
                  {requiredRole}
                </span>
                .
              </span>
            ) : (
              <span>You do not have permission to access the requested resource.</span>
            )}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {isAuthenticated && user && (
            <div className="rounded-lg bg-secondary/60 p-3 text-xs space-y-1">
              <p className="text-muted-foreground">Currently logged in as:</p>
              <p className="font-medium text-foreground">{user.fullName} ({user.email})</p>
              <p className="text-[11px] text-muted-foreground">
                Active Role: <span className="font-semibold text-primary">{user.role}</span>
              </p>
            </div>
          )}

          <div className="flex flex-col gap-2 pt-2">
            {isAuthenticated && user ? (
              <>
                <Button className="w-full gap-2" asChild>
                  <Link href={getRoleDashboardPath(user.role)}>
                    <LayoutDashboard className="h-4 w-4" />
                    <span>Go to Your Assigned Dashboard</span>
                  </Link>
                </Button>
                <Button
                  variant="outline"
                  className="w-full text-destructive hover:bg-destructive/10"
                  onClick={() => logout("/")}
                >
                  Log out and switch account
                </Button>
              </>
            ) : (
              <>
                <Button className="w-full" asChild>
                  <Link href="/staff-login">Log in as Staff</Link>
                </Button>
                <Button variant="outline" className="w-full" asChild>
                  <Link href="/customer/login">Log in as Customer</Link>
                </Button>
              </>
            )}

            <Button variant="ghost" className="w-full gap-1.5 text-xs text-muted-foreground" asChild>
              <Link href="/">
                <ArrowLeft className="h-3.5 w-3.5" />
                <span>Return to Public Storefront</span>
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default function UnauthorizedPage() {
  return (
    <StorefrontLayout>
      <Suspense fallback={<div className="container mx-auto p-12 text-center text-sm">Loading authorization details...</div>}>
        <UnauthorizedContent />
      </Suspense>
    </StorefrontLayout>
  );
}

