import { test, expect } from "@playwright/test";
import { loginAs, users } from "../fixtures/auth";

test.describe("NOTIF access", () => {
  test("NOTIF-E2E-001: unauthenticated redirect", async ({ page }) => {
    await page.goto("/notifications");
    await expect(page).toHaveURL(/\/login/);
    expect(page.url()).toContain("callbackUrl");
    expect(page.url()).toContain("notifications");
  });

  test("NOTIF-E2E-002: agency coordinator inbox", async ({ page }) => {
    await loginAs(page, users.coordinator);
    await page.goto("/notifications");
    await expect(page.getByRole("heading", { name: "Notifications" })).toBeVisible();
  });

  test("NOTIF-E2E-003: provider inbox", async ({ page }) => {
    await loginAs(page, users.provider);
    await page.goto("/notifications");
    await expect(page.getByRole("heading", { name: "Notifications" })).toBeVisible();
  });
});
