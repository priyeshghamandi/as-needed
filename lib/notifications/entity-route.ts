import { eq } from "drizzle-orm";
import { ShiftAssignmentTable } from "@/drizzle/schema";

export function resolveNotificationEntityHref(
  relatedEntityType: string | null | undefined,
  relatedEntityId: string | null | undefined,
): string {
  if (!relatedEntityType || !relatedEntityId) return "/notifications";

  switch (relatedEntityType) {
    case "staffing_request":
      return `/staffing-requests/${relatedEntityId}`;
    case "shift":
      return `/shifts/${relatedEntityId}`;
    case "healthcare_professional":
      return `/workforce/${relatedEntityId}`;
    case "facility":
      return `/facilities/${relatedEntityId}`;
    case "credential":
      return `/compliance?open=${relatedEntityId}`;
    case "user_invite":
      return "/settings?tab=team";
    case "shift_assignment":
      return `/notifications?assignment=${relatedEntityId}`;
    default:
      return "/notifications";
  }
}

/** Resolves shift_assignment to shift detail route when possible. */
export async function resolveNotificationEntityHrefAsync(
  relatedEntityType: string | null | undefined,
  relatedEntityId: string | null | undefined,
): Promise<string> {
  if (relatedEntityType === "shift_assignment" && relatedEntityId) {
    const { db } = await import("@/drizzle/db");
    const [row] = await db
      .select({ shiftId: ShiftAssignmentTable.shiftId })
      .from(ShiftAssignmentTable)
      .where(eq(ShiftAssignmentTable.id, relatedEntityId))
      .limit(1);

    if (row?.shiftId) return `/shifts/${row.shiftId}`;
  }

  return resolveNotificationEntityHref(relatedEntityType, relatedEntityId);
}

export function relatedEntityLabel(
  relatedEntityType: string | null | undefined,
): string | null {
  if (!relatedEntityType) return null;

  const labels: Record<string, string> = {
    staffing_request: "Staffing request",
    shift: "Shift",
    shift_assignment: "Assignment",
    healthcare_professional: "Professional",
    facility: "Facility",
    credential: "Credential",
    user_invite: "Team invite",
  };

  return labels[relatedEntityType] ?? "View details";
}
