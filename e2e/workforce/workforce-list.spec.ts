import { test, expect } from "@playwright/test";
import { loginAs, users } from "../fixtures/auth";

test.describe("WORK-E2E list", () => {
  test("WORK-E2E-010: list shows seeded professionals", async ({ page }) => {
    await loginAs(page, users.recruiter);
    await page.goto("/workforce");
    await expect(page.getByRole("columnheader", { name: "Name" })).toBeVisible();
    await expect(page.getByRole("columnheader", { name: "Role" })).toBeVisible();
    await expect(page.getByRole("columnheader", { name: "Availability" })).toBeVisible();
    await expect(page.getByRole("link", { name: "Jane Smith" }).first()).toBeVisible();
  });

  test("WORK-E2E-011: search by name", async ({ page }) => {
    await loginAs(page, users.recruiter);
    await page.goto("/workforce");
    const search = page.getByPlaceholder("Search name or email");
    await search.fill("Jane");
    await search.press("Enter");
    await expect(page.getByRole("link", { name: "Jane Smith" }).first()).toBeVisible();
    await expect(page.getByRole("link", { name: "Pro2 E2E" })).toHaveCount(0);
  });

  test("WORK-E2E-012: filter by availability", async ({ page }) => {
    await loginAs(page, users.recruiter);
    await page.goto("/workforce");
    await page.getByLabel("Availability").selectOption("available");
    await expect(page.getByRole("link", { name: "Jane Smith" }).first()).toBeVisible();
    await expect(page.getByRole("link", { name: "Pro3 E2E" })).toHaveCount(0);
  });

  test("WORK-E2E-013: empty agency empty state", async ({ page }) => {
    await loginAs(page, users.workforceEmpty);
    await page.goto("/workforce");
    await expect(page.getByText("No healthcare professionals yet")).toBeVisible();
  });
});
