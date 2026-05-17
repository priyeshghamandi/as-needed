import { test, expect } from "@playwright/test";
import { loginAs, users } from "../fixtures/auth";

test.describe("FAC-E2E list", () => {
  test("FAC-E2E-010: list shows seeded facilities", async ({ page }) => {
    await loginAs(page, users.coordinator);
    await page.goto("/facilities");
    await expect(page.getByRole("columnheader", { name: "Facility" })).toBeVisible();
    await expect(page.getByRole("columnheader", { name: "Type" })).toBeVisible();
    await expect(page.getByRole("columnheader", { name: "Location" })).toBeVisible();
    await expect(page.getByRole("link", { name: "E2E Memorial Hospital" }).first()).toBeVisible();
  });

  test("FAC-E2E-011: filter by facility type", async ({ page }) => {
    await loginAs(page, users.coordinator);
    await page.goto("/facilities");
    await page.getByLabel("Facility type").selectOption("hospital");
    await expect(page.getByRole("link", { name: "E2E Memorial Hospital" }).first()).toBeVisible();
    await expect(page.getByRole("link", { name: "SF Community Clinic" })).toHaveCount(0);
  });

  test("FAC-E2E-012: search by facility name", async ({ page }) => {
    await loginAs(page, users.coordinator);
    await page.goto("/facilities");
    const search = page.getByPlaceholder("Search name, contact, or city");
    await search.fill("Memorial");
    await search.press("Enter");
    await expect(page.getByRole("link", { name: "E2E Memorial Hospital" }).first()).toBeVisible();
    await expect(page.getByRole("link", { name: "SF Community Clinic" })).toHaveCount(0);
  });

  test("FAC-E2E-013: empty state", async ({ page }) => {
    await loginAs(page, users.workforceEmpty);
    await page.goto("/facilities");
    await expect(page.getByText("No facilities yet")).toBeVisible();
  });
});
