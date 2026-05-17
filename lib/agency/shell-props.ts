import { eq } from "drizzle-orm";
import { db } from "@/drizzle/db";
import { AgencyTable, UserTable } from "@/drizzle/schema";

export interface AgencyShellProps {
  agencyName: string;
  userName: string;
  userInitials: string;
}

export async function getAgencyShellProps(
  userId: string,
  agencyId: string,
): Promise<AgencyShellProps> {
  const [agency, user] = await Promise.all([
    db
      .select({ name: AgencyTable.name })
      .from(AgencyTable)
      .where(eq(AgencyTable.id, agencyId))
      .limit(1)
      .then((r) => r[0] ?? null),
    db
      .select({ name: UserTable.name })
      .from(UserTable)
      .where(eq(UserTable.id, userId))
      .limit(1)
      .then((r) => r[0] ?? null),
  ]);
  const userName = user?.name ?? "Team Member";
  const userInitials = userName
    .split(" ")
    .map((s: string) => s[0] ?? "")
    .join("")
    .toUpperCase()
    .slice(0, 2);
  return { agencyName: agency?.name ?? "Your Agency", userName, userInitials };
}
