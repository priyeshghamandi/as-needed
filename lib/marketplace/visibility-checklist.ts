import { parseCoordinate } from "@/lib/matching/distance";
import {
  DEFAULT_SERVICE_AREA_RADIUS_MILES,
  type ServiceAreaCenter,
} from "@/lib/places/service-area-bounds";
import { isProfessionalInAgencyServiceArea } from "@/lib/marketplace/geo-eligibility";
import { deriveComplianceStatus } from "@/lib/workforce/shift-readiness";
import type { VisibilityBlockedReason } from "@/lib/marketplace/types";

export type ChecklistItemId =
  | "active"
  | "location"
  | "profile"
  | "compliance"
  | "agency_toggle"
  | "service_area";

export type ChecklistItem = {
  id: ChecklistItemId;
  label: string;
  passed: boolean;
  detail?: string;
};

export type VisibilityChecklistInput = {
  professional: {
    firstName: string;
    lastName: string;
    role: string;
    placeId: string | null;
    latitude: string | null;
    longitude: string | null;
    isActive: boolean;
    publicSlug: string | null;
  };
  agency: {
    primaryServiceAreaLat: string | null;
    primaryServiceAreaLng: string | null;
    serviceAreaRadiusMiles: number;
  };
  visibility: {
    isMarketplaceVisible: boolean;
    visibilityBlockedReason: string | null;
  };
  credentials: { status: string }[];
};

export type VisibilityChecklistResult = {
  items: ChecklistItem[];
  canEnable: boolean;
  blockReason: VisibilityBlockedReason | null;
};

export function buildVisibilityChecklist(
  input: VisibilityChecklistInput,
): VisibilityChecklistResult {
  const lat = parseCoordinate(input.professional.latitude);
  const lng = parseCoordinate(input.professional.longitude);
  const agencyLat = parseCoordinate(input.agency.primaryServiceAreaLat);
  const agencyLng = parseCoordinate(input.agency.primaryServiceAreaLng);

  const hasServiceArea = Boolean(
    agencyLat != null && agencyLng != null && input.agency.primaryServiceAreaLat,
  );

  const agencyCenter: ServiceAreaCenter | null =
    hasServiceArea && agencyLat != null && agencyLng != null
      ? { latitude: agencyLat, longitude: agencyLng }
      : null;

  const locationInArea =
    agencyCenter != null &&
    lat != null &&
    lng != null &&
    isProfessionalInAgencyServiceArea(
      { latitude: lat, longitude: lng },
      agencyCenter,
      input.agency.serviceAreaRadiusMiles || DEFAULT_SERVICE_AREA_RADIUS_MILES,
    );

  const profileComplete = Boolean(
    input.professional.firstName?.trim() &&
      input.professional.lastName?.trim() &&
      input.professional.role &&
      input.professional.publicSlug,
  );

  const compliance = deriveComplianceStatus(input.credentials);
  const complianceOk = compliance !== "blocked";

  const blockedReason = input.visibility.visibilityBlockedReason as VisibilityBlockedReason | null;

  const items: ChecklistItem[] = [
    {
      id: "service_area",
      label: "Agency service area configured",
      passed: hasServiceArea,
      detail: hasServiceArea ? undefined : "Complete agency onboarding to set a service area.",
    },
    {
      id: "active",
      label: "Professional is active",
      passed: input.professional.isActive,
    },
    {
      id: "location",
      label: "Location within agency service area",
      passed: Boolean(input.professional.placeId && locationInArea),
      detail: !input.professional.placeId
        ? "Add a validated location on the workforce profile."
        : !locationInArea
          ? "Location is outside your agency service area."
          : undefined,
    },
    {
      id: "profile",
      label: "Profile ready for marketplace (name, role, public URL)",
      passed: profileComplete,
      detail: profileComplete ? undefined : "A public profile URL is generated when requirements are met.",
    },
    {
      id: "compliance",
      label: "Compliance credentials in good standing",
      passed: complianceOk,
      detail: complianceOk ? undefined : "Resolve expired or rejected credentials.",
    },
    {
      id: "agency_toggle",
      label: "Visible on marketplace (agency opt-in)",
      passed: input.visibility.isMarketplaceVisible && !blockedReason,
    },
  ];

  const canEnable =
    items.filter((i) => i.id !== "agency_toggle").every((i) => i.passed) &&
    !blockedReason;

  return {
    items,
    canEnable,
    blockReason: blockedReason,
  };
}
