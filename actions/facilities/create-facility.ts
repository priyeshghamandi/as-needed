"use server";

import { requireAuthContext } from "@/lib/auth/authorization";
import { assertCanManageFacilities } from "@/lib/auth/facilities-access";
import { createFacilityCore } from "@/lib/facilities/create-facility-core";
import type { FacilityInput } from "@/lib/validations/facility";

export type CreateFacilityState =
  | { status: "idle" }
  | { status: "success"; facilityId: string; inviteUrl?: string }
  | { status: "error"; field?: string; message: string };

export async function createFacilityAction(input: FacilityInput): Promise<CreateFacilityState> {
  try {
    const { context } = await requireAuthContext();
    const agencyId = context.agencyId;
    if (!agencyId) return { status: "error", message: "Agency context required." };

    await assertCanManageFacilities(context.userId, agencyId);

    const result = await createFacilityCore(agencyId, context.userId, input);
    if (!result.ok) {
      return {
        status: "error",
        field: result.field,
        message: result.message,
      };
    }

    return {
      status: "success",
      facilityId: result.facilityId,
      inviteUrl: result.inviteUrl,
    };
  } catch (error) {
    console.error("createFacilityAction failed", error);
    return {
      status: "error",
      message: error instanceof Error ? error.message : "Unable to save. Try again.",
    };
  }
}
