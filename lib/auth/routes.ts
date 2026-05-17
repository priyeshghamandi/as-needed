export const PUBLIC_PATHS = [
  "/",
  "/signup",
  "/login",
  "/invite",
] as const;

export const AUTH_API_PREFIX = "/api/auth";

export function isPublicPath(pathname: string): boolean {
  if (pathname.startsWith(AUTH_API_PREFIX)) return true;
  if (pathname.startsWith("/api/places")) return true;
  if (pathname === "/api/invites/accept") return true;
  if (pathname.startsWith("/invite/")) return true;

  return PUBLIC_PATHS.some(
    (p) => pathname === p || (p !== "/" && pathname.startsWith(`${p}/`)),
  );
}
