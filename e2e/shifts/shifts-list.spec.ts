import { test, expect } from "@playwright/test";
import { loginAs, users } from "../fixtures/auth";

async function openShiftForRequest(page: import("@playwright/test").Page, requestTitle: string) {
  const row = page.locator("table tbody tr").filter({ hasText: requestTitle });
  await row.locator('a[href^="/shifts/"]').first().click();
}

test.describe("SHIFT-E2E list", () => {
  test.beforeEach(async ({ page }) => {
    await loginAs(page, users.coordinator);
    await page.goto("/shifts");
  });

  test("SHIFT-E2E-010: list shows seeded shifts", async ({ page }) => {
    await expect(page.getByRole("link", { name: "ICU RN — Night" }).first()).toBeVisible();
    await expect(page.getByRole("cell", { name: "E2E Memorial Hospital" }).first()).toBeVisible();
    await expect(page.locator("table tbody").getByText(/^Open$/).first()).toBeVisible();
  });

  test("SHIFT-E2E-011: filter by status open", async ({ page }) => {
    await page.getByLabel("Status").selectOption("open");
    await expect(page).toHaveURL(/status=open/, { timeout: 10_000 });
    await expect(page.getByRole("link", { name: "ICU RN — Night" }).first()).toBeVisible();
  });

  test("SHIFT-E2E-012: unfilled filter", async ({ page }) => {
    await page.goto("/shifts?unfilled=1");
    await expect(page).toHaveURL(/unfilled=1/);
    await expect(page.getByRole("link", { name: "ICU RN — Night" }).first()).toBeVisible();
  });

  test("SHIFT-E2E-013: row opens detail", async ({ page }) => {
    await openShiftForRequest(page, "ICU RN — Night");
    await expect(page).toHaveURL(/\/shifts\/[0-9a-f-]+/);
    await expect(page.getByRole("heading", { name: "ICU RN — Night" })).toBeVisible();
  });
});
