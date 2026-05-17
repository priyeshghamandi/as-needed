export {
  STAFFING_REQUESTS_WRITE_ROLES as ASSIGNMENTS_WRITE_ROLES,
  STAFFING_REQUESTS_VIEW_ROLES as MATCH_VIEW_ROLES,
  canManageStaffingRequests as canManageAssignments,
  canViewStaffingRequests as canViewMatchPage,
  type StaffingRequestsWriteRole as AssignmentsWriteRole,
  type StaffingRequestsViewRole as MatchViewRole,
} from "@/lib/auth/staffing-requests-access-rules";
