import { NextResponse } from "next/server";
import {
  ForbiddenError,
  requireAuthContext,
  UnauthorizedError,
} from "@/lib/auth/authorization";
import { assertCanManageWorkforce } from "@/lib/auth/workforce-access";
import { bulkSetMarketplaceVisibility } from "@/lib/marketplace/visibility-queries";
import { marketplaceVisibilityBulkSchema } from "@/lib/validations/marketplace-visibility";

export async function POST(request: Request) {
  try {
    const { context: auth } = await requireAuthContext();
    const agencyId = auth.agencyId;
    if (!agencyId) {
      return NextResponse.json({ error: "Agency context required" }, { status: 403 });
    }

    await assertCanManageWorkforce(auth.userId, agencyId);

    const body = await request.json();
    const parsed = marketplaceVisibilityBulkSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid request", details: parsed.error.flatten() },
        { status: 400 },
      );
    }

    const result = await bulkSetMarketplaceVisibility({
      agencyId,
      professionalIds: parsed.data.professionalIds,
      isMarketplaceVisible: parsed.data.isMarketplaceVisible,
      actorUserId: auth.userId,
    });

    return NextResponse.json(result);
  } catch (error) {
    if (error instanceof UnauthorizedError) {
      return NextResponse.json({ error: error.message }, { status: 401 });
    }
    if (error instanceof ForbiddenError) {
      return NextResponse.json({ error: error.message }, { status: 403 });
    }
    console.error("POST marketplace-visibility/bulk failed", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
