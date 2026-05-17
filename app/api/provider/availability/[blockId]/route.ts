import { NextResponse } from "next/server";
import {
  ForbiddenError,
  UnauthorizedError,
} from "@/lib/auth/authorization";
import { requireLinkedProviderContext } from "@/lib/auth/provider-context";
import {
  deleteAvailabilityBlock,
  updateAvailabilityBlock,
} from "@/lib/provider/availability-blocks";
import { parseAvailabilityBlockInput } from "@/lib/validations/availability-block";

type RouteContext = { params: Promise<{ blockId: string }> };

export async function PATCH(request: Request, context: RouteContext) {
  try {
    const { professional } = await requireLinkedProviderContext();
    const { blockId } = await context.params;
    const body = await request.json();
    const parsed = parseAvailabilityBlockInput(body);
    if (!parsed.success) {
      const issue = parsed.error.issues[0];
      return NextResponse.json(
        { error: issue?.message ?? "Invalid input" },
        { status: 400 },
      );
    }

    const result = await updateAvailabilityBlock(
      professional.id,
      blockId,
      parsed.data,
    );
    if (!result.ok) {
      return NextResponse.json({ error: result.message }, { status: result.status });
    }

    return NextResponse.json({ id: result.id });
  } catch (error) {
    if (error instanceof UnauthorizedError) {
      return NextResponse.json({ error: error.message }, { status: 401 });
    }
    if (error instanceof ForbiddenError) {
      return NextResponse.json({ error: error.message }, { status: 403 });
    }
    console.error("PATCH /api/provider/availability/[blockId] failed", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function DELETE(_request: Request, context: RouteContext) {
  try {
    const { professional } = await requireLinkedProviderContext();
    const { blockId } = await context.params;
    const result = await deleteAvailabilityBlock(professional.id, blockId);
    if (!result.ok) {
      return NextResponse.json({ error: result.message }, { status: result.status });
    }

    return NextResponse.json({ id: result.id });
  } catch (error) {
    if (error instanceof UnauthorizedError) {
      return NextResponse.json({ error: error.message }, { status: 401 });
    }
    if (error instanceof ForbiddenError) {
      return NextResponse.json({ error: error.message }, { status: 403 });
    }
    console.error("DELETE /api/provider/availability/[blockId] failed", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
