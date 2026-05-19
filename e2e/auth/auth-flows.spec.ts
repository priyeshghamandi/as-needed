import { test, expect } from "@playwright/test";
import { loginAs, users, E2E_PASSWORD } from "../fixtures/auth";

test.describe("AUTH-E2E flows", () => {
  test("AUTH-T005: login success redirects agency owner to dashboard", async ({ page }) => {
    await loginAs(page, users.ownerA);
    await expect(page).toHaveURL(/\/dashboard/);
  });

  test("AUTH-T006: invalid login shows error", async ({ page }) => {
    await page.goto("/login");
    await page.getByPlaceholder("you@agency.com").fill(users.ownerA);
    await page.locator('input[type="password"]').fill("WrongPassword1!");
    await page.getByRole("button", { name: /sign in/i }).click();
    await expect(page).toHaveURL(/\/login/);
    await expect(page.getByText(/invalid email or password/i)).toBeVisible();
  });

  test("AUTH-T007: logout destroys session", async ({ page }) => {
    await loginAs(page, users.ownerA);
    await page.goto("/settings");
    await page.getByRole("button", { name: /sign out/i }).first().click();
    await expect(page).toHaveURL(/\/login/);
    await page.goto("/dashboard");
    await expect(page).toHaveURL(/\/login/);
  });

  test("AUTH-T018/T019: signup page has no HP self-signup; facility is request-access only", async ({
    page,
  }) => {
    await page.goto("/signup");
    await expect(page.getByText(/staffing workspace/i)).toBeVisible();
    const text = await page.locator("body").innerText();
    expect(text.toLowerCase()).toMatch(/healthcare professionals join through an invitation/i);
    expect(text.toLowerCase()).toMatch(/request access/);
  });

  test("AUTH-T015: valid invite acceptance", async ({ page }) => {
    await loginAs(page, users.ownerA);
    const inviteRes = await page.request.post("/api/invites", {
      data: {
        email: `auth-invite-${Date.now()}@example.com`,
        role: "staffing_coordinator",
        inviteType: "agency_staff",
      },
    });
    expect(inviteRes.ok()).toBeTruthy();
    const { inviteUrl } = await inviteRes.json();
    const token = inviteUrl.split("/invite/")[1];

    await page.context().clearCookies();
    await page.goto(`/invite/${token}`);
    await page.getByRole("textbox", { name: "Full name" }).fill("Invited Coordinator");
    await page.getByRole("textbox", { name: "Create password" }).fill(E2E_PASSWORD);
    await page.getByRole("button", { name: /accept invite/i }).click();
    await page.waitForURL((url) => !url.pathname.includes("/invite/"), { timeout: 30_000 });
    expect(page.url()).toMatch(/\/dashboard|\/onboarding/);
  });

  test("AUTH-T017: invalid invite token shows not found", async ({ page }) => {
    const res = await page.goto("/invite/expired-token-not-in-db-000000000000000000000000");
    expect(res?.status()).toBe(404);
  });

  test("AUTH-T020/T021: session persists on refresh; cleared session blocks access", async ({
    page,
  }) => {
    await loginAs(page, users.ownerA);
    await page.goto("/dashboard");
    await page.reload();
    await expect(page).toHaveURL(/\/dashboard/);

    await page.context().clearCookies();
    await page.goto("/dashboard");
    await expect(page).toHaveURL(/\/login/);
  });

  test("AUTH-T013: agency user cannot access another agency via API", async ({ page }) => {
    await loginAs(page, users.ownerA);
    const agencies = await page.evaluate(async () => {
      const res = await fetch("/api/agencies/not-a-real-agency-id");
      return res.status;
    });
    expect(agencies).toBeGreaterThanOrEqual(403);
  });
});
