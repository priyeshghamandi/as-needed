import { test, expect } from "@playwright/test";
import { loginAs, users } from "../fixtures/auth";

test.describe("Customer Requests access", () => {
  test("CRQ-E2E-001: unauthenticated new request redirects to login", async ({ page }) => {
    await page.context().clearCookies();
    await page.goto("/customer/requests/new");
    await expect(page).toHaveURL(/\/login/);
    expect(page.url()).toContain("callbackUrl");
  });

  test("CRQ-E2E-002: agency user cannot access customer routes", async ({ page }) => {
    await loginAs(page, users.coordinator);
    await page.goto("/customer/requests");
    await expect(page).not.toHaveURL(/\/customer\/requests/);
  });
});
