"use server";

import { requireAuthContext } from "@/lib/auth/authorization";
import { assertCanManageStaffingRequests } from "@/lib/auth/staffing-requests-access";
import { transitionStaffingRequestCore } from "@/lib/staffing-requests/transition-request";

export type TransitionStatusState =
  | { status: "success"; requestId: string; newStatus: string }
  | { status: "error"; message: string };

export async function transitionStaffingRequestStatusAction(
  requestId: string,
  toStatus: string,
): Promise<TransitionStatusState> {
  try {
    const { context } = await requireAuthContext();
    const agencyId = context.agencyId;
    if (!agencyId) return { status: "error", message: "Agency context required." };

    await assertCanManageStaffingRequests(context.userId, agencyId);

    const result = await transitionStaffingRequestCore(agencyId, requestId, toStatus);
    if (!result.ok) {
      return { status: "error", message: result.message };
    }

    return { status: "success", requestId: result.requestId, newStatus: result.status };
  } catch (error) {
    console.error("transitionStaffingRequestStatusAction failed", error);
    return {
      status: "error",
      message: error instanceof Error ? error.message : "Unable to update status.",
    };
  }
}
