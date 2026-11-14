import type { UserRole } from "@/types/auth";

export const SESSION_COOKIES = {
  ROLE: "asli_user_role",
  TOKEN: "asli_auth_token",
} as const;

/**
 * Saves client session cookies for Next.js route middleware inspection.
 * NOTE: These are client-managed session cookies, NOT HttpOnly. The actual
 * sensitive refresh token is maintained in an HttpOnly cookie set directly
 * by the Express.js backend.
 */
export function setClientSessionCookies(token: string, role: UserRole): void {
  if (typeof document === "undefined") return;

  const maxAge = 7 * 24 * 60 * 60; // 7 days matching backend refresh expiry
  const secure = window.location.protocol === "https:" ? "; Secure" : "";

  document.cookie = `${SESSION_COOKIES.TOKEN}=${encodeURIComponent(
    token
  )}; path=/; max-age=${maxAge}; SameSite=Lax${secure}`;
  document.cookie = `${SESSION_COOKIES.ROLE}=${encodeURIComponent(
    role
  )}; path=/; max-age=${maxAge}; SameSite=Lax${secure}`;
}

/**
 * Clears client session cookies on logout or session invalidation.
 */
export function clearClientSessionCookies(): void {
  if (typeof document === "undefined") return;

  document.cookie = `${SESSION_COOKIES.TOKEN}=; path=/; max-age=0; SameSite=Lax`;
  document.cookie = `${SESSION_COOKIES.ROLE}=; path=/; max-age=0; SameSite=Lax`;
}

/**
 * Reads a client cookie value by name.
 */
export function getClientCookie(name: string): string | null {
  if (typeof document === "undefined") return null;

  const matches = document.cookie.match(
    new RegExp(
      "(?:^|; )" +
        name.replace(/([\.$?*|{}\(\)\[\]\\\/\+^])/g, "\\$1") +
        "=([^;]*)"
    )
  );
  return matches ? decodeURIComponent(matches[1]) : null;
}

