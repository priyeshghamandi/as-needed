import { and, eq, gte, inArray } from "drizzle-orm";
import { db } from "@/drizzle/db";
import {
  AgencyTable,
  FacilityTable,
  HealthcareProfessionalTable,
  ShiftTable,
  StaffingRequestSelectionTable,
  StaffingRequestTable,
} from "@/drizzle/schema";
import type { CustomerFacilityScope } from "@/lib/customer-requests/facility-scope";
import { routeStaffingRequest } from "@/lib/request-routing/route-staffing-request";
import { isProfessionalPublicEligible } from "@/lib/marketplace/eligibility";
import type { CustomerLocationContext } from "@/lib/marketplace/types";
import {
  assertSameProfessionalRole,
  customerRequestCreateSchema,
  type CustomerRequestCreateInput,
} from "@/lib/validations/customer-request";
import { roleNeededLabel } from "@/lib/staffing-requests/staffing-requests-ui";

export type CreateCustomerRequestResult =
  | { ok: true; requestId: string }
  | {
      ok: false;
      status: number;
      code?: string;
      field?: string;
      message: string;
      existingRequestId?: string;
    };

export type CustomerSelectionPreview = {
  id: string;
  displayName: string;
  role: string;
  roleLabel: string;
  agencyName: string;
  headline: string | null;
  eligible: boolean;
};

export async function getCustomerSelectionPreviews(
  professionalIds: string[],
  customerLocation: CustomerLocationContext | null,
): Promise<CustomerSelectionPreview[]> {
  if (professionalIds.length === 0) return [];

  const rows = await db
    .select({
      id: HealthcareProfessionalTable.id,
      firstName: HealthcareProfessionalTable.firstName,
      lastName: HealthcareProfessionalTable.lastName,
      role: HealthcareProfessionalTable.role,
      agencyName: AgencyTable.name,
    })
    .from(HealthcareProfessionalTable)
    .innerJoin(AgencyTable, eq(HealthcareProfessionalTable.agencyId, AgencyTable.id))
    .where(inArray(HealthcareProfessionalTable.id, professionalIds));

  const previews: CustomerSelectionPreview[] = [];
  for (const row of rows) {
    const eligible = customerLocation
      ? await isProfessionalPublicEligible(row.id, customerLocation)
      : false;
    previews.push({
      id: row.id,
      displayName: `${row.firstName} ${row.lastName}`.trim(),
      role: row.role,
      roleLabel: roleNeededLabel(row.role),
      agencyName: row.agencyName,
      headline: null,
      eligible,
    });
  }

  return previews;
}

async function findDuplicateRequest(params: {
  facilityId: string;
  professionalIds: string[];
  availabilityStart: Date;
  availabilityEnd: Date;
}): Promise<string | null> {
  const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
  const sortedIds = [...params.professionalIds].sort();

  const candidates = await db
    .select({
      id: StaffingRequestTable.id,
    })
    .from(StaffingRequestTable)
    .where(
      and(
        eq(StaffingRequestTable.facilityId, params.facilityId),
        eq(StaffingRequestTable.source, "marketplace_customer"),
        gte(StaffingRequestTable.customerSubmittedAt, oneHourAgo),
      ),
    );

  for (const candidate of candidates) {
    const selections = await db
      .select({ professionalId: StaffingRequestSelectionTable.healthcareProfessionalId })
      .from(StaffingRequestSelectionTable)
      .where(eq(StaffingRequestSelectionTable.staffingRequestId, candidate.id));

    const existingIds = selections.map((s) => s.professionalId).sort();
    if (existingIds.length !== sortedIds.length) continue;
    if (!existingIds.every((id, i) => id === sortedIds[i])) continue;

    const [shift] = await db
      .select({ startAt: ShiftTable.startAt, endAt: ShiftTable.endAt })
      .from(ShiftTable)
      .where(eq(ShiftTable.staffingRequestId, candidate.id))
      .limit(1);

    if (!shift) continue;

    const startDiff = Math.abs(shift.startAt.getTime() - params.availabilityStart.getTime());
    const endDiff = Math.abs(shift.endAt.getTime() - params.availabilityEnd.getTime());
    if (startDiff <= 60 * 60 * 1000 && endDiff <= 60 * 60 * 1000) {
      return candidate.id;
    }
  }

  return null;
}

export async function createCustomerStaffingRequest(params: {
  userId: string;
  scope: CustomerFacilityScope;
  input: CustomerRequestCreateInput;
  customerLocation: CustomerLocationContext | null;
}): Promise<CreateCustomerRequestResult> {
  const parsed = customerRequestCreateSchema.safeParse(params.input);
  if (!parsed.success) {
    const issue = parsed.error.issues[0];
    return {
      ok: false,
      status: 400,
      field: issue?.path[0]?.toString(),
      message: issue?.message ?? "Invalid input.",
    };
  }

  const data = parsed.data;

  if (data.facilityId !== params.scope.facilityId) {
    return { ok: false, status: 404, message: "Facility not found." };
  }

  const professionals = await db
    .select({
      id: HealthcareProfessionalTable.id,
      role: HealthcareProfessionalTable.role,
      agencyId: HealthcareProfessionalTable.agencyId,
    })
    .from(HealthcareProfessionalTable)
    .where(inArray(HealthcareProfessionalTable.id, data.professionalIds));

  if (professionals.length !== data.professionalIds.length) {
    return {
      ok: false,
      status: 400,
      code: "invalid_selection",
      message: "One or more selected professionals could not be found.",
    };
  }

  const roles = professionals.map((p) => p.role);
  if (!assertSameProfessionalRole(roles)) {
    return {
      ok: false,
      status: 400,
      code: "role_mismatch",
      message: "All selected professionals must share the same role.",
    };
  }

  if (roles[0] !== data.roleNeeded) {
    return {
      ok: false,
      status: 400,
      code: "role_mismatch",
      field: "roleNeeded",
      message: "Selected professionals do not match the requested role.",
    };
  }

  if (!params.customerLocation) {
    return {
      ok: false,
      status: 400,
      code: "location_required",
      message: "Set your facility location before submitting a request.",
    };
  }

  for (const pro of professionals) {
    const eligible = await isProfessionalPublicEligible(pro.id, params.customerLocation);
    if (!eligible) {
      return {
        ok: false,
        status: 400,
        code: "ineligible_professional",
        field: "professionalIds",
        message:
          "One or more professionals are no longer available in your area. Remove them and try again.",
      };
    }
  }

  const startAt = new Date(data.availabilityStart);
  const endAt = new Date(data.availabilityEnd);

  const duplicateId = await findDuplicateRequest({
    facilityId: data.facilityId,
    professionalIds: data.professionalIds,
    availabilityStart: startAt,
    availabilityEnd: endAt,
  });

  if (duplicateId) {
    return {
      ok: false,
      status: 409,
      code: "duplicate_request",
      message: "A similar request was submitted recently.",
      existingRequestId: duplicateId,
    };
  }

  const [facility] = await db
    .select({ id: FacilityTable.id })
    .from(FacilityTable)
    .where(
      and(eq(FacilityTable.id, data.facilityId), eq(FacilityTable.agencyId, params.scope.agencyId)),
    )
    .limit(1);

  if (!facility) {
    return { ok: false, status: 404, message: "Facility not found." };
  }

  const title =
    data.title.trim() ||
    `${roleNeededLabel(data.roleNeeded)} staffing — ${params.scope.facilityName}`;

  const now = new Date();

  const requestId = await db.transaction(async (tx) => {
    const [request] = await tx
      .insert(StaffingRequestTable)
      .values({
        agencyId: params.scope.agencyId,
        facilityId: data.facilityId,
        createdByUserId: params.userId,
        title,
        roleNeeded: data.roleNeeded,
        professionalsRequired: data.professionalsRequired,
        priority: "normal",
        status: "open",
        source: "marketplace_customer",
        fulfillmentStatus: "pending_agency_review",
        customerSubmittedAt: now,
        notes: data.notes?.trim() || null,
      })
      .returning({ id: StaffingRequestTable.id });

    await tx.insert(ShiftTable).values({
      agencyId: params.scope.agencyId,
      staffingRequestId: request.id,
      facilityId: data.facilityId,
      startAt,
      endAt,
      shiftType: data.shiftType || null,
      requiredCount: data.professionalsRequired,
      status: "open",
    });

    await tx.insert(StaffingRequestSelectionTable).values(
      data.professionalIds.map((professionalId, index) => {
        const pro = professionals.find((p) => p.id === professionalId)!;
        return {
          staffingRequestId: request.id,
          healthcareProfessionalId: professionalId,
          agencyId: pro.agencyId,
          selectionType: "customer_preferred" as const,
          sortOrder: index,
        };
      }),
    );

    return request.id;
  });

  await routeStaffingRequest(requestId);

  return { ok: true, requestId };
}
