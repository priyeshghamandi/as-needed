export { stubPlacesApi } from "../onboarding/helpers";
import { expect, type Page } from "@playwright/test";

export async function pickWorkforceLocation(
  page: Page,
  query: string,
  optionMatch?: string | RegExp,
) {
  const input = page.getByPlaceholder("Search city, metro, or ZIP");
  await input.fill(query);
  const listbox = page.getByRole("listbox");
  await listbox.waitFor({ state: "visible", timeout: 15_000 });
  if (optionMatch) {
    const named = listbox.getByRole("button", { name: optionMatch });
    if ((await named.count()) > 0) {
      await named.first().click();
    } else {
      await listbox.getByRole("button").first().click();
    }
  } else {
    await listbox.getByRole("button").first().click();
  }
  await page.waitForResponse(
    (res) => res.url().includes("/api/places/details") && res.ok(),
    { timeout: 20_000 },
  );
  await page
    .waitForResponse((res) => res.url().includes("/api/places/validate"), { timeout: 20_000 })
    .catch(() => null);
  await expect(page.getByRole("button", { name: /^Remove / })).toBeVisible({ timeout: 15_000 });
}
