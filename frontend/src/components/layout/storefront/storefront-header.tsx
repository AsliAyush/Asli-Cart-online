"use client";

import React from "react";
import Link from "next/link";
import { Sparkles, ShoppingBag, Tag, Grid, Package, Flame } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { StorefrontSearch } from "./storefront-search";
import { StorefrontUserMenu } from "./storefront-user-menu";
import { StorefrontMobileNav } from "./storefront-mobile-nav";
import { BrandLogo } from "@/components/shared/brand-logo";
import { useCustomerCart } from "@/modules/customer/hooks/use-customer-cart";
import { useAuth } from "@/hooks/use-auth";

export function StorefrontHeader() {
  const { isAuthenticated, user } = useAuth();
  const isCustomer = isAuthenticated && user?.role === "CUSTOMER";
  const { data: cartData } = useCustomerCart();
  const cartItemCount = isCustomer ? (cartData?.itemsCount || 0) : 0;

  return (
    <header className="sticky top-0 z-40 w-full border-b border-border/80 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/70">
      {/* Top Value Announcement Bar */}
      <div className="bg-primary text-primary-foreground py-1 px-4 text-center text-xs font-medium tracking-wide flex items-center justify-center gap-2">
        <Sparkles className="h-3.5 w-3.5 text-amber-300 shrink-0" />
        <span className="truncate">
          Asli Cart: Discover 100% genuine deals, verified discounts & price drops across top Indian stores.
        </span>
      </div>

      {/* Main Navbar */}
      <div className="container mx-auto flex h-16 items-center justify-between gap-4 px-4 sm:px-6">
        {/* Brand Logo & Mobile Trigger */}
        <div className="flex items-center gap-3">
          <StorefrontMobileNav />
          <BrandLogo size="md" priority />
          <Badge
            variant="deal"
            className="hidden xl:inline-flex text-[10px] py-0 px-2 font-bold"
          >
            100% Genuine
          </Badge>
        </div>

        {/* Center Search Input */}
        <div className="hidden md:flex flex-1 max-w-md mx-2">
          <StorefrontSearch />
        </div>

        {/* Desktop Navigation Links */}
        <nav className="hidden lg:flex items-center gap-5 text-xs font-medium text-muted-foreground" aria-label="Storefront Desktop Navigation">
          <Link
            href="/deals"
            className="flex items-center gap-1.5 hover:text-foreground transition-colors"
          >
            <Flame className="h-3.5 w-3.5 text-rose-500" />
            <span>Hot Deals</span>
          </Link>
          <Link
            href="/offers"
            className="flex items-center gap-1.5 hover:text-foreground transition-colors"
          >
            <Tag className="h-3.5 w-3.5 text-amber-500" />
            <span>Store Offers</span>
          </Link>
          <Link
            href="/products"
            className="flex items-center gap-1.5 hover:text-foreground transition-colors"
          >
            <Package className="h-3.5 w-3.5 text-primary" />
            <span>Products</span>
          </Link>
          <Link
            href="/categories"
            className="flex items-center gap-1.5 hover:text-foreground transition-colors"
          >
            <Grid className="h-3.5 w-3.5 text-emerald-500" />
            <span>Categories</span>
          </Link>
        </nav>

        {/* Right: Cart Icon & User Menu */}
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="icon"
            className="relative h-9 w-9 text-muted-foreground hover:text-foreground"
            asChild
          >
            <Link href="/customer/cart" title="Shopping Cart">
              <ShoppingBag className="h-5 w-5" />
              {cartItemCount > 0 && (
                <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-amber-500 text-[10px] font-bold text-slate-900 shadow">
                  {cartItemCount}
                </span>
              )}
              <span className="sr-only">View shopping cart</span>
            </Link>
          </Button>

          {/* User Menu / Guest Actions */}
          <StorefrontUserMenu />
        </div>
      </div>
    </header>
  );
}
