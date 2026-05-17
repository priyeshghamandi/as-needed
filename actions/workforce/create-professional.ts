"use server";

import { requireAuthContext } from "@/lib/auth/authorization";
import { assertCanManageWorkforce } from "@/lib/auth/workforce-access";
import { createProfessionalCore } from "@/lib/workforce/create-professional-core";
import type { WorkforceProfessionalInput } from "@/lib/validations/workforce-professional";

export type CreateProfessionalState =
  | { status: "idle" }
  | { status: "success"; professionalId: string; inviteUrl?: string }
  | { status: "error"; field?: string; message: string };

export async function createHealthcareProfessionalAction(
  input: WorkforceProfessionalInput,
): Promise<CreateProfessionalState> {
  try {
    const { context } = await requireAuthContext();
    const agencyId = context.agencyId;
    if (!agencyId) return { status: "error", message: "Agency context required." };

    await assertCanManageWorkforce(context.userId, agencyId);

    const result = await createProfessionalCore(agencyId, context.userId, input);
    if (!result.ok) {
      return {
        status: "error",
        field: result.field,
        message: result.message,
      };
    }

    return {
      status: "success",
      professionalId: result.professionalId,
      inviteUrl: result.inviteUrl,
    };
  } catch (error) {
    console.error("createHealthcareProfessionalAction failed", error);
    return {
      status: "error",
      message: error instanceof Error ? error.message : "Unable to save. Try again.",
    };
  }
}
