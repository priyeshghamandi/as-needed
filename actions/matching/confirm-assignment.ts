"use server";

import { requireAuthContext } from "@/lib/auth/authorization";
import { assertCanManageAssignments } from "@/lib/auth/assignments-access";
import { confirmShiftAssignmentCore } from "@/lib/assignments/assignment-operations";

export type ConfirmAssignmentState =
  | { status: "success"; assignmentId: string }
  | { status: "error"; message: string };

export async function confirmShiftAssignmentAction(
  assignmentId: string,
): Promise<ConfirmAssignmentState> {
  try {
    const { context } = await requireAuthContext();
    const agencyId = context.agencyId;
    if (!agencyId) return { status: "error", message: "Agency context required." };

    await assertCanManageAssignments(context.userId, agencyId);

    const result = await confirmShiftAssignmentCore(agencyId, assignmentId);
    if (!result.ok) {
      return { status: "error", message: result.message };
    }

    return { status: "success", assignmentId: result.assignmentId };
  } catch (error) {
    console.error("confirmShiftAssignmentAction failed", error);
    return {
      status: "error",
      message: error instanceof Error ? error.message : "Unable to confirm assignment.",
    };
  }
}
