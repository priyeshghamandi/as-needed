import { test, expect } from "@playwright/test";
import { loginAs, users } from "../fixtures/auth";

test.describe("WORK-E2E access", () => {
  test("WORK-E2E-001: unauthenticated blocked from /workforce", async ({ page }) => {
    await page.goto("/workforce");
    await expect(page).toHaveURL(/\/login/);
    expect(page.url()).toContain("callbackUrl");
    expect(page.url()).toContain("workforce");
  });

  test("WORK-E2E-002: recruiter can access list", async ({ page }) => {
    await loginAs(page, users.recruiter);
    await page.goto("/workforce");
    await expect(page.getByRole("heading", { name: "Workforce" })).toBeVisible();
    await expect(page.getByRole("link", { name: /add professional/i })).toBeVisible();
  });

  test("WORK-E2E-003: provider blocked", async ({ page }) => {
    await loginAs(page, users.provider);
    await page.goto("/workforce");
    await expect(page).not.toHaveURL(/\/workforce$/);
    await expect(page.getByRole("heading", { name: "Workforce" })).not.toBeVisible();
  });

  test("WORK-E2E-004: coordinator cannot access /workforce/new", async ({ page }) => {
    await loginAs(page, users.coordinator);
    await page.goto("/workforce/new");
    await expect(page).toHaveURL(/\/workforce/);
    await expect(page.getByText(/do not have permission to add professionals/i)).toBeVisible();
  });
});
