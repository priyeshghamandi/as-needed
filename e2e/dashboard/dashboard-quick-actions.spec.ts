import { test, expect } from "@playwright/test";
import { loginAs, users } from "../fixtures/auth";

test("OPS-E2E-040: coordinator sees create staffing request action", async ({ page }) => {
  await loginAs(page, users.coordinator);
  await page.goto("/dashboard");
  await expect(page.getByRole("link", { name: /create staffing request/i })).toBeVisible();
});

test("OPS-E2E-041: recruiter does not see create staffing request", async ({ page }) => {
  await loginAs(page, users.recruiter);
  await page.goto("/dashboard");
  await expect(page.getByRole("link", { name: /create staffing request/i })).not.toBeVisible();
  await expect(page.getByRole("link", { name: /add healthcare professional/i })).toBeVisible();
});

test("OPS-E2E-042: compliance manager limited quick actions", async ({ page }) => {
  await loginAs(page, users.compliance);
  await page.goto("/dashboard");
  await expect(page.getByRole("link", { name: /add healthcare professional/i })).not.toBeVisible();
  await expect(page.getByRole("link", { name: /add facility/i })).not.toBeVisible();
  await expect(page.getByRole("link", { name: /view workforce/i })).toBeVisible();
  await expect(page.getByRole("link", { name: /view facilities/i })).toBeVisible();
});
