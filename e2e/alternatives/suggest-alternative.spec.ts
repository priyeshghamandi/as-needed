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

test.describe("Alternative suggestions", () => {
  test("ALT-E2E-001: coordinator proposes alternative → customer sees card", async ({
    browser,
  }) => {
    const facilityContext = await browser.newContext();
    const coordinatorContext = await browser.newContext();
    const facility = await facilityContext.newPage();
    const coordinator = await coordinatorContext.newPage();
    await loginAs(facility, users.facility);
    await loginAs(coordinator, users.coordinator);

    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 5);
    tomorrow.setHours(13, 0, 0, 0);
    const end = new Date(tomorrow.getTime() + 8 * 60 * 60 * 1000);

    await facility.context().addCookies([
      {
        name: MARKETPLACE_LOCATION_COOKIE,
        value: encodeURIComponent(JSON.stringify(location)),
        url: "http://localhost:3000",
      },
    ]);

    await facility.addInitScript(
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

    await facility.goto("/customer/requests/new");
    await facility.getByRole("button", { name: /submit staffing request/i }).click();
    await expect(facility).toHaveURL(/\/customer\/requests\/[0-9a-f-]+/, { timeout: 30_000 });
    const requestId = facility.url().split("/").pop()!;

    await coordinator.goto(`/staffing-requests/${requestId}`);
    await coordinator.getByRole("link", { name: /review fulfillment/i }).click();
    await coordinator.getByRole("button", { name: /^decline$/i }).click();
    await coordinator.getByRole("button", { name: /decline fulfillment/i }).click();
    await expect(coordinator.getByText(/fulfillment declined/i)).toBeVisible({ timeout: 15_000 });

    await coordinator.getByRole("button", { name: /suggest alternative/i }).click();
    await expect(coordinator.getByRole("dialog")).toBeVisible();
    await coordinator.getByLabel(/Pro3 E2E/i).check();
    await coordinator.getByRole("button", { name: /propose suggested alternative/i }).click();
    await expect(coordinator.getByText(/suggested alternative proposed/i)).toBeVisible({
      timeout: 15_000,
    });

    await facility.goto(`/customer/requests/${requestId}`);
    await expect(facility.getByRole("heading", { name: /suggested alternative/i })).toBeVisible({
      timeout: 15_000,
    });

    await facilityContext.close();
    await coordinatorContext.close();
  });

  test("ALT-E2E-007: UI uses Suggested Alternative label", async ({ browser }) => {
    const facilityContext = await browser.newContext();
    const coordinatorContext = await browser.newContext();
    const facility = await facilityContext.newPage();
    const coordinator = await coordinatorContext.newPage();
    await loginAs(facility, users.facility);
    await loginAs(coordinator, users.coordinator);

    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 6);
    tomorrow.setHours(14, 0, 0, 0);
    const end = new Date(tomorrow.getTime() + 8 * 60 * 60 * 1000);

    await facility.context().addCookies([
      {
        name: MARKETPLACE_LOCATION_COOKIE,
        value: encodeURIComponent(JSON.stringify(location)),
        url: "http://localhost:3000",
      },
    ]);

    await facility.addInitScript(
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

    await facility.goto("/customer/requests/new");
    await facility.getByRole("button", { name: /submit staffing request/i }).click();
    await expect(facility).toHaveURL(/\/customer\/requests\/[0-9a-f-]+/, { timeout: 30_000 });
    const requestId = facility.url().split("/").pop()!;

    await coordinator.goto(`/staffing-requests/${requestId}`);
    await coordinator.getByRole("link", { name: /review fulfillment/i }).click();
    await expect(coordinator).toHaveURL(/\/fulfillment/, { timeout: 15_000 });
    await coordinator.getByRole("button", { name: /^decline$/i }).click();
    await coordinator.getByRole("button", { name: /decline fulfillment/i }).click();
    await expect(coordinator.getByText(/fulfillment declined/i)).toBeVisible({ timeout: 15_000 });
    await coordinator.getByRole("button", { name: /suggest alternative/i }).click();
    await coordinator.getByLabel(/Pro3 E2E/i).check();
    await coordinator.getByRole("button", { name: /propose suggested alternative/i }).click();
    await expect(coordinator.getByText(/suggested alternative proposed/i)).toBeVisible({
      timeout: 15_000,
    });

    await facility.goto(`/customer/requests/${requestId}`);
    await expect(
      facility.getByRole("heading", { name: /suggested alternative/i }),
    ).toBeVisible({ timeout: 15_000 });
    await expect(facility.getByText(/replacement booking/i)).toHaveCount(0);

    await facilityContext.close();
    await coordinatorContext.close();
  });
});
