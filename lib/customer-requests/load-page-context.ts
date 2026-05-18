import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { isFacilityRole } from "@/lib/auth/roles";
import { resolveCustomerFacilityScope } from "@/lib/customer-requests/facility-scope";

export async function loadCustomerRequestsPageContext() {
  const session = await auth();
  if (!session?.user?.id || !session.user.email) {
    redirect("/login?callbackUrl=/customer/requests");
  }

  if (!session.user.primaryRole || !isFacilityRole(session.user.primaryRole)) {
    redirect("/dashboard?error=forbidden");
  }

  const scopeResult = await resolveCustomerFacilityScope(
    session.user.id,
    session.user.email,
  );

  if (!scopeResult.ok) {
    redirect("/facility?error=no_facility_linked");
  }

  const name = session.user.name ?? "Facility user";
  const initials = name
    .split(/\s+/)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase() ?? "")
    .join("");

  return {
    userId: session.user.id,
    userName: name,
    userInitials: initials || "FU",
    scope: scopeResult.scope,
  };
}
