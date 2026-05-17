"use server";

import { requireAuthContext } from "@/lib/auth/authorization";
import { assertCanViewMatchPageAccess } from "@/lib/auth/assignments-access";
import { getMatchCandidates } from "@/lib/matching/candidate-query";
import type { MatchFiltersParams } from "@/lib/matching/types";

export async function getMatchCandidatesAction(
  requestId: string,
  shiftId: string,
  filters: MatchFiltersParams = {},
) {
  const { context } = await requireAuthContext();
  const agencyId = context.agencyId;
  if (!agencyId) return [];

  await assertCanViewMatchPageAccess(context.userId, agencyId);

  return getMatchCandidates(agencyId, requestId, shiftId, filters);
}
