import { describe, expect, it } from "vitest";
import { publicMarketplaceProfilePatchSchema } from "@/lib/validations/public-marketplace-profile";

describe("workforce public-profile API", () => {
  it("PPP-API-010: valid patch body", () => {
    const parsed = publicMarketplaceProfilePatchSchema.safeParse({
      headline: "ICU RN",
      bio: "Experienced nurse",
      specialties: ["ICU", "Med-Surg"],
      photoUrl: "",
      credentialsSummary: "",
    });
    expect(parsed.success).toBe(true);
  });

  it("PPP-API-011: rejects missing headline", () => {
    const parsed = publicMarketplaceProfilePatchSchema.safeParse({
      headline: "",
      specialties: [],
    });
    expect(parsed.success).toBe(false);
  });
});
