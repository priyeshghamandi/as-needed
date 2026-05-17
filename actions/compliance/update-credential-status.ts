"use server";

import { requireAuthContext } from "@/lib/auth/authorization";
import { assertCanManageCompliance } from "@/lib/auth/compliance-access";
import { updateCredentialStatusCore } from "@/lib/compliance/credential-operations";
import { updateCredentialStatusSchema } from "@/lib/validations/credential";

export type CredentialActionState =
  | { status: "success"; id: string }
  | { status: "error"; message: string };

export async function updateCredentialStatusAction(
  credentialId: string,
  body: unknown,
): Promise<CredentialActionState> {
  try {
    const parsed = updateCredentialStatusSchema.safeParse(body);
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

    const result = await updateCredentialStatusCore(
      agencyId,
      credentialId,
      parsed.data.status,
    );
    if (!result.ok) return { status: "error", message: result.message };

    return { status: "success", id: result.id };
  } catch (error) {
    console.error("updateCredentialStatusAction failed", error);
    return {
      status: "error",
      message: error instanceof Error ? error.message : "Unable to update status.",
    };
  }
}
