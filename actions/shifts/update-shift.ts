"use server";

import { requireAuthContext } from "@/lib/auth/authorization";
import { assertCanManageShifts } from "@/lib/auth/shifts-access";
import { updateShiftCore } from "@/lib/shifts/shift-operations";
import type { UpdateShiftInput } from "@/lib/validations/shift";

export type UpdateShiftState =
  | { status: "success"; shiftId: string }
  | { status: "error"; field?: string; message: string };

export async function updateShiftAction(
  shiftId: string,
  input: UpdateShiftInput,
): Promise<UpdateShiftState> {
  try {
    const { context } = await requireAuthContext();
    const agencyId = context.agencyId;
    if (!agencyId) return { status: "error", message: "Agency context required." };

    await assertCanManageShifts(context.userId, agencyId);

    const result = await updateShiftCore(agencyId, shiftId, input);
    if (!result.ok) {
      return { status: "error", field: result.field, message: result.message };
    }

    return { status: "success", shiftId: result.shiftId };
  } catch (error) {
    console.error("updateShiftAction failed", error);
    return {
      status: "error",
      message: error instanceof Error ? error.message : "Unable to update shift.",
    };
  }
}
