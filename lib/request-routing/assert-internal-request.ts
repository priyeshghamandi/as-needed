import { env } from "@/data/env/server";

export function assertInternalRequest(request: Request): boolean {
  const key = request.headers.get("x-asneeded-internal-key");
  return Boolean(key && key === env.AUTH_SECRET);
}
