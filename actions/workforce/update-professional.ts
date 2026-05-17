"use server";

import { and, eq } from "drizzle-orm";
import { requireAuthContext } from "@/lib/auth/authorization";
import { db } from "@/drizzle/db";
import { HealthcareProfessionalTable } from "@/drizzle/schema";
import {
  updateProfessionalSchema,
  type UpdateProfessionalInput,
} from "@/lib/validations/workforce-professional";

export type UpdateProfessionalState =
  | { status: "idle" }
  | { status: "success" }
  | { status: "error"; field?: string; message: string };

export async function updateHealthcareProfessionalAction(
  professionalId: string,
  input: UpdateProfessionalInput,
): Promise<UpdateProfessionalState> {
  const parsed = updateProfessionalSchema.safeParse(input);
  if (!parsed.success) {
    const issue = parsed.error.issues[0];
    return {
      status: "error",
      field: issue?.path[0]?.toString(),
      message: issue?.message ?? "Invalid input.",
    };
  }

  try {
    const { context } = await requireAuthContext();
    const agencyId = context.agencyId;
    if (!agencyId) return { status: "error", message: "Agency context required." };

    const WRITE_ROLES = ["agency_owner", "agency_admin", "recruiter"] as const;
    if (!WRITE_ROLES.includes(context.primaryRole as never)) {
      return { status: "error", message: "You do not have permission to edit professionals." };
    }

    const [updated] = await db
      .update(HealthcareProfessionalTable)
      .set({
        firstName: parsed.data.firstName.trim(),
        lastName: parsed.data.lastName.trim(),
        role: parsed.data.role,
        specialty: parsed.data.specialty || null,
        yearsExperience: parsed.data.yearsExperience ?? null,
        phone: parsed.data.phone || null,
        updatedAt: new Date(),
      })
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
    console.error("updateHealthcareProfessionalAction failed", error);
    return {
      status: "error",
      message: error instanceof Error ? error.message : "Unable to save. Try again.",
    };
  }
}
