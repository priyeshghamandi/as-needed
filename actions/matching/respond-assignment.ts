"use server";

import { requireAuthContext } from "@/lib/auth/authorization";
import { assertProviderOwnsAssignment } from "@/lib/auth/assignments-access";
import { respondToShiftAssignmentCore } from "@/lib/assignments/assignment-operations";
import type { RespondToAssignmentInput } from "@/lib/validations/assignment";

export type RespondAssignmentState =
  | { status: "success"; assignmentId: string }
  | { status: "error"; message: string };

export async function respondToShiftAssignmentAction(
  assignmentId: string,
  input: RespondToAssignmentInput,
): Promise<RespondAssignmentState> {
  try {
    const { context } = await requireAuthContext();
    if (!context.userId) return { status: "error", message: "Authentication required." };

    await assertProviderOwnsAssignment(context.userId, assignmentId);

    const result = await respondToShiftAssignmentCore(assignmentId, input);
    if (!result.ok) {
      return { status: "error", message: result.message };
    }

    return { status: "success", assignmentId: result.assignmentId };
  } catch (error) {
    console.error("respondToShiftAssignmentAction failed", error);
    return {
      status: "error",
      message: error instanceof Error ? error.message : "Unable to update assignment.",
    };
  }
}
