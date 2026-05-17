import { NextResponse } from "next/server";
import {
  ForbiddenError,
  requireAuthContext,
  UnauthorizedError,
} from "@/lib/auth/authorization";
import {
  assertCanManageCompliance,
  assertCanViewCompliance,
} from "@/lib/auth/compliance-access";
import { createCredentialCore } from "@/lib/compliance/credential-operations";
import { parseComplianceListParams } from "@/lib/compliance/list-filters";
import { listCredentials } from "@/lib/compliance/queries";
import { credentialInputSchema } from "@/lib/validations/credential";

export async function GET(request: Request) {
  try {
    const { context } = await requireAuthContext();
    const agencyId = context.agencyId;
    if (!agencyId) {
      return NextResponse.json({ error: "Agency context required" }, { status: 403 });
    }

    await assertCanViewCompliance(context.userId, agencyId);

    const { searchParams } = new URL(request.url);
    const params = parseComplianceListParams(searchParams);
    const result = await listCredentials(agencyId, params);

    return NextResponse.json(result);
  } catch (error) {
    if (error instanceof UnauthorizedError) {
      return NextResponse.json({ error: error.message }, { status: 401 });
    }
    if (error instanceof ForbiddenError) {
      return NextResponse.json({ error: error.message }, { status: 403 });
    }
    console.error("GET /api/compliance/credentials failed", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const { context } = await requireAuthContext();
    const agencyId = context.agencyId;
    if (!agencyId) {
      return NextResponse.json({ error: "Agency context required" }, { status: 403 });
    }

    await assertCanManageCompliance(context.userId, agencyId);

    const body = await request.json();
    const parsed = credentialInputSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message ?? "Invalid input" },
        { status: 400 },
      );
    }

    const result = await createCredentialCore(agencyId, parsed.data);
    if (!result.ok) {
      return NextResponse.json({ error: result.message }, { status: result.status });
    }

    return NextResponse.json({ id: result.id, warning: result.warning }, { status: 201 });
  } catch (error) {
    if (error instanceof UnauthorizedError) {
      return NextResponse.json({ error: error.message }, { status: 401 });
    }
    if (error instanceof ForbiddenError) {
      return NextResponse.json({ error: error.message }, { status: 403 });
    }
    console.error("POST /api/compliance/credentials failed", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
