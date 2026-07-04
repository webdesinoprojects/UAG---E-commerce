export const CHECKOUT_ORDER_ACCESS_COOKIE = "uag_checkout_order_access";
export const CHECKOUT_ORDER_ACCESS_MAX_AGE = 60 * 60 * 24;

export function getCheckoutOrderAccessCookieOptions() {
  return {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax" as const,
    path: "/",
    maxAge: CHECKOUT_ORDER_ACCESS_MAX_AGE,
  };
}
