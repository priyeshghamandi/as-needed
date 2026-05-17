import { expect, type Page } from "@playwright/test";

const MOCK_SF = {
  displayName: "San Francisco, CA",
  placeId: "mock-sf",
  city: "San Francisco",
  state: "CA",
  country: "US",
  latitude: 37.7749,
  longitude: -122.4194,
};

const MOCK_OAKLAND = {
  displayName: "Oakland, CA",
  placeId: "mock-oakland",
  city: "Oakland",
  state: "CA",
  country: "US",
  latitude: 37.8044,
  longitude: -122.2712,
};

const MOCK_NYC = {
  displayName: "New York, NY",
  placeId: "mock-nyc",
  city: "New York",
  state: "NY",
  country: "US",
  latitude: 40.7128,
  longitude: -74.006,
};

export async function stubPlacesApi(page: Page) {
  await page.route("**/api/places/autocomplete**", async (route) => {
    const q = new URL(route.request().url()).searchParams.get("q")?.toLowerCase() ?? "";
    const suggestions = q.includes("new york")
      ? [{ placeId: "mock-nyc", label: "New York, NY", secondary: "NY, USA" }]
      : q.includes("oakland")
        ? [{ placeId: "mock-oakland", label: "Oakland, CA", secondary: "CA, USA" }]
        : [{ placeId: "mock-sf", label: "San Francisco, CA", secondary: "CA, USA" }];
    await route.fulfill({ json: { suggestions, source: "mock", restricted: false } });
  });
  await page.route("**/api/places/details**", async (route) => {
    const placeId = new URL(route.request().url()).searchParams.get("placeId") ?? "";
    const area =
      placeId === "mock-nyc"
        ? MOCK_NYC
        : placeId.includes("oakland")
          ? MOCK_OAKLAND
          : MOCK_SF;
    await route.fulfill({ json: { area, source: "mock" } });
  });
  await page.route("**/api/places/validate", async (route) => {
    const body = route.request().postDataJSON() as { location?: { placeId?: string } };
    const outside = body?.location?.placeId === "mock-nyc";
    if (outside) {
      await route.fulfill({
        status: 422,
        json: {
          error: "This location is outside your agency's service area.",
          code: "OUT_OF_SERVICE_AREA",
        },
      });
      return;
    }
    await route.fulfill({ json: { ok: true } });
  });
}

export async function pickLocationSuggestion(
  page: Page,
  placeholder: string | RegExp,
  query: string,
  optionMatch?: string | RegExp,
) {
  const input = page.getByPlaceholder(placeholder).and(page.locator(":enabled")).last();
  await input.fill(query);
  const listbox = page.getByRole("listbox");
  await listbox.waitFor({ state: "visible", timeout: 15_000 });
  if (optionMatch) {
    const named = listbox.getByRole("button", { name: optionMatch });
    if ((await named.count()) > 0) {
      await named.first().click();
      return;
    }
  }
  await listbox.getByRole("button").first().click();
  await page.waitForResponse(
    (res) => res.url().includes("/api/places/details") && res.ok(),
    { timeout: 20_000 },
  );
  const validateRes = await page
    .waitForResponse((res) => res.url().includes("/api/places/validate"), {
      timeout: 20_000,
    })
    .catch(() => null);
  if (validateRes && !validateRes.ok()) {
    return;
  }
  await listbox.waitFor({ state: "hidden", timeout: 15_000 });
  await expect(input).toBeDisabled({ timeout: 15_000 });
  await expect(page.getByRole("button", { name: /^Remove / })).toBeVisible({
    timeout: 10_000,
  });
}

export async function submitFacilitiesContinue(page: Page) {
  await page.getByRole("button", { name: /^continue$/i }).click();
  const error = page.locator(".text-rose-600");
  await expect(
    page.getByText(/facilit.* added|Your workspace is ready to/i).or(error),
  ).toBeVisible({ timeout: 30_000 });
  if (await error.isVisible()) {
    throw new Error(`Facility save failed: ${await error.first().innerText()}`);
  }
}

export async function submitProfessionalsContinue(page: Page) {
  await page.getByRole("button", { name: /^continue$/i }).click();
  const error = page.locator(".text-rose-600");
  await expect(
    page
      .getByText(/professional added|Step 06 · Facilities/i)
      .or(error),
  ).toBeVisible({ timeout: 30_000 });
  if (await error.isVisible()) {
    throw new Error(`Professional save failed: ${await error.first().innerText()}`);
  }
}

export async function fillProfileStep(page: Page) {
  await page.getByPlaceholder("+1 (555) 010-2841").fill("+1 555 010 2841");
  await page.getByPlaceholder("Jennifer Liu").fill("Jane Doe");
  await page.getByPlaceholder("jliu@apexstaffing.com").fill("ops@e2e-agency.com");
  await page.getByRole("button", { name: "RN Staffing" }).click();
}

export async function fillServiceAreaStep(page: Page, radiusMiles = 50) {
  await pickLocationSuggestion(
    page,
    /Search city, metro, state, or ZIP/i,
    "San Francisco",
    /San Francisco.*CA.*USA/i,
  );
  if (radiusMiles !== 75) {
    const slider = page.locator('input[type="range"]');
    await slider.evaluate((el, miles) => {
      (el as HTMLInputElement).value = String(miles);
      el.dispatchEvent(new Event("input", { bubbles: true }));
      el.dispatchEvent(new Event("change", { bubbles: true }));
    }, radiusMiles);
  }
}

/** Server resume skips welcome when required steps are incomplete; lands on profile. */
export async function ensureProfileStep(page: Page) {
  const start = page.getByRole("button", { name: /start setup/i });
  if (await start.isVisible().catch(() => false)) {
    await start.click();
  }
  await page.getByText(/Step 02 · Agency profile/i).waitFor({ state: "visible" });
}

export async function saveProfileAndContinue(page: Page) {
  await fillProfileStep(page);
  await page.getByRole("button", { name: /save & continue/i }).click();
  await page.getByText(/Step 03 · Service area/i).waitFor({ state: "visible" });
}

export async function saveServiceAreaAndContinue(page: Page, radiusMiles = 50) {
  await fillServiceAreaStep(page, radiusMiles);
  await page.getByRole("button", { name: /save & continue/i }).click();
  await page.getByText(/Step 04 · Operations team/i).waitFor({ state: "visible" });
}

export async function skipTeamStep(page: Page) {
  await page.getByRole("button", { name: /skip for now/i }).click();
  await page.getByText(/Step 05 · Workforce/i).waitFor({ state: "visible" });
}

export async function skipProfessionalsStep(page: Page) {
  await page.getByRole("button", { name: /skip for now/i }).click();
  await page.getByText(/Step 06 · Facilities/i).waitFor({ state: "visible" });
}

export async function skipFacilitiesStep(page: Page) {
  await page.getByRole("button", { name: /skip for now/i }).click();
  await page.getByText(/Your workspace is ready to/i).waitFor({ state: "visible" });
}
