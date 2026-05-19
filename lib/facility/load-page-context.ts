import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { isFacilityRole } from "@/lib/auth/roles";
import { resolveFacilityContext } from "@/lib/facility/resolve-facility";

export async function loadFacilityPageContext(callbackPath: string) {
  const session = await auth();
  if (!session?.user?.id || !session.user.email) {
    redirect(`/login?callbackUrl=${encodeURIComponent(callbackPath)}`);
  }

  if (!session.user.primaryRole || !isFacilityRole(session.user.primaryRole)) {
    redirect("/dashboard?error=forbidden");
  }

  const resolved = await resolveFacilityContext(session.user.id, session.user.email);
  if (!resolved.ok) {
    return {
      linked: false as const,
      userName: session.user.name ?? session.user.email ?? "Facility user",
      userEmail: session.user.email,
    };
  }

  const name = session.user.name ?? session.user.email ?? "Facility user";
  const initials = name
    .split(/\s+/)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase() ?? "")
    .join("");

  return {
    linked: true as const,
    userId: session.user.id,
    userName: name,
    userInitials: initials || "FU",
    facility: resolved.context,
  };
}
