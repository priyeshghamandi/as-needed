import { test, expect } from "@playwright/test";
import { loginAs, users } from "../fixtures/auth";

test.describe("FAC-E2E auth write", () => {
  test("FAC-E2E-040: recruiter no Add button", async ({ page }) => {
    await loginAs(page, users.recruiter);
    await page.goto("/facilities");
    await expect(page.getByRole("link", { name: /add facility/i })).not.toBeVisible();
  });

  test("FAC-E2E-041: recruiter no Edit on detail", async ({ page }) => {
    await loginAs(page, users.recruiter);
    await page.goto("/facilities");
    await page.getByRole("link", { name: "E2E Memorial Hospital" }).first().click();
    await expect(page.getByRole("button", { name: /^edit$/i })).not.toBeVisible();
  });

  test("FAC-E2E-042: owner can create", async ({ page }) => {
    await loginAs(page, users.ownerA);
    await page.goto("/facilities/new");
    await expect(page.getByLabel(/facility name/i)).toBeVisible();
  });
});
