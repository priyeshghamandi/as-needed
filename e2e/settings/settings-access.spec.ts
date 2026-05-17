import { test, expect } from "@playwright/test";
import { loginAs, users } from "../fixtures/auth";

test.describe("SET access", () => {
  test("SET-E2E-001: unauthenticated redirect", async ({ page }) => {
    await page.goto("/settings");
    await expect(page).toHaveURL(/\/login/);
    expect(page.url()).toContain("callbackUrl");
    expect(page.url()).toContain("settings");
  });

  test("SET-E2E-002: provider blocked", async ({ page }) => {
    await loginAs(page, users.provider);
    await page.goto("/settings");
    await expect(page).not.toHaveURL(/\/settings/);
  });

  test("SET-E2E-003: owner can access", async ({ page }) => {
    await loginAs(page, users.ownerA);
    await page.goto("/settings");
    await expect(page.getByRole("heading", { name: "Settings" })).toBeVisible();
    await expect(page.getByRole("tab", { name: "Profile", selected: true })).toBeVisible();
  });
});
