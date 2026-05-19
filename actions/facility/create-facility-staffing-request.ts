"use server";

import { revalidatePath } from "next/cache";
import {
  FacilityNotLinkedError,
  requireFacilityContext,
} from "@/lib/facility/require-facility-context";
import { createFacilityStaffingRequest } from "@/lib/facility/create-facility-request";
import type { FacilityStaffingRequestInput } from "@/lib/validations/facility-staffing-request";

export type CreateFacilityStaffingRequestState =
  | { status: "idle" }
  | { status: "success"; requestId: string }
  | { status: "error"; message: string; field?: string };

export async function createFacilityStaffingRequestAction(
  input: FacilityStaffingRequestInput,
): Promise<CreateFacilityStaffingRequestState> {
  try {
    const ctx = await requireFacilityContext();
    const result = await createFacilityStaffingRequest(
      ctx.facility,
      ctx.userId,
      input,
    );

    if (!result.ok) {
      return {
        status: "error",
        message: result.message,
        field: result.field,
      };
    }

    revalidatePath("/facility/dashboard");
    revalidatePath("/facility/requests");

    return { status: "success", requestId: result.requestId };
  } catch (error) {
    if (error instanceof FacilityNotLinkedError) {
      return { status: "error", message: error.message };
    }
    console.error("createFacilityStaffingRequestAction failed", error);
    return {
      status: "error",
      message:
        error instanceof Error ? error.message : "Unable to create staffing request.",
    };
  }
}
