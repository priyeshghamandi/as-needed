import { and, eq } from "drizzle-orm";
import { db } from "@/drizzle/db";
import {
  CredentialTable,
  FacilityTable,
  HealthcareProfessionalTable,
  ShiftTable,
  StaffingRequestTable,
  UserRoleTable,
} from "@/drizzle/schema";
import { ForbiddenError } from "@/lib/auth/authorization";
import { isAgencyRole } from "@/lib/auth/roles";

export async function assertAgencyActivityAccess(
  userId: string,
  agencyId: string,
): Promise<void> {
  const rows = await db
    .select({ role: UserRoleTable.role, agencyId: UserRoleTable.agencyId })
    .from(UserRoleTable)
    .where(eq(UserRoleTable.userId, userId));

  const allowed = rows.some(
    (row) =>
      row.role === "platform_admin" ||
      (row.agencyId === agencyId && isAgencyRole(row.role)),
  );

  if (!allowed) {
    throw new ForbiddenError("You do not have permission to view activity logs.");
  }
}

export async function assertActivityEntityInAgency(
  agencyId: string,
  entityType: string,
  entityId: string,
): Promise<void> {
  let found = false;

  switch (entityType) {
    case "staffing_request": {
      const [row] = await db
        .select({ id: StaffingRequestTable.id })
        .from(StaffingRequestTable)
        .where(and(eq(StaffingRequestTable.id, entityId), eq(StaffingRequestTable.agencyId, agencyId)))
        .limit(1);
      found = Boolean(row);
      break;
    }
    case "shift": {
      const [row] = await db
        .select({ id: ShiftTable.id })
        .from(ShiftTable)
        .where(and(eq(ShiftTable.id, entityId), eq(ShiftTable.agencyId, agencyId)))
        .limit(1);
      found = Boolean(row);
      break;
    }
    case "healthcare_professional": {
      const [row] = await db
        .select({ id: HealthcareProfessionalTable.id })
        .from(HealthcareProfessionalTable)
        .where(
          and(
            eq(HealthcareProfessionalTable.id, entityId),
            eq(HealthcareProfessionalTable.agencyId, agencyId),
          ),
        )
        .limit(1);
      found = Boolean(row);
      break;
    }
    case "facility": {
      const [row] = await db
        .select({ id: FacilityTable.id })
        .from(FacilityTable)
        .where(and(eq(FacilityTable.id, entityId), eq(FacilityTable.agencyId, agencyId)))
        .limit(1);
      found = Boolean(row);
      break;
    }
    case "credential": {
      const [row] = await db
        .select({ id: CredentialTable.id })
        .from(CredentialTable)
        .where(and(eq(CredentialTable.id, entityId), eq(CredentialTable.agencyId, agencyId)))
        .limit(1);
      found = Boolean(row);
      break;
    }
    case "agency":
      found = entityId === agencyId;
      break;
    default:
      found = true;
  }

  if (!found) {
    throw new ForbiddenError("Activity entity is not in your agency.");
  }
}
