import { test, expect } from "@playwright/test";
import { loginAs, users } from "../fixtures/auth";

test.describe("OPS-E2E access", () => {
  test("OPS-E2E-001: unauthenticated user blocked", async ({ page }) => {
    await page.goto("/dashboard");
    await expect(page).toHaveURL(/\/login/);
    expect(page.url()).toContain("callbackUrl");
    expect(page.url()).toContain("dashboard");
  });

  test("OPS-E2E-002: agency owner can access dashboard", async ({ page }) => {
    await loginAs(page, users.ownerA);
    await page.goto("/dashboard");
    await expect(page.getByText("Open Requests")).toBeVisible();
    await expect(page.getByText("Fill Rate")).toBeVisible();
    await expect(page.getByText("Available Professionals")).toBeVisible();
    await expect(page.getByText("Urgent Shifts")).toBeVisible();
    await expect(page.getByText("Compliance Alerts")).toBeVisible();
  });

  test("OPS-E2E-003: staffing coordinator can access dashboard", async ({ page }) => {
    await loginAs(page, users.coordinator);
    await page.goto("/dashboard");
    await expect(page.getByText("Active Staffing Requests")).toBeVisible();
    await expect(page.getByText(/Finish setting up your agency/i)).not.toBeVisible();
  });

  test("OPS-E2E-004: provider cannot access dashboard", async ({ page }) => {
    await loginAs(page, users.provider);
    await page.goto("/dashboard");
    await expect(page).not.toHaveURL(/\/dashboard$/);
    await expect(page.getByText("Open Requests")).not.toBeVisible();
  });

  test("OPS-E2E-005: facility user cannot access dashboard", async ({ page }) => {
    await loginAs(page, users.facility);
    await page.goto("/dashboard");
    await expect(page).toHaveURL(/\/facility/);
    await expect(page.getByText("Open Requests")).not.toBeVisible();
  });
});
