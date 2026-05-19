import {
  resolveCustomerFacilityScope,
  type CustomerFacilityScope,
} from "@/lib/customer-requests/facility-scope";
import {
  resolveConsumerCareScope,
  type ConsumerCareScope,
} from "@/lib/consumer/resolve-consumer-scope";

export type CustomerRequestScope =
  | ({ scopeType: "facility" } & CustomerFacilityScope)
  | ConsumerCareScope;

export type CustomerScopeResult =
  | { ok: true; scope: CustomerRequestScope }
  | {
      ok: false;
      reason: "no_facility" | "not_facility_user" | "not_consumer" | "no_care_site";
    };

export async function resolveCustomerOrConsumerScope(
  userId: string,
  userEmail: string,
): Promise<CustomerScopeResult> {
  const consumer = await resolveConsumerCareScope(userId);
  if (consumer.ok) {
    return { ok: true, scope: consumer.scope };
  }

  const facility = await resolveCustomerFacilityScope(userId, userEmail);
  if (facility.ok) {
    return {
      ok: true,
      scope: { scopeType: "facility", ...facility.scope },
    };
  }

  if (consumer.reason === "no_care_site") {
    return { ok: false, reason: "no_care_site" };
  }

  return { ok: false, reason: facility.reason };
}

export async function assertCustomerRequestAccess(
  userId: string,
  userEmail: string,
  requestFacilityId: string,
): Promise<boolean> {
  const scope = await resolveCustomerOrConsumerScope(userId, userEmail);
  if (!scope.ok) return false;
  return scope.scope.facilityId === requestFacilityId;
}
