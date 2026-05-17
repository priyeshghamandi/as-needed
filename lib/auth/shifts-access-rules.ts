export {
  STAFFING_REQUESTS_WRITE_ROLES as SHIFTS_WRITE_ROLES,
  STAFFING_REQUESTS_VIEW_ROLES as SHIFTS_VIEW_ROLES,
  canManageStaffingRequests as canManageShifts,
  canViewStaffingRequests as canViewShifts,
  type StaffingRequestsWriteRole as ShiftsWriteRole,
  type StaffingRequestsViewRole as ShiftsViewRole,
} from "@/lib/auth/staffing-requests-access-rules";
