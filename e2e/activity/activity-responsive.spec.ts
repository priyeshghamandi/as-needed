import { test, expect } from "@playwright/test";
import { loginAs, users } from "../fixtures/auth";

test.describe("ACT responsive", () => {
  test("ACT-E2E-030: mobile timeline", async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 844 });
    await loginAs(page, users.coordinator);
    await page.goto("/dashboard");
    await expect(page.getByTestId("activity-card").first()).toBeVisible();
  });
});
