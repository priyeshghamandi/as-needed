import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

const MARKETPLACE_LOCATION_COOKIE = "marketplace_location";

test.describe("Public Marketplace Home", () => {
  test("PMK-E2E-001: home loads with hero and CTAs", async ({ page }) => {
    await page.goto("/marketplace");
    await expect(
      page.getByRole("heading", {
        name: /find healthcare professionals for your facility/i,
      }),
    ).toBeVisible();
    await expect(
      page.getByRole("link", { name: /search by role and location/i }),
    ).toBeVisible();
    await expect(
      page.getByRole("main").getByRole("link", { name: /^browse categories$/i }),
    ).toBeVisible();
  });

  test("PMK-E2E-002: browse categories navigates to category index", async ({ page }) => {
    await page.goto("/marketplace");
    await page.getByRole("main").getByRole("link", { name: /^browse categories$/i }).click();
    await expect(page).toHaveURL(/\/marketplace\/categories$/);
    await expect(page.getByRole("heading", { name: /browse by role/i })).toBeVisible();
  });

  test("PMK-E2E-003: search CTA navigates to search", async ({ page }) => {
    await page.goto("/marketplace");
    await page.getByRole("link", { name: /search by role and location/i }).click();
    await expect(page).toHaveURL(/\/marketplace\/search/);
    await expect(page.getByRole("heading", { name: /search professionals/i })).toBeVisible();
  });

  test("PMK-E2E-004: location chip opens modal and persists cookie", async ({ page }) => {
    await page.context().clearCookies();
    await page.goto("/marketplace");
    await page.getByRole("button", { name: /set facility location/i }).click();
    await expect(page.getByRole("dialog")).toBeVisible();
    await expect(page.getByRole("heading", { name: /your facility location/i })).toBeVisible();

    const location = {
      displayName: "Austin, TX",
      placeId: "e2e-austin-tx",
      city: "Austin",
      state: "TX",
      latitude: 30.2672,
      longitude: -97.7431,
    };
    await page.context().addCookies([
      {
        name: MARKETPLACE_LOCATION_COOKIE,
        value: encodeURIComponent(JSON.stringify(location)),
        url: page.url(),
      },
    ]);
    await page.reload();
    await expect(page.getByRole("button", { name: /austin, tx/i })).toBeVisible();
  });

  test("PMK-E2E-005: fulfillment disclaimer on home and category child", async ({ page }) => {
    const disclaimer = /staffing is fulfilled by licensed agency coordinators/i;
    await page.goto("/marketplace");
    await expect(page.getByText(disclaimer)).toBeVisible();
    await page.goto("/marketplace/categories");
    await expect(page.getByText(disclaimer)).toBeVisible();
  });

  test("PMK-E2E-006: root is the platform homepage", async ({ page }) => {
    await page.goto("/");
    await expect(page).toHaveURL("/");
    await expect(
      page.getByRole("heading", {
        name: /run healthcare staffing operations/i,
      }),
    ).toBeVisible();
    await expect(page.getByRole("link", { name: /browse marketplace/i })).toBeVisible();
  });

  test("PMK-A11Y-001: axe on marketplace home", async ({ page }) => {
    await page.goto("/marketplace");
    const results = await new AxeBuilder({ page }).analyze();
    expect(results.violations).toEqual([]);
  });
});
