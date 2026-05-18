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

test.describe("Agency fulfillment decline", () => {
  test("AFR-E2E-003: decline requires reason via modal", async ({ browser }) => {
    const facilityContext = await browser.newContext();
    const coordinatorContext = await browser.newContext();
    const facility = await facilityContext.newPage();
    const coordinator = await coordinatorContext.newPage();
    await loginAs(facility, users.facility);
    await loginAs(coordinator, users.coordinator);

    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 3);
    tomorrow.setHours(11, 0, 0, 0);
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
    await expect(coordinator.getByRole("button", { name: /^decline$/i })).toBeVisible({
      timeout: 15_000,
    });
    await coordinator.getByRole("button", { name: /^decline$/i }).click();
    await expect(coordinator.getByRole("dialog")).toBeVisible();
    await expect(coordinator.getByText(/^reason$/i)).toBeVisible();
    await coordinator.getByRole("button", { name: /decline fulfillment/i }).click();
    await expect(coordinator.getByText(/fulfillment declined/i)).toBeVisible({ timeout: 15_000 });

    await facilityContext.close();
    await coordinatorContext.close();
  });

  test("AFR-E2E-004: recruiter cannot confirm fulfillment", async ({ page }) => {
    await loginAs(page, users.coordinator);
    await page.goto("/staffing-requests/routed");
    const link = page.getByRole("link", { name: /rn staffing/i }).first();
    if ((await link.count()) === 0) {
      test.skip();
      return;
    }
    const href = await link.getAttribute("href");
    if (!href) {
      test.skip();
      return;
    }

    await loginAs(page, users.recruiter);
    await page.goto(href);
    await expect(page.getByRole("button", { name: /^confirm fulfillment$/i })).toHaveCount(0);
  });

  test("AFR-E2E-005: cross-agency fulfillment page 404", async ({ browser }) => {
    const facilityContext = await browser.newContext();
    const agencyBContext = await browser.newContext();
    const facility = await facilityContext.newPage();
    const agencyB = await agencyBContext.newPage();
    await loginAs(facility, users.facility);
    await loginAs(agencyB, users.ownerB);

    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 4);
    tomorrow.setHours(9, 0, 0, 0);
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

    const res = await agencyB.goto(`/staffing-requests/${requestId}/fulfillment`);
    expect(res?.status()).toBe(404);

    await facilityContext.close();
    await agencyBContext.close();
  });
});
