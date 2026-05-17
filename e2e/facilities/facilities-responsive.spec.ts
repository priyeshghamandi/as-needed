import { test, expect } from "@playwright/test";
import { loginAs, users } from "../fixtures/auth";

test.describe("FAC-E2E responsive", () => {
  test("FAC-E2E-050: mobile list 375px", async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 });
    await loginAs(page, users.coordinator);
    await page.goto("/facilities");
    await expect(page.getByRole("link", { name: "E2E Memorial Hospital" }).first()).toBeVisible();
    const scrollWidth = await page.evaluate(() => document.documentElement.scrollWidth);
    const clientWidth = await page.evaluate(() => document.documentElement.clientWidth);
    expect(scrollWidth).toBeLessThanOrEqual(clientWidth + 1);
  });
});
