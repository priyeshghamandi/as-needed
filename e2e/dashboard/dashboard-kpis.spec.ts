import { test, expect } from "@playwright/test";
import { loginAs, users } from "../fixtures/auth";

test.describe("OPS-E2E KPIs", () => {
  test.beforeEach(async ({ page }) => {
    await loginAs(page, users.ownerA);
    await page.goto("/dashboard");
  });

  test("OPS-E2E-010: open requests KPI matches seeded count", async ({ page }) => {
    const card = page.locator("text=Open Requests").locator("..").locator("..");
    await expect(card.getByText("3", { exact: true }).first()).toBeVisible();
  });

  test("OPS-E2E-011: available professionals KPI", async ({ page }) => {
    const card = page.locator("text=Available Professionals").locator("..").locator("..");
    await expect(card.getByText("2", { exact: true }).first()).toBeVisible();
  });

  test("OPS-E2E-012: fill rate displays percentage", async ({ page }) => {
    // Seed: 4 filled of 7 required across 3 active requests → 57%
    await expect(page.getByText("57%")).toBeVisible();
  });
});

test("OPS-E2E-013: empty agency shows zero KPIs", async ({ page }) => {
  await loginAs(page, users.ownerB);
  await page.goto("/dashboard");
  const openCard = page.locator("text=Open Requests").locator("..").locator("..");
  await expect(openCard.getByText("0", { exact: true }).first()).toBeVisible();
  await expect(page.getByText("0%").or(page.getByText("—"))).toBeVisible();
});
