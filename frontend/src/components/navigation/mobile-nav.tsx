"use client";

import React from "react";
import Link from "next/link";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  Menu,
  ShoppingBag,
  ShieldCheck,
  Tag,
  LayoutDashboard,
  LogOut,
  Lock,
  User,
  UserPlus,
} from "lucide-react";
import { useUiStore } from "@/stores";
import { useAuth } from "@/hooks/use-auth";
import { getRoleDashboardPath } from "@/lib/auth-helpers";

export function MobileNav() {
  const { isMobileMenuOpen, setMobileMenuOpen } = useUiStore();
  const { user, isAuthenticated, logout } = useAuth();

  const navLinks = [
    { label: "Today's Top Deals", href: "/#deals", icon: Tag },
    { label: "Verified Savings", href: "/#features", icon: ShieldCheck },
    { label: "Architecture", href: "/#portals", icon: LayoutDashboard },
  ];

  return (
    <Sheet open={isMobileMenuOpen} onOpenChange={setMobileMenuOpen}>
      <SheetTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="lg:hidden"
          aria-label="Toggle navigation menu"
        >
          <Menu className="h-5 w-5" />
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="w-[300px] sm:w-[350px]">
        <SheetHeader className="text-left">
          <SheetTitle className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground font-bold text-sm">
              AC
            </div>
            <span className="font-bold text-lg">
              Asli<span className="text-primary">Cart</span>
            </span>
          </SheetTitle>
        </SheetHeader>

        {/* Authenticated User Banner */}
        {isAuthenticated && user && (
          <div className="mt-4 rounded-lg bg-secondary/60 p-3 space-y-1">
            <p className="text-xs font-semibold text-foreground">{user.fullName}</p>
            <p className="text-[11px] text-muted-foreground">{user.email}</p>
            <p className="text-[10px] font-mono font-medium text-primary">
              Role: {user.role}
            </p>
          </div>
        )}

        <div className="mt-6 flex flex-col space-y-2">
          <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground px-2">
            Explore
          </p>
          {navLinks.map((item) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.label}
                href={item.href}
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium text-foreground transition-colors hover:bg-secondary"
              >
                <Icon className="h-4 w-4 text-primary" />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </div>

        <Separator className="my-6" />

        {/* Auth Actions */}
        <div className="space-y-2">
          <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground px-2">
            Account Access
          </p>
          {isAuthenticated && user ? (
            <div className="space-y-2">
              <Button
                variant="default"
                className="w-full justify-start gap-2"
                asChild
                onClick={() => setMobileMenuOpen(false)}
              >
                <Link href={getRoleDashboardPath(user.role)}>
                  <LayoutDashboard className="h-4 w-4" />
                  <span>Go to My Dashboard</span>
                </Link>
              </Button>
              <Button
                variant="outline"
                className="w-full justify-start gap-2 text-destructive hover:bg-destructive/10"
                onClick={() => {
                  setMobileMenuOpen(false);
                  logout("/");
                }}
              >
                <LogOut className="h-4 w-4" />
                <span>Sign Out</span>
              </Button>
            </div>
          ) : (
            <div className="space-y-2">
              <Button
                variant="default"
                className="w-full justify-start gap-2"
                asChild
                onClick={() => setMobileMenuOpen(false)}
              >
                <Link href="/customer/login">
                  <User className="h-4 w-4" />
                  <span>Customer Sign In</span>
                </Link>
              </Button>
              <Button
                variant="outline"
                className="w-full justify-start gap-2"
                asChild
                onClick={() => setMobileMenuOpen(false)}
              >
                <Link href="/customer/register">
                  <UserPlus className="h-4 w-4" />
                  <span>Register Free Account</span>
                </Link>
              </Button>
              <Button
                variant="ghost"
                className="w-full justify-start gap-2 text-xs text-muted-foreground"
                asChild
                onClick={() => setMobileMenuOpen(false)}
              >
                <Link href="/staff-login">
                  <Lock className="h-3.5 w-3.5" />
                  <span>Staff Administrative Login</span>
                </Link>
              </Button>
            </div>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}
