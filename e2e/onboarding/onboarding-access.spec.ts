import { test, expect } from "@playwright/test";
import { loginAs, users } from "../fixtures/auth";

test.describe("ONB-E2E access", () => {
  test("ONB-E2E-001: unauthenticated user blocked from onboarding", async ({ page }) => {
    await page.goto("/onboarding");
    await expect(page).toHaveURL(/\/login/);
    expect(page.url()).toContain("callbackUrl");
    expect(page.url()).toContain("onboarding");
  });

  test("ONB-E2E-002: agency owner lands on onboarding after login (incomplete)", async ({
    page,
  }) => {
    await page.setViewportSize({ width: 1280, height: 800 });
    await loginAs(page, users.ownerIncomplete);
    await expect(page).toHaveURL(/\/onboarding/);
    await expect(page.getByText(/Step 02 · Agency profile/i)).toBeVisible();
    await expect(page.getByText(/Step 2 of 7/i)).toBeVisible();
  });

  test("ONB-E2E-003: provider cannot access onboarding", async ({ page }) => {
    await loginAs(page, users.provider);
    await page.goto("/onboarding");
    await expect(page).not.toHaveURL(/\/onboarding/);
    await expect(page.getByRole("button", { name: /start setup/i })).not.toBeVisible();
  });

  test("ONB-E2E-004: facility user cannot access onboarding", async ({ page }) => {
    await loginAs(page, users.facility);
    await page.goto("/onboarding");
    await expect(page).toHaveURL(/\/facility/);
    await expect(page.getByRole("button", { name: /start setup/i })).not.toBeVisible();
  });

  test("ONB-E2E-005: completed onboarding redirects to dashboard", async ({ page }) => {
    await loginAs(page, users.ownerA);
    await page.goto("/onboarding");
    await expect(page).toHaveURL(/\/dashboard/);
  });
});
