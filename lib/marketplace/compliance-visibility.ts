import { eq } from "drizzle-orm";
import { db } from "@/drizzle/db";
import {
  CredentialTable,
  ProfessionalMarketplaceVisibilityTable,
} from "@/drizzle/schema";
import { deriveComplianceStatus } from "@/lib/workforce/shift-readiness";
import type { VisibilityBlockedReason } from "@/lib/marketplace/types";

export async function syncMarketplaceComplianceBlock(
  agencyId: string,
  professionalId: string,
): Promise<VisibilityBlockedReason | null> {
  const credentials = await db
    .select({ status: CredentialTable.status })
    .from(CredentialTable)
    .where(eq(CredentialTable.professionalId, professionalId));

  const compliance = deriveComplianceStatus(credentials);
  const blockedReason: VisibilityBlockedReason | null =
    compliance === "blocked" ? "compliance_expired" : null;

  await db
    .update(ProfessionalMarketplaceVisibilityTable)
    .set({
      visibilityBlockedReason: blockedReason,
      updatedAt: new Date(),
    })
    .where(
      eq(ProfessionalMarketplaceVisibilityTable.healthcareProfessionalId, professionalId),
    );

  return blockedReason;
}
