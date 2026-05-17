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
  agencyServiceAreaSettingsSchema,
  type AgencyServiceAreaSettingsInput,
} from "@/lib/validations/agency-service-area-settings";

export type UpdateAgencyServiceAreaState =
  | { status: "idle" }
  | { status: "success" }
  | { status: "error"; message: string };

export async function updateAgencyServiceAreaAction(
  input: AgencyServiceAreaSettingsInput,
): Promise<UpdateAgencyServiceAreaState> {
  const parsed = agencyServiceAreaSettingsSchema.safeParse(input);
  if (!parsed.success) {
    return {
      status: "error",
      message: parsed.error.issues[0]?.message ?? "Invalid service area data.",
    };
  }

  try {
    const { context } = await requireAuthContext();
    const agencyId = context.agencyId;
    if (!agencyId) {
      return { status: "error", message: "Agency context required." };
    }

    assertCanManageAgencySettings(context.primaryRole, agencyId);

    const { primaryServiceArea, serviceAreaRadiusMiles } = parsed.data;

    await db
      .update(AgencyTable)
      .set({
        primaryServiceAreaName: primaryServiceArea.displayName,
        primaryServiceAreaPlaceId: primaryServiceArea.placeId,
        primaryServiceAreaCity: primaryServiceArea.city || null,
        primaryServiceAreaState: primaryServiceArea.state || null,
        primaryServiceAreaCountry: primaryServiceArea.country,
        primaryServiceAreaLat: String(primaryServiceArea.latitude),
        primaryServiceAreaLng: String(primaryServiceArea.longitude),
        serviceAreaRadiusMiles,
        updatedAt: new Date(),
      })
      .where(eq(AgencyTable.id, agencyId));

    await logActivity({
      agencyId,
      actorUserId: context.userId,
      action: ACTIVITY_ACTIONS.SETTINGS_UPDATED,
      entityType: "agency",
      entityId: agencyId,
      metadata: { section: "service-area" },
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
    console.error("updateAgencyServiceAreaAction failed", error);
    return {
      status: "error",
      message: "Unable to save settings. Try again.",
    };
  }
}
