import { test, expect } from "@playwright/test";
import { loginAs, users } from "../fixtures/auth";

test.describe("REQ-E2E detail", () => {
  test("REQ-E2E-030: start matching", async ({ page }) => {
    await loginAs(page, users.coordinator);
    await page.goto("/staffing-requests");
    await page.getByRole("link", { name: "ER RN — Weekend" }).click();
    await page.getByRole("button", { name: /start matching/i }).click();
    await expect(page.getByText("Matching")).toBeVisible();
    await expect(page.getByRole("link", { name: /open matching/i })).toBeVisible();
  });

  test("REQ-E2E-031: cancel request", async ({ page }) => {
    await loginAs(page, users.coordinator);
    await page.goto("/staffing-requests");
    await page.getByRole("link", { name: "Med-Surg CNA" }).click();
    await page.getByRole("button", { name: /cancel request/i }).click();
    await page.getByRole("dialog").getByRole("button", { name: /cancel request/i }).click();
    await expect(page.getByText("Cancelled", { exact: true })).toBeVisible();
    await expect(page.getByText(/was cancelled/i)).toBeVisible();
  });

  test("REQ-E2E-032: recruiter cannot cancel", async ({ page }) => {
    await loginAs(page, users.recruiter);
    await page.goto("/staffing-requests");
    await page.getByRole("link", { name: "ICU RN — Night" }).first().click();
    await expect(page.getByRole("button", { name: /cancel request/i })).not.toBeVisible();
  });

  test("REQ-E2E-033: cross-agency blocked", async ({ page }) => {
    await loginAs(page, users.coordinator);
    await page.goto("/staffing-requests/e2e00000-0000-4000-8000-000000000011");
    await expect(page.getByRole("heading", { name: "404" })).toBeVisible();
  });
});
