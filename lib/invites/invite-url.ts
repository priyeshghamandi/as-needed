import { and, desc, eq, gt } from "drizzle-orm";
import { db } from "@/drizzle/db";
import { UserInviteTable } from "@/drizzle/schema";

export function formatInviteUrl(token: string): string {
  const base =
    process.env.NEXT_PUBLIC_APP_URL?.replace(/\/$/, "") ?? "http://localhost:3000";
  return `${base}/invite/${token}`;
}

export async function findPendingInviteUrl(filters: {
  agencyId: string;
  email: string;
  facilityId?: string | null;
  inviteType?: "provider" | "facility_user" | "agency_staff";
}): Promise<string | null> {
  const email = filters.email.trim().toLowerCase();
  const [row] = await db
    .select({ token: UserInviteTable.token })
    .from(UserInviteTable)
    .where(
      and(
        eq(UserInviteTable.email, email),
        eq(UserInviteTable.agencyId, filters.agencyId),
        eq(UserInviteTable.status, "pending"),
        gt(UserInviteTable.expiresAt, new Date()),
        filters.facilityId
          ? eq(UserInviteTable.facilityId, filters.facilityId)
          : undefined,
        filters.inviteType
          ? eq(UserInviteTable.inviteType, filters.inviteType)
          : undefined,
      ),
    )
    .orderBy(desc(UserInviteTable.createdAt))
    .limit(1);

  return row ? formatInviteUrl(row.token) : null;
}
