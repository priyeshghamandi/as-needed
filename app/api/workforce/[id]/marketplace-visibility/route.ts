import { NextResponse } from "next/server";
import {
  ForbiddenError,
  requireAuthContext,
  UnauthorizedError,
} from "@/lib/auth/authorization";
import { assertCanManageWorkforce } from "@/lib/auth/workforce-access";
import { getMarketplaceVisibilityState, setMarketplaceVisibility } from "@/lib/marketplace/visibility-queries";
import { marketplaceVisibilityPatchSchema } from "@/lib/validations/marketplace-visibility";

type RouteContext = { params: Promise<{ id: string }> };

export async function GET(_request: Request, context: RouteContext) {
  try {
    const { id } = await context.params;
    const { context: auth } = await requireAuthContext();
    const agencyId = auth.agencyId;
    if (!agencyId) {
      return NextResponse.json({ error: "Agency context required" }, { status: 403 });
    }

    const state = await getMarketplaceVisibilityState(agencyId, id);
    if (!state) {
      return NextResponse.json({ error: "Professional not found" }, { status: 404 });
    }

    return NextResponse.json({
      isMarketplaceVisible: state.isMarketplaceVisible,
      visibilityBlockedReason: state.visibilityBlockedReason,
      marketplaceVisibleAt: state.marketplaceVisibleAt?.toISOString() ?? null,
      marketplaceHiddenAt: state.marketplaceHiddenAt?.toISOString() ?? null,
      enabledByName: state.enabledByName,
      publicSlug: state.publicSlug,
      checklist: state.checklist,
    });
  } catch (error) {
    if (error instanceof UnauthorizedError) {
      return NextResponse.json({ error: error.message }, { status: 401 });
    }
    console.error("GET marketplace-visibility failed", error);
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
    const parsed = marketplaceVisibilityPatchSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid request", details: parsed.error.flatten() },
        { status: 400 },
      );
    }

    const result = await setMarketplaceVisibility({
      agencyId,
      professionalId: id,
      isMarketplaceVisible: parsed.data.isMarketplaceVisible,
      actorUserId: auth.userId,
    });

    if (!result.ok) {
      return NextResponse.json({ error: "Cannot update visibility", details: result.errors }, { status: 400 });
    }

    const state = await getMarketplaceVisibilityState(agencyId, id);
    if (!state) {
      return NextResponse.json({ error: "Professional not found" }, { status: 404 });
    }
    return NextResponse.json({
      isMarketplaceVisible: state.isMarketplaceVisible,
      visibilityBlockedReason: state.visibilityBlockedReason,
      marketplaceVisibleAt: state.marketplaceVisibleAt?.toISOString() ?? null,
      marketplaceHiddenAt: state.marketplaceHiddenAt?.toISOString() ?? null,
      enabledByName: state.enabledByName,
      publicSlug: state.publicSlug,
      checklist: state.checklist,
    });
  } catch (error) {
    if (error instanceof UnauthorizedError) {
      return NextResponse.json({ error: error.message }, { status: 401 });
    }
    if (error instanceof ForbiddenError) {
      return NextResponse.json({ error: error.message }, { status: 403 });
    }
    console.error("PATCH marketplace-visibility failed", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
