import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { requireAuthContext, assertAgencyAccess } from "@/lib/auth/authorization";
import { db } from "@/drizzle/db";
import { AgencyTable } from "@/drizzle/schema";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ agencyId: string }> },
) {
  const { agencyId } = await params;

  try {
    const { context } = await requireAuthContext();
    await assertAgencyAccess(context.userId, agencyId);

    const rows = await db
      .select({
        id: AgencyTable.id,
        name: AgencyTable.name,
        status: AgencyTable.status,
      })
      .from(AgencyTable)
      .where(eq(AgencyTable.id, agencyId))
      .limit(1);

    const agency = rows[0];
    if (!agency) {
      return NextResponse.json({ error: "Agency not found" }, { status: 404 });
    }

    return NextResponse.json({ agency });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Forbidden";
    const status = message.includes("access") ? 403 : 401;
    return NextResponse.json({ error: message }, { status });
  }
}
