import { test, expect } from "@playwright/test";

test.describe("Public homepage", () => {
  test("loads platform homepage with marketplace CTA", async ({ page }) => {
    await page.goto("/");
    await expect(page).toHaveURL("/");
    await expect(
      page.getByRole("heading", { name: /run healthcare staffing operations/i }),
    ).toBeVisible();
    await expect(page.getByRole("link", { name: /browse marketplace/i })).toBeVisible();
    await expect(page.getByRole("link", { name: /explore marketplace/i })).toBeVisible();
  });

  test("navigates to marketplace from homepage", async ({ page }) => {
    await page.goto("/");
    await page.getByRole("link", { name: /browse marketplace/i }).click();
    await expect(page).toHaveURL(/\/marketplace$/);
    await expect(
      page.getByRole("heading", {
        name: /find healthcare professionals for your facility/i,
      }),
    ).toBeVisible();
  });
});
