export type ApproximateAvailability =
  | "likely_available"
  | "available_this_week"
  | "recently_active";

export const APPROXIMATE_AVAILABILITY_LABELS: Record<ApproximateAvailability, string> = {
  likely_available: "Likely available soon",
  available_this_week: "Available this week",
  recently_active: "Recently active",
};
