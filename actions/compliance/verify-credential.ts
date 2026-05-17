"use server";

import { requireAuthContext } from "@/lib/auth/authorization";
import { assertCanManageCompliance } from "@/lib/auth/compliance-access";
import { verifyCredentialCore } from "@/lib/compliance/credential-operations";

export type CredentialActionState =
  | { status: "success"; id: string }
  | { status: "error"; message: string };

export async function verifyCredentialAction(
  credentialId: string,
): Promise<CredentialActionState> {
  try {
    const { context } = await requireAuthContext();
    const agencyId = context.agencyId;
    if (!agencyId) return { status: "error", message: "Agency context required." };

    await assertCanManageCompliance(context.userId, agencyId);

    const result = await verifyCredentialCore(agencyId, credentialId, context.userId);
    if (!result.ok) return { status: "error", message: result.message };

    return { status: "success", id: result.id };
  } catch (error) {
    console.error("verifyCredentialAction failed", error);
    return {
      status: "error",
      message: error instanceof Error ? error.message : "Unable to verify credential.",
    };
  }
}
