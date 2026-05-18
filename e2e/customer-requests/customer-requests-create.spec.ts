import { test, expect } from "@playwright/test";
import { loginAs, users } from "../fixtures/auth";
import { MARKETPLACE_LOCATION_COOKIE } from "../../lib/marketplace/location-cookie";
import { MARKETPLACE_REQUEST_CART_KEY } from "../../lib/marketplace/marketplace-cart";

const E2E_MP_PRO_1 = "e2e00000-0000-4000-8000-000000000401";
const E2E_MP_PRO_2 = "e2e00000-0000-4000-8000-000000000402";

const location = {
  displayName: "San Francisco, CA",
  placeId: "mock-sf",
  city: "San Francisco",
  state: "CA",
  latitude: 37.7749,
  longitude: -122.4194,
};

test.describe("Customer Requests create", () => {
  test.beforeEach(async ({ page }) => {
    await loginAs(page, users.facility);
    await page.context().addCookies([
      {
        name: MARKETPLACE_LOCATION_COOKIE,
        value: encodeURIComponent(JSON.stringify(location)),
        url: "http://localhost:3000",
      },
    ]);
  });

  test("CRQ-E2E-003: create request from cart with two professionals", async ({ page }) => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 2);
    tomorrow.setHours(7, 0, 0, 0);
    const end = new Date(tomorrow.getTime() + 8 * 60 * 60 * 1000);

    await page.addInitScript(
      ({ cartKey, cart }) => {
        sessionStorage.setItem(cartKey, JSON.stringify(cart));
      },
      {
        cartKey: MARKETPLACE_REQUEST_CART_KEY,
        cart: {
          professionalIds: [E2E_MP_PRO_1],
          role: "rn",
          needStart: tomorrow.toISOString(),
          needEnd: end.toISOString(),
          urgency: null,
          shiftType: "day",
          locationDisplayName: location.displayName,
        },
      },
    );

    await page.goto("/customer/requests/new");
    await expect(page.getByRole("heading", { name: /request professionals/i })).toBeVisible();
    await expect(page.getByText(/pro2 e2e/i)).toBeVisible({ timeout: 15_000 });
    await expect(page.getByRole("button", { name: /submit staffing request/i })).toBeVisible();
    await expect(page.getByRole("button", { name: /book/i })).toHaveCount(0);

    await page.getByRole("button", { name: /submit staffing request/i }).click();
    await expect(page).toHaveURL(/\/customer\/requests\/[0-9a-f-]+/, { timeout: 30_000 });
    await expect(page.getByText(/submitted/i)).toBeVisible();
  });

  test("CRQ-E2E-006: submit button copy not Book", async ({ page }) => {
    await page.addInitScript(
      ({ cartKey, cart }) => {
        sessionStorage.setItem(cartKey, JSON.stringify(cart));
      },
      {
        cartKey: MARKETPLACE_REQUEST_CART_KEY,
        cart: {
          professionalIds: [E2E_MP_PRO_1],
          role: "rn",
          needStart: null,
          needEnd: null,
          urgency: null,
          shiftType: null,
          locationDisplayName: null,
        },
      },
    );
    await page.goto("/customer/requests/new");
    await expect(page.getByRole("button", { name: /^submit staffing request$/i })).toBeVisible();
    await expect(page.getByRole("button", { name: /book/i })).toHaveCount(0);
  });
});
