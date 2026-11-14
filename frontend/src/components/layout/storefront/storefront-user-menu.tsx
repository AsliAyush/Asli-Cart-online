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
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  User,
  Heart,
  ShoppingBag,
  LayoutDashboard,
  LogOut,
  ChevronDown,
  Shield,
  UserPlus,
} from "lucide-react";
import { getRoleDashboardPath, isStaffRole } from "@/lib/auth-helpers";

export function StorefrontUserMenu() {
  const { user, isAuthenticated, isInitialized, logout, isLoading } = useAuth();

  // If not yet initialized, render a compact skeleton placeholder
  if (!isInitialized) {
    return <div className="h-8 w-24 animate-pulse rounded-md bg-secondary" />;
  }

  // Guest State: Show Sign In & Register buttons
  if (!isAuthenticated || !user) {
    return (
      <div className="flex items-center gap-1.5 sm:gap-2">
        <Button variant="ghost" size="sm" asChild className="hidden sm:inline-flex text-xs">
          <Link href="/staff-login">Staff Portal</Link>
        </Button>
        <Button variant="outline" size="sm" asChild className="text-xs">
          <Link href="/customer/login">Sign In</Link>
        </Button>
        <Button variant="default" size="sm" asChild className="text-xs font-semibold">
          <Link href="/customer/register">Register</Link>
        </Button>
      </div>
    );
  }

  const initials = user.fullName
    ? user.fullName
        .split(" ")
        .map((n) => n[0])
        .slice(0, 2)
        .join("")
        .toUpperCase()
    : "CU";

  const isStaff = isStaffRole(user.role);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          className="flex items-center gap-2 px-2 py-1.5 h-auto hover:bg-secondary/80 focus-visible:ring-1"
        >
          <Avatar className="h-8 w-8 rounded-full border border-border">
            <AvatarFallback className="bg-primary/10 text-primary font-bold text-xs">
              {initials}
            </AvatarFallback>
          </Avatar>
          <div className="hidden text-left md:flex md:flex-col">
            <span className="text-xs font-semibold leading-tight text-foreground truncate max-w-[120px]">
              {user.fullName.split(" ")[0]}
            </span>
            <span className="text-[10px] text-muted-foreground truncate max-w-[120px]">
              {user.role}
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
              <Badge
                variant={isStaff ? "deal" : "outline"}
                className="text-[9px] py-0 px-1.5 font-bold"
              >
                {user.role}
              </Badge>
            </div>
          </div>
        </DropdownMenuLabel>

        <DropdownMenuSeparator />

        {/* If customer, show customer navigation links */}
        {!isStaff ? (
          <>
            <DropdownMenuItem asChild>
              <Link href="/customer/dashboard" className="cursor-pointer gap-2 text-xs">
                <LayoutDashboard className="h-3.5 w-3.5 text-primary" />
                <span>My Dashboard</span>
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link href="/customer/profile" className="cursor-pointer gap-2 text-xs">
                <User className="h-3.5 w-3.5 text-muted-foreground" />
                <span>Account Profile</span>
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link href="/customer/wishlist" className="cursor-pointer gap-2 text-xs">
                <Heart className="h-3.5 w-3.5 text-rose-500" />
                <span>Saved Wishlist</span>
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link href="/customer/cart" className="cursor-pointer gap-2 text-xs">
                <ShoppingBag className="h-3.5 w-3.5 text-amber-500" />
                <span>Cart Overview</span>
              </Link>
            </DropdownMenuItem>
          </>
        ) : (
          <DropdownMenuItem asChild>
            <Link href={getRoleDashboardPath(user.role)} className="cursor-pointer gap-2 text-xs">
              <Shield className="h-3.5 w-3.5 text-primary" />
              <span>Go to Staff Dashboard</span>
            </Link>
          </DropdownMenuItem>
        )}

        <DropdownMenuSeparator />

        <DropdownMenuItem
          onClick={() => logout("/")}
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

