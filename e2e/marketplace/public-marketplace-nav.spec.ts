import { test, expect } from "@playwright/test";
import { loginAs, users } from "../fixtures/auth";

test.describe("Public Marketplace Navigation", () => {
  test("PMK-E2E-007: facility user sees My staffing requests link", async ({ page }) => {
    await loginAs(page, users.facility);
    await page.goto("/marketplace");
    await expect(page.getByRole("link", { name: /my staffing requests/i })).toBeVisible();
    await page.getByRole("link", { name: /my staffing requests/i }).click();
    await expect(page).toHaveURL(/\/facility/);
  });

  test("mobile nav exposes categories and search", async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto("/marketplace");
    await page.getByRole("button", { name: /open menu/i }).click();
    const mobileNav = page.getByRole("navigation", { name: /marketplace mobile/i });
    await expect(mobileNav.getByRole("link", { name: /^categories$/i })).toBeVisible();
    await expect(mobileNav.getByRole("link", { name: /^search$/i })).toBeVisible();
    await mobileNav.getByRole("link", { name: /^categories$/i }).click();
    await expect(page).toHaveURL(/\/marketplace\/categories$/);
  });

  test("header links categories and search on desktop", async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 800 });
    await page.goto("/marketplace");
    const nav = page.getByRole("navigation", { name: /^marketplace$/i });
    await nav.getByRole("link", { name: /^categories$/i }).click();
    await expect(page).toHaveURL(/\/marketplace\/categories$/);
    await page.goto("/marketplace");
    await nav.getByRole("link", { name: /^search$/i }).click();
    await expect(page).toHaveURL(/\/marketplace\/search/);
  });
});
