import { test, expect } from "@playwright/test";
import { loginAs, users } from "../fixtures/auth";

test.describe("REQ-E2E access", () => {
  test("REQ-E2E-001: unauthenticated blocked", async ({ page }) => {
    await page.goto("/staffing-requests");
    await expect(page).toHaveURL(/\/login/);
    expect(page.url()).toContain("callbackUrl");
  });

  test("REQ-E2E-002: provider blocked", async ({ page }) => {
    await loginAs(page, users.provider);
    await page.goto("/staffing-requests");
    await expect(page).toHaveURL(/\/(my-shifts|rn)/);
  });

  test("REQ-E2E-003: facility user blocked", async ({ page }) => {
    await loginAs(page, users.facility);
    await page.goto("/staffing-requests");
    await expect(page).toHaveURL(/\/facility/);
  });

  test("REQ-E2E-004: coordinator can access list", async ({ page }) => {
    await loginAs(page, users.coordinator);
    await page.goto("/staffing-requests");
    await expect(page.getByRole("heading", { name: "Staffing Requests" })).toBeVisible();
  });

  test("REQ-E2E-005: recruiter read-only", async ({ page }) => {
    await loginAs(page, users.recruiter);
    await page.goto("/staffing-requests");
    await expect(page.getByRole("heading", { name: "Staffing Requests" })).toBeVisible();
    await expect(page.getByRole("link", { name: /new staffing request/i })).not.toBeVisible();
    await page.goto("/staffing-requests/new");
    await expect(page).toHaveURL(/\/staffing-requests/);
    await expect(page.getByText(/do not have permission to create staffing requests/i)).toBeVisible();
  });
});
