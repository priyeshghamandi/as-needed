import { execSync } from "node:child_process";
import { test, expect } from "@playwright/test";
import { loginAs, users } from "../fixtures/auth";
import {
  ensureProfileStep,
  saveProfileAndContinue,
  saveServiceAreaAndContinue,
  stubPlacesApi,
} from "./helpers";

function resetOnboardingSeed() {
  execSync("npx tsx --env-file=.env scripts/seed-onboarding-e2e.ts", {
    stdio: "pipe",
    cwd: process.cwd(),
  });
}

test.describe("ONB-E2E responsive", () => {
  test.beforeEach(async ({ page }) => {
    resetOnboardingSeed();
    await stubPlacesApi(page);
  });

  test("ONB-E2E-030: mobile layout smoke (375px)", async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 });
    await loginAs(page, users.onboardFlow);
    await ensureProfileStep(page);
    await expect(page.getByRole("button", { name: /save & continue/i })).toBeVisible();
    await saveProfileAndContinue(page);
    await expect(page.getByText(/Step 03 · Service area/i)).toBeVisible();
    await saveServiceAreaAndContinue(page);
    const scrollWidth = await page.evaluate(
      () => document.documentElement.scrollWidth,
    );
    const clientWidth = await page.evaluate(
      () => document.documentElement.clientWidth,
    );
    expect(
      scrollWidth,
      "ONB-RESP-01: document should not overflow horizontally on mobile",
    ).toBeLessThanOrEqual(clientWidth + 1);
  });

  test("ONB-E2E-031: tablet layout smoke (768px)", async ({ page }) => {
    await page.setViewportSize({ width: 768, height: 1024 });
    await loginAs(page, users.onboardPersist);
    await expect(page.getByText(/Step 05 · Workforce/i)).toBeVisible();
    await expect(page.getByRole("button", { name: /^continue$/i })).toBeVisible();
    await expect(page.locator("ol.grid-cols-7")).toBeVisible();
  });

  test("ONB-E2E-032: desktop layout smoke (1280px)", async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 800 });
    await loginAs(page, users.onboardFlow);
    await ensureProfileStep(page);
    await expect(page.locator("ol.grid-cols-7")).toBeVisible();
    await expect(page.locator(".grid.grid-cols-12").first()).toBeVisible();
  });
});
