"use server";

import { requireAuthContext } from "@/lib/auth/authorization";
import { assertCanManageCompliance } from "@/lib/auth/compliance-access";
import { rejectCredentialCore } from "@/lib/compliance/credential-operations";
import { rejectCredentialSchema } from "@/lib/validations/credential";

export type CredentialActionState =
  | { status: "success"; id: string }
  | { status: "error"; message: string };

export async function rejectCredentialAction(
  credentialId: string,
  body: unknown,
): Promise<CredentialActionState> {
  try {
    const parsed = rejectCredentialSchema.safeParse(body);
    if (!parsed.success) {
      return {
        status: "error",
        message: parsed.error.issues[0]?.message ?? "Invalid input.",
      };
    }

    const { context } = await requireAuthContext();
    const agencyId = context.agencyId;
    if (!agencyId) return { status: "error", message: "Agency context required." };

    await assertCanManageCompliance(context.userId, agencyId);

    const result = await rejectCredentialCore(agencyId, credentialId, parsed.data.reason);
    if (!result.ok) return { status: "error", message: result.message };

    return { status: "success", id: result.id };
  } catch (error) {
    console.error("rejectCredentialAction failed", error);
    return {
      status: "error",
      message: error instanceof Error ? error.message : "Unable to reject credential.",
    };
  }
}
