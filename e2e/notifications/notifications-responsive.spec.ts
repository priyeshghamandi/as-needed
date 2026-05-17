import { test, expect } from "@playwright/test";
import { loginAs, users } from "../fixtures/auth";

test.describe("NOTIF responsive", () => {
  test("NOTIF-E2E-040: mobile cards", async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await loginAs(page, users.coordinator);
    await page.goto("/notifications");
    await expect(page.getByTestId("notification-card").first()).toBeVisible();
  });

  test("NOTIF-E2E-041: bell visible on dashboard mobile", async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await loginAs(page, users.coordinator);
    await page.goto("/dashboard");
    await expect(page.getByLabel(/notifications/i)).toBeVisible();
  });
});
