"use server";

import { eq } from "drizzle-orm";
import { requireAuthContext } from "@/lib/auth/authorization";
import { SettingsForbiddenError } from "@/lib/settings/assert-can-manage-settings";
import { db } from "@/drizzle/db";
import { AgencyTable } from "@/drizzle/schema";
import { logActivity } from "@/lib/activity/log-activity";
import { ACTIVITY_ACTIONS } from "@/lib/activity/actions";
import { assertCanManageAgencySettings } from "@/lib/settings/assert-can-manage-settings";
import {
  agencyProfileSettingsSchema,
  type AgencyProfileSettingsInput,
} from "@/lib/validations/agency-profile-settings";

export type UpdateAgencyProfileState =
  | { status: "idle" }
  | { status: "success" }
  | { status: "error"; message: string };

export async function updateAgencyProfileAction(
  input: AgencyProfileSettingsInput,
): Promise<UpdateAgencyProfileState> {
  const parsed = agencyProfileSettingsSchema.safeParse(input);
  if (!parsed.success) {
    return {
      status: "error",
      message: parsed.error.issues[0]?.message ?? "Invalid profile data.",
    };
  }

  try {
    const { context } = await requireAuthContext();
    const agencyId = context.agencyId;
    if (!agencyId) {
      return { status: "error", message: "Agency context required." };
    }

    assertCanManageAgencySettings(context.primaryRole, agencyId);

    await db
      .update(AgencyTable)
      .set({
        name: parsed.data.name,
        phone: parsed.data.phone,
        website: parsed.data.website || null,
        logoUrl: parsed.data.logoUrl || null,
        agencyType: parsed.data.agencyType ?? null,
        workforceSize: parsed.data.workforceSize ?? null,
        operationalContactName: parsed.data.operationalContactName,
        operationalContactEmail: parsed.data.operationalContactEmail,
        description: parsed.data.description || null,
        staffingSpecialties: parsed.data.staffingSpecialties,
        updatedAt: new Date(),
      })
      .where(eq(AgencyTable.id, agencyId));

    await logActivity({
      agencyId,
      actorUserId: context.userId,
      action: ACTIVITY_ACTIONS.SETTINGS_UPDATED,
      entityType: "agency",
      entityId: agencyId,
      metadata: { section: "profile" },
    });

    return { status: "success" };
  } catch (error) {
    if (error instanceof SettingsForbiddenError) {
      return {
        status: "error",
        message: "You don't have permission to change this setting.",
      };
    }
    if (error instanceof Error && error.message.includes("permission")) {
      return { status: "error", message: error.message };
    }
    console.error("updateAgencyProfileAction failed", error);
    return {
      status: "error",
      message: "Unable to save settings. Try again.",
    };
  }
}
