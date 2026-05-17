"use server";

import { requireAuthContext } from "@/lib/auth/authorization";
import { assertCanManageShifts } from "@/lib/auth/shifts-access";
import { createSecondaryShiftCore } from "@/lib/shifts/shift-operations";
import type { CreateSecondaryShiftInput } from "@/lib/validations/shift";

export type CreateSecondaryShiftState =
  | { status: "success"; shiftId: string }
  | { status: "error"; field?: string; message: string };

export async function createSecondaryShiftAction(
  input: CreateSecondaryShiftInput,
): Promise<CreateSecondaryShiftState> {
  try {
    const { context } = await requireAuthContext();
    const agencyId = context.agencyId;
    if (!agencyId) return { status: "error", message: "Agency context required." };

    await assertCanManageShifts(context.userId, agencyId);

    const result = await createSecondaryShiftCore(agencyId, input);
    if (!result.ok) {
      return { status: "error", field: result.field, message: result.message };
    }

    return { status: "success", shiftId: result.shiftId };
  } catch (error) {
    console.error("createSecondaryShiftAction failed", error);
    return {
      status: "error",
      message: error instanceof Error ? error.message : "Unable to create shift.",
    };
  }
}
