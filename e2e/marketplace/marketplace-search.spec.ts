import { test, expect } from "@playwright/test";

test.describe("Marketplace Search", () => {
  test("MPS-E2E-001: search page loads", async ({ page }) => {
    await page.goto("/marketplace/search");
    await expect(page.getByRole("heading", { name: /search professionals/i })).toBeVisible();
    await expect(page.getByRole("button", { name: /^search$/i })).toBeVisible();
    await expect(page.getByLabel(/role/i)).toBeVisible();
  });

  test("MPS-E2E-002: submit without location shows validation", async ({ page }) => {
    await page.goto("/marketplace/search");
    await page.getByLabel(/role/i).selectOption("rn");
    await page.getByRole("radio", { name: /urgency/i }).check();
    await page.locator("select").filter({ hasText: /select urgency/i }).selectOption("flexible");
    await page.getByRole("button", { name: /^search$/i }).click();
    await expect(page.getByText(/facility location/i)).toBeVisible();
  });

  test("MPS-E2E-003: empty results state after valid query", async ({ page }) => {
    await page.goto(
      "/marketplace/search?role=rn&urgency=flexible&lat=0&lng=0&sort=relevance",
    );
    await expect(
      page.getByRole("heading", { name: /no professionals found|0 professionals/i }),
    ).toBeVisible({ timeout: 15_000 });
  });
});
