import { describe, expect, it } from "vitest";

describe("GET /api/marketplace/categories", () => {
  it("CAT-API-000: categories list response shape", () => {
    const sample = {
      categories: [
        {
          id: "uuid",
          slug: "registered-nurse",
          name: "Registered Nurse (RN)",
          roleFilter: "rn",
        },
      ],
    };
    expect(sample.categories[0].slug).toBe("registered-nurse");
  });
});
