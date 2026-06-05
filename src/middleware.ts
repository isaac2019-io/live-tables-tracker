import { jwtVerify } from "jose";
import { NextResponse, type NextRequest } from "next/server";

const PUBLIC_API_PATHS = [
  "/api/auth/login",
  "/api/auth/logout",
  "/api/cron/daily",
  "/api/sync/public",
];

function isPublicApiPath(pathname: string) {
  return PUBLIC_API_PATHS.some(
    (path) => pathname === path || pathname.startsWith(`${path}/`),
  );
}

function requiresAuth(pathname: string) {
  if (pathname.startsWith("/admin")) return true;
  if (pathname.startsWith("/api/") && !isPublicApiPath(pathname)) return true;
  return false;
}

function getSecret() {
  return new TextEncoder().encode(
    process.env.AUTH_SECRET ?? "development-secret-change-me",
  );
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/favicon.ico") ||
    pathname.endsWith(".png") ||
    pathname.endsWith(".svg")
  ) {
    return NextResponse.next();
  }

  if (!requiresAuth(pathname)) {
    return NextResponse.next();
  }

  const token = request.cookies.get("session")?.value;
  if (!token) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("next", pathname);
    return NextResponse.redirect(loginUrl);
  }

  try {
    await jwtVerify(token, getSecret());
    return NextResponse.next();
  } catch {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("next", pathname);
    return NextResponse.redirect(loginUrl);
  }
}

export const config = {
  matcher: ["/((?!_next/static|_next/image).*)"],
};
