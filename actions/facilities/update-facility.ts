"use server";

import { and, eq } from "drizzle-orm";
import { requireAuthContext } from "@/lib/auth/authorization";
import { assertCanManageFacilities } from "@/lib/auth/facilities-access";
import { db } from "@/drizzle/db";
import { FacilityTable } from "@/drizzle/schema";
import { isContactEmailTaken } from "@/lib/facilities/queries";
import { updateFacilitySchema, type UpdateFacilityInput } from "@/lib/validations/facility";

export type UpdateFacilityState =
  | { status: "idle" }
  | { status: "success" }
  | { status: "error"; field?: string; message: string };

export async function updateFacilityAction(
  facilityId: string,
  input: UpdateFacilityInput,
): Promise<UpdateFacilityState> {
  const parsed = updateFacilitySchema.safeParse(input);
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

    await assertCanManageFacilities(context.userId, agencyId);

    const taken = await isContactEmailTaken(
      agencyId,
      parsed.data.contactEmail,
      facilityId,
    );
    if (taken) {
      return {
        status: "error",
        field: "contactEmail",
        message: "A facility with this contact email already exists in your agency.",
      };
    }

    const [updated] = await db
      .update(FacilityTable)
      .set({
        name: parsed.data.name.trim(),
        type: parsed.data.type,
        contactName: parsed.data.contactName.trim(),
        contactEmail: parsed.data.contactEmail,
        contactPhone: parsed.data.contactPhone.trim(),
        notes: parsed.data.notes || null,
        updatedAt: new Date(),
      })
      .where(
        and(eq(FacilityTable.id, facilityId), eq(FacilityTable.agencyId, agencyId)),
      )
      .returning({ id: FacilityTable.id });

    if (!updated) return { status: "error", message: "Facility not found." };

    return { status: "success" };
  } catch (error) {
    console.error("updateFacilityAction failed", error);
    return {
      status: "error",
      message: error instanceof Error ? error.message : "Unable to save. Try again.",
    };
  }
}
