import { test, expect } from "@playwright/test";
import { loginAs, users } from "../fixtures/auth";

test.describe("Facility portal responsive", () => {
  test("FPORT-E2E-030: tablet dashboard layout", async ({ page }) => {
    await page.setViewportSize({ width: 768, height: 1024 });
    await loginAs(page, users.facility);
    await page.goto("/facility/dashboard");
    await expect(page.getByText("Open requests")).toBeVisible();
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth > window.innerWidth);
    expect(overflow).toBe(false);
  });

  test("FPORT-E2E-031: mobile request list uses cards", async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 });
    await loginAs(page, users.facility);
    await page.goto("/facility/requests");
    await expect(page.locator("table").first()).toBeHidden();
    await expect(page.getByText("ICU RN — Night")).toBeVisible();
  });
});
