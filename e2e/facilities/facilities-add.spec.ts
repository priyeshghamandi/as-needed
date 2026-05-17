import { test, expect } from "@playwright/test";
import { loginAs, users } from "../fixtures/auth";
import { pickFacilityLocation, stubPlacesApi } from "./helpers";

test.describe("FAC-E2E add", () => {
  test.beforeEach(async ({ page }) => {
    await stubPlacesApi(page);
    await loginAs(page, users.coordinator);
  });

  test("FAC-E2E-020: add facility inside service area with invite", async ({ page }) => {
    await page.goto("/facilities/new");
    await page.getByLabel(/facility name/i).fill("New Test Hospital");
    await page.getByLabel(/contact name/i).fill("Alex Contact");
    await page.getByLabel(/contact email/i).fill(`new.facility.${Date.now()}@example.com`);
    await page.getByLabel(/contact phone/i).fill("5551234567");
    await pickFacilityLocation(page, "San Francisco");
    await page.getByLabel(/invite facility contact/i).check();
    await page.getByRole("button", { name: /add facility/i }).click();
    await expect(page).toHaveURL(/\/facilities\/[0-9a-f-]+/, { timeout: 15_000 });
    await expect(page.getByText(/invite pending/i)).toBeVisible();
  });

  test("FAC-E2E-021: reject outside service area", async ({ page }) => {
    await page.goto("/facilities/new");
    await page.getByLabel(/facility name/i).fill("Far Hospital");
    await page.getByLabel(/contact name/i).fill("Far Contact");
    await page.getByLabel(/contact email/i).fill(`far.${Date.now()}@example.com`);
    await page.getByLabel(/contact phone/i).fill("5551234567");
    const input = page.getByPlaceholder("Search city, metro, or ZIP");
    await input.fill("New York");
    const listbox = page.getByRole("listbox");
    await listbox.waitFor({ state: "visible" });
    await listbox.getByRole("button", { name: /New York/i }).click();
    await expect(page.getByText(/outside your agency's service area/i).first()).toBeVisible();
    await page.getByRole("button", { name: /add facility/i }).click();
    await expect(page).toHaveURL(/\/facilities\/new/);
  });

  test("FAC-E2E-022: duplicate contact email rejected", async ({ page }) => {
    await page.goto("/facilities/new");
    await page.getByLabel(/facility name/i).fill("Dup Hospital");
    await page.getByLabel(/contact name/i).fill("Dup Contact");
    await page.getByLabel(/contact email/i).fill("memorial.contact@example.com");
    await page.getByLabel(/contact phone/i).fill("5551234567");
    await pickFacilityLocation(page, "San Francisco");
    await page.getByRole("button", { name: /add facility/i }).click();
    await expect(page.getByText(/already exists/i)).toBeVisible();
  });

  test("FAC-E2E-024: add without invite", async ({ page }) => {
    await page.goto("/facilities/new");
    await page.getByLabel(/facility name/i).fill("No Invite Clinic");
    await page.getByLabel(/contact name/i).fill("No Invite");
    await page.getByLabel(/contact email/i).fill(`noinvite.${Date.now()}@example.com`);
    await page.getByLabel(/contact phone/i).fill("5551234567");
    await page.getByLabel(/invite facility contact/i).uncheck();
    await pickFacilityLocation(page, "San Francisco");
    await page.getByRole("button", { name: /add facility/i }).click();
    await expect(page).toHaveURL(/\/facilities\/[0-9a-f-]+/, { timeout: 15_000 });
    await expect(page.getByRole("button", { name: /invite contact/i })).toBeVisible();
  });
});
