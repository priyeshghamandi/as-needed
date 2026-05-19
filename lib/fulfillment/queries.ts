import { and, desc, eq, inArray } from "drizzle-orm";
import { db } from "@/drizzle/db";
import {
  FacilityTable,
  FulfillmentReviewTable,
  HealthcareProfessionalTable,
  ShiftTable,
  StaffingRequestSelectionTable,
  StaffingRequestTable,
  UserTable,
} from "@/drizzle/schema";
import { listAlternativesForAgency } from "@/lib/alternatives/queries";
import { getProfessionalPublicSummary } from "@/lib/alternatives/picker-candidates";
import { getVisibilityBlockReason } from "@/lib/marketplace/eligibility";
import { hasStaffingRequestAgencyAccess } from "@/lib/request-routing/queries";
import type { SuggestedAlternativeStatus } from "@/lib/fulfillment/alternative-status";
import type { StaffingRequestFulfillmentStatus } from "@/lib/ui/fulfillment-status";

export type FulfillmentReviewHistoryItem = {
  id: string;
  professionalName: string | null;
  decision: "confirmed" | "declined";
  declineReason: string | null;
  declineNotes: string | null;
  reviewerName: string;
  reviewedAt: Date;
};

export type FulfillmentSelectionRow = {
  professionalId: string;
  displayName: string;
  role: string;
  review: {
    decision: "confirmed" | "declined";
    declineReason: string | null;
    declineNotes: string | null;
    reviewedAt: Date;
  } | null;
  complianceBlocked: boolean;
};

export type AgencyAlternativeSummary = {
  id: string;
  originalProfessionalId: string;
  originalDisplayName: string;
  suggestedProfessionalId: string;
  suggestedDisplayName: string;
  status: SuggestedAlternativeStatus;
  messageToCustomer: string | null;
  proposedAt: Date;
};

export type AgencyFulfillmentPageData = {
  requestId: string;
  title: string;
  fulfillmentStatus: StaffingRequestFulfillmentStatus | null;
  notes: string | null;
  facilityName: string;
  shiftStartAt: Date | null;
  shiftEndAt: Date | null;
  shiftType: string | null;
  selections: FulfillmentSelectionRow[];
  reviewHistory: FulfillmentReviewHistoryItem[];
  alternatives: AgencyAlternativeSummary[];
};

export async function getAgencyFulfillmentPageData(
  agencyId: string,
  staffingRequestId: string,
): Promise<AgencyFulfillmentPageData | null> {
  const allowed = await hasStaffingRequestAgencyAccess(agencyId, staffingRequestId);
  if (!allowed) return null;

  const [request] = await db
    .select({
      id: StaffingRequestTable.id,
      title: StaffingRequestTable.title,
      source: StaffingRequestTable.source,
      fulfillmentStatus: StaffingRequestTable.fulfillmentStatus,
      notes: StaffingRequestTable.notes,
      facilityName: FacilityTable.name,
      shiftStartAt: ShiftTable.startAt,
      shiftEndAt: ShiftTable.endAt,
      shiftType: ShiftTable.shiftType,
    })
    .from(StaffingRequestTable)
    .innerJoin(FacilityTable, eq(StaffingRequestTable.facilityId, FacilityTable.id))
    .leftJoin(ShiftTable, eq(ShiftTable.staffingRequestId, StaffingRequestTable.id))
    .where(
      and(
        eq(StaffingRequestTable.id, staffingRequestId),
        inArray(StaffingRequestTable.source, ["marketplace_customer", "marketplace_consumer"]),
      ),
    )
    .limit(1);

  if (!request) return null;

  const selections = await db
    .select({
      professionalId: HealthcareProfessionalTable.id,
      firstName: HealthcareProfessionalTable.firstName,
      lastName: HealthcareProfessionalTable.lastName,
      role: HealthcareProfessionalTable.role,
      isActive: HealthcareProfessionalTable.isActive,
    })
    .from(StaffingRequestSelectionTable)
    .innerJoin(
      HealthcareProfessionalTable,
      eq(StaffingRequestSelectionTable.healthcareProfessionalId, HealthcareProfessionalTable.id),
    )
    .where(
      and(
        eq(StaffingRequestSelectionTable.staffingRequestId, staffingRequestId),
        eq(StaffingRequestSelectionTable.agencyId, agencyId),
      ),
    )
    .orderBy(StaffingRequestSelectionTable.sortOrder);

  const reviews = await db
    .select({
      id: FulfillmentReviewTable.id,
      professionalId: FulfillmentReviewTable.healthcareProfessionalId,
      decision: FulfillmentReviewTable.decision,
      declineReason: FulfillmentReviewTable.declineReason,
      declineNotes: FulfillmentReviewTable.declineNotes,
      reviewedAt: FulfillmentReviewTable.reviewedAt,
      reviewerName: UserTable.name,
      proFirstName: HealthcareProfessionalTable.firstName,
      proLastName: HealthcareProfessionalTable.lastName,
    })
    .from(FulfillmentReviewTable)
    .innerJoin(UserTable, eq(FulfillmentReviewTable.reviewedByUserId, UserTable.id))
    .leftJoin(
      HealthcareProfessionalTable,
      eq(FulfillmentReviewTable.healthcareProfessionalId, HealthcareProfessionalTable.id),
    )
    .where(
      and(
        eq(FulfillmentReviewTable.staffingRequestId, staffingRequestId),
        eq(FulfillmentReviewTable.agencyId, agencyId),
      ),
    )
    .orderBy(desc(FulfillmentReviewTable.reviewedAt));

  const reviewByPro = new Map(
    reviews
      .filter((r) => r.professionalId)
      .map((r) => [
        r.professionalId!,
        {
          decision: r.decision as "confirmed" | "declined",
          declineReason: r.declineReason,
          declineNotes: r.declineNotes,
          reviewedAt: r.reviewedAt,
        },
      ]),
  );

  const selectionRows: FulfillmentSelectionRow[] = [];
  for (const row of selections) {
    const blockReason = await getVisibilityBlockReason(row.professionalId);
    selectionRows.push({
      professionalId: row.professionalId,
      displayName: `${row.firstName} ${row.lastName}`.trim(),
      role: row.role,
      review: reviewByPro.get(row.professionalId) ?? null,
      complianceBlocked: blockReason === "compliance_expired" || !row.isActive,
    });
  }

  const reviewHistory: FulfillmentReviewHistoryItem[] = reviews.map((r) => ({
    id: r.id,
    professionalName: r.proFirstName
      ? `${r.proFirstName} ${r.proLastName}`.trim()
      : null,
    decision: r.decision as "confirmed" | "declined",
    declineReason: r.declineReason,
    declineNotes: r.declineNotes,
    reviewerName: r.reviewerName ?? "Coordinator",
    reviewedAt: r.reviewedAt,
  }));

  const altRows = await listAlternativesForAgency(staffingRequestId, agencyId);
  const alternatives: AgencyAlternativeSummary[] = [];
  for (const alt of altRows) {
    const [original, suggested] = await Promise.all([
      getProfessionalPublicSummary(alt.originalProfessionalId),
      getProfessionalPublicSummary(alt.suggestedProfessionalId),
    ]);
    if (!original || !suggested) continue;
    alternatives.push({
      id: alt.id,
      originalProfessionalId: alt.originalProfessionalId,
      originalDisplayName: original.displayName,
      suggestedProfessionalId: alt.suggestedProfessionalId,
      suggestedDisplayName: suggested.displayName,
      status: alt.status,
      messageToCustomer: alt.messageToCustomer,
      proposedAt: alt.proposedAt,
    });
  }

  return {
    requestId: request.id,
    title: request.title,
    fulfillmentStatus: request.fulfillmentStatus as StaffingRequestFulfillmentStatus | null,
    notes: request.notes,
    facilityName: request.facilityName,
    shiftStartAt: request.shiftStartAt,
    shiftEndAt: request.shiftEndAt,
    shiftType: request.shiftType,
    selections: selectionRows,
    reviewHistory,
    alternatives,
  };
}
