import { NextResponse } from "next/server";

// Routes accessible without authentication
const PUBLIC_ROUTES = new Set(["/login", "/otp"]);

export function middleware(request) {
  const { pathname } = request.nextUrl;
  const token = request.cookies.get("admin_token")?.value;
  const isLoggedIn = !!token;

  // Root redirect — never show 404
  if (pathname === "/") {
    return NextResponse.redirect(
      new URL(isLoggedIn ? "/admin/overview" : "/login", request.url)
    );
  }

  const isPublic =
    PUBLIC_ROUTES.has(pathname) ||
    [...PUBLIC_ROUTES].some((r) => pathname.startsWith(r + "/"));

  const isProtected = pathname.startsWith("/admin");

  // Unauthenticated user hitting a protected route → login
  if (!isLoggedIn && isProtected) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("redirect", pathname);
    return NextResponse.redirect(loginUrl);
  }

  // Authenticated user hitting a public (auth) route → dashboard
  if (isLoggedIn && isPublic) {
    return NextResponse.redirect(new URL("/admin/overview", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon\\.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|woff|woff2|ttf|otf|eot)).*)",
  ],
};
