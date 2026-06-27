export const CART_COOKIE_NAME = "uag_cart";
export const CART_COOKIE_PATH = "/";
export const CART_COOKIE_MAX_AGE = 60 * 60 * 24 * 30;

export interface CartCookieOptions {
  httpOnly: true;
  secure: boolean;
  sameSite: "lax";
  path: typeof CART_COOKIE_PATH;
  maxAge: number;
}

export function getCartCookieOptions(): CartCookieOptions {
  return {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: CART_COOKIE_PATH,
    maxAge: CART_COOKIE_MAX_AGE,
  };
}
