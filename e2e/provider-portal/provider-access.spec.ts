import { test, expect } from "@playwright/test";
import { loginAs, users } from "../fixtures/auth";

test.describe("HPP-E2E access", () => {
  test("HPP-E2E-001: unauthenticated blocked from my-shifts", async ({ page }) => {
    await page.goto("/my-shifts");
    await expect(page).toHaveURL(/\/login/);
    expect(page.url()).toContain("callbackUrl");
    expect(page.url()).toContain("my-shifts");
  });

  test("HPP-E2E-002: provider lands on my-shifts after login", async ({ page }) => {
    await loginAs(page, users.provider);
    await expect(page).toHaveURL(/\/my-shifts/);
    await expect(page.getByRole("button", { name: "Invites" })).toBeVisible();
  });

  test("HPP-E2E-003: agency owner cannot access provider routes", async ({ page }) => {
    await loginAs(page, users.ownerA);
    await page.goto("/my-shifts");
    await expect(page).toHaveURL(/\/dashboard/);
    await page.goto("/availability");
    await expect(page).toHaveURL(/\/dashboard/);
  });

  test("HPP-E2E-004: facility user cannot access provider routes", async ({ page }) => {
    await loginAs(page, users.facility);
    await page.goto("/my-shifts");
    await expect(page).toHaveURL(/\/facility/);
  });

  test("HPP-E2E-005: unlinked provider sees empty state", async ({ page }) => {
    await loginAs(page, users.providerUnlinked);
    await page.goto("/my-shifts");
    await expect(page.getByText(/account not linked/i)).toBeVisible();
    await expect(page.getByText(/Provider Portal ICU RN/i)).toHaveCount(0);
  });
});
