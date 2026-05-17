"use server";

import { requireLinkedProviderContext } from "@/lib/auth/provider-context";
import { acceptShiftAssignmentForProvider } from "@/lib/provider/accept-shift-assignment";

export type AcceptShiftAssignmentState =
  | { status: "success"; assignmentId: string }
  | { status: "error"; message: string };

export async function acceptShiftAssignmentAction(
  assignmentId: string,
): Promise<AcceptShiftAssignmentState> {
  try {
    const { professional } = await requireLinkedProviderContext();
    const result = await acceptShiftAssignmentForProvider(
      assignmentId,
      professional.id,
    );
    if (!result.ok) {
      return { status: "error", message: result.message };
    }
    return { status: "success", assignmentId: result.assignmentId };
  } catch (error) {
    console.error("acceptShiftAssignmentAction failed", error);
    return {
      status: "error",
      message: error instanceof Error ? error.message : "Unable to accept shift.",
    };
  }
}
