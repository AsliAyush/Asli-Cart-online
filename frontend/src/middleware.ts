import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { SESSION_COOKIES } from "@/lib/session-cookie";

// Role-to-prefix mapping
const ROLE_ROUTE_MAP: Record<string, string> = {
  SUPER_ADMIN: "/admin",
  PRODUCT_MANAGER: "/product-manager",
  SOCIAL_MEDIA_MANAGER: "/social-media-manager",
  CUSTOMER: "/customer",
};

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const tokenCookie = request.cookies.get(SESSION_COOKIES.TOKEN)?.value;
  const roleCookie = request.cookies.get(SESSION_COOKIES.ROLE)?.value;
  const isAuthenticated = Boolean(tokenCookie);

  // 1. Staff Portals Protection (/admin, /product-manager, /social-media-manager)
  const isStaffRoute =
    pathname.startsWith("/admin") ||
    pathname.startsWith("/product-manager") ||
    pathname.startsWith("/social-media-manager");

  if (isStaffRoute) {
    if (!isAuthenticated) {
      const loginUrl = new URL("/staff-login", request.url);
      loginUrl.searchParams.set("returnUrl", pathname);
      return NextResponse.redirect(loginUrl);
    }

    // Role-specific check
    if (pathname.startsWith("/admin") && roleCookie !== "SUPER_ADMIN") {
      const unauthorizedUrl = new URL("/unauthorized", request.url);
      unauthorizedUrl.searchParams.set("requiredRole", "SUPER_ADMIN");
      return NextResponse.redirect(unauthorizedUrl);
    }

    if (
      pathname.startsWith("/product-manager") &&
      roleCookie !== "PRODUCT_MANAGER"
    ) {
      const unauthorizedUrl = new URL("/unauthorized", request.url);
      unauthorizedUrl.searchParams.set("requiredRole", "PRODUCT_MANAGER");
      return NextResponse.redirect(unauthorizedUrl);
    }

    if (
      pathname.startsWith("/social-media-manager") &&
      roleCookie !== "SOCIAL_MEDIA_MANAGER"
    ) {
      const unauthorizedUrl = new URL("/unauthorized", request.url);
      unauthorizedUrl.searchParams.set("requiredRole", "SOCIAL_MEDIA_MANAGER");
      return NextResponse.redirect(unauthorizedUrl);
    }

    return NextResponse.next();
  }

  // 2. Customer Protected Routes (/customer/dashboard, etc.)
  const isCustomerAuthPage =
    pathname === "/customer/login" || pathname === "/customer/register";
  const isCustomerProtectedRoute =
    pathname.startsWith("/customer") && !isCustomerAuthPage;

  if (isCustomerProtectedRoute) {
    if (!isAuthenticated) {
      const loginUrl = new URL("/customer/login", request.url);
      loginUrl.searchParams.set("returnUrl", pathname);
      return NextResponse.redirect(loginUrl);
    }

    if (roleCookie !== "CUSTOMER") {
      const unauthorizedUrl = new URL("/unauthorized", request.url);
      unauthorizedUrl.searchParams.set("requiredRole", "CUSTOMER");
      return NextResponse.redirect(unauthorizedUrl);
    }

    return NextResponse.next();
  }

  // 3. Prevent logged-in users from needlessly visiting login pages
  if (isAuthenticated && roleCookie) {
    if (pathname === "/staff-login" && roleCookie !== "CUSTOMER") {
      const targetDashboard = ROLE_ROUTE_MAP[roleCookie] || "/";
      return NextResponse.redirect(new URL(`${targetDashboard}/dashboard`, request.url));
    }
    if (pathname === "/customer/login" && roleCookie === "CUSTOMER") {
      return NextResponse.redirect(new URL("/customer/dashboard", request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/admin/:path*",
    "/product-manager/:path*",
    "/social-media-manager/:path*",
    "/customer/:path*",
    "/staff-login",
  ],
};

