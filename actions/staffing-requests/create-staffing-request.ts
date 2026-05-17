"use server";

import { requireAuthContext } from "@/lib/auth/authorization";
import { assertCanManageStaffingRequests } from "@/lib/auth/staffing-requests-access";
import { createStaffingRequestCore } from "@/lib/staffing-requests/create-request";
import type { StaffingRequestFormInput } from "@/lib/validations/staffing-request";

export type CreateStaffingRequestState =
  | { status: "idle" }
  | { status: "success"; requestId: string }
  | { status: "error"; field?: string; message: string };

export async function createStaffingRequestAction(
  input: StaffingRequestFormInput,
): Promise<CreateStaffingRequestState> {
  try {
    const { context } = await requireAuthContext();
    const agencyId = context.agencyId;
    if (!agencyId) return { status: "error", message: "Agency context required." };

    await assertCanManageStaffingRequests(context.userId, agencyId);

    const result = await createStaffingRequestCore(agencyId, context.userId, input);
    if (!result.ok) {
      return {
        status: "error",
        field: result.field,
        message: result.message,
      };
    }

    return { status: "success", requestId: result.requestId };
  } catch (error) {
    console.error("createStaffingRequestAction failed", error);
    return {
      status: "error",
      message: error instanceof Error ? error.message : "Unable to save. Try again.",
    };
  }
}
