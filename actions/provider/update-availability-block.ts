"use server";

import { requireLinkedProviderContext } from "@/lib/auth/provider-context";
import { updateAvailabilityBlock } from "@/lib/provider/availability-blocks";
import { parseAvailabilityBlockInput } from "@/lib/validations/availability-block";

export type AvailabilityBlockActionState =
  | { status: "success"; id: string }
  | { status: "error"; message: string };

export async function updateAvailabilityBlockAction(
  blockId: string,
  body: unknown,
): Promise<AvailabilityBlockActionState> {
  try {
    const parsed = parseAvailabilityBlockInput(body);
    if (!parsed.success) {
      const issue = parsed.error.issues[0];
      return { status: "error", message: issue?.message ?? "Invalid input." };
    }

    const { professional } = await requireLinkedProviderContext();
    const result = await updateAvailabilityBlock(
      professional.id,
      blockId,
      parsed.data,
    );
    if (!result.ok) {
      return { status: "error", message: result.message };
    }
    return { status: "success", id: result.id };
  } catch (error) {
    console.error("updateAvailabilityBlockAction failed", error);
    return {
      status: "error",
      message: error instanceof Error ? error.message : "Unable to update availability.",
    };
  }
}
