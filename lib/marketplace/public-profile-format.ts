import type { ApproximateAvailability } from "@/lib/marketplace/approximate-availability";
import { WORKFORCE_ROLE_LABELS } from "@/lib/validations/workforce-professional";

export function roleDisplayLabel(role: string): string {
  return WORKFORCE_ROLE_LABELS[role as keyof typeof WORKFORCE_ROLE_LABELS] ?? role.toUpperCase();
}

export function yearsExperienceBucket(
  years: number | null | undefined,
): "<2" | "2-5" | "5+" | null {
  if (years == null || !Number.isFinite(years)) return null;
  if (years < 2) return "<2";
  if (years <= 5) return "2-5";
  return "5+";
}

export function yearsExperienceBucketLabel(bucket: string | null): string | null {
  if (!bucket) return null;
  if (bucket === "<2") return "Under 2 years experience";
  if (bucket === "2-5") return "2–5 years experience";
  if (bucket === "5+") return "5+ years experience";
  return null;
}

export function buildCredentialsSummaryLines(
  credentials: { name: string; status: string }[],
  storedSummary: string | null,
): string[] {
  if (storedSummary?.trim()) {
    return storedSummary
      .split("\n")
      .map((line) => line.trim())
      .filter(Boolean);
  }

  return credentials
    .filter((c) => c.status === "verified")
    .map((c) => `${c.name} — Verified`);
}

export function resolveHeadline(params: {
  profileHeadline: string | null;
  specialty: string | null;
  role: string;
}): string {
  if (params.profileHeadline?.trim()) return params.profileHeadline.trim();
  if (params.specialty?.trim()) return params.specialty.trim();
  return roleDisplayLabel(params.role);
}

export function isPublicProfileHeadlineConfigured(
  headline: string | null | undefined,
): boolean {
  return Boolean(headline?.trim());
}

export function buildPublicProfileWarnings(params: {
  isMarketplaceVisible: boolean;
  profileHeadline: string | null;
  publicSlug: string | null;
}): string[] {
  const warnings: string[] = [];
  if (params.isMarketplaceVisible && !isPublicProfileHeadlineConfigured(params.profileHeadline)) {
    warnings.push(
      "Add a public headline before customers with location set can view this profile.",
    );
  }
  if (params.isMarketplaceVisible && !params.publicSlug) {
    warnings.push("Public slug is missing — re-save marketplace visibility.");
  }
  return warnings;
}

export function isStoredApproximateAvailability(
  value: string | null | undefined,
): value is ApproximateAvailability {
  return (
    value === "likely_available" ||
    value === "available_this_week" ||
    value === "recently_active"
  );
}
