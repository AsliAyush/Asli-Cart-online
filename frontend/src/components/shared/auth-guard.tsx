"use client";

import React, { useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useAuth } from "@/hooks/use-auth";
import type { UserRole } from "@/types/auth";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ShieldAlert, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { getRoleDashboardPath } from "@/lib/auth-helpers";

interface AuthGuardProps {
  children: React.ReactNode;
  allowedRoles: UserRole[];
  portalType?: "staff" | "customer";
}

export function AuthGuard({
  children,
  allowedRoles,
  portalType = "staff",
}: AuthGuardProps) {
  const router = useRouter();
  const pathname = usePathname();
  const { user, isAuthenticated, isInitialized } = useAuth();

  useEffect(() => {
    if (!isInitialized) return;

    if (!isAuthenticated) {
      const loginPath = portalType === "staff" ? "/staff-login" : "/customer/login";
      router.replace(`${loginPath}?returnUrl=${encodeURIComponent(pathname)}`);
    }
  }, [isInitialized, isAuthenticated, portalType, pathname, router]);

  // Loading state while checking session
  if (!isInitialized) {
    return (
      <div className="container mx-auto p-8 space-y-4 max-w-4xl">
        <Skeleton className="h-12 w-64 rounded-lg" />
        <Skeleton className="h-24 w-full rounded-xl" />
        <Skeleton className="h-64 w-full rounded-xl" />
      </div>
    );
  }

  // Not authenticated
  if (!isAuthenticated || !user) {
    return null;
  }

  // Role Mismatch
  if (!allowedRoles.includes(user.role)) {
    return (
      <div className="container mx-auto max-w-lg py-16 px-4">
        <Card className="border-destructive/40 shadow-md">
          <CardHeader className="text-center">
            <div className="mx-auto mb-2 flex h-12 w-12 items-center justify-center rounded-full bg-destructive/10 text-destructive">
              <ShieldAlert className="h-6 w-6" />
            </div>
            <CardTitle className="text-xl">Access Restricted</CardTitle>
            <CardDescription className="text-xs">
              Your account ({user.email}) has the role{" "}
              <span className="font-semibold text-foreground">{user.role}</span>
              , which is not permitted to view this area.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button className="w-full" asChild>
              <Link href={getRoleDashboardPath(user.role)}>
                Go to Your Authorized Dashboard
              </Link>
            </Button>
            <Button variant="outline" className="w-full gap-2" asChild>
              <Link href="/">
                <ArrowLeft className="h-4 w-4" />
                Return to Storefront
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return <>{children}</>;
}

