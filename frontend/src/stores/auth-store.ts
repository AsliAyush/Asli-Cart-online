import { create } from "zustand";
import type { AuthUser } from "@/types/auth";
import {
  setClientSessionCookies,
  clearClientSessionCookies,
  getClientCookie,
  SESSION_COOKIES,
} from "@/lib/session-cookie";

interface AuthState {
  user: AuthUser | null;
  accessToken: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  isInitialized: boolean;

  setAuth: (
    user: AuthUser,
    accessToken: string,
    refreshToken?: string | null
  ) => void;
  setAccessToken: (token: string) => void;
  clearAuth: () => void;
  setLoading: (loading: boolean) => void;
  setInitialized: (initialized: boolean) => void;
}

const STORAGE_KEYS = {
  USER: "asli_cart_user_state",
  ACCESS_TOKEN: "asli_cart_access_token",
};

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  accessToken: null,
  refreshToken: null,
  isAuthenticated: false,
  isLoading: false,
  isInitialized: false,

  setAuth: (user, accessToken, refreshToken = null) => {
    // Synchronize client session cookies for Next.js route protection
    setClientSessionCookies(accessToken, user.role);

    // Save in sessionStorage (cleared when browser tab closes)
    if (typeof window !== "undefined") {
      try {
        sessionStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(user));
        sessionStorage.setItem(STORAGE_KEYS.ACCESS_TOKEN, accessToken);
      } catch {
        // Safe fail if storage is restricted
      }
    }

    set({
      user,
      accessToken,
      refreshToken,
      isAuthenticated: true,
      isLoading: false,
      isInitialized: true,
    });
  },

  setAccessToken: (token) => {
    const currentUser = get().user;
    if (currentUser) {
      setClientSessionCookies(token, currentUser.role);
    }
    if (typeof window !== "undefined") {
      try {
        sessionStorage.setItem(STORAGE_KEYS.ACCESS_TOKEN, token);
      } catch {}
    }
    set({ accessToken: token });
  },

  clearAuth: () => {
    clearClientSessionCookies();

    if (typeof window !== "undefined") {
      try {
        sessionStorage.removeItem(STORAGE_KEYS.USER);
        sessionStorage.removeItem(STORAGE_KEYS.ACCESS_TOKEN);
      } catch {}
    }

    set({
      user: null,
      accessToken: null,
      refreshToken: null,
      isAuthenticated: false,
      isLoading: false,
      isInitialized: true,
    });
  },

  setLoading: (loading) => set({ isLoading: loading }),
  setInitialized: (initialized) => set({ isInitialized: initialized }),
}));

/**
 * Fast synchronous check to initialize from sessionStorage on client load.
 */
export function getSavedSession(): {
  user: AuthUser | null;
  accessToken: string | null;
} {
  if (typeof window === "undefined") {
    return { user: null, accessToken: null };
  }

  try {
    const rawUser = sessionStorage.getItem(STORAGE_KEYS.USER);
    const token =
      sessionStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN) ||
      getClientCookie(SESSION_COOKIES.TOKEN);

    if (rawUser && token) {
      return {
        user: JSON.parse(rawUser) as AuthUser,
        accessToken: token,
      };
    }
  } catch {
    // Ignore parse errors
  }

  return { user: null, accessToken: null };
}

