"use client";

import React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { User, Phone, Mail, Loader2, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  updateCustomerProfileSchema,
  type UpdateCustomerProfileFormValues,
} from "../validators";
import { useUpdateCustomerProfile } from "../hooks/use-customer-profile";
import type { CustomerProfile } from "../types";

interface ProfileFormProps {
  profile: CustomerProfile;
}

export function ProfileForm({ profile }: ProfileFormProps) {
  const updateMutation = useUpdateCustomerProfile();

  const {
    register,
    handleSubmit,
    formState: { errors, isDirty },
  } = useForm<UpdateCustomerProfileFormValues>({
    resolver: zodResolver(updateCustomerProfileSchema),
    defaultValues: {
      fullName: profile.fullName || "",
      phone: profile.phone || "",
      avatarUrl: profile.avatarUrl || "",
    },
  });

  const onSubmit = (values: UpdateCustomerProfileFormValues) => {
    updateMutation.mutate({
      fullName: values.fullName,
      phone: values.phone ? values.phone.trim() : undefined,
      avatarUrl: values.avatarUrl ? values.avatarUrl.trim() : undefined,
    });
  };

  return (
    <Card className="border border-border/80 shadow-sm">
      <CardHeader>
        <CardTitle className="text-lg flex items-center gap-2">
          <User className="h-5 w-5 text-primary" />
          <span>Personal Information</span>
        </CardTitle>
        <CardDescription className="text-xs">
          Manage your verified customer name and mobile contact preferences.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {/* Email (Read-Only) */}
          <div className="space-y-1.5">
            <Label htmlFor="profile-email" className="text-xs font-medium text-muted-foreground">
              Email Address (Verified)
            </Label>
            <div className="relative">
              <Mail className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground opacity-60" />
              <Input
                id="profile-email"
                type="email"
                value={profile.email}
                disabled
                className="pl-9 h-9 text-xs bg-secondary/40 text-muted-foreground cursor-not-allowed"
              />
            </div>
            <p className="text-[11px] text-muted-foreground">
              Your email is your authenticated identity on Asli Cart and cannot be changed here.
            </p>
          </div>

          {/* Full Name */}
          <div className="space-y-1.5">
            <Label htmlFor="profile-fullName" className="text-xs font-medium">
              Full Name
            </Label>
            <div className="relative">
              <User className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                id="profile-fullName"
                type="text"
                {...register("fullName")}
                className="pl-9 h-9 text-xs"
                placeholder="Enter your full name"
              />
            </div>
            {errors.fullName && (
              <p className="text-[11px] text-destructive font-medium">
                {errors.fullName.message}
              </p>
            )}
          </div>

          {/* Phone Number */}
          <div className="space-y-1.5">
            <Label htmlFor="profile-phone" className="text-xs font-medium">
              Phone Number (Optional)
            </Label>
            <div className="relative">
              <Phone className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                id="profile-phone"
                type="tel"
                {...register("phone")}
                className="pl-9 h-9 text-xs"
                placeholder="e.g. 9876543210"
              />
            </div>
            {errors.phone && (
              <p className="text-[11px] text-destructive font-medium">
                {errors.phone.message}
              </p>
            )}
          </div>

          <div className="flex justify-end pt-2">
            <Button
              type="submit"
              size="sm"
              disabled={!isDirty || updateMutation.isPending}
              className="gap-1.5 font-semibold"
            >
              {updateMutation.isPending ? (
                <>
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  <span>Saving...</span>
                </>
              ) : (
                <>
                  <Save className="h-3.5 w-3.5" />
                  <span>Save Changes</span>
                </>
              )}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}

