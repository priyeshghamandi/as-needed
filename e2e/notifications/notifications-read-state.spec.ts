import { test, expect } from "@playwright/test";
import { loginAs, users } from "../fixtures/auth";

test.describe("NOTIF read state", () => {
  test("NOTIF-E2E-020: mark one read", async ({ page }) => {
    await loginAs(page, users.coordinator);
    await page.goto("/notifications");
    const row = page.getByTestId("notification-row").filter({ hasText: "New staffing request" });
    await row.getByRole("button", { name: "Mark read" }).click();
    await expect(row.getByText("Read")).toBeVisible();
  });

  test("NOTIF-E2E-021: mark all read", async ({ page }) => {
    await loginAs(page, users.coordinator);
    await page.goto("/notifications");
    await page.getByRole("button", { name: "Mark all as read" }).click();
    await expect(page.getByText("All read")).toBeVisible();
  });

  test("NOTIF-E2E-022: bell badge updates", async ({ page }) => {
    await loginAs(page, users.coordinator);
    await page.goto("/notifications");
    await page.getByRole("button", { name: "Mark all as read" }).click();
    await page.goto("/dashboard");
    await expect(page.getByLabel(/notifications/i)).not.toContainText("99");
  });

  test("NOTIF-E2E-023: cannot mark another user notification via API", async ({
    request,
    page,
  }) => {
    await loginAs(page, users.coordinator);
    const res = await request.patch(
      "/api/notifications/e2e00000-0000-4000-8000-000000000015/read",
    );
    expect([403, 404]).toContain(res.status());
  });
});
