import type { Page } from "@playwright/test";

export const E2E_PASSWORD = "E2eTestPassword1!";

export const users = {
  ownerA: "e2e-dash-owner-a@example.com",
  ownerB: "e2e-dash-owner-b@example.com",
  ownerIncomplete: "e2e-dash-owner-incomplete@example.com",
  onboardFlow: "e2e-onboard-flow@example.com",
  onboardPersist: "e2e-onboard-persist@example.com",
  onboardExit: "e2e-onboard-exit@example.com",
  coordinator: "e2e-dash-coordinator@example.com",
  recruiter: "e2e-dash-recruiter@example.com",
  compliance: "e2e-dash-compliance@example.com",
  provider: "e2e-dash-provider@example.com",
  providerUnlinked: "e2e-provider-unlinked@example.com",
  facility: "e2e-dash-facility@example.com",
  facilityB: "e2e-dash-facility-b@example.com",
  workforceEmpty: "e2e-workforce-empty@example.com",
} as const;

export async function loginAs(page: Page, email: string, password = E2E_PASSWORD) {
  await page.context().clearCookies();
  await page.goto("/login");
  await page.getByPlaceholder("you@agency.com").fill(email);
  await page.locator('input[type="password"]').fill(password);
  await page.getByRole("button", { name: /sign in/i }).click();
  await page.waitForURL((url) => !url.pathname.startsWith("/login"), { timeout: 30_000 });
}
