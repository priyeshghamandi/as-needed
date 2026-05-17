import { and, desc, eq } from "drizzle-orm";
import { db } from "@/drizzle/db";
import {
  AgencyTable,
  UserInviteTable,
  UserRoleTable,
  UserTable,
} from "@/drizzle/schema";
import { agencyRowToGeographicLocation } from "@/lib/settings/agency-location";
import { parseAgencyPreferences } from "@/lib/validations/agency-preferences";

export type AgencyMemberRow = {
  userId: string;
  name: string;
  email: string;
  role: string;
  joinedAt: Date;
};

export type PendingInviteRow = {
  id: string;
  email: string;
  role: string;
  createdAt: Date;
  expiresAt: Date;
};

export type AgencySettingsDto = {
  agencyId: string;
  profile: {
    name: string;
    phone: string | null;
    website: string | null;
    logoUrl: string | null;
    agencyType: string | null;
    workforceSize: string | null;
    operationalContactName: string | null;
    operationalContactEmail: string | null;
    description: string | null;
    staffingSpecialties: string[];
  };
  serviceArea: {
    primaryServiceArea: ReturnType<typeof agencyRowToGeographicLocation>;
    serviceAreaRadiusMiles: number;
  };
  preferences: ReturnType<typeof parseAgencyPreferences>;
  members: AgencyMemberRow[];
  pendingInvites: PendingInviteRow[];
};

export async function getAgencySettingsDto(agencyId: string): Promise<AgencySettingsDto | null> {
  const [agency] = await db
    .select({
      id: AgencyTable.id,
      name: AgencyTable.name,
      phone: AgencyTable.phone,
      website: AgencyTable.website,
      logoUrl: AgencyTable.logoUrl,
      agencyType: AgencyTable.agencyType,
      workforceSize: AgencyTable.workforceSize,
      operationalContactName: AgencyTable.operationalContactName,
      operationalContactEmail: AgencyTable.operationalContactEmail,
      description: AgencyTable.description,
      staffingSpecialties: AgencyTable.staffingSpecialties,
      agencyPreferences: AgencyTable.agencyPreferences,
      primaryServiceAreaName: AgencyTable.primaryServiceAreaName,
      primaryServiceAreaPlaceId: AgencyTable.primaryServiceAreaPlaceId,
      primaryServiceAreaCity: AgencyTable.primaryServiceAreaCity,
      primaryServiceAreaState: AgencyTable.primaryServiceAreaState,
      primaryServiceAreaCountry: AgencyTable.primaryServiceAreaCountry,
      primaryServiceAreaLat: AgencyTable.primaryServiceAreaLat,
      primaryServiceAreaLng: AgencyTable.primaryServiceAreaLng,
      serviceAreaRadiusMiles: AgencyTable.serviceAreaRadiusMiles,
    })
    .from(AgencyTable)
    .where(eq(AgencyTable.id, agencyId))
    .limit(1);

  if (!agency) return null;

  const members = await db
    .select({
      userId: UserTable.id,
      name: UserTable.name,
      email: UserTable.email,
      role: UserRoleTable.role,
      joinedAt: UserRoleTable.createdAt,
    })
    .from(UserRoleTable)
    .innerJoin(UserTable, eq(UserRoleTable.userId, UserTable.id))
    .where(eq(UserRoleTable.agencyId, agencyId))
    .orderBy(desc(UserRoleTable.createdAt));

  const pendingInvites = await db
    .select({
      id: UserInviteTable.id,
      email: UserInviteTable.email,
      role: UserInviteTable.role,
      createdAt: UserInviteTable.createdAt,
      expiresAt: UserInviteTable.expiresAt,
    })
    .from(UserInviteTable)
    .where(
      and(eq(UserInviteTable.agencyId, agencyId), eq(UserInviteTable.status, "pending")),
    )
    .orderBy(desc(UserInviteTable.createdAt));

  return {
    agencyId: agency.id,
    profile: {
      name: agency.name,
      phone: agency.phone,
      website: agency.website,
      logoUrl: agency.logoUrl,
      agencyType: agency.agencyType,
      workforceSize: agency.workforceSize,
      operationalContactName: agency.operationalContactName,
      operationalContactEmail: agency.operationalContactEmail,
      description: agency.description,
      staffingSpecialties: agency.staffingSpecialties ?? [],
    },
    serviceArea: {
      primaryServiceArea: agencyRowToGeographicLocation(agency),
      serviceAreaRadiusMiles: agency.serviceAreaRadiusMiles,
    },
    preferences: parseAgencyPreferences(agency.agencyPreferences),
    members: members.map((m) => ({
      ...m,
      name: m.name ?? "Team member",
    })),
    pendingInvites,
  };
}
