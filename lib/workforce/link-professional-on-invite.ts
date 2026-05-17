import { and, eq, isNull, sql } from "drizzle-orm";
import type { db } from "@/drizzle/db";
import { HealthcareProfessionalTable } from "@/drizzle/schema";

type DbOrTx = Pick<typeof db, "select" | "update">;

/** Links an existing workforce row to the user who accepted a provider invite. */
export async function linkProfessionalToUserOnInvite(
  database: DbOrTx,
  params: { userId: string; email: string; agencyId: string },
): Promise<string | null> {
  const email = params.email.trim().toLowerCase();

  const [pro] = await database
    .select({ id: HealthcareProfessionalTable.id })
    .from(HealthcareProfessionalTable)
    .where(
      and(
        eq(HealthcareProfessionalTable.agencyId, params.agencyId),
        isNull(HealthcareProfessionalTable.userId),
        sql`lower(${HealthcareProfessionalTable.email}) = ${email}`,
      ),
    )
    .limit(1);

  if (!pro) return null;

  await database
    .update(HealthcareProfessionalTable)
    .set({ userId: params.userId, updatedAt: new Date() })
    .where(eq(HealthcareProfessionalTable.id, pro.id));

  return pro.id;
}
