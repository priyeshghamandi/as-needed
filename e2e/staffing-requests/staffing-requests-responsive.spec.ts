import { test, expect } from "@playwright/test";
import { loginAs, users } from "../fixtures/auth";

test.describe("REQ-E2E responsive", () => {
  test("REQ-E2E-040: mobile list 375px", async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 });
    await loginAs(page, users.coordinator);
    await page.goto("/staffing-requests");
    await expect(page.getByRole("link", { name: "ICU RN — Night" }).first()).toBeVisible();
    const scrollWidth = await page.evaluate(() => document.documentElement.scrollWidth);
    const clientWidth = await page.evaluate(() => document.documentElement.clientWidth);
    expect(scrollWidth).toBeLessThanOrEqual(clientWidth + 1);
  });

  test("REQ-E2E-041: mobile create form", async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 });
    await loginAs(page, users.coordinator);
    await page.goto("/staffing-requests/new");
    await expect(page.getByRole("button", { name: /create request/i })).toBeVisible();
    await expect(page.locator("#req-facility")).toBeVisible();
  });

  test("REQ-E2E-042: desktop table 1280px", async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 800 });
    await loginAs(page, users.coordinator);
    await page.goto("/staffing-requests");
    await expect(page.getByRole("columnheader", { name: "Request" })).toBeVisible();
    await expect(page.getByRole("columnheader", { name: "Facility" })).toBeVisible();
  });
});
