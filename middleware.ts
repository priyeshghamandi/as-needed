import NextAuth from "next-auth";
import { NextResponse } from "next/server";
import { authConfig } from "@/auth.config";
import { canAccessPath } from "@/lib/auth/path-access";
import { getPostLoginRedirect, getUnauthorizedRedirect } from "@/lib/auth/redirects";
import type { ScopedRole } from "@/lib/auth/roles";
import { isPublicPath } from "@/lib/auth/routes";

const { auth } = NextAuth(authConfig);

export default auth((req) => {
  const { pathname } = req.nextUrl;
  const session = req.auth;
  const isLoggedIn = Boolean(session?.user?.id);

  if (isPublicPath(pathname)) {
    if (isLoggedIn && (pathname === "/login" || pathname === "/signup")) {
      const roles = (session?.user?.roles ?? []) as ScopedRole[];
      const redirectUrl = getPostLoginRedirect(roles);
      return NextResponse.redirect(new URL(redirectUrl, req.url));
    }
    return NextResponse.next();
  }

  if (!isLoggedIn) {
    const loginUrl = new URL("/login", req.url);
    loginUrl.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(loginUrl);
  }

  const roles = (session?.user?.roles ?? []) as ScopedRole[];

  if (!canAccessPath(pathname, roles)) {
    const redirectUrl = getUnauthorizedRedirect(roles);
    return NextResponse.redirect(new URL(redirectUrl, req.url));
  }

  return NextResponse.next();
});

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
