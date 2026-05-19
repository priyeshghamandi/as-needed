import { test, expect } from "@playwright/test";
import { loginAs, users } from "../fixtures/auth";

test.describe("Facility dashboard", () => {
  test.beforeEach(async ({ page }) => {
    await loginAs(page, users.facility);
    await page.goto("/facility/dashboard");
  });

  test("FPORT-E2E-010: dashboard KPIs render", async ({ page }) => {
    await expect(page.getByRole("heading", { name: "Key metrics" })).toBeAttached();
    await expect(page.getByText("Open requests")).toBeVisible();
    await expect(page.getByText("At risk")).toBeVisible();
  });

  test("FPORT-E2E-011: active requests snippet shows seeded request", async ({ page }) => {
    await expect(page.getByText("ICU RN — Night")).toBeVisible();
  });

  test("FPORT-E2E-012: create request CTA navigates", async ({ page }) => {
    await page.getByRole("link", { name: "Create staffing request" }).first().click();
    await expect(page).toHaveURL(/\/facility\/requests\/new/);
  });
});
