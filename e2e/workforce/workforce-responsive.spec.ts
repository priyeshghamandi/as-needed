import { test, expect } from "@playwright/test";
import { loginAs, users } from "../fixtures/auth";

test.describe("WORK-E2E responsive", () => {
  test("WORK-E2E-050: mobile list cards 375px", async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 });
    await loginAs(page, users.recruiter);
    await page.goto("/workforce");
    await expect(page.getByRole("link", { name: /Jane Smith/i }).first()).toBeVisible();
    const scrollWidth = await page.evaluate(() => document.documentElement.scrollWidth);
    const clientWidth = await page.evaluate(() => document.documentElement.clientWidth);
    expect(scrollWidth).toBeLessThanOrEqual(clientWidth + 1);
    await page.getByRole("link", { name: "Jane Smith" }).first().click();
    await expect(page).toHaveURL(/\/workforce\//);
  });
});
