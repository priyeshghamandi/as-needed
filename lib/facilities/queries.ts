import { and, asc, count, desc, eq, ilike, inArray, sql } from "drizzle-orm";
import { db } from "@/drizzle/db";
import {
  ActivityLogTable,
  FacilityTable,
  ShiftTable,
  StaffingRequestTable,
  UserInviteTable,
  UserRoleTable,
  UserTable,
} from "@/drizzle/schema";
import { buildFacilityWhereConditions } from "@/lib/facilities/list-filters";

export type PortalAccessStatus = "invited" | "active" | "not_invited";

export const PAGE_SIZE = 25;

const ACTIVE_REQUEST_STATUSES = [
  "open",
  "matching",
  "partially_filled",
  "confirmed",
  "at_risk",
] as const;

export interface FacilitiesListItem {
  id: string;
  name: string;
  type: string;
  city: string | null;
  state: string | null;
  contactName: string | null;
  contactEmail: string | null;
  openRequestsCount: number;
  portalAccess: PortalAccessStatus;
  updatedAt: Date;
}

export interface FacilitiesListParams {
  q?: string;
  type?: string;
  state?: string;
  sort?: "name" | "updated" | "city";
  page?: number;
}

export interface FacilitiesListResult {
  items: FacilitiesListItem[];
  total: number;
  page: number;
  pageCount: number;
}

export async function getFacilitiesList(
  agencyId: string,
  params: FacilitiesListParams = {},
): Promise<FacilitiesListResult> {
  const { sort = "name", page = 1 } = params;
  const conditions = buildFacilityWhereConditions(agencyId, params);

  const orderBy =
    sort === "updated"
      ? [desc(FacilityTable.updatedAt)]
      : sort === "city"
        ? [asc(FacilityTable.state), asc(FacilityTable.city)]
        : [asc(FacilityTable.name)];

  const allFacilities = await db
    .select({
      id: FacilityTable.id,
      name: FacilityTable.name,
      type: FacilityTable.type,
      city: FacilityTable.city,
      state: FacilityTable.state,
      contactName: FacilityTable.contactName,
      contactEmail: FacilityTable.contactEmail,
      updatedAt: FacilityTable.updatedAt,
    })
    .from(FacilityTable)
    .where(and(...conditions))
    .orderBy(...orderBy);

  const total = allFacilities.length;
  const pageCount = Math.ceil(total / PAGE_SIZE);
  const safePage = Math.max(1, Math.min(page, pageCount || 1));
  const offset = (safePage - 1) * PAGE_SIZE;
  const pageItems = allFacilities.slice(offset, offset + PAGE_SIZE);

  if (pageItems.length === 0) {
    return { items: [], total, page: safePage, pageCount };
  }

  const pageIds = pageItems.map((f) => f.id);
  const emails = pageItems
    .map((f) => f.contactEmail?.toLowerCase())
    .filter((e): e is string => Boolean(e));

  const [requestCounts, pendingInvites, activeUsers] = await Promise.all([
    db
      .select({
        facilityId: StaffingRequestTable.facilityId,
        openCount: count(),
      })
      .from(StaffingRequestTable)
      .where(
        and(
          inArray(StaffingRequestTable.facilityId, pageIds),
          inArray(StaffingRequestTable.status, [...ACTIVE_REQUEST_STATUSES]),
        ),
      )
      .groupBy(StaffingRequestTable.facilityId),

    db
      .select({
        facilityId: UserInviteTable.facilityId,
        email: UserInviteTable.email,
      })
      .from(UserInviteTable)
      .where(
        and(
          eq(UserInviteTable.agencyId, agencyId),
          eq(UserInviteTable.status, "pending"),
          eq(UserInviteTable.inviteType, "facility_user"),
        ),
      ),

    emails.length > 0
      ? db
          .select({ email: UserTable.email })
          .from(UserTable)
          .innerJoin(UserRoleTable, eq(UserRoleTable.userId, UserTable.id))
          .where(
            and(
              eq(UserRoleTable.agencyId, agencyId),
              eq(UserRoleTable.role, "facility_user"),
              inArray(UserTable.email, emails),
            ),
          )
      : Promise.resolve([]),
  ]);

  const openMap = new Map(requestCounts.map((r) => [r.facilityId, Number(r.openCount)]));
  const activeEmailSet = new Set(activeUsers.map((u) => u.email.toLowerCase()));
  const pendingByFacility = new Map<string, boolean>();
  const pendingByEmail = new Map<string, boolean>();
  for (const inv of pendingInvites) {
    if (inv.facilityId) pendingByFacility.set(inv.facilityId, true);
    pendingByEmail.set(inv.email.toLowerCase(), true);
  }

  const items: FacilitiesListItem[] = pageItems.map((f) => {
    const email = f.contactEmail?.toLowerCase();
    let portalAccess: PortalAccessStatus = "not_invited";
    if (email && activeEmailSet.has(email)) portalAccess = "active";
    else if (pendingByFacility.get(f.id) || (email && pendingByEmail.has(email))) {
      portalAccess = "invited";
    }

    return {
      ...f,
      openRequestsCount: openMap.get(f.id) ?? 0,
      portalAccess,
    };
  });

  return { items, total, page: safePage, pageCount };
}

export interface RecentRequest {
  id: string;
  title: string;
  status: string;
  updatedAt: Date;
}

export interface ActivityEntry {
  id: string;
  action: string;
  createdAt: Date;
  actorName: string | null;
}

export interface FacilityDetail {
  id: string;
  name: string;
  type: string;
  contactName: string | null;
  contactEmail: string | null;
  contactPhone: string | null;
  addressLine1: string | null;
  addressLine2: string | null;
  city: string | null;
  state: string | null;
  country: string | null;
  postalCode: string | null;
  notes: string | null;
  createdAt: Date;
  updatedAt: Date;
  openRequestsCount: number;
  confirmedShiftsCount: number;
  portalAccess: PortalAccessStatus;
  pendingInviteEmail: string | null;
  recentRequests: RecentRequest[];
  activityFeed: ActivityEntry[];
}

export async function getFacilityDetail(
  agencyId: string,
  facilityId: string,
): Promise<FacilityDetail | null> {
  const rows = await db
    .select()
    .from(FacilityTable)
    .where(and(eq(FacilityTable.id, facilityId), eq(FacilityTable.agencyId, agencyId)))
    .limit(1);

  const facility = rows[0];
  if (!facility) return null;

  const email = facility.contactEmail?.toLowerCase();

  const [
    openRequestsResult,
    confirmedShiftsResult,
    recentRequests,
    activityRows,
    pendingInvite,
    activeUser,
  ] = await Promise.all([
    db
      .select({ count: count() })
      .from(StaffingRequestTable)
      .where(
        and(
          eq(StaffingRequestTable.facilityId, facilityId),
          inArray(StaffingRequestTable.status, [...ACTIVE_REQUEST_STATUSES]),
        ),
      ),

    db
      .select({ count: count() })
      .from(ShiftTable)
      .where(
        and(
          eq(ShiftTable.facilityId, facilityId),
          inArray(ShiftTable.status, ["confirmed", "completed"]),
        ),
      ),

    db
      .select({
        id: StaffingRequestTable.id,
        title: StaffingRequestTable.title,
        status: StaffingRequestTable.status,
        updatedAt: StaffingRequestTable.updatedAt,
      })
      .from(StaffingRequestTable)
      .where(eq(StaffingRequestTable.facilityId, facilityId))
      .orderBy(desc(StaffingRequestTable.updatedAt))
      .limit(5),

    db
      .select({
        id: ActivityLogTable.id,
        action: ActivityLogTable.action,
        createdAt: ActivityLogTable.createdAt,
        actorName: UserTable.name,
      })
      .from(ActivityLogTable)
      .leftJoin(UserTable, eq(ActivityLogTable.actorUserId, UserTable.id))
      .where(
        and(
          eq(ActivityLogTable.agencyId, agencyId),
          eq(ActivityLogTable.entityType, "facility"),
          eq(ActivityLogTable.entityId, facilityId),
        ),
      )
      .orderBy(desc(ActivityLogTable.createdAt))
      .limit(5),

    db
      .select({ email: UserInviteTable.email })
      .from(UserInviteTable)
      .where(
        and(
          eq(UserInviteTable.agencyId, agencyId),
          eq(UserInviteTable.status, "pending"),
          eq(UserInviteTable.inviteType, "facility_user"),
          eq(UserInviteTable.facilityId, facilityId),
        ),
      )
      .limit(1),

    email
      ? db
          .select({ id: UserTable.id })
          .from(UserTable)
          .innerJoin(UserRoleTable, eq(UserRoleTable.userId, UserTable.id))
          .where(
            and(
              eq(UserRoleTable.agencyId, agencyId),
              eq(UserRoleTable.role, "facility_user"),
              ilike(UserTable.email, email),
            ),
          )
          .limit(1)
      : Promise.resolve([]),
  ]);

  let portalAccess: PortalAccessStatus = "not_invited";
  if (activeUser.length > 0) portalAccess = "active";
  else if (pendingInvite[0]) portalAccess = "invited";

  return {
    id: facility.id,
    name: facility.name,
    type: facility.type,
    contactName: facility.contactName,
    contactEmail: facility.contactEmail,
    contactPhone: facility.contactPhone,
    addressLine1: facility.addressLine1,
    addressLine2: facility.addressLine2,
    city: facility.city,
    state: facility.state,
    country: facility.country,
    postalCode: facility.postalCode,
    notes: facility.notes,
    createdAt: facility.createdAt,
    updatedAt: facility.updatedAt,
    openRequestsCount: Number(openRequestsResult[0]?.count ?? 0),
    confirmedShiftsCount: Number(confirmedShiftsResult[0]?.count ?? 0),
    portalAccess,
    pendingInviteEmail: pendingInvite[0]?.email ?? null,
    recentRequests,
    activityFeed: activityRows,
  };
}

export async function isContactEmailTaken(
  agencyId: string,
  email: string,
  excludeFacilityId?: string,
): Promise<boolean> {
  const conditions = [
    eq(FacilityTable.agencyId, agencyId),
    ilike(FacilityTable.contactEmail, email),
  ];
  if (excludeFacilityId) {
    conditions.push(sql`${FacilityTable.id} <> ${excludeFacilityId}`);
  }
  const [row] = await db
    .select({ id: FacilityTable.id })
    .from(FacilityTable)
    .where(and(...conditions))
    .limit(1);
  return Boolean(row);
}
