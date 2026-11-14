/**
 * Customer Module
 *
 * Core export barrel for customer storefront features, multi-merchant comparisons,
 * cart preparation, wishlist monitoring, and profile management.
 */

export * from "./types";
export * from "./validators";
export * from "./services";
export * from "./hooks";
export * from "./components";

export const CUSTOMER_MODULE_METADATA = {
  name: "Customer Storefront",
  role: "CUSTOMER",
  basePath: "/",
} as const;
