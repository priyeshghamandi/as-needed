import { test, expect } from "@playwright/test";
import { loginAs, users } from "../fixtures/auth";

test.describe("MEL marketplace visibility toggle", () => {
  test("MEL-E2E-004: marketplace tab shows checklist", async ({ page }) => {
    await loginAs(page, users.recruiter);
    await page.goto("/workforce");
    const firstLink = page.locator('a[href^="/workforce/"]').first();
    if ((await firstLink.count()) === 0) {
      test.skip();
      return;
    }
    const href = await firstLink.getAttribute("href");
    await page.goto(`${href}?tab=marketplace`);
    await expect(page.getByText("Agency service area configured")).toBeVisible();
    await expect(page.getByRole("checkbox", { name: "Visible on marketplace" })).toBeVisible();
  });
});
