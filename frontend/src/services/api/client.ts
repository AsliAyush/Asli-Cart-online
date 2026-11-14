import axios, { type AxiosInstance } from "axios";
import { setupInterceptors } from "./interceptors";
import { APP_CONFIG } from "@/lib/constants";

/**
 * Resolved API Base URL from environment variable or fallback to standard config.
 * Centralized here to avoid hardcoding across components and services.
 */
export const API_BASE_URL: string =
  process.env.NEXT_PUBLIC_API_BASE_URL || APP_CONFIG.defaultApiBaseUrl;

/**
 * Centralized Axios API client instance for Asli Cart.
 */
export const apiClient: AxiosInstance = setupInterceptors(
  axios.create({
    baseURL: API_BASE_URL,
    timeout: 15000,
    withCredentials: true,
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
    },
  })
);

export default apiClient;

