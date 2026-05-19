import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { isCustomerRole } from "@/lib/auth/roles";
import { resolveCustomerOrConsumerScope } from "@/lib/customer-requests/customer-scope";

export async function loadCustomerRequestsPageContext() {
  const session = await auth();
  if (!session?.user?.id || !session.user.email) {
    redirect("/login?callbackUrl=/customer/requests");
  }

  if (!session.user.primaryRole || !isCustomerRole(session.user.primaryRole)) {
    redirect("/dashboard?error=forbidden");
  }

  const scopeResult = await resolveCustomerOrConsumerScope(
    session.user.id,
    session.user.email,
  );

  if (!scopeResult.ok) {
    if (scopeResult.reason === "no_care_site") {
      redirect("/care/onboarding");
    }
    redirect("/facility?error=no_facility_linked");
  }

  const scope = scopeResult.scope;
  const isConsumer = scope.scopeType === "consumer";
  const name = session.user.name ?? (isConsumer ? "Care seeker" : "Facility user");
  const initials = name
    .split(/\s+/)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase() ?? "")
    .join("");

  return {
    userId: session.user.id,
    userName: name,
    userInitials: initials || (isConsumer ? "CS" : "FU"),
    scope,
    isConsumer,
    facilityName: scope.facilityName,
    agencyName: scope.scopeType === "facility" ? scope.agencyName : null,
    navRequestsLabel: isConsumer ? "My care requests" : "My staffing requests",
  };
}
