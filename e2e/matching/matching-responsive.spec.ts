import { test, expect } from "@playwright/test";
import { loginAs, users } from "../fixtures/auth";

test.describe("MATCH-E2E responsive", () => {
  test.beforeEach(async ({ page }) => {
    await loginAs(page, users.coordinator);
  });

  test("MATCH-E2E-040: mobile match table 375px scroll", async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 });
    await page.goto("/staffing-requests");
    await page.getByRole("link", { name: "Med-Surg CNA" }).click();
    await page.getByRole("link", { name: /match professionals/i }).click();
    await expect(page.getByRole("heading", { name: "Candidates" })).toBeVisible();
    await expect(page.locator("table")).toBeVisible();
  });

  test("MATCH-E2E-041: desktop 1280px full layout", async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 800 });
    await page.goto("/staffing-requests");
    await page.getByRole("link", { name: "Med-Surg CNA" }).click();
    await page.getByRole("link", { name: /match professionals/i }).click();
    await expect(page.getByRole("columnheader", { name: "Professional" })).toBeVisible();
    await expect(page.getByRole("heading", { name: "Existing invites" })).toBeVisible();
  });
});
