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
import { Badge } from "@/components/ui/badge";
import {
  Menu,
  ShoppingBag,
  ShieldCheck,
  Tag,
  LayoutDashboard,
  LogOut,
  User,
  Heart,
  Grid,
  Package,
  Lock,
} from "lucide-react";
import { useUiStore } from "@/stores/ui-store";
import { useAuth } from "@/hooks/use-auth";
import { getRoleDashboardPath, isStaffRole } from "@/lib/auth-helpers";
import { BrandLogo } from "@/components/shared/brand-logo";

export function StorefrontMobileNav() {
  const { isMobileMenuOpen, setMobileMenuOpen } = useUiStore();
  const { user, isAuthenticated, logout } = useAuth();

  const isStaff = isStaffRole(user?.role);

  const storefrontLinks = [
    { label: "Home", href: "/", icon: ShoppingBag },
    { label: "Hot Deals", href: "/deals", icon: Tag },
    { label: "Store Offers", href: "/offers", icon: Tag },
    { label: "Products Catalog", href: "/products", icon: Package },
    { label: "Categories", href: "/categories", icon: Grid },
    { label: "Why Asli Cart?", href: "/#features", icon: ShieldCheck },
  ];

  return (
    <Sheet open={isMobileMenuOpen} onOpenChange={setMobileMenuOpen}>
      <SheetTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="lg:hidden"
          aria-label="Open storefront navigation menu"
        >
          <Menu className="h-5 w-5" />
        </Button>
      </SheetTrigger>

      <SheetContent side="left" className="w-[300px] sm:w-[350px] p-0 flex flex-col">
        {/* Header */}
        <SheetHeader className="p-4 border-b border-border text-left">
          <SheetTitle asChild>
            <BrandLogo size="md" subtitle="Verified Deals" href={null} />
          </SheetTitle>
        </SheetHeader>

        {/* User state if logged in */}
        {isAuthenticated && user && (
          <div className="p-4 bg-secondary/40 border-b border-border space-y-1">
            <p className="text-xs font-semibold text-foreground">{user.fullName}</p>
            <p className="text-[11px] text-muted-foreground">{user.email}</p>
            <Badge
              variant={isStaff ? "deal" : "outline"}
              className="text-[9px] py-0 px-2 font-bold uppercase mt-1"
            >
              {user.role}
            </Badge>
          </div>
        )}

        {/* Storefront navigation */}
        <nav className="flex-1 overflow-y-auto p-4 space-y-1" aria-label="Storefront Mobile Navigation">
          <p className="text-[10px] uppercase font-semibold text-muted-foreground px-2 py-1">
            Browse Storefront
          </p>
          {storefrontLinks.map((item) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.label}
                href={item.href}
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-3 rounded-lg px-3 py-2 text-xs font-medium text-foreground transition-colors hover:bg-secondary"
              >
                <Icon className="h-4 w-4 text-primary" />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        <Separator />

        {/* Customer Account or Guest Actions */}
        <div className="p-4 space-y-2">
          {isAuthenticated && user ? (
            <div className="space-y-1.5">
              {!isStaff ? (
                <>
                  <Button
                    variant="default"
                    size="sm"
                    className="w-full justify-start gap-2 text-xs"
                    asChild
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <Link href="/customer/dashboard">
                      <LayoutDashboard className="h-3.5 w-3.5" />
                      <span>My Savings Dashboard</span>
                    </Link>
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full justify-start gap-2 text-xs"
                    asChild
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <Link href="/customer/profile">
                      <User className="h-3.5 w-3.5" />
                      <span>Account Profile</span>
                    </Link>
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full justify-start gap-2 text-xs"
                    asChild
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <Link href="/customer/wishlist">
                      <Heart className="h-3.5 w-3.5 text-rose-500" />
                      <span>Saved Wishlist</span>
                    </Link>
                  </Button>
                </>
              ) : (
                <Button
                  variant="default"
                  size="sm"
                  className="w-full justify-start gap-2 text-xs"
                  asChild
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <Link href={getRoleDashboardPath(user.role)}>
                    <LayoutDashboard className="h-3.5 w-3.5" />
                    <span>Go to Staff Dashboard</span>
                  </Link>
                </Button>
              )}

              <Button
                variant="ghost"
                size="sm"
                className="w-full justify-start gap-2 text-xs text-destructive hover:bg-destructive/10"
                onClick={() => {
                  setMobileMenuOpen(false);
                  logout("/");
                }}
              >
                <LogOut className="h-3.5 w-3.5" />
                <span>Sign Out</span>
              </Button>
            </div>
          ) : (
            <div className="space-y-2">
              <Button
                variant="default"
                size="sm"
                className="w-full justify-start gap-2 text-xs font-semibold"
                asChild
                onClick={() => setMobileMenuOpen(false)}
              >
                <Link href="/customer/login">
                  <User className="h-3.5 w-3.5" />
                  <span>Customer Sign In</span>
                </Link>
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="w-full justify-start gap-2 text-xs"
                asChild
                onClick={() => setMobileMenuOpen(false)}
              >
                <Link href="/customer/register">
                  <span>Register Free Account</span>
                </Link>
              </Button>
              <Button
                variant="ghost"
                size="sm"
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

