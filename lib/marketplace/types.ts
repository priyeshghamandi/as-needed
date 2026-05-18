export type VisibilityBlockedReason =
  | "compliance_expired"
  | "profile_incomplete"
  | "location_out_of_area"
  | "manual_admin_block";

export type CustomerLocationContext = {
  latitude: number;
  longitude: number;
  city?: string;
  state?: string;
};

export type EligibleProfessional = {
  id: string;
  publicSlug: string;
  firstName: string;
  lastName: string;
  role: string;
  specialty: string | null;
  city: string | null;
  state: string | null;
};

export type GetEligibleProfessionalsFilters = {
  role?: string;
  categorySlug?: string;
  customerLocation?: CustomerLocationContext | null;
  agencyId?: string;
  limit?: number;
  offset?: number;
};

export const CATEGORY_SLUG_ROLE_MAP: Record<string, string> = {
  "registered-nurse": "rn",
  cna: "cna",
  lpn: "lpn",
  emt: "emt",
  cnm: "cnm",
  cns: "cns",
};
