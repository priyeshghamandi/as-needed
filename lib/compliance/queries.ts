import { and, asc, count, desc, eq, inArray, sql } from "drizzle-orm";
import { db } from "@/drizzle/db";
import {
  CredentialTable,
  HealthcareProfessionalTable,
  UserTable,
} from "@/drizzle/schema";
import { computeExpiryDisplayBadge, formatExpiryDate } from "@/lib/compliance/expiry-display";
import {
  buildCredentialWhereConditions,
  COMPLIANCE_PAGE_SIZE,
  type ComplianceListParams,
} from "@/lib/compliance/list-filters";

export type CredentialListItem = {
  id: string;
  professionalId: string;
  professionalName: string;
  professionalRole: string;
  type: string;
  name: string;
  licenseNumber: string | null;
  issuingAuthority: string | null;
  expiresAt: string | null;
  expiresDisplay: string;
  status: string;
  displayBadge: string | null;
  verifiedAt: string | null;
  updatedAt: string;
};

export type ComplianceKpis = {
  pendingReview: number;
  expiringSoon: number;
  expired: number;
  verified: number;
};

export async function getComplianceKpis(agencyId: string): Promise<ComplianceKpis> {
  const rows = await db
    .select({
      status: CredentialTable.status,
      count: count(),
    })
    .from(CredentialTable)
    .where(eq(CredentialTable.agencyId, agencyId))
    .groupBy(CredentialTable.status);

  const map = Object.fromEntries(rows.map((r) => [r.status, Number(r.count)]));

  return {
    pendingReview: map.pending_review ?? 0,
    expiringSoon: map.expiring_soon ?? 0,
    expired: map.expired ?? 0,
    verified: map.verified ?? 0,
  };
}

export async function listCredentials(
  agencyId: string,
  params: ComplianceListParams,
) {
  const page = params.page ?? 1;
  const offset = (page - 1) * COMPLIANCE_PAGE_SIZE;
  const conditions = buildCredentialWhereConditions(agencyId, params);
  const where = and(...conditions);

  const [totalRow] = await db
    .select({ total: count() })
    .from(CredentialTable)
    .innerJoin(
      HealthcareProfessionalTable,
      eq(CredentialTable.professionalId, HealthcareProfessionalTable.id),
    )
    .where(where);

  const total = Number(totalRow?.total ?? 0);

  const rows = await db
    .select({
      id: CredentialTable.id,
      professionalId: CredentialTable.professionalId,
      firstName: HealthcareProfessionalTable.firstName,
      lastName: HealthcareProfessionalTable.lastName,
      role: HealthcareProfessionalTable.role,
      type: CredentialTable.type,
      name: CredentialTable.name,
      licenseNumber: CredentialTable.licenseNumber,
      issuingAuthority: CredentialTable.issuingAuthority,
      expiresAt: CredentialTable.expiresAt,
      status: CredentialTable.status,
      verifiedAt: CredentialTable.verifiedAt,
      updatedAt: CredentialTable.updatedAt,
    })
    .from(CredentialTable)
    .innerJoin(
      HealthcareProfessionalTable,
      eq(CredentialTable.professionalId, HealthcareProfessionalTable.id),
    )
    .where(where)
    .orderBy(
      sql`${CredentialTable.expiresAt} asc nulls last`,
      asc(CredentialTable.status),
      desc(CredentialTable.updatedAt),
    )
    .limit(COMPLIANCE_PAGE_SIZE)
    .offset(offset);

  const items: CredentialListItem[] = rows.map((row) => {
    const displayBadge = computeExpiryDisplayBadge(row.status, row.expiresAt);
    return {
      id: row.id,
      professionalId: row.professionalId,
      professionalName: `${row.firstName} ${row.lastName}`,
      professionalRole: row.role,
      type: row.type,
      name: row.name,
      licenseNumber: row.licenseNumber,
      issuingAuthority: row.issuingAuthority,
      expiresAt: row.expiresAt,
      expiresDisplay: formatExpiryDate(row.expiresAt),
      status: row.status,
      displayBadge,
      verifiedAt: row.verifiedAt?.toISOString() ?? null,
      updatedAt: row.updatedAt.toISOString(),
    };
  });

  return {
    items,
    total,
    page,
    pageCount: Math.max(1, Math.ceil(total / COMPLIANCE_PAGE_SIZE)),
    kpis: await getComplianceKpis(agencyId),
  };
}

export type CredentialDetail = {
  id: string;
  agencyId: string;
  professionalId: string;
  professionalName: string;
  professionalRole: string;
  type: string;
  name: string;
  licenseNumber: string | null;
  issuingAuthority: string | null;
  issuedAt: string | null;
  expiresAt: string | null;
  expiresDisplay: string;
  status: string;
  displayBadge: string | null;
  documentUrl: string | null;
  reviewNotes: string | null;
  verifiedAt: string | null;
  verifiedByName: string | null;
  createdAt: string;
  updatedAt: string;
};

export async function getCredentialDetail(
  agencyId: string,
  credentialId: string,
): Promise<CredentialDetail | null> {
  const [row] = await db
    .select({
      id: CredentialTable.id,
      agencyId: CredentialTable.agencyId,
      professionalId: CredentialTable.professionalId,
      firstName: HealthcareProfessionalTable.firstName,
      lastName: HealthcareProfessionalTable.lastName,
      role: HealthcareProfessionalTable.role,
      type: CredentialTable.type,
      name: CredentialTable.name,
      licenseNumber: CredentialTable.licenseNumber,
      issuingAuthority: CredentialTable.issuingAuthority,
      issuedAt: CredentialTable.issuedAt,
      expiresAt: CredentialTable.expiresAt,
      status: CredentialTable.status,
      documentUrl: CredentialTable.documentUrl,
      reviewNotes: CredentialTable.reviewNotes,
      verifiedAt: CredentialTable.verifiedAt,
      verifiedByName: UserTable.name,
      createdAt: CredentialTable.createdAt,
      updatedAt: CredentialTable.updatedAt,
    })
    .from(CredentialTable)
    .innerJoin(
      HealthcareProfessionalTable,
      eq(CredentialTable.professionalId, HealthcareProfessionalTable.id),
    )
    .leftJoin(UserTable, eq(CredentialTable.verifiedByUserId, UserTable.id))
    .where(
      and(eq(CredentialTable.id, credentialId), eq(CredentialTable.agencyId, agencyId)),
    )
    .limit(1);

  if (!row) return null;

  return {
    id: row.id,
    agencyId: row.agencyId,
    professionalId: row.professionalId,
    professionalName: `${row.firstName} ${row.lastName}`,
    professionalRole: row.role,
    type: row.type,
    name: row.name,
    licenseNumber: row.licenseNumber,
    issuingAuthority: row.issuingAuthority,
    issuedAt: row.issuedAt,
    expiresAt: row.expiresAt,
    expiresDisplay: formatExpiryDate(row.expiresAt),
    status: row.status,
    displayBadge: computeExpiryDisplayBadge(row.status, row.expiresAt),
    documentUrl: row.documentUrl,
    reviewNotes: row.reviewNotes,
    verifiedAt: row.verifiedAt?.toISOString() ?? null,
    verifiedByName: row.verifiedByName,
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
  };
}

export async function listProfessionalsForCombobox(agencyId: string) {
  return db
    .select({
      id: HealthcareProfessionalTable.id,
      firstName: HealthcareProfessionalTable.firstName,
      lastName: HealthcareProfessionalTable.lastName,
      role: HealthcareProfessionalTable.role,
      city: HealthcareProfessionalTable.city,
    })
    .from(HealthcareProfessionalTable)
    .where(
      and(
        eq(HealthcareProfessionalTable.agencyId, agencyId),
        eq(HealthcareProfessionalTable.isActive, true),
      ),
    )
    .orderBy(asc(HealthcareProfessionalTable.lastName), asc(HealthcareProfessionalTable.firstName));
}

export async function assertProfessionalInAgency(
  agencyId: string,
  professionalId: string,
): Promise<boolean> {
  const [row] = await db
    .select({ id: HealthcareProfessionalTable.id })
    .from(HealthcareProfessionalTable)
    .where(
      and(
        eq(HealthcareProfessionalTable.id, professionalId),
        eq(HealthcareProfessionalTable.agencyId, agencyId),
      ),
    )
    .limit(1);

  return Boolean(row);
}

export async function findDuplicateCredentialWarning(
  agencyId: string,
  professionalId: string,
  type: string,
  licenseNumber: string | null,
  excludeId?: string,
): Promise<boolean> {
  if (!licenseNumber?.trim()) return false;

  const conditions = [
    eq(CredentialTable.agencyId, agencyId),
    eq(CredentialTable.professionalId, professionalId),
    eq(CredentialTable.type, type),
    eq(CredentialTable.licenseNumber, licenseNumber.trim()),
  ];

  const rows = await db
    .select({ id: CredentialTable.id })
    .from(CredentialTable)
    .where(and(...conditions))
    .limit(5);

  return rows.some((r) => r.id !== excludeId);
}
