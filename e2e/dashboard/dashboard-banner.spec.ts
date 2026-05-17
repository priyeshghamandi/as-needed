import { test, expect } from "@playwright/test";
import { loginAs, users } from "../fixtures/auth";

test("OPS-E2E-030: incomplete onboarding banner for owner", async ({ page }) => {
  await loginAs(page, users.ownerIncomplete);
  await expect(page).toHaveURL(/\/onboarding/);
  await page.goto("/dashboard");
  await expect(page.getByText(/Finish setting up your agency/i)).toBeVisible();
  await expect(page.getByRole("link", { name: /complete setup|continue setup/i })).toHaveAttribute(
    "href",
    "/onboarding",
  );
});

test("OPS-E2E-031: banner hidden when onboarding complete", async ({ page }) => {
  await loginAs(page, users.ownerA);
  await page.goto("/dashboard");
  await expect(page.getByText(/Finish setting up your agency/i)).not.toBeVisible();
});

test("OPS-E2E-032: coordinator does not see onboarding banner", async ({ page }) => {
  await loginAs(page, users.coordinator);
  await page.goto("/dashboard");
  await expect(page.getByText(/Finish setting up your agency/i)).not.toBeVisible();
});
