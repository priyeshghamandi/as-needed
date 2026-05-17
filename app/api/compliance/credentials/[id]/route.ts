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
import {
  deleteCredentialCore,
  updateCredentialCore,
} from "@/lib/compliance/credential-operations";
import { getCredentialDetail } from "@/lib/compliance/queries";
import { credentialUpdateSchema } from "@/lib/validations/credential";

type RouteContext = { params: Promise<{ id: string }> };

export async function GET(_request: Request, context: RouteContext) {
  try {
    const { context: authCtx } = await requireAuthContext();
    const agencyId = authCtx.agencyId;
    if (!agencyId) {
      return NextResponse.json({ error: "Agency context required" }, { status: 403 });
    }

    await assertCanViewCompliance(authCtx.userId, agencyId);

    const { id } = await context.params;
    const detail = await getCredentialDetail(agencyId, id);

    if (!detail) {
      return NextResponse.json({ error: "Credential not found." }, { status: 404 });
    }

    return NextResponse.json(detail);
  } catch (error) {
    if (error instanceof UnauthorizedError) {
      return NextResponse.json({ error: error.message }, { status: 401 });
    }
    if (error instanceof ForbiddenError) {
      return NextResponse.json({ error: error.message }, { status: 403 });
    }
    console.error("GET /api/compliance/credentials/[id] failed", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function PATCH(request: Request, context: RouteContext) {
  try {
    const { context: authCtx } = await requireAuthContext();
    const agencyId = authCtx.agencyId;
    if (!agencyId) {
      return NextResponse.json({ error: "Agency context required" }, { status: 403 });
    }

    await assertCanManageCompliance(authCtx.userId, agencyId);

    const { id } = await context.params;
    const body = await request.json();
    const parsed = credentialUpdateSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message ?? "Invalid input" },
        { status: 400 },
      );
    }

    const result = await updateCredentialCore(agencyId, id, parsed.data);
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
    console.error("PATCH /api/compliance/credentials/[id] failed", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function DELETE(_request: Request, context: RouteContext) {
  try {
    const { context: authCtx } = await requireAuthContext();
    const agencyId = authCtx.agencyId;
    if (!agencyId) {
      return NextResponse.json({ error: "Agency context required" }, { status: 403 });
    }

    await assertCanManageCompliance(authCtx.userId, agencyId);

    const { id } = await context.params;
    const result = await deleteCredentialCore(agencyId, id);
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
    console.error("DELETE /api/compliance/credentials/[id] failed", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
