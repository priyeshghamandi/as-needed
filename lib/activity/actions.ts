/** Canonical activity action keys (extend as modules ship). */
export const ACTIVITY_ACTIONS = {
  AGENCY_ONBOARDING_COMPLETED: "agency.onboarding.completed",
  FACILITY_CREATED: "facility.created",
  FACILITY_UPDATED: "facility.updated",
  HEALTHCARE_PROFESSIONAL_CREATED: "healthcare_professional.created",
  HEALTHCARE_PROFESSIONAL_UPDATED: "healthcare_professional.updated",
  STAFFING_REQUEST_CREATED: "staffing_request.created",
  STAFFING_REQUEST_STATUS_CHANGED: "staffing_request.status_changed",
  SHIFT_CREATED: "shift.created",
  SHIFT_STATUS_CHANGED: "shift.status_changed",
  SHIFT_ASSIGNMENT_INVITED: "shift_assignment.invited",
  SHIFT_ASSIGNMENT_ACCEPTED: "shift_assignment.accepted",
  SHIFT_ASSIGNMENT_DECLINED: "shift_assignment.declined",
  CREDENTIAL_VERIFIED: "credential.verified",
  CREDENTIAL_EXPIRED: "credential.expired",
  USER_INVITE_SENT: "user_invite.sent",
  SETTINGS_UPDATED: "settings.updated",
} as const;
