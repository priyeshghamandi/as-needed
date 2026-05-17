"use server";

import { requireLinkedProviderContext } from "@/lib/auth/provider-context";
import { declineShiftAssignmentForProvider } from "@/lib/provider/decline-shift-assignment";
import {
  declineShiftAssignmentSchema,
  type DeclineShiftAssignmentInput,
} from "@/lib/validations/provider-assignment";

export type DeclineShiftAssignmentState =
  | { status: "success"; assignmentId: string }
  | { status: "error"; message: string };

export async function declineShiftAssignmentAction(
  assignmentId: string,
  input: DeclineShiftAssignmentInput,
): Promise<DeclineShiftAssignmentState> {
  try {
    const parsed = declineShiftAssignmentSchema.safeParse(input);
    if (!parsed.success) {
      const issue = parsed.error.issues[0];
      return { status: "error", message: issue?.message ?? "Invalid input." };
    }

    const { professional } = await requireLinkedProviderContext();
    const result = await declineShiftAssignmentForProvider(
      assignmentId,
      professional.id,
      parsed.data,
    );
    if (!result.ok) {
      return { status: "error", message: result.message };
    }
    return { status: "success", assignmentId: result.assignmentId };
  } catch (error) {
    console.error("declineShiftAssignmentAction failed", error);
    return {
      status: "error",
      message: error instanceof Error ? error.message : "Unable to decline shift.",
    };
  }
}
