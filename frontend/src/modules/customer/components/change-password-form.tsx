"use client";

import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Lock, Eye, EyeOff, Loader2, KeyRound } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  changeCustomerPasswordSchema,
  type ChangeCustomerPasswordFormValues,
} from "../validators";
import { useChangeCustomerPassword } from "../hooks/use-customer-profile";

export function ChangePasswordForm() {
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const changePasswordMutation = useChangeCustomerPassword();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ChangeCustomerPasswordFormValues>({
    resolver: zodResolver(changeCustomerPasswordSchema),
    defaultValues: {
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    },
  });

  const onSubmit = (values: ChangeCustomerPasswordFormValues) => {
    changePasswordMutation.mutate(
      {
        currentPassword: values.currentPassword,
        newPassword: values.newPassword,
      },
      {
        onSuccess: () => reset(),
      }
    );
  };

  return (
    <Card className="border border-border/80 shadow-sm">
      <CardHeader>
        <CardTitle className="text-lg flex items-center gap-2">
          <KeyRound className="h-5 w-5 text-primary" />
          <span>Security & Password</span>
        </CardTitle>
        <CardDescription className="text-xs">
          Ensure your account stays protected by using a strong, unique password.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {/* Current Password */}
          <div className="space-y-1.5">
            <Label htmlFor="current-password" className="text-xs font-medium">
              Current Password
            </Label>
            <div className="relative">
              <Lock className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                id="current-password"
                type={showCurrentPassword ? "text" : "password"}
                {...register("currentPassword")}
                className="pl-9 pr-9 h-9 text-xs"
                placeholder="Enter your current password"
              />
              <button
                type="button"
                onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                className="absolute right-3 top-2.5 text-muted-foreground hover:text-foreground"
              >
                {showCurrentPassword ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </button>
            </div>
            {errors.currentPassword && (
              <p className="text-[11px] text-destructive font-medium">
                {errors.currentPassword.message}
              </p>
            )}
          </div>

          {/* New Password */}
          <div className="space-y-1.5">
            <Label htmlFor="new-password" className="text-xs font-medium">
              New Password
            </Label>
            <div className="relative">
              <Lock className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                id="new-password"
                type={showNewPassword ? "text" : "password"}
                {...register("newPassword")}
                className="pl-9 pr-9 h-9 text-xs"
                placeholder="Must include uppercase, lowercase, number & symbol"
              />
              <button
                type="button"
                onClick={() => setShowNewPassword(!showNewPassword)}
                className="absolute right-3 top-2.5 text-muted-foreground hover:text-foreground"
              >
                {showNewPassword ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </button>
            </div>
            {errors.newPassword && (
              <p className="text-[11px] text-destructive font-medium">
                {errors.newPassword.message}
              </p>
            )}
          </div>

          {/* Confirm New Password */}
          <div className="space-y-1.5">
            <Label htmlFor="confirm-password" className="text-xs font-medium">
              Confirm New Password
            </Label>
            <div className="relative">
              <Lock className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                id="confirm-password"
                type="password"
                {...register("confirmPassword")}
                className="pl-9 h-9 text-xs"
                placeholder="Re-enter your new password"
              />
            </div>
            {errors.confirmPassword && (
              <p className="text-[11px] text-destructive font-medium">
                {errors.confirmPassword.message}
              </p>
            )}
          </div>

          <div className="flex justify-end pt-2">
            <Button
              type="submit"
              size="sm"
              disabled={changePasswordMutation.isPending}
              className="gap-1.5 font-semibold"
            >
              {changePasswordMutation.isPending ? (
                <>
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  <span>Updating...</span>
                </>
              ) : (
                <>
                  <KeyRound className="h-3.5 w-3.5" />
                  <span>Update Password</span>
                </>
              )}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}

