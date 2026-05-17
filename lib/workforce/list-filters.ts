import { eq, ilike, or, type SQL } from "drizzle-orm";
import { HealthcareProfessionalTable } from "@/drizzle/schema";
import type { ComplianceStatus, WorkforceListParams } from "@/lib/workforce/queries";

export function parseWorkforceListParams(
  searchParams: URLSearchParams,
): WorkforceListParams {
  const q = searchParams.get("q")?.trim() || undefined;
  const role = searchParams.get("role")?.trim() || undefined;
  const availability = searchParams.get("availability")?.trim() || undefined;
  const complianceRaw = searchParams.get("compliance")?.trim();
  const compliance =
    complianceRaw === "clear" || complianceRaw === "attention" || complianceRaw === "blocked"
      ? (complianceRaw as ComplianceStatus)
      : undefined;
  const activeParam = searchParams.get("active");
  const active = activeParam === "false" ? false : true;
  const sortRaw = searchParams.get("sort");
  const sort =
    sortRaw === "reliability" || sortRaw === "updated" || sortRaw === "name"
      ? sortRaw
      : "name";
  const pageRaw = Number.parseInt(searchParams.get("page") ?? "1", 10);
  const page = Number.isFinite(pageRaw) && pageRaw > 0 ? pageRaw : 1;

  return { q, role, availability, compliance, active, sort, page };
}

export function buildProfessionalWhereConditions(
  agencyId: string,
  params: Pick<WorkforceListParams, "q" | "role" | "availability" | "active">,
): SQL[] {
  const { q, role, availability, active = true } = params;
  const conditions: SQL[] = [
    eq(HealthcareProfessionalTable.agencyId, agencyId),
    eq(HealthcareProfessionalTable.isActive, active),
  ];

  if (q) {
    const like = `%${q}%`;
    conditions.push(
      or(
        ilike(HealthcareProfessionalTable.firstName, like),
        ilike(HealthcareProfessionalTable.lastName, like),
        ilike(HealthcareProfessionalTable.email, like),
      )!,
    );
  }

  if (role) {
    conditions.push(eq(HealthcareProfessionalTable.role, role as never));
  }

  if (availability) {
    conditions.push(
      eq(HealthcareProfessionalTable.availabilityStatus, availability as never),
    );
  }

  return conditions;
}

export function buildListQueryString(params: WorkforceListParams): string {
  const sp = new URLSearchParams();
  if (params.q) sp.set("q", params.q);
  if (params.role) sp.set("role", params.role);
  if (params.availability) sp.set("availability", params.availability);
  if (params.compliance) sp.set("compliance", params.compliance);
  if (params.active === false) sp.set("active", "false");
  if (params.sort && params.sort !== "name") sp.set("sort", params.sort);
  if (params.page && params.page > 1) sp.set("page", String(params.page));
  const qs = sp.toString();
  return qs ? `?${qs}` : "";
}
