import { and, asc, eq, inArray } from "drizzle-orm";
import { db } from "@/drizzle/db";
import {
  AgencyTable,
  CredentialTable,
  FacilityTable,
  HealthcareProfessionalTable,
  ShiftAssignmentTable,
  ShiftTable,
  StaffingRequestTable,
} from "@/drizzle/schema";
import { FILLED_ASSIGNMENT_STATUSES } from "@/lib/dashboard/metrics";
import { computeShiftFill } from "@/lib/shifts/fill-count";
import { evaluateCredentialMatch } from "@/lib/matching/credential-match";
import { distanceMiles, isWithinServiceArea, parseCoordinate } from "@/lib/matching/distance";
import {
  applyCandidateFilters,
  sortCandidates,
  type CandidateFilterInput,
} from "@/lib/matching/filters";
import type {
  MatchCandidateRow,
  MatchFiltersParams,
  MatchPageShift,
  ShiftAssignmentRow,
} from "@/lib/matching/types";
import { DEFAULT_SERVICE_AREA_RADIUS_MILES } from "@/lib/places/service-area-bounds";

export async function getMatchContext(
  agencyId: string,
  requestId: string,
  shiftId: string,
) {
  const [request] = await db
    .select({
      id: StaffingRequestTable.id,
      title: StaffingRequestTable.title,
      status: StaffingRequestTable.status,
      roleNeeded: StaffingRequestTable.roleNeeded,
      professionalsRequired: StaffingRequestTable.professionalsRequired,
      requiredCredentials: StaffingRequestTable.requiredCredentials,
      facilityId: FacilityTable.id,
      facilityName: FacilityTable.name,
      facilityLat: FacilityTable.latitude,
      facilityLng: FacilityTable.longitude,
      agencyRadius: AgencyTable.serviceAreaRadiusMiles,
      agencyLat: AgencyTable.primaryServiceAreaLat,
      agencyLng: AgencyTable.primaryServiceAreaLng,
    })
    .from(StaffingRequestTable)
    .innerJoin(FacilityTable, eq(StaffingRequestTable.facilityId, FacilityTable.id))
    .innerJoin(AgencyTable, eq(StaffingRequestTable.agencyId, AgencyTable.id))
    .where(and(eq(StaffingRequestTable.id, requestId), eq(StaffingRequestTable.agencyId, agencyId)))
    .limit(1);

  if (!request) return null;

  const shifts = await db
    .select({
      id: ShiftTable.id,
      startAt: ShiftTable.startAt,
      endAt: ShiftTable.endAt,
      shiftType: ShiftTable.shiftType,
      status: ShiftTable.status,
      requiredCount: ShiftTable.requiredCount,
    })
    .from(ShiftTable)
    .where(eq(ShiftTable.staffingRequestId, requestId))
    .orderBy(asc(ShiftTable.startAt));

  if (shifts.length === 0) return null;

  const activeShift = shifts.find((s) => s.id === shiftId) ?? shifts[0];
  const facilityLat = parseCoordinate(request.facilityLat);
  const facilityLng = parseCoordinate(request.facilityLng);
  const radiusMiles = request.agencyRadius ?? DEFAULT_SERVICE_AREA_RADIUS_MILES;

  const shiftRows: MatchPageShift[] = [];
  for (const shift of shifts) {
    const assignments = await db
      .select({ status: ShiftAssignmentTable.status })
      .from(ShiftAssignmentTable)
      .where(eq(ShiftAssignmentTable.shiftId, shift.id));
    const fill = computeShiftFill(shift.requiredCount, assignments, shift.status);
    shiftRows.push({
      id: shift.id,
      startAt: shift.startAt,
      endAt: shift.endAt,
      shiftType: shift.shiftType,
      status: shift.status,
      requiredCount: fill.requiredCount,
      filledCount: fill.filledCount,
      remainingSlots: Math.max(0, fill.requiredCount - fill.filledCount),
    });
  }

  const active = shiftRows.find((s) => s.id === activeShift.id) ?? shiftRows[0];

  return {
    request: {
      id: request.id,
      title: request.title,
      status: request.status,
      roleNeeded: request.roleNeeded,
      professionalsRequired: request.professionalsRequired,
      requiredCredentials: request.requiredCredentials,
      facilityName: request.facilityName,
    },
    shifts: shiftRows,
    activeShift: active,
    facilityLat,
    facilityLng,
    radiusMiles,
  };
}

export async function getMatchCandidates(
  agencyId: string,
  requestId: string,
  shiftId: string,
  filters: MatchFiltersParams = {},
): Promise<MatchCandidateRow[]> {
  const ctx = await getMatchContext(agencyId, requestId, shiftId);
  if (!ctx) return [];

  const professionals = await db
    .select({
      id: HealthcareProfessionalTable.id,
      firstName: HealthcareProfessionalTable.firstName,
      lastName: HealthcareProfessionalTable.lastName,
      role: HealthcareProfessionalTable.role,
      specialty: HealthcareProfessionalTable.specialty,
      city: HealthcareProfessionalTable.city,
      state: HealthcareProfessionalTable.state,
      availabilityStatus: HealthcareProfessionalTable.availabilityStatus,
      reliabilityScore: HealthcareProfessionalTable.reliabilityScore,
      latitude: HealthcareProfessionalTable.latitude,
      longitude: HealthcareProfessionalTable.longitude,
    })
    .from(HealthcareProfessionalTable)
    .where(
      and(
        eq(HealthcareProfessionalTable.agencyId, agencyId),
        eq(HealthcareProfessionalTable.isActive, true),
      ),
    );

  const proIds = professionals.map((p) => p.id);
  const credentialsByPro = new Map<string, { type: string; status: string }[]>();
  if (proIds.length > 0) {
    const creds = await db
      .select({
        professionalId: CredentialTable.professionalId,
        type: CredentialTable.type,
        status: CredentialTable.status,
      })
      .from(CredentialTable)
      .where(
        and(
          eq(CredentialTable.agencyId, agencyId),
          inArray(CredentialTable.professionalId, proIds),
        ),
      );
    for (const cred of creds) {
      const list = credentialsByPro.get(cred.professionalId) ?? [];
      list.push({ type: cred.type, status: cred.status });
      credentialsByPro.set(cred.professionalId, list);
    }
  }

  const assignments = await db
    .select({
      id: ShiftAssignmentTable.id,
      professionalId: ShiftAssignmentTable.professionalId,
      status: ShiftAssignmentTable.status,
    })
    .from(ShiftAssignmentTable)
    .where(eq(ShiftAssignmentTable.shiftId, ctx.activeShift.id));

  const assignmentByPro = new Map(
    assignments.map((a) => [a.professionalId, { id: a.id, status: a.status }]),
  );

  const center =
    ctx.facilityLat != null && ctx.facilityLng != null
      ? { latitude: ctx.facilityLat, longitude: ctx.facilityLng }
      : null;

  const rows: MatchCandidateRow[] = professionals.map((pro) => {
    const lat = parseCoordinate(pro.latitude);
    const lng = parseCoordinate(pro.longitude);
    let distance: number | null = null;
    let withinArea = true;

    if (center && lat != null && lng != null) {
      distance = distanceMiles(center.latitude, center.longitude, lat, lng);
      withinArea = isWithinServiceArea(
        { latitude: lat, longitude: lng },
        center,
        ctx.radiusMiles,
      );
    }

    const creds = credentialsByPro.get(pro.id) ?? [];
    const { meetsCredentials, complianceWarnings } = evaluateCredentialMatch(
      ctx.request.requiredCredentials,
      creds,
    );

    const assignment = assignmentByPro.get(pro.id);

    return {
      id: pro.id,
      firstName: pro.firstName,
      lastName: pro.lastName,
      role: pro.role,
      specialty: pro.specialty,
      city: pro.city,
      state: pro.state,
      availabilityStatus: pro.availabilityStatus,
      reliabilityScore: pro.reliabilityScore ?? 0,
      distanceMiles: distance,
      withinServiceArea: withinArea,
      assignmentStatus: assignment?.status ?? null,
      assignmentId: assignment?.id ?? null,
      complianceWarnings,
      meetsCredentials,
    };
  });

  const filterInput: CandidateFilterInput = {
    roleNeeded: ctx.request.roleNeeded,
    availableOnly: filters.availableOnly,
    withinServiceArea: filters.withinServiceArea,
    hasRequiredCredentials: filters.hasRequiredCredentials,
    requiredCredentials: ctx.request.requiredCredentials,
  };

  let filtered = applyCandidateFilters(rows, filterInput);
  filtered = sortCandidates(filtered);

  if (filters.limit != null && filters.limit > 0) {
    filtered = filtered.slice(0, filters.limit);
  }

  return filtered;
}

export async function getShiftAssignmentsForRequest(
  agencyId: string,
  requestId: string,
  shiftId?: string,
): Promise<ShiftAssignmentRow[]> {
  const conditions = [
    eq(ShiftTable.agencyId, agencyId),
    eq(ShiftTable.staffingRequestId, requestId),
  ];
  if (shiftId) {
    conditions.push(eq(ShiftTable.id, shiftId));
  }

  const rows = await db
    .select({
      id: ShiftAssignmentTable.id,
      shiftId: ShiftAssignmentTable.shiftId,
      professionalId: ShiftAssignmentTable.professionalId,
      firstName: HealthcareProfessionalTable.firstName,
      lastName: HealthcareProfessionalTable.lastName,
      status: ShiftAssignmentTable.status,
      invitedAt: ShiftAssignmentTable.invitedAt,
      respondedAt: ShiftAssignmentTable.respondedAt,
      confirmedAt: ShiftAssignmentTable.confirmedAt,
      declineReason: ShiftAssignmentTable.declineReason,
      cancellationReason: ShiftAssignmentTable.cancellationReason,
    })
    .from(ShiftAssignmentTable)
    .innerJoin(ShiftTable, eq(ShiftAssignmentTable.shiftId, ShiftTable.id))
    .innerJoin(
      HealthcareProfessionalTable,
      eq(ShiftAssignmentTable.professionalId, HealthcareProfessionalTable.id),
    )
    .where(and(...conditions))
    .orderBy(ShiftAssignmentTable.invitedAt);

  return rows.map((row) => ({
    id: row.id,
    shiftId: row.shiftId,
    professionalId: row.professionalId,
    professionalName: `${row.firstName} ${row.lastName}`.trim(),
    status: row.status,
    invitedAt: row.invitedAt,
    respondedAt: row.respondedAt,
    confirmedAt: row.confirmedAt,
    declineReason: row.declineReason,
    cancellationReason: row.cancellationReason,
  }));
}

export async function countFilledForShift(shiftId: string): Promise<number> {
  const assignments = await db
    .select({ status: ShiftAssignmentTable.status })
    .from(ShiftAssignmentTable)
    .where(eq(ShiftAssignmentTable.shiftId, shiftId));

  return assignments.filter((a) =>
    (FILLED_ASSIGNMENT_STATUSES as readonly string[]).includes(a.status),
  ).length;
}
