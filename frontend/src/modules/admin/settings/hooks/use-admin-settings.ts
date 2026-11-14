import { useQuery } from "@tanstack/react-query";
import { adminSettingsService } from "../settings.service";

export const ADMIN_SETTINGS_QUERY_KEYS = {
  profile: ["admin", "settings", "profile"] as const,
  health: ["admin", "settings", "health"] as const,
};

export function useAdminProfile() {
  return useQuery({
    queryKey: ADMIN_SETTINGS_QUERY_KEYS.profile,
    queryFn: () => adminSettingsService.getAdminProfile(),
    staleTime: 60 * 1000,
  });
}

export function useSystemHealth() {
  return useQuery({
    queryKey: ADMIN_SETTINGS_QUERY_KEYS.health,
    queryFn: () => adminSettingsService.getHealthStatus(),
    staleTime: 30 * 1000,
  });
}

