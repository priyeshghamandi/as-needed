import { describe, expect, it } from "vitest";
import { credentialInputSchema } from "./credential";

describe("credential validation", () => {
  it("COMP-UT-001: valid create payload", () => {
    const result = credentialInputSchema.safeParse({
      professionalId: "00000000-0000-4000-8000-000000000001",
      type: "license",
      name: "RN License",
      licenseNumber: "RN-1",
      issuedAt: "2024-01-01",
      expiresAt: "2026-01-01",
    });
    expect(result.success).toBe(true);
  });

  it("COMP-UT-002: expires before issued fails", () => {
    const result = credentialInputSchema.safeParse({
      professionalId: "00000000-0000-4000-8000-000000000001",
      type: "license",
      name: "RN License",
      issuedAt: "2025-06-01",
      expiresAt: "2024-01-01",
    });
    expect(result.success).toBe(false);
  });

  it("COMP-UT-003: empty name fails", () => {
    const result = credentialInputSchema.safeParse({
      professionalId: "00000000-0000-4000-8000-000000000001",
      type: "license",
      name: "",
    });
    expect(result.success).toBe(false);
  });

  it("COMP-UT-004: invalid documentUrl fails", () => {
    const result = credentialInputSchema.safeParse({
      professionalId: "00000000-0000-4000-8000-000000000001",
      type: "license",
      name: "RN License",
      documentUrl: "not-a-url",
    });
    expect(result.success).toBe(false);
  });
});
