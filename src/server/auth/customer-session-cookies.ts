import "server-only";

import { cookies } from "next/headers";
import {
  ADMIN_ACCESS_TOKEN_COOKIE,
  ADMIN_AUTH_COOKIE_PATH,
  ADMIN_REFRESH_TOKEN_COOKIE,
} from "@/server/auth/cookies";
import {
  CUSTOMER_ACCESS_TOKEN_COOKIE,
  CUSTOMER_REFRESH_TOKEN_COOKIE,
  CUSTOMER_REFRESH_TOKEN_MAX_AGE,
  getCustomerAccessTokenMaxAge,
  getCustomerAuthCookieOptions,
} from "@/lib/customer-auth-cookies";

export async function setCustomerSessionCookies(input: {
  accessToken: string;
  refreshToken: string;
  expiresIn?: number;
}) {
  const cookieStore = await cookies();

  cookieStore.delete({
    name: ADMIN_ACCESS_TOKEN_COOKIE,
    path: ADMIN_AUTH_COOKIE_PATH,
  });
  cookieStore.delete({
    name: ADMIN_REFRESH_TOKEN_COOKIE,
    path: ADMIN_AUTH_COOKIE_PATH,
  });

  cookieStore.set(
    CUSTOMER_ACCESS_TOKEN_COOKIE,
    input.accessToken,
    getCustomerAuthCookieOptions(
      getCustomerAccessTokenMaxAge(input.expiresIn)
    )
  );

  cookieStore.set(
    CUSTOMER_REFRESH_TOKEN_COOKIE,
    input.refreshToken,
    getCustomerAuthCookieOptions(CUSTOMER_REFRESH_TOKEN_MAX_AGE)
  );
}
