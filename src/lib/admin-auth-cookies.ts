export const ADMIN_ACCESS_TOKEN_COOKIE = "uag_admin_access_token";
export const ADMIN_REFRESH_TOKEN_COOKIE = "uag_admin_refresh_token";

export const ADMIN_AUTH_COOKIE_PATH = "/";
export const LEGACY_ADMIN_AUTH_COOKIE_PATH = "/admin";
export const ADMIN_AUTH_COOKIE_DELETE_PATHS = [
  ADMIN_AUTH_COOKIE_PATH,
  LEGACY_ADMIN_AUTH_COOKIE_PATH,
] as const;

const DEFAULT_ACCESS_TOKEN_MAX_AGE = 60 * 60;
const MIN_ACCESS_TOKEN_MAX_AGE = 60;
const MAX_ACCESS_TOKEN_MAX_AGE = 60 * 60 * 24;

export const ADMIN_REFRESH_TOKEN_MAX_AGE = 60 * 60 * 24 * 7;

export interface AdminAuthCookieOptions {
  httpOnly: true;
  secure: boolean;
  sameSite: "lax";
  path: typeof ADMIN_AUTH_COOKIE_PATH;
  maxAge?: number;
}

export function getAdminAuthCookieOptions(
  maxAge?: number
): AdminAuthCookieOptions {
  return {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: ADMIN_AUTH_COOKIE_PATH,
    // Preserve an explicit `maxAge: 0` so the same helper can be reused for
    // cookie deletion. A truthy check would drop zero and leave the cookie.
    ...(maxAge !== undefined ? { maxAge } : {}),
  };
}

export function getAccessTokenMaxAge(expiresIn: number | undefined) {
  if (!expiresIn || !Number.isFinite(expiresIn)) {
    return DEFAULT_ACCESS_TOKEN_MAX_AGE;
  }

  return Math.max(
    MIN_ACCESS_TOKEN_MAX_AGE,
    Math.min(expiresIn, MAX_ACCESS_TOKEN_MAX_AGE)
  );
}
