import React from "react";
import type { UserRole } from "@/types/auth";
import {
  LayoutDashboard,
  Users,
  ShieldCheck,
  Package,
  Tag,
  Settings,
  Compass,
  TrendingDown,
  Share2,
} from "lucide-react";

export interface StaffNavItem {
  title: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: string;
  implemented: boolean;
  description: string;
}

/**
 * Super Admin Navigation Configuration
 * Scope: Platform Governance, Access Control, Global Catalog, System Settings
 */
export const SUPER_ADMIN_NAV: StaffNavItem[] = [
  {
    title: "Dashboard",
    href: "/admin/dashboard",
    icon: LayoutDashboard,
    implemented: true,
    description: "System health and administrative metrics overview",
  },
  {
    title: "Users",
    href: "/admin/users",
    icon: Users,
    implemented: true,
    description: "Staff account provisioning and user directory",
  },
  {
    title: "Roles & Permissions",
    href: "/admin/roles",
    icon: ShieldCheck,
    implemented: true,
    description: "Granular RBAC role matrices and module permissions",
  },
  {
    title: "Products",
    href: "/admin/products",
    icon: Package,
    implemented: true,
    description: "Master product catalog oversight",
  },
  {
    title: "Offers",
    href: "/admin/offers",
    icon: Tag,
    implemented: true,
    description: "Global deal approval and offer feeds",
  },
  {
    title: "Settings",
    href: "/admin/settings",
    icon: Settings,
    implemented: true,
    description: "Platform configuration and admin profile",
  },
];

/**
 * Product Manager Navigation Configuration
 * Scope: Deal discovery, price benchmarks, and offer curation
 */
export const PRODUCT_MANAGER_NAV: StaffNavItem[] = [
  {
    title: "Dashboard",
    href: "/product-manager/dashboard",
    icon: LayoutDashboard,
    implemented: true,
    description: "Catalog curation overview and active deal metrics",
  },
  {
    title: "Product Discovery",
    href: "/product-manager/discovery",
    icon: Compass,
    implemented: true,
    description: "Automated deal discovery and merchant scrapers",
  },
  {
    title: "Products",
    href: "/product-manager/products",
    icon: Package,
    implemented: true,
    description: "Product management and category assignment",
  },
  {
    title: "Pricing",
    href: "/product-manager/pricing",
    icon: TrendingDown,
    implemented: true,
    description: "Historical price tracking and drop thresholds",
  },
  {
    title: "Offers",
    href: "/product-manager/offers",
    icon: Tag,
    implemented: true,
    description: "Deal verification and merchant affiliate links",
  },
];

/**
 * Social Media Manager Navigation Configuration
 * Scope: Strictly dashboard placeholder (no unfinished features exposed)
 */
export const SOCIAL_MEDIA_MANAGER_NAV: StaffNavItem[] = [
  {
    title: "Dashboard",
    href: "/social-media-manager/dashboard",
    icon: LayoutDashboard,
    implemented: true,
    description: "Social broadcast overview (module deferred)",
  },
];

/**
 * Resolves authorized navigation items strictly mapped to the authenticated role.
 */
export function getStaffNavItems(role?: UserRole | null): StaffNavItem[] {
  switch (role) {
    case "SUPER_ADMIN":
      return SUPER_ADMIN_NAV;
    case "PRODUCT_MANAGER":
      return PRODUCT_MANAGER_NAV;
    case "SOCIAL_MEDIA_MANAGER":
      return SOCIAL_MEDIA_MANAGER_NAV;
    default:
      return [];
  }
}

