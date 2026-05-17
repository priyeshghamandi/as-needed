import { test, expect } from "@playwright/test";
import { loginAs, users } from "../fixtures/auth";
import { pickWorkforceLocation, stubPlacesApi } from "./helpers";

test.describe("WORK-E2E add", () => {
  test.beforeEach(async ({ page }) => {
    await stubPlacesApi(page);
    await loginAs(page, users.recruiter);
  });

  test("WORK-E2E-020: add professional inside service area", async ({ page }) => {
    await page.goto("/workforce/new");
    await page.getByLabel(/first name/i).fill("New");
    await page.getByLabel(/last name/i).fill("Hire");
    await page.getByLabel(/^email$/i).fill(`new.hire.${Date.now()}@example.com`);
    await pickWorkforceLocation(page, "San Francisco");
    await page.getByRole("button", { name: /add professional/i }).click();
    await expect(page).toHaveURL(/\/workforce\/[0-9a-f-]+/, { timeout: 15_000 });
  });

  test("WORK-E2E-021: reject location outside service area", async ({ page }) => {
    await page.goto("/workforce/new");
    await page.getByLabel(/first name/i).fill("Far");
    await page.getByLabel(/last name/i).fill("Away");
    await page.getByLabel(/^email$/i).fill(`far.${Date.now()}@example.com`);
    const input = page.getByPlaceholder("Search city, metro, or ZIP");
    await input.fill("New York");
    const listbox = page.getByRole("listbox");
    await listbox.waitFor({ state: "visible" });
    await listbox.getByRole("button", { name: /New York/i }).click();
    await expect(page.getByText(/outside your agency's service area/i).first()).toBeVisible();
    await page.getByRole("button", { name: /add professional/i }).click();
    await expect(page).toHaveURL(/\/workforce\/new/);
  });

  test("WORK-E2E-022: add with invite requires email", async ({ page }) => {
    await page.goto("/workforce/new");
    await page.getByLabel(/send platform invite/i).check();
    await page.getByRole("button", { name: /add professional/i }).click();
    await expect(page.getByText(/email is required/i)).toBeVisible();
  });

  test("WORK-E2E-023: duplicate email rejected", async ({ page }) => {
    await page.goto("/workforce/new");
    await page.getByLabel(/first name/i).fill("Dup");
    await page.getByLabel(/last name/i).fill("Email");
    await page.getByLabel(/^email$/i).fill("jane.smith.e2e@example.com");
    await pickWorkforceLocation(page, "San Francisco");
    await page.getByRole("button", { name: /add professional/i }).click();
    await expect(page.getByText(/already exists/i)).toBeVisible();
  });

  test("WORK-E2E-024: add without invite phone-only", async ({ page }) => {
    await page.goto("/workforce/new");
    await page.getByLabel(/first name/i).fill("Phone");
    await page.getByLabel(/last name/i).fill("Only");
    await page.getByLabel(/^phone$/i).fill("5551234567");
    await pickWorkforceLocation(page, "San Francisco");
    await page.getByRole("button", { name: /add professional/i }).click();
    await expect(page).toHaveURL(/\/workforce\/[0-9a-f-]+/, { timeout: 15_000 });
    await expect(page.getByText("Not invited")).toBeVisible();
  });
});
