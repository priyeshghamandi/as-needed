import { test, expect } from "@playwright/test";
import { loginAs, users } from "../fixtures/auth";

test.describe("SHIFT-E2E responsive", () => {
  test.beforeEach(async ({ page }) => {
    await loginAs(page, users.coordinator);
  });

  test("SHIFT-E2E-030: mobile list 375px", async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 });
    await page.goto("/shifts");
    await expect(page.getByRole("heading", { name: "Shifts" })).toBeVisible();
    await expect(page.getByRole("link", { name: "ICU RN — Night" }).first()).toBeVisible();
  });

  test("SHIFT-E2E-031: mobile detail assignments section", async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 });
    await page.goto("/shifts");
    await page.getByRole("link", { name: "ICU RN — Night" }).first().click();
    await expect(page).toHaveURL(/\/shifts\/[0-9a-f-]+/);
    await expect(page.getByRole("heading", { name: "Assignments" })).toBeVisible();
  });

  test("SHIFT-E2E-032: desktop 1280px table", async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 800 });
    await page.goto("/shifts");
    await expect(page.getByRole("columnheader", { name: "Facility" })).toBeVisible();
    await expect(page.getByRole("columnheader", { name: "Status" })).toBeVisible();
  });
});
