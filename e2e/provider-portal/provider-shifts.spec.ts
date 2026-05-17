import { test, expect } from "@playwright/test";
import { loginAs, users } from "../fixtures/auth";

const ASSIGNMENT_1 = "e2e00000-0000-4000-8000-000000000101";
const ASSIGNMENT_2 = "e2e00000-0000-4000-8000-000000000102";

test.describe.configure({ mode: "serial" });

test.describe("HPP-E2E provider shifts", () => {
  test.beforeEach(async ({ page }) => {
    await loginAs(page, users.provider);
    await page.goto("/my-shifts");
  });

  test("HPP-E2E-010: Invites tab lists pending invite", async ({ page }) => {
    await expect(page.getByRole("button", { name: "Invites" })).toBeVisible();
    await expect(page.getByText("E2E Memorial Hospital").first()).toBeVisible();
    await expect(page.getByText("Invited").first()).toBeVisible();
  });

  test("HPP-E2E-011: Accept shift invite", async ({ page }) => {
    await page.getByText("E2E Memorial Hospital").first().click();
    await page.getByRole("button", { name: /accept shift/i }).click();
    await page.getByRole("button", { name: /confirm accept/i }).click();
    await expect(page.getByText(/shift accepted/i)).toBeVisible();
    await page.getByRole("button", { name: "Upcoming" }).click();
    await expect(page.getByText("E2E Memorial Hospital").first()).toBeVisible();
  });

  test("HPP-E2E-013: Accept blocked on overlapping shift", async ({ page }) => {
    const overlapRes = await page.request.patch(`/api/shift-assignments/${ASSIGNMENT_2}`, {
      data: { status: "accepted" },
    });
    expect(overlapRes.status()).toBe(409);
    const body = (await overlapRes.json()) as { error?: string };
    expect(body.error ?? "").toMatch(/overlap/i);
  });

  test("HPP-E2E-012: Decline shift invite with reason", async ({ page }) => {
    const res = await page.request.patch(`/api/shift-assignments/${ASSIGNMENT_2}`, {
      data: { status: "declined", declineReason: "Schedule conflict" },
    });
    expect(res.ok()).toBeTruthy();
    await page.reload();
    await expect(page.getByText("Provider Portal ICU RN")).toHaveCount(0);
  });

  test("HPP-E2E-014: Provider cannot accept foreign assignment", async ({ page }) => {
    const foreignId = "00000000-0000-0000-0000-000000000001";
    const patch = await page.request.patch(`/api/shift-assignments/${foreignId}`, {
      data: { status: "accepted" },
    });
    expect([403, 404]).toContain(patch.status());
  });
});
