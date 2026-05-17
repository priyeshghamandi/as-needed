"use server";

import { requireAuthContext } from "@/lib/auth/authorization";
import { assertCanManageCompliance } from "@/lib/auth/compliance-access";
import { createCredentialCore } from "@/lib/compliance/credential-operations";
import { credentialInputSchema } from "@/lib/validations/credential";

export type CredentialActionState =
  | { status: "success"; id: string; warning?: string }
  | { status: "error"; message: string };

export async function createCredentialAction(body: unknown): Promise<CredentialActionState> {
  try {
    const parsed = credentialInputSchema.safeParse(body);
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

    const result = await createCredentialCore(agencyId, parsed.data);
    if (!result.ok) return { status: "error", message: result.message };

    return { status: "success", id: result.id, warning: result.warning };
  } catch (error) {
    console.error("createCredentialAction failed", error);
    return {
      status: "error",
      message: error instanceof Error ? error.message : "Unable to create credential.",
    };
  }
}
