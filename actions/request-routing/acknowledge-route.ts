"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/auth";
import { canManageStaffingRequests } from "@/lib/auth/staffing-requests-access-rules";
import { acknowledgeStaffingRequestRoute } from "@/lib/request-routing/acknowledge-route";

export async function acknowledgeStaffingRequestRouteAction(staffingRequestId: string) {
  const session = await auth();
  const userId = session?.user?.id;
  const agencyId = session?.user?.agencyId;
  const primaryRole = session?.user?.primaryRole;

  if (!userId || !agencyId) {
    return { status: "error" as const, message: "Not authenticated." };
  }

  if (!canManageStaffingRequests(primaryRole)) {
    return { status: "error" as const, message: "You do not have permission to acknowledge routes." };
  }

  const result = await acknowledgeStaffingRequestRoute({
    agencyId,
    staffingRequestId,
    userId,
  });

  if (!result.ok) {
    return { status: "error" as const, message: result.message };
  }

  revalidatePath("/staffing-requests/routed");
  revalidatePath(`/staffing-requests/${staffingRequestId}`);

  return { status: "success" as const };
}
