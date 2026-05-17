import { test, expect } from "@playwright/test";
import { loginAs, users } from "../fixtures/auth";

test.describe("SET rbac", () => {
  test("SET-E2E-050: coordinator sees view-only banner on profile", async ({ page }) => {
    await loginAs(page, users.coordinator);
    await page.goto("/settings?tab=profile");
    await expect(page.getByRole("status")).toContainText("View only");
    await expect(page.getByRole("button", { name: "Save changes" })).toHaveCount(0);
  });

  test("SET-E2E-051: coordinator cannot revoke invite", async ({ page }) => {
    await loginAs(page, users.coordinator);
    await page.goto("/settings?tab=team");
    await expect(page.getByRole("button", { name: "Revoke" })).toHaveCount(0);
  });
});
