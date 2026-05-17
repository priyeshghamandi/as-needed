"use server";

import { requireAuthContext } from "@/lib/auth/authorization";
import { assertCanManageShifts } from "@/lib/auth/shifts-access";
import { cancelShiftCore } from "@/lib/shifts/shift-operations";

export type CancelShiftState =
  | { status: "success"; shiftId: string }
  | { status: "error"; message: string };

export async function cancelShiftAction(shiftId: string): Promise<CancelShiftState> {
  try {
    const { context } = await requireAuthContext();
    const agencyId = context.agencyId;
    if (!agencyId) return { status: "error", message: "Agency context required." };

    await assertCanManageShifts(context.userId, agencyId);

    const result = await cancelShiftCore(agencyId, shiftId);
    if (!result.ok) {
      return { status: "error", message: result.message };
    }

    return { status: "success", shiftId: result.shiftId };
  } catch (error) {
    console.error("cancelShiftAction failed", error);
    return {
      status: "error",
      message: error instanceof Error ? error.message : "Unable to cancel shift.",
    };
  }
}
