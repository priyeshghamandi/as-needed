import { test, expect } from "@playwright/test";
import { loginAs, users } from "../fixtures/auth";

const AGENCY_B_REQUEST_ID = "e2e00000-0000-4000-8000-000000000011";
const CLINIC_REQUEST_ID = "e2e00000-0000-4000-8000-0000000000f2";

test.describe("Facility requests", () => {
  test("FPORT-E2E-020: create staffing request", async ({ page }) => {
    await loginAs(page, users.facility);
    await page.goto("/facility/requests/new");

    const title = `E2E Facility Request ${Date.now()}`;
    await page.getByLabel("Title").fill(title);
    await page.getByLabel("Shift date").fill("2099-12-01");
    await page.getByLabel("Start time").fill("07:00");
    await page.getByLabel("End time").fill("19:00");

    await page.getByRole("button", { name: "Submit staffing request" }).click();
    await expect(page).toHaveURL(/\/facility\/requests\/[0-9a-f-]+/, { timeout: 15_000 });
    await expect(page.getByText("submitted")).toBeVisible();
    await expect(page.getByRole("heading", { name: title })).toBeVisible();
  });

  test("FPORT-E2E-021: request list scoped to facility A", async ({ page }) => {
    await loginAs(page, users.facility);
    await page.goto("/facility/requests");
    await expect(page.getByText("ICU RN — Night")).toBeVisible();
    await expect(page.getByText("Clinic-only staffing request")).not.toBeVisible();
  });

  test("FPORT-E2E-022: cross-facility detail returns not found", async ({ page }) => {
    await loginAs(page, users.facility);
    await page.goto(`/facility/requests/${CLINIC_REQUEST_ID}`);
    await expect(page.getByText(/not found/i)).toBeVisible();
  });

  test("FPORT-E2E-023: request detail timeline visible", async ({ page }) => {
    await loginAs(page, users.facility);
    await page.goto("/facility/requests");
    await page.getByRole("link", { name: "ICU RN — Night" }).first().click();
    await expect(page.getByText("Request submitted")).toBeVisible();
  });

  test("FPORT-E2E-024: validation errors on empty submit", async ({ page }) => {
    await loginAs(page, users.facility);
    await page.goto("/facility/requests/new");
    await page.getByLabel("Title").fill("");
    await page.getByLabel("Shift date").fill("");
    await page.getByRole("button", { name: "Submit staffing request" }).click();
    await expect(page.getByText(/at least 3 characters|required/i).first()).toBeVisible();
    await expect(page).toHaveURL(/\/facility\/requests\/new/);
  });

  test("FPORT-E2E-025: filter by status open", async ({ page }) => {
    await loginAs(page, users.facility);
    await page.goto("/facility/requests?status=open");
    await expect(page.getByText("ICU RN — Night")).toBeVisible();
    await expect(page.getByText("ER RN — Weekend")).not.toBeVisible();
  });

  test("facility B user sees only clinic request", async ({ page }) => {
    await loginAs(page, users.facilityB);
    await page.goto("/facility/requests");
    await expect(page.getByText("Clinic-only staffing request")).toBeVisible();
    await expect(page.getByText("ICU RN — Night")).not.toBeVisible();
  });
});
