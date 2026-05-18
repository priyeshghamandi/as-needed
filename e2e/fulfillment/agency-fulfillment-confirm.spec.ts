import { test, expect } from "@playwright/test";
import { loginAs, users } from "../fixtures/auth";
import { MARKETPLACE_LOCATION_COOKIE } from "../../lib/marketplace/location-cookie";
import { MARKETPLACE_REQUEST_CART_KEY } from "../../lib/marketplace/marketplace-cart";

const E2E_MP_PRO_1 = "e2e00000-0000-4000-8000-000000000401";

const location = {
  displayName: "San Francisco, CA",
  placeId: "mock-sf",
  city: "San Francisco",
  state: "CA",
  latitude: 37.7749,
  longitude: -122.4194,
};

async function submitAndOpenFulfillment(
  facilityPage: import("@playwright/test").Page,
  coordinatorPage: import("@playwright/test").Page,
  uniqueOffsetHours = 0,
) {
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 2);
  tomorrow.setHours(7 + (uniqueOffsetHours % 12), 0, 0, 0);
  const end = new Date(tomorrow.getTime() + 8 * 60 * 60 * 1000);

  await facilityPage.context().addCookies([
    {
      name: MARKETPLACE_LOCATION_COOKIE,
      value: encodeURIComponent(JSON.stringify(location)),
      url: "http://localhost:3000",
    },
  ]);

  await facilityPage.addInitScript(
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

  await facilityPage.goto("/customer/requests/new");
  await facilityPage.getByRole("button", { name: /submit staffing request/i }).click();
  await expect(facilityPage).toHaveURL(/\/customer\/requests\/[0-9a-f-]+/, { timeout: 30_000 });
  const requestUrl = facilityPage.url();
  const requestId = requestUrl.split("/").pop()!;

  await coordinatorPage.goto(`/staffing-requests/${requestId}`);
  await coordinatorPage.getByRole("link", { name: /review fulfillment/i }).click();
  await expect(coordinatorPage).toHaveURL(/\/fulfillment/, { timeout: 15_000 });
  await expect(
    coordinatorPage.getByRole("button", { name: /^confirm fulfillment$/i }),
  ).toBeVisible({ timeout: 15_000 });

  return requestId;
}

async function isolatedPages(browser: import("@playwright/test").Browser) {
  const facilityContext = await browser.newContext();
  const coordinatorContext = await browser.newContext();
  return {
    facility: await facilityContext.newPage(),
    coordinator: await coordinatorContext.newPage(),
    async close() {
      await facilityContext.close();
      await coordinatorContext.close();
    },
  };
}

test.describe("Agency fulfillment confirm", () => {
  test("AFR-E2E-001: coordinator confirms → customer sees Approve fulfillment", async ({
    browser,
  }) => {
    const { facility, coordinator, close } = await isolatedPages(browser);
    await loginAs(facility, users.facility);
    await loginAs(coordinator, users.coordinator);

    const requestId = await submitAndOpenFulfillment(facility, coordinator, 2);

    await coordinator.getByRole("button", { name: /^confirm fulfillment$/i }).click();
    await expect(coordinator.getByText(/fulfillment confirmed/i)).toBeVisible({ timeout: 15_000 });

    await facility.goto(`/customer/requests/${requestId}`);
    await expect(facility.getByRole("button", { name: /approve fulfillment/i })).toBeVisible({
      timeout: 15_000,
    });
    await expect(facility.getByRole("button", { name: /book/i })).toHaveCount(0);

    await close();
  });

  test("AFR-E2E-002: customer approves → status customer_approved", async ({ browser }) => {
    const { facility, coordinator, close } = await isolatedPages(browser);
    await loginAs(facility, users.facility);
    await loginAs(coordinator, users.coordinator);

    const requestId = await submitAndOpenFulfillment(facility, coordinator);
    await coordinator.getByRole("button", { name: /^confirm fulfillment$/i }).click();
    await expect(coordinator.getByText(/fulfillment confirmed/i)).toBeVisible({ timeout: 15_000 });

    await facility.goto(`/customer/requests/${requestId}`);
    await facility.getByRole("button", { name: /approve fulfillment/i }).click();
    await expect(facility.getByText(/approved/i)).toBeVisible({ timeout: 15_000 });

    await close();
  });

  test("AFR-E2E-006: copy does not say Booked", async ({ browser }) => {
    const { facility, coordinator, close } = await isolatedPages(browser);
    await loginAs(facility, users.facility);
    await loginAs(coordinator, users.coordinator);

    await submitAndOpenFulfillment(facility, coordinator, 6);
    await expect(coordinator.getByText(/booked/i)).toHaveCount(0);
    await expect(coordinator.getByRole("button", { name: /confirm fulfillment/i })).toBeVisible();

    await close();
  });
});
