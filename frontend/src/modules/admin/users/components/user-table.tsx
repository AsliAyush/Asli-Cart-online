"use client";

import React, { useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { AdminUserListItem } from "../types";
import { EditUserDialog } from "./edit-user-dialog";
import { ChangeRoleDialog } from "./change-role-dialog";
import { UserStatusModal } from "./user-status-modal";
import { UserDetailsDialog } from "./user-details-dialog";
import {
  MoreHorizontal,
  Eye,
  Edit2,
  Shield,
  UserCheck,
  UserX,
  ChevronLeft,
  ChevronRight,
  Users,
} from "lucide-react";

interface UserTableProps {
  users: AdminUserListItem[];
  isLoading: boolean;
  page: number;
  totalPages: number;
  total: number;
  limit: number;
  onPageChange: (newPage: number) => void;
}

export function UserTable({
  users,
  isLoading,
  page,
  totalPages,
  total,
  limit,
  onPageChange,
}: UserTableProps) {
  const [selectedUser, setSelectedUser] = useState<AdminUserListItem | null>(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isChangeRoleOpen, setIsChangeRoleOpen] = useState(false);
  const [isStatusModalOpen, setIsStatusModalOpen] = useState(false);

  const handleOpenDetails = (user: AdminUserListItem) => {
    setSelectedUser(user);
    setIsDetailsOpen(true);
  };

  const handleOpenEdit = (user: AdminUserListItem) => {
    setSelectedUser(user);
    setIsEditOpen(true);
  };

  const handleOpenChangeRole = (user: AdminUserListItem) => {
    setSelectedUser(user);
    setIsChangeRoleOpen(true);
  };

  const handleOpenStatusModal = (user: AdminUserListItem) => {
    setSelectedUser(user);
    setIsStatusModalOpen(true);
  };

  const getRoleBadgeVariant = (roleName?: string) => {
    switch (roleName) {
      case "SUPER_ADMIN":
        return "deal";
      case "PRODUCT_MANAGER":
        return "default";
      case "SOCIAL_MEDIA_MANAGER":
        return "secondary";
      case "CUSTOMER":
      default:
        return "outline";
    }
  };

  if (isLoading) {
    return (
      <div className="border rounded-lg bg-card overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>User</TableHead>
              <TableHead>Role</TableHead>
              <TableHead>Account Status</TableHead>
              <TableHead>Created</TableHead>
              <TableHead className="w-16 text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {Array.from({ length: 5 }).map((_, i) => (
              <TableRow key={i}>
                <TableCell>
                  <div className="flex items-center gap-3">
                    <Skeleton className="h-9 w-9 rounded-full" />
                    <div className="space-y-1">
                      <Skeleton className="h-4 w-32" />
                      <Skeleton className="h-3 w-40" />
                    </div>
                  </div>
                </TableCell>
                <TableCell><Skeleton className="h-5 w-24" /></TableCell>
                <TableCell><Skeleton className="h-5 w-16" /></TableCell>
                <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                <TableCell className="text-right"><Skeleton className="h-8 w-8 ml-auto" /></TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    );
  }

  if (users.length === 0) {
    return (
      <div className="border border-dashed rounded-lg p-12 text-center bg-card">
        <Users className="h-10 w-10 text-muted-foreground/50 mx-auto mb-3" />
        <h3 className="text-base font-semibold text-foreground">No users match your criteria</h3>
        <p className="text-xs text-muted-foreground mt-1 max-w-sm mx-auto">
          Try adjusting your search query, role filter, or account status to view platform accounts.
        </p>
      </div>
    );
  }

  return (
    <>
      <div className="border rounded-lg bg-card overflow-hidden shadow-2xs">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/30">
              <TableHead>User</TableHead>
              <TableHead>Role</TableHead>
              <TableHead>Account Status</TableHead>
              <TableHead>Created</TableHead>
              <TableHead className="w-16 text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {users.map((user) => {
              const initials = user.fullName
                .split(" ")
                .map((n) => n[0])
                .join("")
                .slice(0, 2)
                .toUpperCase();

              const createdDate = new Date(user.createdAt).toLocaleDateString(undefined, {
                month: "short",
                day: "numeric",
                year: "numeric",
              });

              return (
                <TableRow key={user.id} className="hover:bg-muted/20">
                  {/* User Avatar & Name */}
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <Avatar className="h-9 w-9 border border-border">
                        <AvatarFallback className="bg-primary/10 text-primary font-semibold text-xs">
                          {initials}
                        </AvatarFallback>
                      </Avatar>
                      <div className="min-w-0">
                        <p className="text-sm font-semibold text-foreground truncate">
                          {user.fullName}
                        </p>
                        <p className="text-xs text-muted-foreground truncate">{user.email}</p>
                      </div>
                    </div>
                  </TableCell>

                  {/* Role Badge */}
                  <TableCell>
                    <Badge variant={getRoleBadgeVariant(user.role?.name)} className="text-[11px] font-medium">
                      {user.role?.name?.replace("_", " ") || "CUSTOMER"}
                    </Badge>
                  </TableCell>

                  {/* Account Status */}
                  <TableCell>
                    {user.isActive ? (
                      <span className="inline-flex items-center gap-1.5 text-xs font-medium text-emerald-600 dark:text-emerald-400">
                        <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                        Active
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 text-xs font-medium text-destructive">
                        <span className="h-1.5 w-1.5 rounded-full bg-destructive" />
                        Inactive
                      </span>
                    )}
                  </TableCell>

                  {/* Created Date */}
                  <TableCell className="text-xs text-muted-foreground">
                    {createdDate}
                  </TableCell>

                  {/* Actions Dropdown */}
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                          <MoreHorizontal className="h-4 w-4" />
                          <span className="sr-only">Open menu</span>
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-48 text-xs">
                        <DropdownMenuLabel className="text-xs font-normal text-muted-foreground">
                          User Actions
                        </DropdownMenuLabel>
                        <DropdownMenuItem onClick={() => handleOpenDetails(user)}>
                          <Eye className="h-3.5 w-3.5 mr-2" />
                          View Details
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleOpenEdit(user)}>
                          <Edit2 className="h-3.5 w-3.5 mr-2" />
                          Edit Profile
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleOpenChangeRole(user)}>
                          <Shield className="h-3.5 w-3.5 mr-2" />
                          Change Role
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          onClick={() => handleOpenStatusModal(user)}
                          className={user.isActive ? "text-destructive focus:text-destructive" : "text-emerald-600 focus:text-emerald-600"}
                        >
                          {user.isActive ? (
                            <>
                              <UserX className="h-3.5 w-3.5 mr-2" />
                              Deactivate User
                            </>
                          ) : (
                            <>
                              <UserCheck className="h-3.5 w-3.5 mr-2" />
                              Activate User
                            </>
                          )}
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>

        {/* Pagination Bar */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 p-3 border-t bg-muted/10 text-xs text-muted-foreground">
          <div>
            Showing {(page - 1) * limit + 1} to {Math.min(page * limit, total)} of {total} accounts
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => onPageChange(page - 1)}
              disabled={page <= 1}
              className="h-8 text-xs px-2.5"
            >
              <ChevronLeft className="h-3.5 w-3.5 mr-1" />
              Previous
            </Button>
            <span className="px-2 font-medium text-foreground">
              Page {page} of {Math.max(1, totalPages)}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => onPageChange(page + 1)}
              disabled={page >= totalPages}
              className="h-8 text-xs px-2.5"
            >
              Next
              <ChevronRight className="h-3.5 w-3.5 ml-1" />
            </Button>
          </div>
        </div>
      </div>

      {/* Modals & Dialogs */}
      <UserDetailsDialog
        user={selectedUser}
        open={isDetailsOpen}
        onOpenChange={setIsDetailsOpen}
      />
      <EditUserDialog
        user={selectedUser}
        open={isEditOpen}
        onOpenChange={setIsEditOpen}
      />
      <ChangeRoleDialog
        user={selectedUser}
        open={isChangeRoleOpen}
        onOpenChange={setIsChangeRoleOpen}
      />
      <UserStatusModal
        user={selectedUser}
        open={isStatusModalOpen}
        onOpenChange={setIsStatusModalOpen}
      />
    </>
  );
}

