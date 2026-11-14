"use client";

import React from "react";
import {
  User,
  Mail,
  Phone,
  ShieldCheck,
  Calendar,
  AlertCircle,
} from "lucide-react";
import { AuthGuard } from "@/components/shared/auth-guard";
import { StorefrontBreadcrumbs } from "@/components/layout/storefront";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  useCustomerProfile,
  ProfileForm,
  ChangePasswordForm,
} from "@/modules/customer";

export default function CustomerProfilePage() {
  const { data: profile, isLoading, isError } = useCustomerProfile();

  return (
    <AuthGuard allowedRoles={["CUSTOMER"]} portalType="customer">
      <div className="container mx-auto py-8 px-4 sm:px-6 max-w-4xl space-y-8">
        <StorefrontBreadcrumbs />

        <div className="space-y-1">
          <h1 className="text-2xl sm:text-3xl font-extrabold text-foreground">
            Account Profile & Settings
          </h1>
          <p className="text-xs text-muted-foreground">
            Manage your personal profile details, phone number, and account security.
          </p>
        </div>

        {isLoading ? (
          <div className="space-y-6">
            <Skeleton className="h-64 w-full rounded-xl" />
            <Skeleton className="h-64 w-full rounded-xl" />
          </div>
        ) : isError || !profile ? (
          <div className="rounded-xl border border-destructive/20 bg-destructive/5 p-8 text-center space-y-2">
            <AlertCircle className="h-8 w-8 text-destructive mx-auto" />
            <p className="text-xs text-destructive font-semibold">
              Unable to load your profile details at this time.
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Account Summary Card */}
            <Card className="border border-border/80 shadow-sm">
              <CardHeader className="pb-3">
                <CardTitle className="text-base font-bold flex items-center gap-2">
                  <ShieldCheck className="h-4 w-4 text-emerald-600" />
                  <span>Account Status</span>
                </CardTitle>
                <CardDescription className="text-xs">
                  Your verified membership information on Asli Cart.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
                  <div className="rounded-lg bg-secondary/40 p-3 space-y-1">
                    <span className="text-muted-foreground block text-[11px]">Role</span>
                    <Badge variant="outline" className="text-[10px] font-bold">
                      {profile.role}
                    </Badge>
                  </div>

                  <div className="rounded-lg bg-secondary/40 p-3 space-y-1">
                    <span className="text-muted-foreground block text-[11px]">Verification</span>
                    <span className="text-emerald-600 font-semibold flex items-center gap-1">
                      <ShieldCheck className="h-3.5 w-3.5" />
                      {profile.emailVerified ? "Email Verified" : "Active Member"}
                    </span>
                  </div>

                  <div className="rounded-lg bg-secondary/40 p-3 space-y-1">
                    <span className="text-muted-foreground block text-[11px]">Member Since</span>
                    <span className="font-medium text-foreground flex items-center gap-1">
                      <Calendar className="h-3.5 w-3.5 text-muted-foreground" />
                      {new Date(profile.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Profile Form (Full Name & Phone) */}
            <ProfileForm profile={profile} />

            {/* Password Management */}
            <ChangePasswordForm />
          </div>
        )}
      </div>
    </AuthGuard>
  );
}
