import { ForbiddenError, UnauthorizedError } from "@/lib/auth/authorization";
import { isFacilityRole } from "@/lib/auth/roles";
import type { AppRole } from "@/lib/auth/roles";

export function assertFacilityUserRole(primaryRole: AppRole | null | undefined): void {
  if (!primaryRole || !isFacilityRole(primaryRole)) {
    throw new ForbiddenError("Facility customer access required.");
  }
}

export async function requireFacilityCustomerContext(
  context: {
    userId: string;
    primaryRole: AppRole | null | undefined;
  },
  sessionEmail: string | null | undefined,
): Promise<{ userId: string; email: string }> {
  if (!sessionEmail) {
    throw new UnauthorizedError();
  }
  assertFacilityUserRole(context.primaryRole);
  return { userId: context.userId, email: sessionEmail };
}
