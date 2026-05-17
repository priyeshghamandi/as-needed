import { NextResponse } from "next/server";
import {
  ForbiddenError,
  UnauthorizedError,
} from "@/lib/auth/authorization";
import { requireLinkedProviderContext } from "@/lib/auth/provider-context";
import {
  createAvailabilityBlock,
  listAvailabilityBlocks,
} from "@/lib/provider/availability-blocks";
import { parseAvailabilityBlockInput } from "@/lib/validations/availability-block";

export async function GET(request: Request) {
  try {
    const { professional } = await requireLinkedProviderContext();
    const { searchParams } = new URL(request.url);
    const from = searchParams.get("from");
    const to = searchParams.get("to");

    const items = await listAvailabilityBlocks(
      professional.id,
      from ? new Date(from) : undefined,
      to ? new Date(to) : undefined,
    );

    return NextResponse.json({ items });
  } catch (error) {
    if (error instanceof UnauthorizedError) {
      return NextResponse.json({ error: error.message }, { status: 401 });
    }
    if (error instanceof ForbiddenError) {
      return NextResponse.json({ error: error.message }, { status: 403 });
    }
    console.error("GET /api/provider/availability failed", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const { professional } = await requireLinkedProviderContext();
    const body = await request.json();
    const parsed = parseAvailabilityBlockInput(body);
    if (!parsed.success) {
      const issue = parsed.error.issues[0];
      return NextResponse.json(
        { error: issue?.message ?? "Invalid input" },
        { status: 400 },
      );
    }

    const result = await createAvailabilityBlock(professional.id, parsed.data);
    if (!result.ok) {
      return NextResponse.json({ error: result.message }, { status: result.status });
    }

    return NextResponse.json({ id: result.id }, { status: 201 });
  } catch (error) {
    if (error instanceof UnauthorizedError) {
      return NextResponse.json({ error: error.message }, { status: 401 });
    }
    if (error instanceof ForbiddenError) {
      return NextResponse.json({ error: error.message }, { status: 403 });
    }
    console.error("POST /api/provider/availability failed", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
