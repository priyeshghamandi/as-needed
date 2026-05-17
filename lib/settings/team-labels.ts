const TEAM_ROLE_LABELS: Record<string, string> = {
  agency_owner: "Agency Owner",
  agency_admin: "Agency Admin",
  staffing_coordinator: "Staffing Coordinator",
  recruiter: "Recruiter",
  compliance_manager: "Compliance Manager",
  platform_admin: "Platform Admin",
};

export function teamMemberRoleLabel(role: string): string {
  return TEAM_ROLE_LABELS[role] ?? role.replace(/_/g, " ");
}

export const TEAM_INVITE_DISPLAY_ROLES = [
  "Staffing Coordinator",
  "Recruiter",
  "Compliance Manager",
  "Operations Manager",
] as const;
