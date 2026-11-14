/**
 * Application Constants
 */
export const APP_CONFIG = {
  name: "Asli Cart",
  tagline: "Honest Discounts, Verified Deals, Real Savings",
  description:
    "India's transparent affiliate commerce platform bringing genuine discounts, real-time price drops, and verified merchant deals.",
  defaultApiBaseUrl: "http://localhost:5000/api/v1",
} as const;

/**
 * API Route Endpoints matching backend v1 architecture
 */
export const API_ENDPOINTS = {
  HEALTH: "/health",
  ADMIN: "/admin",
  PRODUCT_MANAGER: "/product-manager",
  SOCIAL_MEDIA_MANAGER: "/social-media-manager",
  CUSTOMER: "/customer",
} as const;

/**
 * Storage keys for upcoming phases
 */
export const STORAGE_KEYS = {
  THEME: "asli_cart_theme",
  AUTH_TOKEN: "asli_cart_token",
} as const;

