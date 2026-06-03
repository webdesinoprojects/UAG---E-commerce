import "server-only";

export {
  ADMIN_ACCESS_TOKEN_COOKIE,
  ADMIN_REFRESH_TOKEN_COOKIE,
  ADMIN_AUTH_COOKIE_PATH,
  ADMIN_REFRESH_TOKEN_MAX_AGE,
  getAdminAuthCookieOptions,
  getAccessTokenMaxAge,
} from "@/lib/admin-auth-cookies";
