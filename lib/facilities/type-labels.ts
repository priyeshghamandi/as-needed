export const FACILITY_TYPES = [
  "hospital",
  "nursing_home",
  "clinic",
  "assisted_living",
  "home_healthcare",
  "other",
] as const;

export type FacilityType = (typeof FACILITY_TYPES)[number];

export const FACILITY_TYPE_LABELS: Record<FacilityType, string> = {
  hospital: "Hospital",
  nursing_home: "Nursing Home",
  clinic: "Clinic",
  assisted_living: "Assisted Living",
  home_healthcare: "Home Healthcare",
  other: "Other",
};

export function facilityTypeLabel(type: string): string {
  return FACILITY_TYPE_LABELS[type as FacilityType] ?? "Other";
}
