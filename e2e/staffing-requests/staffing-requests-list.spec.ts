import { test, expect } from "@playwright/test";
import { loginAs, users } from "../fixtures/auth";

test.describe("REQ-E2E list", () => {
  test.beforeEach(async ({ page }) => {
    await loginAs(page, users.coordinator);
    await page.goto("/staffing-requests");
  });

  test("REQ-E2E-010: list shows seeded requests", async ({ page }) => {
    await expect(page.getByRole("link", { name: "ICU RN — Night" }).first()).toBeVisible();
    await expect(page.getByRole("cell", { name: "E2E Memorial Hospital" }).first()).toBeVisible();
  });

  test("REQ-E2E-011: filter by status open", async ({ page }) => {
    await page.getByLabel("Status").selectOption("open");
    await expect(page).toHaveURL(/status=open/, { timeout: 10_000 });
    await expect(page.getByRole("link", { name: "ICU RN — Night" }).first()).toBeVisible();
    await expect(page.getByRole("link", { name: "Med-Surg CNA" })).toHaveCount(0);
  });

  test("REQ-E2E-012: search by title", async ({ page }) => {
    const search = page.getByPlaceholder("Search title or facility");
    await search.fill("ICU");
    await search.press("Enter");
    await expect(page.getByRole("link", { name: "ICU RN — Night" }).first()).toBeVisible();
  });

  test("REQ-E2E-013: row navigates to detail", async ({ page }) => {
    await page.getByRole("link", { name: "ICU RN — Night" }).first().click();
    await expect(page).toHaveURL(/\/staffing-requests\/[0-9a-f-]+/);
    await expect(page.getByRole("heading", { name: "ICU RN — Night" })).toBeVisible();
  });
});
