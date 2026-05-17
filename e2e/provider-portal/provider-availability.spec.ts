import { test, expect } from "@playwright/test";
import { loginAs, users } from "../fixtures/auth";

function tomorrowAt(hour: number, minutes = 0) {
  const d = new Date();
  d.setDate(d.getDate() + 1);
  d.setHours(hour, minutes, 0, 0);
  return d;
}

function toInput(d: Date) {
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

test.describe("HPP-E2E provider availability", () => {
  test.beforeEach(async ({ page }) => {
    await loginAs(page, users.provider);
    await page.goto("/availability");
  });

  test("HPP-E2E-020: List availability blocks", async ({ page }) => {
    await expect(page.getByText(/E2E seeded availability/i)).toBeVisible();
  });

  test("HPP-E2E-021: Create availability block", async ({ page }) => {
    await page.getByRole("button", { name: /add availability/i }).click();
    const start = tomorrowAt(8);
    const end = tomorrowAt(16);
    await page.locator('input[type="datetime-local"]').nth(0).fill(toInput(start));
    await page.locator('input[type="datetime-local"]').nth(1).fill(toInput(end));
    await page.getByRole("button", { name: /^save$/i }).click();
    await expect(page.getByText(/availability added/i)).toBeVisible();
    await page.reload();
    await expect(page.getByText(/May 18, 8:00 AM/i).first()).toBeVisible();
  });

  test("HPP-E2E-022: Edit availability block", async ({ page }) => {
    await page.getByRole("button", { name: "Edit" }).first().click();
    const end = tomorrowAt(18);
    await page.locator('input[type="datetime-local"]').nth(1).fill(toInput(end));
    await page.getByRole("button", { name: /^save$/i }).click();
    await expect(page.getByText(/availability updated/i)).toBeVisible();
  });

  test("HPP-E2E-023: Delete availability block", async ({ page }) => {
    page.once("dialog", (d) => d.accept());
    await page.getByRole("button", { name: "Delete" }).first().click();
    await expect(page.getByText(/block deleted/i)).toBeVisible();
  });

  test("HPP-E2E-024: Reject overlapping block create", async ({ page }) => {
    await page.getByRole("button", { name: /add availability/i }).click();
    const start = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
    start.setHours(8, 0, 0, 0);
    const end = new Date(start.getTime() + 8 * 60 * 60 * 1000);
    await page.locator('input[type="datetime-local"]').nth(0).fill(toInput(start));
    await page.locator('input[type="datetime-local"]').nth(1).fill(toInput(end));
    await page.getByRole("button", { name: /^save$/i }).click();
    await expect(page.getByText(/overlaps an existing block/i)).toBeVisible();
  });
});
