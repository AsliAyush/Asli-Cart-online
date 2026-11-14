"use client";

import React from "react";
import Link from "next/link";
import { Search, Tag, ShieldCheck, Sparkles, LayoutDashboard, LogOut, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { MobileNav } from "./mobile-nav";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/hooks/use-auth";
import { getRoleDashboardPath } from "@/lib/auth-helpers";

export function Navbar() {
  const { user, isAuthenticated, logout, isInitialized } = useAuth();

  return (
    <nav className="sticky top-0 z-40 w-full border-b border-border/80 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto flex h-16 items-center justify-between gap-4">
        {/* Brand Logo & Mobile Trigger */}
        <div className="flex items-center gap-3">
          <MobileNav />
          <Link href="/" className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary text-primary-foreground font-black text-base shadow-sm">
              AC
            </div>
            <div className="flex flex-col">
              <span className="text-xl font-extrabold tracking-tight text-foreground">
                Asli<span className="text-primary">Cart</span>
              </span>
            </div>
          </Link>
          <Badge
            variant="deal"
            className="hidden lg:inline-flex text-[10px] py-0 px-2 font-bold"
          >
            100% Genuine
          </Badge>
        </div>

        {/* Search Bar Placeholder */}
        <div className="hidden flex-1 max-w-md md:flex items-center relative">
          <Search className="absolute left-3 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search deals, laptops, smartphones, fashion..."
            className="pl-9 bg-secondary/50 focus-visible:bg-background"
            readOnly
          />
        </div>

        {/* Navigation Links (Desktop) */}
        <div className="hidden lg:flex items-center gap-6 text-sm font-medium">
          <Link
            href="/#deals"
            className="flex items-center gap-1.5 text-muted-foreground transition-colors hover:text-foreground"
          >
            <Tag className="h-4 w-4 text-amber-500" />
            <span>Top Deals</span>
          </Link>
          <Link
            href="/#features"
            className="flex items-center gap-1.5 text-muted-foreground transition-colors hover:text-foreground"
          >
            <ShieldCheck className="h-4 w-4 text-emerald-500" />
            <span>Why Asli?</span>
          </Link>
          <Link
            href="/#portals"
            className="flex items-center gap-1.5 text-muted-foreground transition-colors hover:text-foreground"
          >
            <Sparkles className="h-4 w-4 text-primary" />
            <span>Architecture</span>
          </Link>
        </div>

        {/* Auth Action Buttons */}
        <div className="flex items-center gap-2">
          {isInitialized && isAuthenticated && user ? (
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" asChild>
                <Link
                  href={getRoleDashboardPath(user.role)}
                  className="gap-1.5 font-medium"
                >
                  <LayoutDashboard className="h-3.5 w-3.5 text-primary" />
                  <span className="max-w-[120px] truncate sm:max-w-none">
                    {user.fullName.split(" ")[0]} ({user.role})
                  </span>
                </Link>
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => logout("/")}
                className="gap-1.5 text-muted-foreground hover:text-destructive"
                aria-label="Sign out"
              >
                <LogOut className="h-4 w-4" />
                <span className="hidden sm:inline">Sign Out</span>
              </Button>
            </div>
          ) : (
            <div className="flex items-center gap-1.5 sm:gap-2">
              <Button variant="ghost" size="sm" asChild className="text-xs">
                <Link href="/staff-login">Staff Portal</Link>
              </Button>
              <Button variant="outline" size="sm" asChild className="text-xs">
                <Link href="/customer/login">Sign In</Link>
              </Button>
              <Button variant="default" size="sm" asChild className="text-xs font-semibold">
                <Link href="/customer/register">Register</Link>
              </Button>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}
