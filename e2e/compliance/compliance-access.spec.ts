import { test, expect } from "@playwright/test";
import { loginAs, users } from "../fixtures/auth";

test.describe("COMP-E2E access", () => {
  test("COMP-E2E-001: unauthenticated redirect", async ({ page }) => {
    await page.goto("/compliance");
    await expect(page).toHaveURL(/\/login/);
    expect(page.url()).toContain("callbackUrl");
    expect(page.url()).toContain("compliance");
  });

  test("COMP-E2E-002: compliance manager access", async ({ page }) => {
    await loginAs(page, users.compliance);
    await page.goto("/compliance");
    await expect(page.getByRole("heading", { name: "Compliance" })).toBeVisible();
    await expect(page.getByRole("button", { name: /add credential/i })).toBeVisible();
  });

  test("COMP-E2E-003: agency owner access", async ({ page }) => {
    await loginAs(page, users.ownerA);
    await page.goto("/compliance");
    await expect(page.getByRole("heading", { name: "Compliance" })).toBeVisible();
  });

  test("COMP-E2E-004: coordinator denied", async ({ page }) => {
    await loginAs(page, users.coordinator);
    await page.goto("/compliance");
    await expect(page).toHaveURL(/\/dashboard/);
    await expect(page.getByRole("heading", { name: "Compliance" })).not.toBeVisible();
  });

  test("COMP-E2E-005: provider denied", async ({ page }) => {
    await loginAs(page, users.provider);
    await page.goto("/compliance");
    await expect(page).toHaveURL(/\/my-shifts/);
    await expect(page.getByRole("heading", { name: "Compliance" })).not.toBeVisible();
  });
});
