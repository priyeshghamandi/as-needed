import { test, expect } from "@playwright/test";
import { loginAs, users } from "../fixtures/auth";

test.describe.configure({ mode: "serial" });

test.describe("Customer Requests list", () => {
  test("facility user can open request list", async ({ page }) => {
    await loginAs(page, users.facility);
    await page.goto("/customer/requests");
    await expect(page).toHaveURL(/\/customer\/requests/);
    await expect(
      page.getByRole("heading", { name: /my staffing requests/i }),
    ).toBeVisible({ timeout: 15_000 });
  });
});
