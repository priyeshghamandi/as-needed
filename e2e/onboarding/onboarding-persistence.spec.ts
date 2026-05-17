import { execSync } from "node:child_process";
import { test, expect } from "@playwright/test";
import { loginAs, users } from "../fixtures/auth";

function resetOnboardingSeed() {
  execSync("npx tsx --env-file=.env scripts/seed-onboarding-e2e.ts", {
    stdio: "pipe",
    cwd: process.cwd(),
  });
}

test.describe("ONB-E2E persistence", () => {
  test.beforeEach(() => {
    resetOnboardingSeed();
  });

  test("ONB-E2E-020: progress survives refresh", async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 800 });
    await loginAs(page, users.onboardPersist);
    await expect(page.getByText(/Step 05 · Workforce/i)).toBeVisible();
    await page.reload();
    await expect(page.getByText(/Step 05 · Workforce/i)).toBeVisible();
    await expect(page.locator("ol.grid-cols-7")).toBeVisible();
  });

  test("ONB-E2E-021: save and exit persists state", async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 800 });
    await loginAs(page, users.onboardExit);
    await expect(page.getByText(/Step 06 · Facilities/i)).toBeVisible();
    await page.getByRole("button", { name: /save & exit/i }).click();
    await expect(page).toHaveURL(/\/dashboard/);
    await page.getByRole("link", { name: /complete setup/i }).click();
    await expect(page).toHaveURL(/\/onboarding/);
    await expect(page.getByText(/Step 06 · Facilities/i)).toBeVisible();
  });
});
