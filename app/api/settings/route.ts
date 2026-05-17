import { NextResponse } from "next/server";
import { requireAuthContext } from "@/lib/auth/authorization";
import { SettingsForbiddenError } from "@/lib/settings/assert-can-manage-settings";
import { canViewAgencySettings } from "@/lib/settings/assert-can-view-settings";
import { canManageAgencySettings } from "@/lib/settings/assert-can-manage-settings";
import { getAgencySettingsDto } from "@/lib/settings/queries";
import { updateAgencyProfileAction } from "@/actions/settings/update-agency-profile";
import type { AgencyProfileSettingsInput } from "@/lib/validations/agency-profile-settings";

export async function GET() {
  try {
    const { context } = await requireAuthContext();
    const agencyId = context.agencyId;

    if (!agencyId || !canViewAgencySettings(context.primaryRole, agencyId)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const dto = await getAgencySettingsDto(agencyId);
    if (!dto) {
      return NextResponse.json({ error: "Agency not found" }, { status: 404 });
    }

    return NextResponse.json({
      ...dto,
      canManage: canManageAgencySettings(context.primaryRole, agencyId),
    });
  } catch (error) {
    if (error instanceof SettingsForbiddenError) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
    console.error("GET /api/settings failed", error);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  try {
    const { context } = await requireAuthContext();
    const agencyId = context.agencyId;

    if (!agencyId) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    if (!canManageAgencySettings(context.primaryRole, agencyId)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const section =
      body && typeof body === "object" && "section" in body
        ? (body as { section?: string }).section
        : undefined;

    if (section === "profile" && body && typeof body === "object" && "profile" in body) {
      const result = await updateAgencyProfileAction(
        (body as { profile: AgencyProfileSettingsInput }).profile,
      );
      if (result.status === "success") {
        return NextResponse.json({ ok: true });
      }
      if (result.status === "error") {
        return NextResponse.json({ error: result.message }, { status: 400 });
      }
      return NextResponse.json({ error: "Unable to save" }, { status: 400 });
    }

    return NextResponse.json({ error: "Unsupported section" }, { status: 400 });
  } catch (error) {
    if (error instanceof SettingsForbiddenError) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
    console.error("PATCH /api/settings failed", error);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
