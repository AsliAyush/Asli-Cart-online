/**
 * Product Manager Module
 *
 * Scope: Product catalog, deals, offers, categories, affiliate merchant link
 * ingestion, price tracking, and deal verification workflow.
 */

export const PRODUCT_MANAGER_MODULE_METADATA = {
  name: "Product Manager Portal",
  role: "PRODUCT_MANAGER",
  basePath: "/product-manager",
} as const;

export * from "./dashboard";
export * from "./discovery";
export * from "./products";
export * from "./pricing";
export * from "./offers";
export * from "./affiliate";
