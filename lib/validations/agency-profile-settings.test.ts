import { describe, expect, it } from "vitest";
import { agencyProfileSettingsSchema } from "./agency-profile-settings";

const valid = {
  name: "Apex Staffing",
  phone: "+1 555 0100",
  website: "https://apex.example.com",
  logoUrl: "",
  operationalContactName: "Jane Doe",
  operationalContactEmail: "jane@apex.example.com",
  description: "",
  staffingSpecialties: ["RN Staffing"],
};

describe("agencyProfileSettingsSchema", () => {
  it("SET-UT-001: valid profile payload", () => {
    expect(agencyProfileSettingsSchema.safeParse(valid).success).toBe(true);
  });

  it("SET-UT-002: name too short", () => {
    const result = agencyProfileSettingsSchema.safeParse({ ...valid, name: "A" });
    expect(result.success).toBe(false);
  });

  it("SET-UT-003: invalid website URL", () => {
    const result = agencyProfileSettingsSchema.safeParse({ ...valid, website: "not-a-url" });
    expect(result.success).toBe(false);
  });

  it("SET-UT-004: empty specialties array", () => {
    const result = agencyProfileSettingsSchema.safeParse({ ...valid, staffingSpecialties: [] });
    expect(result.success).toBe(false);
  });
});
