import { test, expect } from "@playwright/test";
import { loginAs, users } from "../fixtures/auth";

test.describe("NOTIF inbox", () => {
  test.beforeEach(async ({ page }) => {
    await loginAs(page, users.coordinator);
    await page.goto("/notifications");
  });

  test("NOTIF-E2E-010: lists only current user notifications", async ({ page }) => {
    await expect(page.getByText("Recruiter-only alert")).not.toBeVisible();
    await expect(page.getByText("New staffing request")).toBeVisible();
  });

  test("NOTIF-E2E-011: unread filter", async ({ page }) => {
    await page.getByRole("button", { name: "Unread" }).click();
    await expect(page.getByText("Shift confirmed")).not.toBeVisible();
    await expect(page.getByText("New staffing request")).toBeVisible();
  });

  test("NOTIF-E2E-012: priority filter", async ({ page }) => {
    await page.getByRole("button", { name: "critical" }).click();
    await expect(page.getByText("Critical coverage gap")).toBeVisible();
    await expect(page.getByText("New staffing request")).not.toBeVisible();
  });

  test("NOTIF-E2E-013: empty agency owner with no rows", async ({ page }) => {
    await loginAs(page, users.workforceEmpty);
    await page.goto("/notifications");
    await expect(page.getByText("No notifications yet")).toBeVisible();
  });
});
