"use client";

import React from "react";
import { QueryProvider } from "./query-provider";
import { ThemeProvider } from "./theme-provider";
import { ToastProvider } from "./toast-provider";
import { AuthProvider } from "./auth-provider";

interface AppProvidersProps {
  children: React.ReactNode;
}

/**
 * Centralized Application Providers Wrapper
 * Encapsulates React Query, Auth initialization, theme management, and notifications.
 */
export function AppProviders({ children }: AppProvidersProps) {
  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="light"
      enableSystem
      disableTransitionOnChange
    >
      <QueryProvider>
        <AuthProvider>
          {children}
          <ToastProvider />
        </AuthProvider>
      </QueryProvider>
    </ThemeProvider>
  );
}
