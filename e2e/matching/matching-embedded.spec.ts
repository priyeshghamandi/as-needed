import { test, expect } from "@playwright/test";
import { loginAs, users } from "../fixtures/auth";

test.describe("MATCH-E2E embedded", () => {
  test("MATCH-E2E-030: embedded panel on request detail", async ({ page }) => {
    await loginAs(page, users.coordinator);
    await page.goto("/staffing-requests");
    await page.getByRole("link", { name: "Med-Surg CNA" }).click();
    await expect(page.getByRole("heading", { name: "Suggested matches" })).toBeVisible();
    const count = await page
      .locator("section")
      .filter({ hasText: "Suggested matches" })
      .locator("li")
      .count();
    expect(count).toBeGreaterThan(0);
    expect(count).toBeLessThanOrEqual(5);
  });

  test("MATCH-E2E-031: view all navigates to match route", async ({ page }) => {
    await loginAs(page, users.coordinator);
    await page.goto("/staffing-requests");
    await page.getByRole("link", { name: "Med-Surg CNA" }).click();
    await page.getByRole("link", { name: "View all" }).click();
    await expect(page).toHaveURL(/\/staffing-requests\/[0-9a-f-]+\/match/);
    await expect(page.getByRole("heading", { name: "Match professionals" })).toBeVisible();
  });
});
