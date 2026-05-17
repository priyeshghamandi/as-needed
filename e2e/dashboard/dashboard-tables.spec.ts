import { test, expect } from "@playwright/test";
import { loginAs, users } from "../fixtures/auth";

test.describe("OPS-E2E tables", () => {
  test.beforeEach(async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 800 });
  });

  test("OPS-E2E-020: active requests table lists seeded rows", async ({ page }) => {
    await loginAs(page, users.ownerA);
    await page.goto("/dashboard");
    const tbody = page
      .locator("section")
      .filter({ hasText: "Active Staffing Requests" })
      .locator("tbody");
    await expect(tbody.getByText("E2E Memorial Hospital").first()).toBeVisible();
    await expect(tbody.getByText("ICU RN — Night")).toBeVisible();
    await expect(tbody.getByText(/open|matching|partially filled/i).first()).toBeVisible();
  });

  test("OPS-E2E-021: available workforce table links to profile", async ({ page }) => {
    await loginAs(page, users.ownerA);
    await page.goto("/dashboard");
    const link = page.locator("div.hidden.md\\:block a[href^=\"/workforce/\"]").first();
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
