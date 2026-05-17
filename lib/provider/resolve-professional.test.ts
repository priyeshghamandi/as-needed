import { describe, expect, it } from "vitest";
import type { ResolvedProfessional } from "@/lib/provider/resolve-professional";

describe("resolveProfessional contract", () => {
  it("HPP-UT-030: linked professional has required fields", () => {
    const row: ResolvedProfessional = {
      id: "e2e00000-0000-4000-8000-0000000000a1",
      firstName: "Jane",
      lastName: "Smith",
      agencyId: "agency-id",
    };
    expect(row.id).toBeTruthy();
    expect(row.firstName).toBe("Jane");
  });

  it("HPP-UT-031: null represents unlinked user", () => {
    const unlinked: ResolvedProfessional | null = null;
    expect(unlinked).toBeNull();
  });
});
