export function resolveActivityEntityHref(
  entityType: string,
  entityId: string,
): string | null {
  switch (entityType) {
    case "staffing_request":
      return `/staffing-requests/${entityId}`;
    case "shift":
      return `/shifts/${entityId}`;
    case "healthcare_professional":
      return `/workforce/${entityId}`;
    case "facility":
      return `/facilities/${entityId}`;
    case "credential":
      return `/compliance?open=${entityId}`;
    case "agency":
      return "/dashboard";
    case "user_invite":
      return "/settings?tab=team";
    case "shift_assignment":
      return null;
    default:
      return null;
  }
}

export function activityEntityTypeLabel(entityType: string): string {
  const labels: Record<string, string> = {
    staffing_request: "Staffing request",
    shift: "Shift",
    shift_assignment: "Assignment",
    healthcare_professional: "Professional",
    facility: "Facility",
    credential: "Credential",
    agency: "Agency",
    user_invite: "Team invite",
  };

  return labels[entityType] ?? entityType.replace(/_/g, " ");
}
