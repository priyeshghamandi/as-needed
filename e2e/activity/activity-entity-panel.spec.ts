import { test, expect } from "@playwright/test";
import { loginAs, users } from "../fixtures/auth";

test.describe("ACT entity panels", () => {
  test("ACT-E2E-020: staffing request activity panel", async ({ page }) => {
    await loginAs(page, users.coordinator);
    await page.goto("/staffing-requests");
    await page.getByRole("link", { name: /ICU RN/i }).first().click();
    await expect(page.getByRole("heading", { name: "Activity" })).toBeVisible();
    await expect(page.getByTestId("activity-row").first()).toBeVisible();
  });

  test("ACT-E2E-021: shift activity panel", async ({ page }) => {
    await loginAs(page, users.coordinator);
    await page.goto("/shifts");
    await page.locator("table tbody tr").first().click();
    await expect(page.getByRole("heading", { name: "Activity" })).toBeVisible();
  });

  test("ACT-E2E-022: system actor display", async ({ page }) => {
    await loginAs(page, users.coordinator);
    await page.goto("/dashboard");
    await expect(page.getByText("System")).toBeVisible();
  });
});
