import { ForbiddenError, UnauthorizedError } from "@/lib/auth/authorization";
import { isCustomerRole } from "@/lib/auth/roles";
import type { AppRole } from "@/lib/auth/roles";

export function assertCustomerRole(primaryRole: AppRole | null | undefined): void {
  if (!primaryRole || !isCustomerRole(primaryRole)) {
    throw new ForbiddenError("Customer access required.");
  }
}

/** @deprecated Use assertCustomerRole */
export const assertFacilityUserRole = assertCustomerRole;

export async function requireCustomerContext(
  context: {
    userId: string;
    primaryRole: AppRole | null | undefined;
  },
  sessionEmail: string | null | undefined,
): Promise<{ userId: string; email: string }> {
  if (!sessionEmail) {
    throw new UnauthorizedError();
  }
  assertCustomerRole(context.primaryRole);
  return { userId: context.userId, email: sessionEmail };
}

/** @deprecated Use requireCustomerContext */
export const requireFacilityCustomerContext = requireCustomerContext;
