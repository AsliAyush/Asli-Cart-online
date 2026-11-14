"use client";

import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useRolesList } from "@/modules/admin/roles/hooks/use-admin-roles";
import { useCreateEmployee } from "../hooks/use-admin-users";
import { createEmployeeSchema, type CreateEmployeeFormValues } from "../validators";
import { UserPlus, Loader2, ShieldAlert } from "lucide-react";

interface CreateUserDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CreateUserDialog({ open, onOpenChange }: CreateUserDialogProps) {
  const { data: roles = [], isLoading: isLoadingRoles } = useRolesList();
  const createMutation = useCreateEmployee();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<CreateEmployeeFormValues>({
    resolver: zodResolver(createEmployeeSchema),
    defaultValues: {
      fullName: "",
      email: "",
      password: "",
      roleId: "",
    },
  });

  const onSubmit = async (values: CreateEmployeeFormValues) => {
    try {
      await createMutation.mutateAsync(values);
      reset();
      onOpenChange(false);
    } catch {
      // Error handled by mutation toast
    }
  };

  // Only internal staff roles (PRODUCT_MANAGER, SOCIAL_MEDIA_MANAGER) are assignable through staff provisioning
  const assignableRoles = roles.filter(
    (r) => r.name === "PRODUCT_MANAGER" || r.name === "SOCIAL_MEDIA_MANAGER"
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-md bg-primary/10 text-primary">
              <UserPlus className="h-5 w-5" />
            </div>
            <div>
              <DialogTitle className="text-lg">Create Staff Account</DialogTitle>
              <DialogDescription className="text-xs">
                Provision a verified internal staff member with role-based permissions.
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 py-2">
          {/* Full Name */}
          <div className="space-y-1.5">
            <Label htmlFor="fullName" className="text-xs font-semibold">
              Full Name
            </Label>
            <Input
              id="fullName"
              placeholder="e.g. Ananya Sharma"
              {...register("fullName")}
              className="h-9 text-sm"
            />
            {errors.fullName && (
              <p className="text-xs text-destructive">{errors.fullName.message}</p>
            )}
          </div>

          {/* Email Address */}
          <div className="space-y-1.5">
            <Label htmlFor="email" className="text-xs font-semibold">
              Staff Email Address
            </Label>
            <Input
              id="email"
              type="email"
              placeholder="employee@aslicart.com"
              {...register("email")}
              className="h-9 text-sm"
            />
            {errors.email && (
              <p className="text-xs text-destructive">{errors.email.message}</p>
            )}
          </div>

          {/* Password */}
          <div className="space-y-1.5">
            <Label htmlFor="password" className="text-xs font-semibold">
              Initial Password
            </Label>
            <Input
              id="password"
              type="password"
              placeholder="Min 8 chars, uppercase, lowercase, number, special"
              {...register("password")}
              className="h-9 text-sm"
            />
            {errors.password && (
              <p className="text-xs text-destructive">{errors.password.message}</p>
            )}
          </div>

          {/* Role Selection */}
          <div className="space-y-1.5">
            <Label htmlFor="roleId" className="text-xs font-semibold">
              Assigned Role
            </Label>
            <select
              id="roleId"
              {...register("roleId")}
              className="w-full h-9 px-3 rounded-md border border-input bg-background text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
              disabled={isLoadingRoles}
            >
              <option value="">Select a role...</option>
              {assignableRoles.map((role) => (
                <option key={role.id} value={role.id}>
                  {role.name.replace("_", " ")} — {role.description || "Platform Role"}
                </option>
              ))}
            </select>
            {errors.roleId && (
              <p className="text-xs text-destructive">{errors.roleId.message}</p>
            )}
            <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground pt-1">
              <ShieldAlert className="h-3.5 w-3.5 text-amber-500 shrink-0" />
              <span>Super Admin accounts require environment bootstrap for security.</span>
            </div>
          </div>

          <DialogFooter className="pt-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => onOpenChange(false)}
              disabled={createMutation.isPending}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              size="sm"
              disabled={createMutation.isPending}
            >
              {createMutation.isPending && (
                <Loader2 className="h-3.5 w-3.5 mr-1.5 animate-spin" />
              )}
              Create Account
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

