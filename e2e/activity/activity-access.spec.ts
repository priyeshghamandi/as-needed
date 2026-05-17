import { test, expect } from "@playwright/test";
import { loginAs, users } from "../fixtures/auth";

test.describe("ACT access", () => {
  test("ACT-E2E-001: provider cannot access API", async ({ page, request }) => {
    await loginAs(page, users.provider);
    const res = await request.get("/api/activity-logs?limit=5");
    expect(res.status()).toBe(403);
  });

  test("ACT-E2E-002: unauthenticated blocked", async ({ request }) => {
    const res = await request.get("/api/activity-logs");
    expect(res.status()).toBe(401);
  });

  test("ACT-E2E-003: coordinator can access API", async ({ page, request }) => {
    await loginAs(page, users.coordinator);
    const res = await request.get("/api/activity-logs?limit=5");
    expect(res.status()).toBe(200);
    const data = (await res.json()) as { items: unknown[] };
    expect(Array.isArray(data.items)).toBe(true);
  });
});
