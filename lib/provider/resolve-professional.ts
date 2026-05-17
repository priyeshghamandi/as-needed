import { eq } from "drizzle-orm";
import { db } from "@/drizzle/db";
import { HealthcareProfessionalTable } from "@/drizzle/schema";

export type ResolvedProfessional = {
  id: string;
  firstName: string;
  lastName: string;
  agencyId: string;
};

export async function resolveProfessionalByUserId(
  userId: string,
): Promise<ResolvedProfessional | null> {
  const [row] = await db
    .select({
      id: HealthcareProfessionalTable.id,
      firstName: HealthcareProfessionalTable.firstName,
      lastName: HealthcareProfessionalTable.lastName,
      agencyId: HealthcareProfessionalTable.agencyId,
    })
    .from(HealthcareProfessionalTable)
    .where(eq(HealthcareProfessionalTable.userId, userId))
    .limit(1);

  return row ?? null;
}
