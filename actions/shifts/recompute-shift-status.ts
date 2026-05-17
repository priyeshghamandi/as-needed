"use server";

import { requireAuthContext } from "@/lib/auth/authorization";
import { assertCanManageShifts } from "@/lib/auth/shifts-access";
import { recomputeShiftStatus } from "@/lib/shifts/sync-request-shift";

export async function recomputeShiftStatusAction(shiftId: string): Promise<void> {
  const { context } = await requireAuthContext();
  const agencyId = context.agencyId;
  if (!agencyId) return;

  await assertCanManageShifts(context.userId, agencyId);
  await recomputeShiftStatus(shiftId);
}
