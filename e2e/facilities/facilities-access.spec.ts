import { test, expect } from "@playwright/test";
import { loginAs, users } from "../fixtures/auth";

test.describe("FAC-E2E access", () => {
  test("FAC-E2E-001: unauthenticated blocked from /facilities", async ({ page }) => {
    await page.goto("/facilities");
    await expect(page).toHaveURL(/\/login/);
    expect(page.url()).toContain("callbackUrl");
    expect(page.url()).toContain("facilities");
  });

  test("FAC-E2E-002: coordinator can access list", async ({ page }) => {
    await loginAs(page, users.coordinator);
    await page.goto("/facilities");
    await expect(page.getByRole("heading", { name: "Facilities" })).toBeVisible();
    await expect(page.getByRole("link", { name: /add facility/i })).toBeVisible();
  });

  test("FAC-E2E-003: facility user blocked from agency facilities", async ({ page }) => {
    await loginAs(page, users.facility);
    await page.goto("/facilities");
    await expect(page).toHaveURL(/\/facility/);
    await expect(page.getByRole("heading", { name: "Facilities" })).not.toBeVisible();
  });

  test("FAC-E2E-004: recruiter cannot access /facilities/new", async ({ page }) => {
    await loginAs(page, users.recruiter);
    await page.goto("/facilities/new");
    await expect(page).toHaveURL(/\/facilities/);
    await expect(page.getByText(/do not have permission to add facilities/i)).toBeVisible();
  });
});
