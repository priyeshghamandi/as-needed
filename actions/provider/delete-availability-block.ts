"use server";

import { requireLinkedProviderContext } from "@/lib/auth/provider-context";
import { deleteAvailabilityBlock } from "@/lib/provider/availability-blocks";

export type AvailabilityBlockActionState =
  | { status: "success"; id: string }
  | { status: "error"; message: string };

export async function deleteAvailabilityBlockAction(
  blockId: string,
): Promise<AvailabilityBlockActionState> {
  try {
    const { professional } = await requireLinkedProviderContext();
    const result = await deleteAvailabilityBlock(professional.id, blockId);
    if (!result.ok) {
      return { status: "error", message: result.message };
    }
    return { status: "success", id: result.id };
  } catch (error) {
    console.error("deleteAvailabilityBlockAction failed", error);
    return {
      status: "error",
      message: error instanceof Error ? error.message : "Unable to delete availability.",
    };
  }
}
