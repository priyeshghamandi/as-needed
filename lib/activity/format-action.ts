import { ACTIVITY_ACTIONS } from "@/lib/activity/actions";

const ACTION_LABELS: Record<string, string> = {
  [ACTIVITY_ACTIONS.AGENCY_ONBOARDING_COMPLETED]: "Onboarding completed",
  [ACTIVITY_ACTIONS.FACILITY_CREATED]: "Facility added",
  [ACTIVITY_ACTIONS.FACILITY_UPDATED]: "Facility updated",
  [ACTIVITY_ACTIONS.HEALTHCARE_PROFESSIONAL_CREATED]: "Professional added",
  [ACTIVITY_ACTIONS.HEALTHCARE_PROFESSIONAL_UPDATED]: "Professional updated",
  [ACTIVITY_ACTIONS.STAFFING_REQUEST_CREATED]: "Staffing request created",
  [ACTIVITY_ACTIONS.STAFFING_REQUEST_STATUS_CHANGED]: "Request status changed",
  [ACTIVITY_ACTIONS.SHIFT_CREATED]: "Shift created",
  [ACTIVITY_ACTIONS.SHIFT_STATUS_CHANGED]: "Shift status changed",
  [ACTIVITY_ACTIONS.SHIFT_ASSIGNMENT_INVITED]: "Professional invited to shift",
  [ACTIVITY_ACTIONS.SHIFT_ASSIGNMENT_ACCEPTED]: "Assignment accepted",
  [ACTIVITY_ACTIONS.SHIFT_ASSIGNMENT_DECLINED]: "Assignment declined",
  [ACTIVITY_ACTIONS.CREDENTIAL_VERIFIED]: "Credential verified",
  [ACTIVITY_ACTIONS.CREDENTIAL_EXPIRED]: "Credential expired",
  [ACTIVITY_ACTIONS.USER_INVITE_SENT]: "Team invite sent",
  [ACTIVITY_ACTIONS.SETTINGS_UPDATED]: "Agency settings updated",
};

export function formatActivityAction(action: string): string {
  if (ACTION_LABELS[action]) return ACTION_LABELS[action];

  return action
    .split(".")
    .map((part) =>
      part
        .replace(/_/g, " ")
        .replace(/\b\w/g, (c) => c.toUpperCase()),
    )
    .join(" ");
}
