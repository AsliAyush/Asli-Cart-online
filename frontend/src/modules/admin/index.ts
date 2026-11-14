/**
 * Admin Module Barrel Export
 */
export const ADMIN_MODULE_METADATA = {
  name: "Admin Portal",
  role: "SUPER_ADMIN",
  basePath: "/admin",
} as const;

export * from "./auth";
export * from "./dashboard";
export * from "./users";
export * from "./roles";
export * from "./products";
export * from "./offers";
export * from "./audit-logs";
export * from "./settings";
