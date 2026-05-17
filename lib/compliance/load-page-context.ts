import { eq } from "drizzle-orm";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { db } from "@/drizzle/db";
import { AgencyTable, UserTable } from "@/drizzle/schema";
import { canViewCompliance } from "@/lib/auth/compliance-access-rules";

export async function loadCompliancePageContext(callbackPath = "/compliance") {
  const session = await auth();
  const userId = session?.user?.id;
  const agencyId = session?.user?.agencyId;
  const primaryRole = session?.user?.primaryRole ?? null;

  if (!userId || !agencyId) redirect(`/login?callbackUrl=${callbackPath}`);

  if (!canViewCompliance(primaryRole)) redirect("/dashboard");

  const [agency, user] = await Promise.all([
    db
      .select({ name: AgencyTable.name })
      .from(AgencyTable)
      .where(eq(AgencyTable.id, agencyId))
      .limit(1)
      .then(([r]) => r ?? null),
    db
      .select({ name: UserTable.name })
      .from(UserTable)
      .where(eq(UserTable.id, userId))
      .limit(1)
      .then(([r]) => r ?? null),
  ]);

  if (!agency) redirect("/login");

  const userName = user?.name ?? "Team Member";
  const userInitials = userName
    .split(" ")
    .map((s) => s[0] ?? "")
    .join("")
    .toUpperCase()
    .slice(0, 2);

  return {
    agencyId,
    agencyName: agency.name,
    userName,
    userInitials,
    primaryRole: primaryRole ?? "compliance_manager",
  };
}
