import { NextResponse } from "next/server";
import {
  ForbiddenError,
  requireAuthContext,
  UnauthorizedError,
} from "@/lib/auth/authorization";
import { assertCanManageWorkforce } from "@/lib/auth/workforce-access";
import {
  getAgencyPublicProfileEditState,
  upsertAgencyPublicProfile,
} from "@/lib/marketplace/public-profile";
import { publicMarketplaceProfilePatchSchema } from "@/lib/validations/public-marketplace-profile";

type RouteContext = { params: Promise<{ id: string }> };

export async function GET(_request: Request, context: RouteContext) {
  try {
    const { id } = await context.params;
    const { context: auth } = await requireAuthContext();
    const agencyId = auth.agencyId;
    if (!agencyId) {
      return NextResponse.json({ error: "Agency context required" }, { status: 403 });
    }

    const state = await getAgencyPublicProfileEditState(agencyId, id);
    if (!state) {
      return NextResponse.json({ error: "Professional not found" }, { status: 404 });
    }

    return NextResponse.json({
      ...state,
      approximateAvailability: state.approximateAvailability,
    });
  } catch (error) {
    if (error instanceof UnauthorizedError) {
      return NextResponse.json({ error: error.message }, { status: 401 });
    }
    console.error("GET public-profile failed", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function PATCH(request: Request, context: RouteContext) {
  try {
    const { id } = await context.params;
    const { context: auth } = await requireAuthContext();
    const agencyId = auth.agencyId;
    if (!agencyId) {
      return NextResponse.json({ error: "Agency context required" }, { status: 403 });
    }

    await assertCanManageWorkforce(auth.userId, agencyId);

    const body = await request.json();
    const parsed = publicMarketplaceProfilePatchSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid input", details: parsed.error.flatten().fieldErrors },
        { status: 400 },
      );
    }

    const result = await upsertAgencyPublicProfile({
      agencyId,
      professionalId: id,
      actorUserId: auth.userId,
      data: parsed.data,
    });

    if (!result.ok) {
      return NextResponse.json({ error: result.error }, { status: 404 });
    }

    const state = await getAgencyPublicProfileEditState(agencyId, id);
    return NextResponse.json(state);
  } catch (error) {
    if (error instanceof UnauthorizedError) {
      return NextResponse.json({ error: error.message }, { status: 401 });
    }
    if (error instanceof ForbiddenError) {
      return NextResponse.json({ error: error.message }, { status: 403 });
    }
    console.error("PATCH public-profile failed", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
