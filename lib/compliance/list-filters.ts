import { and, eq, gte, ilike, inArray, isNull, lte, or, sql, type SQL } from "drizzle-orm";
import {
  CredentialTable,
  HealthcareProfessionalTable,
} from "@/drizzle/schema";
import type { CredentialStatus } from "@/lib/compliance/credential-transitions";

export const COMPLIANCE_PAGE_SIZE = 25;

export type ExpiryFilter = "expired" | "next_30_days" | "next_90_days" | "no_expiry";

export interface ComplianceListParams {
  q?: string;
  status?: CredentialStatus[];
  professionalId?: string;
  expiry?: ExpiryFilter;
  page?: number;
}

export function parseComplianceListParams(searchParams: URLSearchParams): ComplianceListParams {
  const q = searchParams.get("q")?.trim() || undefined;
  const statusRaw = searchParams.get("status");
  const status = statusRaw
    ? statusRaw
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean) as CredentialStatus[]
    : undefined;
  const professionalId = searchParams.get("professionalId")?.trim() || undefined;
  const expiryRaw = searchParams.get("expiry");
  const expiry =
    expiryRaw === "expired" ||
    expiryRaw === "next_30_days" ||
    expiryRaw === "next_90_days" ||
    expiryRaw === "no_expiry"
      ? expiryRaw
      : undefined;
  const pageRaw = Number.parseInt(searchParams.get("page") ?? "1", 10);
  const page = Number.isFinite(pageRaw) && pageRaw > 0 ? pageRaw : 1;
  return { q, status, professionalId, expiry, page };
}

export function buildCredentialWhereConditions(
  agencyId: string,
  params: Pick<ComplianceListParams, "q" | "status" | "professionalId" | "expiry">,
): SQL[] {
  const conditions: SQL[] = [eq(CredentialTable.agencyId, agencyId)];

  if (params.status?.length) {
    conditions.push(inArray(CredentialTable.status, params.status));
  }

  if (params.professionalId) {
    conditions.push(eq(CredentialTable.professionalId, params.professionalId));
  }

  if (params.q) {
    const like = `%${params.q}%`;
    conditions.push(
      or(
        ilike(CredentialTable.name, like),
        ilike(CredentialTable.licenseNumber, like),
        ilike(CredentialTable.type, like),
        ilike(HealthcareProfessionalTable.firstName, like),
        ilike(HealthcareProfessionalTable.lastName, like),
        sql`concat(${HealthcareProfessionalTable.firstName}, ' ', ${HealthcareProfessionalTable.lastName}) ilike ${like}`,
      )!,
    );
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const todayStr = today.toISOString().slice(0, 10);

  if (params.expiry === "expired") {
    conditions.push(lte(CredentialTable.expiresAt, todayStr));
  } else if (params.expiry === "next_30_days") {
    const in30 = new Date(today);
    in30.setDate(in30.getDate() + 30);
    conditions.push(
      and(
        gte(CredentialTable.expiresAt, todayStr),
        lte(CredentialTable.expiresAt, in30.toISOString().slice(0, 10)),
      )!,
    );
  } else if (params.expiry === "next_90_days") {
    const in90 = new Date(today);
    in90.setDate(in90.getDate() + 90);
    conditions.push(
      and(
        gte(CredentialTable.expiresAt, todayStr),
        lte(CredentialTable.expiresAt, in90.toISOString().slice(0, 10)),
      )!,
    );
  } else if (params.expiry === "no_expiry") {
    conditions.push(isNull(CredentialTable.expiresAt));
  }

  return conditions;
}

export function buildListQueryString(params: ComplianceListParams): string {
  const sp = new URLSearchParams();
  if (params.q) sp.set("q", params.q);
  if (params.status?.length) sp.set("status", params.status.join(","));
  if (params.professionalId) sp.set("professionalId", params.professionalId);
  if (params.expiry) sp.set("expiry", params.expiry);
  if (params.page && params.page > 1) sp.set("page", String(params.page));
  const qs = sp.toString();
  return qs ? `?${qs}` : "";
}
