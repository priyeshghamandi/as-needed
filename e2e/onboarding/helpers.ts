import { expect, type Page } from "@playwright/test";

export async function pickLocationSuggestion(
  page: Page,
  placeholder: string | RegExp,
  query: string,
  optionMatch?: string | RegExp,
) {
  const input = page.getByPlaceholder(placeholder).first();
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
  await page
    .waitForResponse(
      (res) => res.url().includes("/api/places/validate") && res.ok(),
      { timeout: 20_000 },
    )
    .catch(() => undefined);
  await listbox.waitFor({ state: "hidden", timeout: 15_000 });
  await expect(input).toBeDisabled({ timeout: 15_000 });
  await expect(page.getByRole("button", { name: /^Remove / })).toBeVisible({
    timeout: 10_000,
  });
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
