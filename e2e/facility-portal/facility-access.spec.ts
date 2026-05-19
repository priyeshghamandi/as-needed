import { test, expect } from "@playwright/test";
import { loginAs, users } from "../fixtures/auth";

test.describe("Facility portal access", () => {
  test("FPORT-E2E-001: unauthenticated blocked from dashboard", async ({ page }) => {
    await page.goto("/facility/dashboard");
    await expect(page).toHaveURL(/\/login/);
    expect(page.url()).toContain("callbackUrl");
  });

  test("FPORT-E2E-002: facility user lands on dashboard after login", async ({ page }) => {
    await loginAs(page, users.facility);
    await expect(page).toHaveURL(/\/facility\/dashboard/);
    await expect(page.getByRole("heading", { name: "Dashboard" })).toBeVisible();
  });

  test("FPORT-E2E-003: agency owner blocked from facility dashboard", async ({ page }) => {
    await loginAs(page, users.ownerA);
    await page.goto("/facility/dashboard");
    await expect(page).toHaveURL(/\/dashboard/);
  });

  test("FPORT-E2E-004: provider blocked from facility requests", async ({ page }) => {
    await loginAs(page, users.provider);
    await page.goto("/facility/requests");
    await expect(page).toHaveURL(/\/my-shifts/);
  });
});
