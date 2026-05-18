import { describe, expect, it } from "vitest";
import {
  buildCredentialsSummaryLines,
  resolveHeadline,
  yearsExperienceBucket,
} from "@/lib/marketplace/public-profile-format";

describe("public-profile-format", () => {
  it("PPP-FMT-001: resolves headline from profile, specialty, or role", () => {
    expect(
      resolveHeadline({
        profileHeadline: "ICU specialist",
        specialty: "Med-Surg",
        role: "rn",
      }),
    ).toBe("ICU specialist");

    expect(
      resolveHeadline({
        profileHeadline: null,
        specialty: "Med-Surg",
        role: "rn",
      }),
    ).toBe("Med-Surg");

    expect(
      resolveHeadline({
        profileHeadline: null,
        specialty: null,
        role: "rn",
      }),
    ).toBe("RN");
  });

  it("PPP-FMT-002: buckets years of experience", () => {
    expect(yearsExperienceBucket(1)).toBe("<2");
    expect(yearsExperienceBucket(3)).toBe("2-5");
    expect(yearsExperienceBucket(8)).toBe("5+");
  });

  it("PPP-FMT-003: builds credential summary lines", () => {
    const lines = buildCredentialsSummaryLines(
      [
        { name: "RN License", status: "verified" },
        { name: "BLS", status: "pending_review" },
      ],
      null,
    );
    expect(lines).toEqual(["RN License — Verified"]);
  });
});
