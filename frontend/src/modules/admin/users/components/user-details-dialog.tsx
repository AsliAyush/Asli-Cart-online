"use client";

import React from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import type { AdminUserListItem } from "../types";
import { CheckCircle2, XCircle, Calendar, Mail, Shield, User as UserIcon } from "lucide-react";

interface UserDetailsDialogProps {
  user: AdminUserListItem | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function UserDetailsDialog({ user, open, onOpenChange }: UserDetailsDialogProps) {
  if (!user) return null;

  const initials = user.fullName
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  const formattedCreated = new Date(user.createdAt).toLocaleDateString(undefined, {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

  const formattedUpdated = new Date(user.updatedAt).toLocaleDateString(undefined, {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-lg">User Profile Details</DialogTitle>
          <DialogDescription className="text-xs font-mono">
            ID: {user.id}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2">
          {/* Avatar & Header */}
          <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/40">
            <Avatar className="h-12 w-12 border">
              <AvatarFallback className="bg-primary/10 text-primary font-bold">
                {initials}
              </AvatarFallback>
            </Avatar>
            <div className="min-w-0 flex-1">
              <h4 className="text-sm font-semibold text-foreground truncate">{user.fullName}</h4>
              <p className="text-xs text-muted-foreground truncate">{user.email}</p>
              <div className="flex items-center gap-2 mt-1">
                <Badge variant={user.isActive ? "default" : "secondary"} className="text-[10px]">
                  {user.isActive ? "Active Account" : "Deactivated"}
                </Badge>
                <Badge variant="outline" className="text-[10px] font-mono">
                  {user.role?.name || "CUSTOMER"}
                </Badge>
              </div>
            </div>
          </div>

          {/* User Attributes Grid */}
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="p-2.5 rounded-md border bg-card">
              <div className="flex items-center gap-1.5 text-muted-foreground mb-1">
                <Mail className="h-3.5 w-3.5" />
                <span>Email Verification</span>
              </div>
              <div className="flex items-center gap-1 font-medium">
                {user.emailVerified ? (
                  <>
                    <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
                    <span>Verified</span>
                  </>
                ) : (
                  <>
                    <XCircle className="h-3.5 w-3.5 text-amber-500" />
                    <span>Pending Verification</span>
                  </>
                )}
              </div>
            </div>

            <div className="p-2.5 rounded-md border bg-card">
              <div className="flex items-center gap-1.5 text-muted-foreground mb-1">
                <Shield className="h-3.5 w-3.5" />
                <span>Role Type</span>
              </div>
              <p className="font-medium text-foreground">
                {user.role?.isSystem ? "System Role" : "Custom Role"}
              </p>
            </div>

            <div className="p-2.5 rounded-md border bg-card col-span-2">
              <div className="flex items-center gap-1.5 text-muted-foreground mb-1">
                <Calendar className="h-3.5 w-3.5" />
                <span>Provisioning & Activity History</span>
              </div>
              <p className="text-foreground text-[11px]">
                Created on: <span className="font-medium">{formattedCreated}</span>
              </p>
              <p className="text-foreground text-[11px]">
                Last modified: <span className="font-medium">{formattedUpdated}</span>
              </p>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

