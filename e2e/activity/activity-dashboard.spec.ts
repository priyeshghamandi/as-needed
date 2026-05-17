import { test, expect } from "@playwright/test";
import { loginAs, users } from "../fixtures/auth";

test.describe("ACT dashboard feed", () => {
  test("ACT-E2E-010: recent activity renders", async ({ page }) => {
    await loginAs(page, users.coordinator);
    await page.goto("/dashboard");
    await expect(page.getByRole("heading", { name: "Recent activity" })).toBeVisible();
    await expect(page.getByTestId("activity-row").first()).toBeVisible();
  });

  test("ACT-E2E-012: empty state for agency with no logs", async ({ page }) => {
    await loginAs(page, users.workforceEmpty);
    await page.goto("/dashboard");
    await expect(page.getByText("No activity yet")).toBeVisible();
  });

  test("ACT-E2E-013: load more", async ({ page }) => {
    await loginAs(page, users.coordinator);
    await page.goto("/dashboard");
    const loadMore = page.getByRole("button", { name: "Load more" });
    if (await loadMore.isVisible()) {
      await loadMore.click();
      await expect(page.getByTestId("activity-row")).toHaveCount(16, { timeout: 10_000 });
    }
  });
});
