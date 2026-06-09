import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { AUTH_COOKIE_NAME } from "@/lib/auth-constants";

const PUBLIC_PATHS = ["/login"];

/**
 * Protecție rută bazată pe cookie `auth_token`.
 * La login, auth.ts setează același token în localStorage (pentru fetch)
 * și în cookie (pentru Edge middleware).
 * Fără cookie: utilizatorul vede /login chiar dacă tokenul ar exista doar în localStorage.
 */
export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const isPublic = PUBLIC_PATHS.some(
    (p) => pathname === p || pathname.startsWith(`${p}/`),
  );
  const rawToken = request.cookies.get(AUTH_COOKIE_NAME)?.value;
  const token = rawToken
    ? (() => {
        try {
          return decodeURIComponent(rawToken);
        } catch {
          return rawToken;
        }
      })()
    : undefined;

  if (!token && !isPublic) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("from", pathname);
    return NextResponse.redirect(loginUrl);
  }

  if (token && pathname === "/login") {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
