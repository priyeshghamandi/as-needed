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
  agencyPreferencesSchema,
  mergeAgencyPreferences,
  type AgencyPreferences,
} from "@/lib/validations/agency-preferences";

export type UpdateAgencyPreferencesState =
  | { status: "idle" }
  | { status: "success" }
  | { status: "error"; message: string };

export async function updateAgencyPreferencesAction(
  input: AgencyPreferences,
): Promise<UpdateAgencyPreferencesState> {
  const parsed = agencyPreferencesSchema.safeParse(input);
  if (!parsed.success) {
    return {
      status: "error",
      message: parsed.error.issues[0]?.message ?? "Invalid preferences.",
    };
  }

  try {
    const { context } = await requireAuthContext();
    const agencyId = context.agencyId;
    if (!agencyId) {
      return { status: "error", message: "Agency context required." };
    }

    assertCanManageAgencySettings(context.primaryRole, agencyId);

    const [agency] = await db
      .select({ agencyPreferences: AgencyTable.agencyPreferences })
      .from(AgencyTable)
      .where(eq(AgencyTable.id, agencyId))
      .limit(1);

    if (!agency) return { status: "error", message: "Agency not found." };

    const merged = mergeAgencyPreferences(agency.agencyPreferences, parsed.data);

    await db
      .update(AgencyTable)
      .set({
        agencyPreferences: merged,
        updatedAt: new Date(),
      })
      .where(eq(AgencyTable.id, agencyId));

    await logActivity({
      agencyId,
      actorUserId: context.userId,
      action: ACTIVITY_ACTIONS.SETTINGS_UPDATED,
      entityType: "agency",
      entityId: agencyId,
      metadata: { section: "preferences" },
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
    console.error("updateAgencyPreferencesAction failed", error);
    return {
      status: "error",
      message: "Unable to save settings. Try again.",
    };
  }
}
