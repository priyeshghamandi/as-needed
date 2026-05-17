import { test, expect } from "@playwright/test";
import { loginAs, users } from "../fixtures/auth";

test.describe("OPS-E2E tables", () => {
  test("OPS-E2E-020: active requests table lists seeded rows", async ({ page }) => {
    await loginAs(page, users.ownerA);
    await page.goto("/dashboard");
    await expect(page.getByText("E2E Memorial Hospital").first()).toBeVisible();
    await expect(page.getByText("ICU RN — Night")).toBeVisible();
    await expect(page.getByText(/open|matching|partially filled/i).first()).toBeVisible();
  });

  test("OPS-E2E-021: available workforce table links to profile", async ({ page }) => {
    await loginAs(page, users.ownerA);
    await page.goto("/dashboard");
    const link = page.locator('a[href^="/workforce/"]:not([href="/workforce/new"])').first();
    await expect(link).toBeVisible();
    const href = await link.getAttribute("href");
    expect(href).toMatch(/^\/workforce\/[0-9a-f-]+$/);
    await link.click();
    await expect(page).toHaveURL(/\/workforce\//);
  });

  test("OPS-E2E-022: activity feed shows recent events", async ({ page }) => {
    await loginAs(page, users.ownerA);
    await page.goto("/dashboard");
    await expect(page.getByText("Recent Activity")).toBeVisible();
    const items = page.locator("ol li");
    await expect(items.first()).toBeVisible();
    expect(await items.count()).toBeLessThanOrEqual(20);
    await expect(page.getByText(/\ds|\dm|\dh|\dd/).first()).toBeVisible();
  });

  test("OPS-E2E-023: empty requests table state", async ({ page }) => {
    await loginAs(page, users.ownerB);
    await page.goto("/dashboard");
    await expect(page.getByText("No active staffing requests")).toBeVisible();
  });
});
