import { test, expect } from "@playwright/test";
import { loginAs, users } from "../fixtures/auth";
import { tomorrowDateInput } from "./helpers";

test.describe("REQ-E2E create", () => {
  test.beforeEach(async ({ page }) => {
    await loginAs(page, users.coordinator);
  });

  test("REQ-E2E-020: create request happy path", async ({ page }) => {
    await page.goto("/staffing-requests/new");
    await page.locator("#req-facility").selectOption({ label: "E2E Memorial Hospital" });
    await page.locator("#req-title").fill(`E2E New Request ${Date.now()}`);
    await page.locator("#req-count").fill("3");
    await page.locator("#req-date").fill(tomorrowDateInput());
    await page.locator("#req-start").fill("07:00");
    await page.locator("#req-end").fill("15:00");
    await page.getByRole("button", { name: /^Create request$/i }).click();
    await expect(page).toHaveURL(/\/staffing-requests\/[0-9a-f-]+/, { timeout: 15_000 });
    await expect(page.getByText("Open", { exact: true })).toBeVisible();
    await expect(page.getByText("0 / 3")).toBeVisible();
  });

  test("REQ-E2E-021: create with optional fields", async ({ page }) => {
    await page.goto("/staffing-requests/new");
    await page.locator("#req-facility").selectOption({ label: "E2E Memorial Hospital" });
    await page.locator("#req-unit").fill("ER");
    await page.locator("#req-title").fill(`E2E Optional ${Date.now()}`);
    await page.locator("#req-specialty").fill("Emergency");
    await page.locator("#req-count").fill("1");
    await page.locator("#req-date").fill(tomorrowDateInput());
    await page.locator("#req-start").fill("08:00");
    await page.locator("#req-end").fill("16:00");
    await page.locator("#req-creds").fill("BLS, ACLS");
    await page.locator("#req-exp").fill("2");
    await page.locator("#req-notes").fill("Bring badge");
    await page.getByRole("button", { name: /^Create request$/i }).click();
    await expect(page).toHaveURL(/\/staffing-requests\/[0-9a-f-]+/, { timeout: 15_000 });
    await expect(page.getByText("Emergency")).toBeVisible();
    await expect(page.getByText("Min experience: 2 years")).toBeVisible();
    await expect(page.getByText("BLS")).toBeVisible();
  });

  test("REQ-E2E-022: past shift date rejected", async ({ page }) => {
    await page.goto("/staffing-requests/new");
    await page.locator("#req-facility").selectOption({ label: "E2E Memorial Hospital" });
    await page.locator("#req-title").fill("Past shift test");
    await page.locator("#req-count").fill("1");
    await page.locator("#req-date").fill("2020-01-01");
    await page.locator("#req-start").fill("07:00");
    await page.locator("#req-end").fill("15:00");
    await page.getByRole("button", { name: /^Create request$/i }).click();
    await expect(page.getByText(/cannot be in the past/i)).toBeVisible();
    await expect(page).toHaveURL(/\/staffing-requests\/new/);
  });

  test("REQ-E2E-024: save draft", async ({ page }) => {
    await page.goto("/staffing-requests/new");
    await page.locator("#req-facility").selectOption({ label: "E2E Memorial Hospital" });
    await page.locator("#req-title").fill(`E2E Draft ${Date.now()}`);
    await page.getByRole("button", { name: /save draft/i }).click();
    await expect(page).toHaveURL(/\/staffing-requests\/[0-9a-f-]+/, { timeout: 15_000 });
    await expect(page.getByText("Draft", { exact: true })).toBeVisible();
  });

  test("REQ-E2E-025: publish draft", async ({ page }) => {
    await page.goto("/staffing-requests");
    await page.getByRole("link", { name: "E2E Draft Request" }).click();
    await page.locator("#pub-date").fill(tomorrowDateInput());
    await page.getByRole("button", { name: /publish request/i }).click();
    await expect(page.getByText("Open", { exact: true })).toBeVisible({ timeout: 10_000 });
    await expect(page.getByRole("heading", { name: "Shifts" })).toBeVisible();
  });

  test("REQ-E2E-026: pre-selected facility", async ({ page }) => {
    await page.goto("/facilities");
    const href = await page
      .getByRole("link", { name: "E2E Memorial Hospital" })
      .first()
      .getAttribute("href");
    const facilityId = href?.match(/facilities\/([0-9a-f-]+)/)?.[1];
    expect(facilityId).toBeTruthy();
    await page.goto(`/staffing-requests/new?facilityId=${facilityId}`);
    await expect(page.locator("#req-facility")).toHaveValue(facilityId!);
  });
});
