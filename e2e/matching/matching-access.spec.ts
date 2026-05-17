import { test, expect } from "@playwright/test";
import { loginAs, users } from "../fixtures/auth";

async function openMedSurgMatch(page: import("@playwright/test").Page) {
  await page.goto("/staffing-requests");
  await page.getByRole("link", { name: "Med-Surg CNA" }).click();
  await page.getByRole("link", { name: /match professionals/i }).click();
}

test.describe("MATCH-E2E access", () => {
  test("MATCH-E2E-001: unauthenticated blocked", async ({ browser }) => {
    const authContext = await browser.newContext();
    const authPage = await authContext.newPage();
    await loginAs(authPage, users.coordinator);
    await authPage.goto("/staffing-requests");
    await authPage.getByRole("link", { name: "Med-Surg CNA" }).click();
    const requestId = authPage.url().match(/staffing-requests\/([^/]+)/)?.[1];
    await authContext.close();

    const anonContext = await browser.newContext();
    const anonPage = await anonContext.newPage();
    await anonPage.goto(`/staffing-requests/${requestId}/match`);
    await expect(anonPage).toHaveURL(/\/login/);
    await anonContext.close();
  });

  test("MATCH-E2E-002: provider blocked", async ({ page }) => {
    await loginAs(page, users.provider);
    await page.goto("/staffing-requests");
    await expect(page).toHaveURL(/\/(my-shifts|rn)/);
  });

  test("MATCH-E2E-003: coordinator can access match page", async ({ page }) => {
    await loginAs(page, users.coordinator);
    await openMedSurgMatch(page);
    await expect(page.getByRole("heading", { name: "Match professionals" })).toBeVisible();
    await expect(page.getByRole("heading", { name: "Candidates" })).toBeVisible();
  });

  test("MATCH-E2E-004: recruiter read-only cannot invite", async ({ page }) => {
    await loginAs(page, users.recruiter);
    await openMedSurgMatch(page);
    await expect(page.getByRole("button", { name: /^invite /i })).not.toBeVisible();
  });
});
