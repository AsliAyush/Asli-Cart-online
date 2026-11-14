/**
 * Asli Cart Super Admin Settings & System Info Types
 */

import type { BackendMeData } from "@/types/auth";
import type { HealthStatusResponse } from "@/types/api";

export type AdminSettingsProfile = BackendMeData;
export type SystemHealthStatus = HealthStatusResponse;

export interface PlatformConfigInfo {
  environment: string;
  apiBaseUrl: string;
  authProvider: string;
  rbacEnforcement: string;
  databaseEngine: string;
}
