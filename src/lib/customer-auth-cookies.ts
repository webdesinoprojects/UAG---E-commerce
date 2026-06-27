export const CUSTOMER_ACCESS_TOKEN_COOKIE = "uag_customer_access_token";
export const CUSTOMER_REFRESH_TOKEN_COOKIE = "uag_customer_refresh_token";

export const CUSTOMER_AUTH_COOKIE_PATH = "/";

const DEFAULT_ACCESS_TOKEN_MAX_AGE = 60 * 60;
const MIN_ACCESS_TOKEN_MAX_AGE = 60;
const MAX_ACCESS_TOKEN_MAX_AGE = 60 * 60 * 24;

export const CUSTOMER_REFRESH_TOKEN_MAX_AGE = 60 * 60 * 24 * 30;

export interface CustomerAuthCookieOptions {
  httpOnly: true;
  secure: boolean;
  sameSite: "lax";
  path: typeof CUSTOMER_AUTH_COOKIE_PATH;
  maxAge?: number;
}

export function getCustomerAuthCookieOptions(
  maxAge?: number
): CustomerAuthCookieOptions {
  return {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: CUSTOMER_AUTH_COOKIE_PATH,
    ...(maxAge !== undefined ? { maxAge } : {}),
  };
}

export function getCustomerAccessTokenMaxAge(expiresIn: number | undefined) {
  if (!expiresIn || !Number.isFinite(expiresIn)) {
    return DEFAULT_ACCESS_TOKEN_MAX_AGE;
  }

  return Math.max(
    MIN_ACCESS_TOKEN_MAX_AGE,
    Math.min(expiresIn, MAX_ACCESS_TOKEN_MAX_AGE)
  );
}
