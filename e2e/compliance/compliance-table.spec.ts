import { test, expect } from "@playwright/test";
import { loginAs, users } from "../fixtures/auth";

test.describe("COMP-E2E table", () => {
  test.beforeEach(async ({ page }) => {
    await loginAs(page, users.compliance);
    await page.goto("/compliance");
  });

  test("COMP-E2E-010: table shows credentials", async ({ page }) => {
    await expect(page.getByRole("heading", { name: "Compliance" })).toBeVisible();
    await expect(page.getByRole("cell", { name: "BLS Certification" })).toBeVisible();
  });

  test("COMP-E2E-011: status filter pending", async ({ page }) => {
    await page.getByLabel("Status").selectOption("pending_review");
    await expect(page.getByRole("cell", { name: "BLS Certification" })).toBeVisible();
    await expect(page.getByRole("cell", { name: "RN License" })).not.toBeVisible();
  });

  test("COMP-E2E-012: search by professional name", async ({ page }) => {
    await page.getByPlaceholder(/search name/i).fill("Jane");
    await page.getByPlaceholder(/search name/i).press("Enter");
    await expect(page.getByRole("cell", { name: /Jane Smith/ }).first()).toBeVisible();
  });

  test("COMP-E2E-013: KPI cards visible", async ({ page }) => {
    await expect(page.getByText("Pending review", { exact: true }).first()).toBeVisible();
    await expect(page.getByText("Verified", { exact: true }).first()).toBeVisible();
  });
});
