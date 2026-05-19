import { describe, expect, it } from "vitest";
import { resolveConsumerCareScope } from "@/lib/consumer/resolve-consumer-scope";

describe("resolveConsumerCareScope", () => {
  it("returns not_consumer for unknown user ids in unit tests without DB", async () => {
    const result = await resolveConsumerCareScope(
      "00000000-0000-0000-0000-000000000000",
    );
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(["not_consumer", "no_care_site"]).toContain(result.reason);
    }
  });
});
