import { test, expect } from "@playwright/test";
import { loginAs, users } from "../fixtures/auth";

test.describe("HPP-E2E responsive", () => {
  test.use({ viewport: { width: 375, height: 812 } });

  test("HPP-E2E-030: Mobile viewport my-shifts", async ({ page }) => {
    await loginAs(page, users.provider);
    await page.goto("/my-shifts");
    await expect(page.getByRole("button", { name: "Invites" })).toBeVisible();
    const scrollWidth = await page.evaluate(() => document.documentElement.scrollWidth);
    const clientWidth = await page.evaluate(() => document.documentElement.clientWidth);
    expect(scrollWidth).toBeLessThanOrEqual(clientWidth + 2);
    await page.getByText("E2E Memorial Hospital").first().click();
    await expect(page.getByRole("button", { name: /accept shift/i })).toBeVisible();
  });

  test("HPP-E2E-031: Mobile viewport availability form", async ({ page }) => {
    await loginAs(page, users.provider);
    await page.goto("/availability");
    await page.getByRole("button", { name: /add availability/i }).click();
    await expect(page.locator('input[type="datetime-local"]').first()).toBeVisible();
    await expect(page.getByRole("button", { name: /^save$/i })).toBeVisible();
  });
});
