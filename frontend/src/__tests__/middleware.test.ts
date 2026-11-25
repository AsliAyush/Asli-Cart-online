import { describe, it, expect } from "vitest";
import { NextRequest } from "next/server";
import { middleware } from "../middleware";
import { SESSION_COOKIES } from "../lib/session-cookie";

function createMockRequest(
  urlPath: string,
  cookieValues: { token?: string; role?: string } = {}
): NextRequest {
  const url = `http://localhost:3000${urlPath}`;
  const req = new NextRequest(url);

  if (cookieValues.token) {
    req.cookies.set(SESSION_COOKIES.TOKEN, cookieValues.token);
  }
  if (cookieValues.role) {
    req.cookies.set(SESSION_COOKIES.ROLE, cookieValues.role);
  }

  return req;
}

describe("Next.js Middleware RBAC Route Protection", () => {
  it("MW-01: unauthenticated user accessing /product-manager is redirected to /staff-login", () => {
    const req = createMockRequest("/product-manager/offers");
    const res = middleware(req);

    expect(res.status).toBe(307);
    const redirectLocation = res.headers.get("location") || "";
    expect(redirectLocation).toContain("/staff-login");
    expect(redirectLocation).toContain("returnUrl=%2Fproduct-manager%2Foffers");
  });

  it("MW-02: PRODUCT_MANAGER can access /product-manager routes", () => {
    const req = createMockRequest("/product-manager/offers", {
      token: "mock-pm-token",
      role: "PRODUCT_MANAGER",
    });
    const res = middleware(req);

    // Allowed (NextResponse.next() status is 200)
    expect(res.status).toBe(200);
    expect(res.headers.get("location")).toBeNull();
  });

  it("MW-03: SUPER_ADMIN can access /product-manager routes where backend RBAC permits", () => {
    const req = createMockRequest("/product-manager/offers", {
      token: "mock-admin-token",
      role: "SUPER_ADMIN",
    });
    const res = middleware(req);

    // Allowed without redirection
    expect(res.status).toBe(200);
    expect(res.headers.get("location")).toBeNull();
  });

  it("MW-04: CUSTOMER is rejected from /product-manager routes and redirected to /unauthorized", () => {
    const req = createMockRequest("/product-manager/offers", {
      token: "mock-customer-token",
      role: "CUSTOMER",
    });
    const res = middleware(req);

    expect(res.status).toBe(307);
    const redirectLocation = res.headers.get("location") || "";
    expect(redirectLocation).toContain("/unauthorized");
    expect(redirectLocation).toContain("requiredRole=PRODUCT_MANAGER");
  });

  it("MW-05: SUPER_ADMIN can access /admin routes", () => {
    const req = createMockRequest("/admin/dashboard", {
      token: "mock-admin-token",
      role: "SUPER_ADMIN",
    });
    const res = middleware(req);

    expect(res.status).toBe(200);
  });

  it("MW-06: PRODUCT_MANAGER cannot access /admin routes and is redirected to /unauthorized", () => {
    const req = createMockRequest("/admin/dashboard", {
      token: "mock-pm-token",
      role: "PRODUCT_MANAGER",
    });
    const res = middleware(req);

    expect(res.status).toBe(307);
    const redirectLocation = res.headers.get("location") || "";
    expect(redirectLocation).toContain("/unauthorized");
    expect(redirectLocation).toContain("requiredRole=SUPER_ADMIN");
  });
});
