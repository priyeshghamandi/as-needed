import { test, expect } from "@playwright/test";
import { loginAs, users } from "../fixtures/auth";

test.describe("NOTIF toast and banner", () => {
  test("NOTIF-E2E-030: critical banner on dashboard", async ({ page }) => {
    await loginAs(page, users.coordinator);
    await page.goto("/dashboard");
    await expect(page.getByRole("alert")).toContainText("Critical coverage gap");
    await expect(page.getByRole("link", { name: "Review alert" })).toBeVisible();
  });

  test("NOTIF-E2E-031: dismiss critical banner", async ({ page }) => {
    await loginAs(page, users.coordinator);
    await page.goto("/dashboard");
    await page.getByRole("button", { name: "Dismiss alert" }).click();
    await expect(page.getByRole("alert")).not.toBeVisible();
  });

  test("NOTIF-E2E-032: urgent toast on session", async ({ page }) => {
    await loginAs(page, users.coordinator);
    await page.goto("/dashboard");
    await expect(page.getByText("Assignment declined")).toBeVisible({ timeout: 15_000 });
  });
});
