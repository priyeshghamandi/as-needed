import { test, expect } from "@playwright/test";

test.describe("Category Directory", () => {
  test("CAT-E2E-001: category index loads", async ({ page }) => {
    await page.goto("/marketplace/categories");
    await expect(page.getByRole("heading", { name: /browse by role/i })).toBeVisible();
    await expect(page.getByRole("link", { name: /registered nurse/i })).toBeVisible();
    await expect(
      page.getByText(/set your facility location/i),
    ).toBeVisible();
  });

  test("CAT-E2E-002: invalid slug 404", async ({ page }) => {
    const res = await page.goto("/marketplace/categories/invalid-role");
    expect(res?.status()).toBe(404);
  });

  test("CAT-E2E-003: category page without location shows prompt", async ({ page }) => {
    await page.context().clearCookies();
    await page.goto("/marketplace/categories/registered-nurse");
    await expect(page.getByRole("heading", { name: /registered nurse/i })).toBeVisible();
    await expect(
      page.getByText(/set your facility location/i),
    ).toBeVisible();
    await expect(page.getByRole("link", { name: /view profile/i })).toHaveCount(0);
  });
});
