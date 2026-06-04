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
import { getJwtExpiryMs, isJwtExpiredOrNearExpiry } from "@/lib/jwt";
import { refreshAdminSession } from "@/lib/admin-session-refresh";

// Skew before the access token's `exp` where the proxy proactively
// rotates so an in-flight Server Action does not hit a 401 mid-request.
const NEAR_EXPIRY_SKEW_SECONDS = 60;

function isAdminLoginPath(pathname: string) {
  return pathname === "/admin/login" || pathname.startsWith("/admin/login/");
}

function getUniqueCookieValues(request: NextRequest, name: string) {
  const seen = new Set<string>();
  const values: string[] = [];

  for (const cookie of request.cookies.getAll(name)) {
    const value = cookie.value;
    if (!value || seen.has(value)) continue;
    seen.add(value);
    values.push(value);
  }

  return values;
}

function getRemainingAccessTokenMaxAge(token: string) {
  const expiresAt = getJwtExpiryMs(token);

  if (!expiresAt) {
    return undefined;
  }

  const seconds = Math.floor((expiresAt - Date.now()) / 1000);
  return seconds > 0 ? getAccessTokenMaxAge(seconds) : undefined;
}

async function refreshWithAnyToken(input: {
  supabaseUrl: string;
  anonKey: string;
  refreshTokens: string[];
}) {
  for (const refreshToken of input.refreshTokens) {
    const refreshed = await refreshAdminSession({
      supabaseUrl: input.supabaseUrl,
      anonKey: input.anonKey,
      refreshToken,
    });

    if (refreshed) {
      return refreshed;
    }
  }

  return null;
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

  const accessTokens = getUniqueCookieValues(request, ADMIN_ACCESS_TOKEN_COOKIE);
  const refreshTokens = getUniqueCookieValues(
    request,
    ADMIN_REFRESH_TOKEN_COOKIE
  );
  const freshAccessToken = accessTokens.find(
    (token) => !isJwtExpiredOrNearExpiry(token, NEAR_EXPIRY_SKEW_SECONDS)
  );

  // Hot path: at least one access token is present and not near expiry. There
  // can temporarily be duplicate same-name cookies (`path=/admin` legacy plus
  // active `path=/`). Pick the fresh token for this request instead of trusting
  // whichever value the browser sent first.
  if (freshAccessToken) {
    request.cookies.set(ADMIN_ACCESS_TOKEN_COOKIE, freshAccessToken);

    const response = NextResponse.next({ request });
    response.cookies.set(
      ADMIN_ACCESS_TOKEN_COOKIE,
      freshAccessToken,
      getAdminAuthCookieOptions(getRemainingAccessTokenMaxAge(freshAccessToken))
    );

    // If this is an old login that only has one legacy refresh token, migrate it
    // to the active root path before expiring the legacy cookie. When multiple
    // values exist, keep the current active refresh token untouched.
    if (refreshTokens.length === 1) {
      response.cookies.set(
        ADMIN_REFRESH_TOKEN_COOKIE,
        refreshTokens[0],
        getAdminAuthCookieOptions(ADMIN_REFRESH_TOKEN_MAX_AGE)
      );
    }

    expireLegacyAdminCookies(response);
    return response;
  }

  // Nothing to refresh from. Reject and drop every admin cookie.
  if (refreshTokens.length === 0) {
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

  const refreshed = await refreshWithAnyToken({
    supabaseUrl,
    anonKey: supabaseAnonKey,
    refreshTokens,
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
