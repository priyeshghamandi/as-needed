"use server";

import { requireAuthContext } from "@/lib/auth/authorization";
import { assertCanManageStaffingRequests } from "@/lib/auth/staffing-requests-access";
import { publishStaffingRequestDraftCore } from "@/lib/staffing-requests/publish-draft";
import type { StaffingRequestCreateInput } from "@/lib/validations/staffing-request";

export type PublishDraftState =
  | { status: "success"; requestId: string }
  | { status: "error"; field?: string; message: string };

export async function publishStaffingRequestDraftAction(
  requestId: string,
  input: StaffingRequestCreateInput,
): Promise<PublishDraftState> {
  try {
    const { context } = await requireAuthContext();
    const agencyId = context.agencyId;
    if (!agencyId) return { status: "error", message: "Agency context required." };

    await assertCanManageStaffingRequests(context.userId, agencyId);

    const result = await publishStaffingRequestDraftCore(agencyId, requestId, input);
    if (!result.ok) {
      return {
        status: "error",
        field: result.field,
        message: result.message,
      };
    }

    return { status: "success", requestId: result.requestId };
  } catch (error) {
    console.error("publishStaffingRequestDraftAction failed", error);
    return {
      status: "error",
      message: error instanceof Error ? error.message : "Unable to publish draft.",
    };
  }
}
