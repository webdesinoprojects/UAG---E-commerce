import { NextResponse, type NextRequest } from "next/server";
import {
  ADMIN_ACCESS_TOKEN_COOKIE,
  ADMIN_AUTH_COOKIE_PATH,
  ADMIN_REFRESH_TOKEN_COOKIE,
  ADMIN_REFRESH_TOKEN_MAX_AGE,
  LEGACY_ADMIN_AUTH_COOKIE_PATH,
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

// Raw Set-Cookie expiry. Next's response cookie store is keyed by cookie NAME
// and rewrites the entire `set-cookie` header on every set/delete, so it cannot
// set a cookie at one path and delete the same-named cookie at another path in
// one response (the calls collapse to whichever ran last). Appending the header
// directly is the only reliable way to expire the legacy `path=/admin` cookies
// next to the active `path=/` cookies. Call AFTER any `response.cookies.*` work,
// since those rewrite the whole header and would drop earlier manual appends.
function appendCookieExpiry(
  response: NextResponse,
  name: string,
  path: string
) {
  const secure = process.env.NODE_ENV === "production" ? "; Secure" : "";
  response.headers.append(
    "set-cookie",
    `${name}=; Path=${path}; Max-Age=0; HttpOnly; SameSite=Lax${secure}`
  );
}

// Expire only the legacy `path=/admin` cookies (used when the active session at
// `path=/` is staying). Stops the stale legacy cookies from shadowing the
// active ones on subsequent requests.
function expireLegacyAdminCookies(response: NextResponse) {
  appendCookieExpiry(
    response,
    ADMIN_ACCESS_TOKEN_COOKIE,
    LEGACY_ADMIN_AUTH_COOKIE_PATH
  );
  appendCookieExpiry(
    response,
    ADMIN_REFRESH_TOKEN_COOKIE,
    LEGACY_ADMIN_AUTH_COOKIE_PATH
  );
}

// Expire admin cookies on both the active and legacy paths. Used when the
// session is rejected so the browser is left with no admin cookies at all.
function expireAllAdminCookies(response: NextResponse) {
  for (const path of [ADMIN_AUTH_COOKIE_PATH, LEGACY_ADMIN_AUTH_COOKIE_PATH]) {
    appendCookieExpiry(response, ADMIN_ACCESS_TOKEN_COOKIE, path);
    appendCookieExpiry(response, ADMIN_REFRESH_TOKEN_COOKIE, path);
  }
}

function redirectToLoginAndClearCookies(request: NextRequest) {
  const { pathname, search } = request.nextUrl;
  const loginUrl = new URL("/admin/login", request.url);
  loginUrl.searchParams.set("next", `${pathname}${search}`);

  const response = NextResponse.redirect(loginUrl);
  expireAllAdminCookies(response);
  return response;
}

function unauthorizedApiAndClearCookies() {
  const response = NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  expireAllAdminCookies(response);
  return response;
}

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const isAdminPage = pathname.startsWith("/admin");
  const isAdminApi = pathname.startsWith("/api/admin");

  if ((!isAdminPage && !isAdminApi) || isAdminLoginPath(pathname)) {
    return NextResponse.next();
  }

  const accessToken = request.cookies.get(ADMIN_ACCESS_TOKEN_COOKIE)?.value;
  const refreshToken = request.cookies.get(ADMIN_REFRESH_TOKEN_COOKIE)?.value;

  // Hot path: token present and not near expiry. No network call. The active
  // cookie already lives in the browser, so we only purge any legacy `/admin`
  // cookie that might be shadowing it.
  if (
    accessToken &&
    !isJwtExpiredOrNearExpiry(accessToken, NEAR_EXPIRY_SKEW_SECONDS)
  ) {
    const response = NextResponse.next();
    expireLegacyAdminCookies(response);
    return response;
  }

  // Nothing to refresh from. Reject and drop every admin cookie.
  if (!refreshToken) {
    return isAdminApi
      ? unauthorizedApiAndClearCookies()
      : redirectToLoginAndClearCookies(request);
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
    return isAdminApi
      ? unauthorizedApiAndClearCookies()
      : redirectToLoginAndClearCookies(request);
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
  // Append legacy expiry AFTER the cookies.set calls above (each rewrites the
  // whole set-cookie header), so these manual deletions survive in the response.
  expireLegacyAdminCookies(response);

  return response;
}

export const config = {
  matcher: ["/admin/:path*", "/api/admin/:path*"],
};
