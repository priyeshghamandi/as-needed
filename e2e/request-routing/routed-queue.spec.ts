import { test, expect } from "@playwright/test";
import { loginAs, users } from "../fixtures/auth";
import { MARKETPLACE_LOCATION_COOKIE } from "../../lib/marketplace/location-cookie";
import { MARKETPLACE_REQUEST_CART_KEY } from "../../lib/marketplace/marketplace-cart";

const E2E_MP_PRO_1 = "e2e00000-0000-4000-8000-000000000401";
const AGENCY_B_PRO_ID = "e2e00000-0000-4000-8000-0000000000b1";

const location = {
  displayName: "San Francisco, CA",
  placeId: "mock-sf",
  city: "San Francisco",
  state: "CA",
  latitude: 37.7749,
  longitude: -122.4194,
};

async function submitCustomerRequest(page: import("@playwright/test").Page, professionalIds: string[]) {
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 2);
  tomorrow.setHours(7, 0, 0, 0);
  const end = new Date(tomorrow.getTime() + 8 * 60 * 60 * 1000);

  await page.context().addCookies([
    {
      name: MARKETPLACE_LOCATION_COOKIE,
      value: encodeURIComponent(JSON.stringify(location)),
      url: "http://localhost:3000",
    },
  ]);

  await page.addInitScript(
    ({ cartKey, cart }) => {
      sessionStorage.setItem(cartKey, JSON.stringify(cart));
    },
    {
      cartKey: MARKETPLACE_REQUEST_CART_KEY,
      cart: {
        professionalIds,
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
  await expect(page.getByRole("button", { name: /submit staffing request/i })).toBeEnabled({
    timeout: 15_000,
  });
  await page.getByRole("button", { name: /submit staffing request/i }).click();
  await expect(page).toHaveURL(/\/customer\/requests\/[0-9a-f-]+/, { timeout: 30_000 });
}

test.describe("Request Routing routed queue", () => {
  test("RTR-E2E-001: customer submit creates routed queue item for Agency A", async ({
    page,
    browser,
  }) => {
    await loginAs(page, users.facility);
    await submitCustomerRequest(page, [E2E_MP_PRO_1]);

    const coordinator = await browser.newPage();
    await loginAs(coordinator, users.coordinator);
    await coordinator.goto("/staffing-requests/routed");
    await expect(coordinator.getByRole("heading", { name: /routed requests/i })).toBeVisible();
    await expect(coordinator.getByRole("link", { name: /rn staffing/i }).first()).toBeVisible({
      timeout: 15_000,
    });
    await expect(coordinator.getByText(/pro2 e2e/i)).toBeVisible();
    await coordinator.close();
  });

  test("RTR-E2E-004: opening detail acknowledges route", async ({ page, browser }) => {
    await loginAs(page, users.facility);
    await submitCustomerRequest(page, [E2E_MP_PRO_1]);

    const coordinator = await browser.newPage();
    await loginAs(coordinator, users.coordinator);
    await coordinator.goto("/staffing-requests/routed");
    await coordinator.getByRole("link", { name: /rn staffing/i }).first().click();
    await expect(coordinator.getByText(/marketplace request/i)).toBeVisible({ timeout: 15_000 });
    await expect(coordinator.getByText(/acknowledged/i)).toBeVisible();
    await coordinator.close();
  });
});

test.describe("Request Routing isolation", () => {
  test("RTR-E2E-003: Agency B cannot see Agency A-only route", async ({ page, browser }) => {
    await loginAs(page, users.facility);
    await submitCustomerRequest(page, [E2E_MP_PRO_1]);

    const agencyB = await browser.newPage();
    await loginAs(agencyB, users.ownerB);
    await agencyB.goto("/staffing-requests/routed");
    await expect(agencyB.getByRole("heading", { name: /routed requests/i })).toBeVisible();
    await expect(agencyB.getByText(/no marketplace requests/i)).toBeVisible({ timeout: 15_000 });
    await agencyB.close();
  });
});

test.describe("Request Routing multi-agency", () => {
  test("RTR-E2E-002: multi-agency selections create two routes; Agency A sees one professional", async ({
    page,
    browser,
  }) => {
    await loginAs(page, users.facility);
    await submitCustomerRequest(page, [E2E_MP_PRO_1, AGENCY_B_PRO_ID]);

    const coordinator = await browser.newPage();
    await loginAs(coordinator, users.coordinator);
    await coordinator.goto("/staffing-requests/routed");
    await expect(coordinator.getByText(/pro2 e2e/i)).toBeVisible({ timeout: 15_000 });
    await expect(coordinator.getByText(/other agency/i)).toHaveCount(0);
    await coordinator.getByRole("link", { name: /rn staffing/i }).first().click();
    await expect(coordinator.getByText(/pro2 e2e/i)).toBeVisible();
    await expect(coordinator.getByText(/other agency/i)).toHaveCount(0);
    await coordinator.close();

    const agencyB = await browser.newPage();
    await loginAs(agencyB, users.ownerB);
    await agencyB.goto("/staffing-requests/routed");
    await expect(agencyB.getByText(/other agency/i)).toBeVisible({ timeout: 15_000 });
    await expect(agencyB.getByText(/pro2 e2e/i)).toHaveCount(0);
    await agencyB.close();
  });
});
