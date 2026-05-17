import { and, eq, ne } from "drizzle-orm";
import { db } from "@/drizzle/db";
import { AvailabilityBlockTable } from "@/drizzle/schema";
import { availabilityBlocksOverlap } from "@/lib/provider/shift-overlap";
import type { AvailabilityBlockInput } from "@/lib/validations/availability-block";

export type AvailabilityBlockRecord = {
  id: string;
  startAt: string;
  endAt: string;
  status: string;
  notes: string | null;
};

export async function listAvailabilityBlocks(
  professionalId: string,
  from?: Date,
  to?: Date,
): Promise<AvailabilityBlockRecord[]> {
  const rows = await db
    .select({
      id: AvailabilityBlockTable.id,
      startAt: AvailabilityBlockTable.startAt,
      endAt: AvailabilityBlockTable.endAt,
      status: AvailabilityBlockTable.status,
      notes: AvailabilityBlockTable.notes,
    })
    .from(AvailabilityBlockTable)
    .where(eq(AvailabilityBlockTable.professionalId, professionalId))
    .orderBy(AvailabilityBlockTable.startAt);

  return rows
    .filter((row) => {
      if (from && row.endAt < from) return false;
      if (to && row.startAt > to) return false;
      return true;
    })
    .map((row) => ({
      id: row.id,
      startAt: row.startAt.toISOString(),
      endAt: row.endAt.toISOString(),
      status: row.status,
      notes: row.notes,
    }));
}

async function findOverlappingBlock(
  professionalId: string,
  startAt: Date,
  endAt: Date,
  excludeId?: string,
): Promise<boolean> {
  const rows = await db
    .select({
      id: AvailabilityBlockTable.id,
      startAt: AvailabilityBlockTable.startAt,
      endAt: AvailabilityBlockTable.endAt,
    })
    .from(AvailabilityBlockTable)
    .where(
      and(
        eq(AvailabilityBlockTable.professionalId, professionalId),
        excludeId ? ne(AvailabilityBlockTable.id, excludeId) : undefined,
      ),
    );

  return rows.some((row) =>
    availabilityBlocksOverlap(startAt, endAt, row.startAt, row.endAt),
  );
}

export type AvailabilityOpResult =
  | { ok: true; id: string }
  | { ok: false; status: number; message: string };

export async function createAvailabilityBlock(
  professionalId: string,
  input: AvailabilityBlockInput,
): Promise<AvailabilityOpResult> {
  const overlap = await findOverlappingBlock(
    professionalId,
    input.startAt,
    input.endAt,
  );
  if (overlap) {
    return {
      ok: false,
      status: 409,
      message: "This time range overlaps an existing block.",
    };
  }

  const [created] = await db
    .insert(AvailabilityBlockTable)
    .values({
      professionalId,
      startAt: input.startAt,
      endAt: input.endAt,
      status: input.status,
      notes: input.notes ?? null,
    })
    .returning({ id: AvailabilityBlockTable.id });

  return { ok: true, id: created.id };
}

export async function updateAvailabilityBlock(
  professionalId: string,
  blockId: string,
  input: AvailabilityBlockInput,
): Promise<AvailabilityOpResult> {
  const [existing] = await db
    .select({ id: AvailabilityBlockTable.id })
    .from(AvailabilityBlockTable)
    .where(
      and(
        eq(AvailabilityBlockTable.id, blockId),
        eq(AvailabilityBlockTable.professionalId, professionalId),
      ),
    )
    .limit(1);

  if (!existing) {
    return { ok: false, status: 404, message: "Availability block not found." };
  }

  const overlap = await findOverlappingBlock(
    professionalId,
    input.startAt,
    input.endAt,
    blockId,
  );
  if (overlap) {
    return {
      ok: false,
      status: 409,
      message: "This time range overlaps an existing block.",
    };
  }

  await db
    .update(AvailabilityBlockTable)
    .set({
      startAt: input.startAt,
      endAt: input.endAt,
      status: input.status,
      notes: input.notes ?? null,
      updatedAt: new Date(),
    })
    .where(eq(AvailabilityBlockTable.id, blockId));

  return { ok: true, id: blockId };
}

export async function deleteAvailabilityBlock(
  professionalId: string,
  blockId: string,
): Promise<AvailabilityOpResult> {
  const [existing] = await db
    .select({ id: AvailabilityBlockTable.id })
    .from(AvailabilityBlockTable)
    .where(
      and(
        eq(AvailabilityBlockTable.id, blockId),
        eq(AvailabilityBlockTable.professionalId, professionalId),
      ),
    )
    .limit(1);

  if (!existing) {
    return { ok: false, status: 404, message: "Availability block not found." };
  }

  await db.delete(AvailabilityBlockTable).where(eq(AvailabilityBlockTable.id, blockId));
  return { ok: true, id: blockId };
}
