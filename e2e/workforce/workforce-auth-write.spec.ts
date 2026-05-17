import { test, expect } from "@playwright/test";
import { loginAs, users } from "../fixtures/auth";

test.describe("WORK-E2E auth write", () => {
  test("WORK-E2E-040: coordinator sees no Add button", async ({ page }) => {
    await loginAs(page, users.coordinator);
    await page.goto("/workforce");
    await expect(page.getByRole("link", { name: /add professional/i })).not.toBeVisible();
  });

  test("WORK-E2E-041: coordinator profile has no Edit", async ({ page }) => {
    await loginAs(page, users.coordinator);
    await page.goto("/workforce");
    await page.getByRole("link", { name: "Jane Smith" }).first().click();
    await expect(page.getByRole("button", { name: /^edit$/i })).not.toBeVisible();
    await expect(page.getByRole("button", { name: /deactivate/i })).not.toBeVisible();
  });
});
