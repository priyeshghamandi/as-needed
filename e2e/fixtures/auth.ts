import type { Page } from "@playwright/test";

export const E2E_PASSWORD = "E2eTestPassword1!";

export const users = {
  ownerA: "e2e-dash-owner-a@example.com",
  ownerB: "e2e-dash-owner-b@example.com",
  ownerIncomplete: "e2e-dash-owner-incomplete@example.com",
  coordinator: "e2e-dash-coordinator@example.com",
  recruiter: "e2e-dash-recruiter@example.com",
  compliance: "e2e-dash-compliance@example.com",
  provider: "e2e-dash-provider@example.com",
  facility: "e2e-dash-facility@example.com",
} as const;

export async function loginAs(page: Page, email: string, password = E2E_PASSWORD) {
  await page.goto("/login");
  await page.getByPlaceholder("you@agency.com").fill(email);
  await page.locator('input[type="password"]').fill(password);
  await Promise.all([
    page.waitForURL((url) => !url.pathname.startsWith("/login"), { timeout: 30_000 }),
    page.getByRole("button", { name: /sign in/i }).click(),
  ]);
}
