"use server";

import { and, eq } from "drizzle-orm";
import { requireAuthContext } from "@/lib/auth/authorization";
import { db } from "@/drizzle/db";
import { HealthcareProfessionalTable } from "@/drizzle/schema";

export type DeactivateState =
  | { status: "idle" }
  | { status: "success" }
  | { status: "error"; message: string };

export async function deactivateProfessionalAction(
  professionalId: string,
): Promise<DeactivateState> {
  try {
    const { context } = await requireAuthContext();
    const agencyId = context.agencyId;
    if (!agencyId) return { status: "error", message: "Agency context required." };

    const WRITE_ROLES = ["agency_owner", "agency_admin", "recruiter"] as const;
    if (!WRITE_ROLES.includes(context.primaryRole as never)) {
      return { status: "error", message: "You do not have permission to deactivate professionals." };
    }

    const [updated] = await db
      .update(HealthcareProfessionalTable)
      .set({ isActive: false, availabilityStatus: "unavailable", updatedAt: new Date() })
      .where(
        and(
          eq(HealthcareProfessionalTable.id, professionalId),
          eq(HealthcareProfessionalTable.agencyId, agencyId),
        ),
      )
      .returning({ id: HealthcareProfessionalTable.id });

    if (!updated) return { status: "error", message: "Professional not found." };

    return { status: "success" };
  } catch (error) {
    console.error("deactivateProfessionalAction failed", error);
    return {
      status: "error",
      message: error instanceof Error ? error.message : "Unable to deactivate. Try again.",
    };
  }
}
