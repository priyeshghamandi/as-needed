import { test, expect } from "@playwright/test";
import { loginAs, users } from "../fixtures/auth";

test.describe("SHIFT-E2E access", () => {
  test("SHIFT-E2E-001: unauthenticated blocked", async ({ page }) => {
    await page.goto("/shifts");
    await expect(page).toHaveURL(/\/login/);
    expect(page.url()).toContain("callbackUrl");
  });

  test("SHIFT-E2E-002: provider blocked", async ({ page }) => {
    await loginAs(page, users.provider);
    await page.goto("/shifts");
    await expect(page).toHaveURL(/\/(my-shifts|rn)/);
  });

  test("SHIFT-E2E-003: coordinator can access list", async ({ page }) => {
    await loginAs(page, users.coordinator);
    await page.goto("/shifts");
    await expect(page.getByRole("heading", { name: "Shifts" })).toBeVisible();
  });

  test("SHIFT-E2E-004: recruiter read-only on detail", async ({ page }) => {
    await loginAs(page, users.recruiter);
    await page.goto("/shifts");
    await page
      .locator("table tbody tr")
      .filter({ hasText: "ICU RN — Night" })
      .locator('a[href^="/shifts/"]')
      .first()
      .click();
    await expect(page.getByRole("button", { name: /edit times/i })).not.toBeVisible();
    await expect(page.getByRole("button", { name: /cancel shift/i })).not.toBeVisible();
  });
});
