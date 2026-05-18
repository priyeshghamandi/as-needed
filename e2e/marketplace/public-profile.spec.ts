import { test, expect } from "@playwright/test";

test.describe("Professional public profiles", () => {
  test("PPP-E2E-001: invalid slug returns 404", async ({ page }) => {
    const res = await page.goto("/marketplace/professionals/not-a-real-slug-00000000");
    expect(res?.status()).toBe(404);
  });

  test("PPP-E2E-002: category page without location shows no listings", async ({ page }) => {
    await page.context().clearCookies();
    await page.goto("/marketplace/categories/registered-nurse");
    await expect(page.getByRole("link", { name: /view profile/i })).toHaveCount(0);
  });
});
