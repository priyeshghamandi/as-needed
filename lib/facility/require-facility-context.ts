import { ForbiddenError, requireAuthContext, UnauthorizedError } from "@/lib/auth/authorization";
import { isFacilityRole, type AppRole } from "@/lib/auth/roles";
import {
  resolveFacilityContext,
  type FacilityContext,
} from "@/lib/facility/resolve-facility";

export class FacilityNotLinkedError extends Error {
  constructor(message = "No facility linked to your account.") {
    super(message);
    this.name = "FacilityNotLinkedError";
  }
}

export type LinkedFacilityContext = {
  userId: string;
  userEmail: string;
  userName: string | null;
  facility: FacilityContext;
};

export async function requireFacilityContext(): Promise<LinkedFacilityContext> {
  const { session, context } = await requireAuthContext();
  const email = session.user?.email;
  if (!email) {
    throw new UnauthorizedError();
  }

  if (!isFacilityRole((context.primaryRole ?? "") as AppRole)) {
    throw new ForbiddenError("Facility access required.");
  }

  const resolved = await resolveFacilityContext(context.userId, email);
  if (!resolved.ok) {
    throw new FacilityNotLinkedError();
  }

  return {
    userId: context.userId,
    userEmail: email,
    userName: session.user?.name ?? null,
    facility: resolved.context,
  };
}
