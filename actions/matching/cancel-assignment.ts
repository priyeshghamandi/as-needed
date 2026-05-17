"use server";

import { requireAuthContext } from "@/lib/auth/authorization";
import { assertCanManageAssignments } from "@/lib/auth/assignments-access";
import { cancelShiftAssignmentCore } from "@/lib/assignments/assignment-operations";

export type CancelAssignmentState =
  | { status: "success"; assignmentId: string }
  | { status: "error"; message: string };

export async function cancelShiftAssignmentAction(
  assignmentId: string,
  cancellationReason?: string,
): Promise<CancelAssignmentState> {
  try {
    const { context } = await requireAuthContext();
    const agencyId = context.agencyId;
    if (!agencyId) return { status: "error", message: "Agency context required." };

    await assertCanManageAssignments(context.userId, agencyId);

    const result = await cancelShiftAssignmentCore(agencyId, assignmentId, cancellationReason);
    if (!result.ok) {
      return { status: "error", message: result.message };
    }

    return { status: "success", assignmentId: result.assignmentId };
  } catch (error) {
    console.error("cancelShiftAssignmentAction failed", error);
    return {
      status: "error",
      message: error instanceof Error ? error.message : "Unable to cancel invite.",
    };
  }
}
