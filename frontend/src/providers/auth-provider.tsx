"use client";

import React, { useEffect } from "react";
import { useAuthStore, getSavedSession } from "@/stores/auth-store";
import { authService } from "@/services/auth";
import { getClientCookie, SESSION_COOKIES } from "@/lib/session-cookie";

interface AuthProviderProps {
  children: React.ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const { setAuth, clearAuth, setInitialized, isInitialized } = useAuthStore();

  useEffect(() => {
    // Only run on client mount
    if (isInitialized) return;

    let isMounted = true;

    async function restoreSession() {
      const saved = getSavedSession();

      if (saved.user && saved.accessToken) {
        // Fast optimistic hydration from secure session cache
        setAuth(saved.user, saved.accessToken);

        // Verify with backend in background
        try {
          const freshUser = await authService.getCurrentUser(saved.user.role);
          if (isMounted) {
            setAuth(freshUser, saved.accessToken);
          }
        } catch (err: any) {
          // If token expired, try refreshing
          if (err?.statusCode === 401) {
            try {
              const isStaff = saved.user.role !== "CUSTOMER";
              const newTokens = await authService.refreshTokens(isStaff);
              const freshUser = await authService.getCurrentUser(saved.user.role);
              if (isMounted) {
                setAuth(freshUser, newTokens.accessToken, newTokens.refreshToken);
              }
            } catch {
              if (isMounted) {
                clearAuth();
              }
            }
          }
        }
      } else {
        // Attempt passive refresh using backend HttpOnly cookie if session indicators exist
        const hasSessionIndicator =
          getClientCookie(SESSION_COOKIES.TOKEN) ||
          getClientCookie(SESSION_COOKIES.ROLE);

        if (hasSessionIndicator) {
          try {
            const newTokens = await authService.refreshTokens(false);
            const freshUser = await authService.getCurrentUser();
            if (isMounted) {
              setAuth(freshUser, newTokens.accessToken, newTokens.refreshToken);
            }
          } catch {
            // Expired or invalid session
            if (isMounted) {
              clearAuth();
            }
          }
        } else {
          // Guest visitor - no previous session exists, skip network refresh
          if (isMounted) {
            clearAuth();
          }
        }
      }

      if (isMounted) {
        setInitialized(true);
      }
    }

    restoreSession();

    return () => {
      isMounted = false;
    };
  }, [setAuth, clearAuth, setInitialized, isInitialized]);

  return <>{children}</>;
}

