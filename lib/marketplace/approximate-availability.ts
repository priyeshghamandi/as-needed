import { and, eq, gte, lte } from "drizzle-orm";
import { db } from "@/drizzle/db";
import { AvailabilityBlockTable } from "@/drizzle/schema";
import {
  APPROXIMATE_AVAILABILITY_LABELS,
  type ApproximateAvailability,
} from "@/lib/marketplace/approximate-availability-labels";

export type { ApproximateAvailability } from "@/lib/marketplace/approximate-availability-labels";
export { APPROXIMATE_AVAILABILITY_LABELS };

const MS_DAY = 86_400_000;

function startOfWeekMonday(date: Date): Date {
  const copy = new Date(date);
  const day = copy.getDay();
  const diffToMonday = day === 0 ? 6 : day - 1;
  copy.setDate(copy.getDate() - diffToMonday);
  copy.setHours(0, 0, 0, 0);
  return copy;
}

export async function computeApproximateAvailability(
  professionalId: string,
  professionalUpdatedAt: Date,
): Promise<ApproximateAvailability | null> {
  const now = new Date();
  const inSevenDays = new Date(now.getTime() + 7 * MS_DAY);
  const weekStart = startOfWeekMonday(now);
  const weekEnd = new Date(weekStart.getTime() + 7 * MS_DAY);
  const recentThreshold = new Date(now.getTime() - 14 * MS_DAY);

  const blocks = await db
    .select({
      startAt: AvailabilityBlockTable.startAt,
      endAt: AvailabilityBlockTable.endAt,
    })
    .from(AvailabilityBlockTable)
    .where(
      and(
        eq(AvailabilityBlockTable.professionalId, professionalId),
        eq(AvailabilityBlockTable.status, "available"),
        gte(AvailabilityBlockTable.endAt, now),
        lte(AvailabilityBlockTable.startAt, inSevenDays),
      ),
    );

  const likelyAvailable = blocks.some(
    (block) => block.startAt < inSevenDays && block.endAt > now,
  );
  if (likelyAvailable) return "likely_available";

  const availableThisWeek = blocks.some(
    (block) => block.startAt < weekEnd && block.endAt > weekStart,
  );
  if (availableThisWeek) return "available_this_week";

  if (professionalUpdatedAt >= recentThreshold) {
    return "recently_active";
  }

  return null;
}
