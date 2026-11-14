"use client";

import React, { useEffect } from "react";
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
import { useUpdateEmployee } from "../hooks/use-admin-users";
import { updateEmployeeSchema, type UpdateEmployeeFormValues } from "../validators";
import type { AdminUserListItem } from "../types";
import { Loader2 } from "lucide-react";

interface EditUserDialogProps {
  user: AdminUserListItem | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function EditUserDialog({ user, open, onOpenChange }: EditUserDialogProps) {
  const updateMutation = useUpdateEmployee();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<UpdateEmployeeFormValues>({
    resolver: zodResolver(updateEmployeeSchema),
    defaultValues: {
      fullName: user?.fullName || "",
    },
  });

  useEffect(() => {
    if (user) {
      reset({ fullName: user.fullName });
    }
  }, [user, reset]);

  if (!user) return null;

  const onSubmit = async (values: UpdateEmployeeFormValues) => {
    try {
      await updateMutation.mutateAsync({ id: user.id, input: values });
      onOpenChange(false);
    } catch {
      // Toast handled by mutation
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-lg">Edit User Profile</DialogTitle>
          <DialogDescription className="text-xs">
            Modify profile information for {user.email}.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 py-2">
          <div className="space-y-1.5">
            <Label htmlFor="edit-fullName" className="text-xs font-semibold">
              Full Name
            </Label>
            <Input
              id="edit-fullName"
              placeholder="e.g. Rahul Gupta"
              {...register("fullName")}
              className="h-9 text-sm"
            />
            {errors.fullName && (
              <p className="text-xs text-destructive">{errors.fullName.message}</p>
            )}
          </div>

          <div className="rounded-md bg-muted/50 p-3 space-y-1 text-xs text-muted-foreground">
            <p>
              <strong className="text-foreground">Email:</strong> {user.email} (Email addresses are immutable)
            </p>
            <p>
              <strong className="text-foreground">Assigned Role:</strong> {user.role?.name || "Customer"}
            </p>
          </div>

          <DialogFooter className="pt-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => onOpenChange(false)}
              disabled={updateMutation.isPending}
            >
              Cancel
            </Button>
            <Button type="submit" size="sm" disabled={updateMutation.isPending}>
              {updateMutation.isPending && (
                <Loader2 className="h-3.5 w-3.5 mr-1.5 animate-spin" />
              )}
              Save Changes
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

