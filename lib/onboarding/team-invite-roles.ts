import type { CreateInviteInput } from "@/lib/validations/invite";

const TEAM_ROLE_MAP: Record<string, CreateInviteInput["role"]> = {
  "Staffing Coordinator": "staffing_coordinator",
  Recruiter: "recruiter",
  "Compliance Manager": "compliance_manager",
  "Operations Manager": "agency_admin",
};

export function teamDisplayRoleToAppRole(
  displayRole: string,
): CreateInviteInput["role"] | null {
  return TEAM_ROLE_MAP[displayRole] ?? null;
}
