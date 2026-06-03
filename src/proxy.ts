import { NextResponse, type NextRequest } from "next/server";
import {
  ADMIN_ACCESS_TOKEN_COOKIE,
  ADMIN_AUTH_COOKIE_PATH,
  ADMIN_REFRESH_TOKEN_COOKIE,
  ADMIN_REFRESH_TOKEN_MAX_AGE,
  getAccessTokenMaxAge,
  getAdminAuthCookieOptions,
} from "@/lib/admin-auth-cookies";
import { isJwtExpiredOrNearExpiry } from "@/lib/jwt";
import { refreshAdminSession } from "@/lib/admin-session-refresh";

// Skew before the access token's `exp` where the proxy proactively
// rotates so an in-flight Server Action does not hit a 401 mid-request.
const NEAR_EXPIRY_SKEW_SECONDS = 60;

function isAdminLoginPath(pathname: string) {
  return pathname === "/admin/login" || pathname.startsWith("/admin/login/");
}

function redirectToLoginAndClearCookies(request: NextRequest) {
  const { pathname, search } = request.nextUrl;
  const loginUrl = new URL("/admin/login", request.url);
  loginUrl.searchParams.set("next", `${pathname}${search}`);

  const response = NextResponse.redirect(loginUrl);
  response.cookies.delete({
    name: ADMIN_ACCESS_TOKEN_COOKIE,
    path: ADMIN_AUTH_COOKIE_PATH,
  });
  response.cookies.delete({
    name: ADMIN_REFRESH_TOKEN_COOKIE,
    path: ADMIN_AUTH_COOKIE_PATH,
  });
  return response;
}

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (!pathname.startsWith("/admin") || isAdminLoginPath(pathname)) {
    return NextResponse.next();
  }

  const accessToken = request.cookies.get(ADMIN_ACCESS_TOKEN_COOKIE)?.value;
  const refreshToken = request.cookies.get(ADMIN_REFRESH_TOKEN_COOKIE)?.value;

  // Hot path: token present and not near expiry. No network call.
  if (
    accessToken &&
    !isJwtExpiredOrNearExpiry(accessToken, NEAR_EXPIRY_SKEW_SECONDS)
  ) {
    return NextResponse.next();
  }

  // Nothing to refresh from. Send to login and drop any stale access cookie.
  if (!refreshToken) {
    return redirectToLoginAndClearCookies(request);
  }

  const supabaseUrl = process.env.SUPABASE_URL;
  const supabaseAnonKey = process.env.SUPABASE_ANON_KEY;

  // If env is missing we cannot refresh from the edge. Fall through and
  // let `requireAdmin()` surface the misconfiguration server-side rather
  // than redirect-looping at the proxy.
  if (!supabaseUrl || !supabaseAnonKey) {
    return NextResponse.next();
  }

  const refreshed = await refreshAdminSession({
    supabaseUrl,
    anonKey: supabaseAnonKey,
    refreshToken,
  });

  if (!refreshed) {
    return redirectToLoginAndClearCookies(request);
  }

  // Propagate the rotated tokens to downstream Server Components on the
  // same request so `requireAdmin()` validates the new access token now,
  // instead of failing once with the old token before the browser sends
  // the rotated cookie back.
  request.cookies.set(ADMIN_ACCESS_TOKEN_COOKIE, refreshed.access_token);
  request.cookies.set(ADMIN_REFRESH_TOKEN_COOKIE, refreshed.refresh_token);

  const response = NextResponse.next({ request });

  response.cookies.set(
    ADMIN_ACCESS_TOKEN_COOKIE,
    refreshed.access_token,
    getAdminAuthCookieOptions(getAccessTokenMaxAge(refreshed.expires_in))
  );
  response.cookies.set(
    ADMIN_REFRESH_TOKEN_COOKIE,
    refreshed.refresh_token,
    getAdminAuthCookieOptions(ADMIN_REFRESH_TOKEN_MAX_AGE)
  );

  return response;
}

export const config = {
  matcher: ["/admin/:path*"],
};
