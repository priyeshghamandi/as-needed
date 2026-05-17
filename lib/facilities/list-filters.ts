import { eq, ilike, or, type SQL } from "drizzle-orm";
import { FacilityTable } from "@/drizzle/schema";

export interface FacilitiesListParams {
  q?: string;
  type?: string;
  state?: string;
  sort?: "name" | "updated" | "city";
  page?: number;
}

export function parseFacilitiesListParams(searchParams: URLSearchParams): FacilitiesListParams {
  const q = searchParams.get("q")?.trim() || undefined;
  const type = searchParams.get("type")?.trim() || undefined;
  const state = searchParams.get("state")?.trim() || undefined;
  const sortRaw = searchParams.get("sort");
  const sort =
    sortRaw === "updated" || sortRaw === "city" || sortRaw === "name" ? sortRaw : "name";
  const pageRaw = Number.parseInt(searchParams.get("page") ?? "1", 10);
  const page = Number.isFinite(pageRaw) && pageRaw > 0 ? pageRaw : 1;
  return { q, type, state, sort, page };
}

export function buildFacilityWhereConditions(
  agencyId: string,
  params: Pick<FacilitiesListParams, "q" | "type" | "state">,
): SQL[] {
  const { q, type, state } = params;
  const conditions: SQL[] = [eq(FacilityTable.agencyId, agencyId)];

  if (q) {
    const like = `%${q}%`;
    conditions.push(
      or(
        ilike(FacilityTable.name, like),
        ilike(FacilityTable.contactName, like),
        ilike(FacilityTable.contactEmail, like),
        ilike(FacilityTable.city, like),
      )!,
    );
  }

  if (type) {
    conditions.push(eq(FacilityTable.type, type as never));
  }

  if (state) {
    conditions.push(eq(FacilityTable.state, state));
  }

  return conditions;
}

export function buildListQueryString(params: FacilitiesListParams): string {
  const sp = new URLSearchParams();
  if (params.q) sp.set("q", params.q);
  if (params.type) sp.set("type", params.type);
  if (params.state) sp.set("state", params.state);
  if (params.sort && params.sort !== "name") sp.set("sort", params.sort);
  if (params.page && params.page > 1) sp.set("page", String(params.page));
  const qs = sp.toString();
  return qs ? `?${qs}` : "";
}
