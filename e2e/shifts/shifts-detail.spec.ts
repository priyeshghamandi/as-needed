import { test, expect, type Page } from "@playwright/test";
import { loginAs, users } from "../fixtures/auth";

const AGENCY_B_SHIFT_ID = "e2e00000-0000-4000-8000-000000000012";

async function openShiftForRequest(page: Page, requestTitle: string) {
  await page.goto("/shifts");
  const row = page.locator("table tbody tr").filter({ hasText: requestTitle });
  await row.locator('a[href^="/shifts/"]').first().click();
  await expect(page).toHaveURL(/\/shifts\/[0-9a-f-]+/);
}

test.describe("SHIFT-E2E detail", () => {
  test("SHIFT-E2E-020: detail shows request and facility links", async ({ page }) => {
    await loginAs(page, users.coordinator);
    await openShiftForRequest(page, "ICU RN — Night");
    await expect(page.getByRole("link", { name: "ICU RN — Night" }).first()).toBeVisible();
    await expect(page.getByRole("link", { name: "E2E Memorial Hospital" })).toBeVisible();
  });

  test("SHIFT-E2E-021: edit shift times", async ({ page }) => {
    await loginAs(page, users.coordinator);
    await openShiftForRequest(page, "ICU RN — Night");
    await page.getByRole("button", { name: /edit times/i }).click();
    await page.locator("#edit-end-time").fill("16:00");
    await page.getByRole("dialog").getByRole("button", { name: /^save$/i }).click();
    await expect(page.getByText(/shift times updated/i)).toBeVisible();
  });

  test("SHIFT-E2E-022: cancel shift", async ({ page }) => {
    await loginAs(page, users.coordinator);
    await openShiftForRequest(page, "ER RN — Weekend");
    await page.getByRole("button", { name: /cancel shift/i }).click();
    await page.getByRole("dialog").getByRole("button", { name: /cancel shift/i }).click();
    await expect(page.getByText("Cancelled", { exact: true })).toBeVisible();
    await expect(page.getByText(/was cancelled/i)).toBeVisible();
  });

  test("SHIFT-E2E-023: match professionals CTA", async ({ page }) => {
    await loginAs(page, users.coordinator);
    await openShiftForRequest(page, "Med-Surg CNA");
    await page.getByRole("link", { name: /match professionals/i }).click();
    await expect(page).toHaveURL(/\/staffing-requests\/[0-9a-f-]+\/match/);
  });

  test("SHIFT-E2E-024: cross-agency shift 404", async ({ page }) => {
    await loginAs(page, users.coordinator);
    await page.goto(`/shifts/${AGENCY_B_SHIFT_ID}`);
    await expect(page.getByRole("heading", { name: "404" })).toBeVisible();
  });

  test("SHIFT-E2E-025: add secondary shift", async ({ page }) => {
    await loginAs(page, users.coordinator);
    await openShiftForRequest(page, "Med-Surg CNA");
    await page.getByRole("button", { name: /add secondary shift/i }).click();
    await page.getByRole("dialog").getByRole("button", { name: /add shift/i }).click();
    await expect(page).toHaveURL(/\/staffing-requests\/[0-9a-f-]+/);
    await expect(page.locator('section:has(h2:text-is("Shifts")) li')).toHaveCount(2);
  });
});
