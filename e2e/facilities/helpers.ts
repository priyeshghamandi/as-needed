export { stubPlacesApi, pickLocationSuggestion } from "../onboarding/helpers";

import { expect, type Page } from "@playwright/test";

export async function pickFacilityLocation(page: Page, query: string) {
  const input = page.getByPlaceholder("Search city, metro, or ZIP");
  await input.fill(query);
  const listbox = page.getByRole("listbox");
  await listbox.waitFor({ state: "visible", timeout: 15_000 });
  await listbox.getByRole("button").first().click();
  await page.waitForResponse(
    (res) => res.url().includes("/api/places/details") && res.ok(),
    { timeout: 20_000 },
  );
  await page
    .waitForResponse((res) => res.url().includes("/api/places/validate"), { timeout: 20_000 })
    .catch(() => null);
  await expect(page.getByRole("button", { name: /^Remove / })).toBeVisible({ timeout: 15_000 });
}
