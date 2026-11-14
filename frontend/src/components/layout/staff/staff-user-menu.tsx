"use client";

import React from "react";
import Link from "next/link";
import { useAuth } from "@/hooks/use-auth";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { LogOut, ExternalLink, Shield, ChevronDown } from "lucide-react";
import { getRoleDashboardPath } from "@/lib/auth-helpers";

export function StaffUserMenu() {
  const { user, logout, isLoading } = useAuth();

  if (!user) return null;

  const initials = user.fullName
    ? user.fullName
        .split(" ")
        .map((n) => n[0])
        .slice(0, 2)
        .join("")
        .toUpperCase()
    : "ST";

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          className="flex items-center gap-2.5 px-2 py-1.5 h-auto hover:bg-secondary/80 focus-visible:ring-1"
        >
          <Avatar className="h-8 w-8 rounded-lg border border-border">
            <AvatarFallback className="rounded-lg bg-primary/10 text-primary font-bold text-xs">
              {initials}
            </AvatarFallback>
          </Avatar>
          <div className="hidden text-left md:flex md:flex-col">
            <span className="text-xs font-semibold leading-tight text-foreground truncate max-w-[130px]">
              {user.fullName}
            </span>
            <span className="text-[10px] text-muted-foreground truncate max-w-[130px]">
              {user.email}
            </span>
          </div>
          <ChevronDown className="h-3.5 w-3.5 text-muted-foreground opacity-60" />
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end" className="w-56 p-1.5">
        <DropdownMenuLabel className="font-normal p-2">
          <div className="flex flex-col space-y-1">
            <p className="text-xs font-semibold leading-none text-foreground">
              {user.fullName}
            </p>
            <p className="text-[11px] leading-none text-muted-foreground">
              {user.email}
            </p>
            <div className="pt-1.5">
              <Badge variant="deal" className="text-[10px] py-0 px-1.5 font-bold">
                {user.role}
              </Badge>
            </div>
          </div>
        </DropdownMenuLabel>

        <DropdownMenuSeparator />

        <DropdownMenuItem asChild>
          <Link href={getRoleDashboardPath(user.role)} className="cursor-pointer gap-2 text-xs">
            <Shield className="h-3.5 w-3.5 text-primary" />
            <span>Portal Overview</span>
          </Link>
        </DropdownMenuItem>

        <DropdownMenuItem asChild>
          <Link href="/" target="_blank" className="cursor-pointer gap-2 text-xs">
            <ExternalLink className="h-3.5 w-3.5 text-muted-foreground" />
            <span>View Public Storefront</span>
          </Link>
        </DropdownMenuItem>

        <DropdownMenuSeparator />

        <DropdownMenuItem
          onClick={() => logout("/staff-login")}
          disabled={isLoading}
          className="cursor-pointer gap-2 text-xs text-destructive focus:bg-destructive/10 focus:text-destructive"
        >
          <LogOut className="h-3.5 w-3.5" />
          <span>Sign Out</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

