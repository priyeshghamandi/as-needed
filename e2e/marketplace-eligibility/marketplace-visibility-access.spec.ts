import { test, expect } from "@playwright/test";
import { loginAs, users } from "../fixtures/auth";

test.describe("MEL marketplace visibility access", () => {
  test("MEL-E2E-001: provider cannot access workforce", async ({ page }) => {
    await loginAs(page, users.provider);
    await page.goto("/workforce");
    await expect(page).not.toHaveURL(/\/workforce$/);
  });

  test("MEL-E2E-002: coordinator marketplace tab read-only", async ({ page }) => {
    await loginAs(page, users.coordinator);
    await page.goto("/workforce");
    const firstLink = page.locator('a[href^="/workforce/"]').first();
    if ((await firstLink.count()) === 0) {
      test.skip();
      return;
    }
    const href = await firstLink.getAttribute("href");
    await page.goto(`${href}?tab=marketplace`);
    await expect(page.getByRole("heading", { name: "Marketplace visibility" })).toBeVisible();
    const toggle = page.getByRole("checkbox", { name: "Visible on marketplace" });
    await expect(toggle).toBeDisabled();
  });

  test("MEL-E2E-003: recruiter can open marketplace tab", async ({ page }) => {
    await loginAs(page, users.recruiter);
    await page.goto("/workforce");
    const firstLink = page.locator('a[href^="/workforce/"]').first();
    if ((await firstLink.count()) === 0) {
      test.skip();
      return;
    }
    const href = await firstLink.getAttribute("href");
    await page.goto(`${href}?tab=marketplace`);
    await expect(page.getByRole("heading", { name: "Marketplace visibility" })).toBeVisible();
    await expect(page.getByText(/agency-controlled/i)).toBeVisible();
  });
});
