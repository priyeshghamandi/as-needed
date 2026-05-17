export type MatchCandidateRow = {
  id: string;
  firstName: string;
  lastName: string;
  role: string;
  specialty: string | null;
  city: string | null;
  state: string | null;
  availabilityStatus: string;
  reliabilityScore: number;
  distanceMiles: number | null;
  withinServiceArea: boolean;
  assignmentStatus: string | null;
  assignmentId: string | null;
  complianceWarnings: string[];
  meetsCredentials: boolean;
};

export type ShiftAssignmentRow = {
  id: string;
  shiftId: string;
  professionalId: string;
  professionalName: string;
  status: string;
  invitedAt: Date | null;
  respondedAt: Date | null;
  confirmedAt: Date | null;
  declineReason: string | null;
  cancellationReason: string | null;
};

export type MatchPageShift = {
  id: string;
  startAt: Date;
  endAt: Date;
  shiftType: string | null;
  status: string;
  requiredCount: number;
  filledCount: number;
  remainingSlots: number;
};

export type MatchFiltersParams = {
  availableOnly?: boolean;
  withinServiceArea?: boolean;
  hasRequiredCredentials?: boolean;
  limit?: number;
};
