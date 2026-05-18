import { and, desc, eq } from "drizzle-orm";
import { db } from "@/drizzle/db";
import { SuggestedAlternativeTable } from "@/drizzle/schema";
import { getProfessionalPublicSummary } from "@/lib/alternatives/picker-candidates";
import type { SuggestedAlternativeStatus } from "@/lib/fulfillment/alternative-status";

export type PendingAlternativeForCustomer = {
  id: string;
  messageToCustomer: string | null;
  proposedAt: Date;
  original: {
    id: string;
    displayName: string;
    role: string;
    approximateAvailabilityLabel: string | null;
    headline: string | null;
  };
  suggested: {
    id: string;
    displayName: string;
    role: string;
    approximateAvailabilityLabel: string | null;
    headline: string | null;
  };
};

export async function getPendingAlternativeForCustomer(
  staffingRequestId: string,
): Promise<PendingAlternativeForCustomer | null> {
  const [row] = await db
    .select({
      id: SuggestedAlternativeTable.id,
      messageToCustomer: SuggestedAlternativeTable.messageToCustomer,
      proposedAt: SuggestedAlternativeTable.proposedAt,
      originalProfessionalId: SuggestedAlternativeTable.originalProfessionalId,
      suggestedProfessionalId: SuggestedAlternativeTable.suggestedProfessionalId,
    })
    .from(SuggestedAlternativeTable)
    .where(
      and(
        eq(SuggestedAlternativeTable.staffingRequestId, staffingRequestId),
        eq(SuggestedAlternativeTable.status, "pending_customer"),
      ),
    )
    .orderBy(desc(SuggestedAlternativeTable.proposedAt))
    .limit(1);

  if (!row) return null;

  const [original, suggested] = await Promise.all([
    getProfessionalPublicSummary(row.originalProfessionalId),
    getProfessionalPublicSummary(row.suggestedProfessionalId),
  ]);

  if (!original || !suggested) return null;

  return {
    id: row.id,
    messageToCustomer: row.messageToCustomer,
    proposedAt: row.proposedAt,
    original: {
      id: original.id,
      displayName: original.displayName,
      role: original.role,
      approximateAvailabilityLabel: original.approximateAvailabilityLabel,
      headline: original.headline,
    },
    suggested: {
      id: suggested.id,
      displayName: suggested.displayName,
      role: suggested.role,
      approximateAvailabilityLabel: suggested.approximateAvailabilityLabel,
      headline: suggested.headline,
    },
  };
}

export type AgencyAlternativeRow = {
  id: string;
  originalProfessionalId: string;
  suggestedProfessionalId: string;
  status: SuggestedAlternativeStatus;
  messageToCustomer: string | null;
  proposedAt: Date;
};

export async function listAlternativesForAgency(
  staffingRequestId: string,
  agencyId: string,
): Promise<AgencyAlternativeRow[]> {
  const rows = await db
    .select({
      id: SuggestedAlternativeTable.id,
      originalProfessionalId: SuggestedAlternativeTable.originalProfessionalId,
      suggestedProfessionalId: SuggestedAlternativeTable.suggestedProfessionalId,
      status: SuggestedAlternativeTable.status,
      messageToCustomer: SuggestedAlternativeTable.messageToCustomer,
      proposedAt: SuggestedAlternativeTable.proposedAt,
    })
    .from(SuggestedAlternativeTable)
    .where(
      and(
        eq(SuggestedAlternativeTable.staffingRequestId, staffingRequestId),
        eq(SuggestedAlternativeTable.agencyId, agencyId),
      ),
    )
    .orderBy(desc(SuggestedAlternativeTable.proposedAt));

  return rows.map((row) => ({
    id: row.id,
    originalProfessionalId: row.originalProfessionalId,
    suggestedProfessionalId: row.suggestedProfessionalId,
    status: row.status as SuggestedAlternativeStatus,
    messageToCustomer: row.messageToCustomer,
    proposedAt: row.proposedAt,
  }));
}
