import { describe, expect, it, vi, beforeEach } from "vitest";
import {
  assertCustomerLocationPresent,
  CustomerLocationRequiredError,
  getEligibleProfessionals,
} from "@/lib/marketplace/eligibility";

vi.mock("@/drizzle/db", () => ({
  db: {
    select: vi.fn(),
  },
}));

vi.mock("@/lib/marketplace/compliance-visibility", () => ({
  syncMarketplaceComplianceBlock: vi.fn().mockResolvedValue(null),
}));

describe("eligibility", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("MEL-UNIT-002: missing customer location returns empty", async () => {
    const result = await getEligibleProfessionals({ customerLocation: null });
    expect(result).toEqual([]);
  });

  it("assertCustomerLocationPresent throws when missing", () => {
    expect(() => assertCustomerLocationPresent(null)).toThrow(CustomerLocationRequiredError);
  });

  it("MEL-UNIT-006: eligible professional shape has no availability fields", async () => {
    const { db } = await import("@/drizzle/db");
    const chain = {
      from: vi.fn().mockReturnThis(),
      innerJoin: vi.fn().mockReturnThis(),
      where: vi.fn().mockResolvedValue([]),
    };
    vi.mocked(db.select).mockReturnValue(chain as never);

    const result = await getEligibleProfessionals({
      customerLocation: { latitude: 39.74, longitude: -104.99 },
    });
    expect(result).toEqual([]);
    for (const row of result) {
      expect(row).not.toHaveProperty("availability_blocks");
      expect(row).not.toHaveProperty("availabilityBlocks");
    }
  });
});
