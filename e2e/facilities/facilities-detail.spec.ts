import { test, expect } from "@playwright/test";
import { loginAs, users } from "../fixtures/auth";

test.describe("FAC-E2E detail", () => {
  test("FAC-E2E-030: detail shows contact and address", async ({ page }) => {
    await loginAs(page, users.coordinator);
    await page.goto("/facilities");
    await page.getByRole("link", { name: "E2E Memorial Hospital" }).first().click();
    await expect(page.getByRole("heading", { name: "E2E Memorial Hospital" })).toBeVisible();
    await expect(page.getByRole("heading", { name: "Contact" })).toBeVisible();
    await expect(page.getByRole("heading", { name: "Address" })).toBeVisible();
  });

  test("FAC-E2E-031: coordinator edits contact", async ({ page }) => {
    await loginAs(page, users.coordinator);
    await page.goto("/facilities");
    await page.getByRole("link", { name: "E2E Memorial Hospital" }).first().click();
    await page.getByRole("button", { name: /^edit$/i }).click();
    const phone = page.getByLabel(/contact phone/i);
    await phone.fill("5559998888");
    await page.getByRole("button", { name: /^save$/i }).click();
    await expect(page.getByText("5559998888")).toBeVisible({ timeout: 10_000 });
  });

  test("FAC-E2E-032: resend invite", async ({ page }) => {
    await loginAs(page, users.coordinator);
    await page.goto("/facilities");
    await page.getByRole("link", { name: "SF Community Clinic" }).first().click();
    await page.getByRole("button", { name: /invite contact|resend invite/i }).click();
    await expect(page.getByText(/invite sent/i)).toBeVisible();
  });

  test("FAC-E2E-033: foreign facility id returns 404", async ({ page }) => {
    await loginAs(page, users.coordinator);
    await page.goto("/facilities/e2e00000-0000-4000-8000-0000000000f1");
    await expect(page.getByRole("heading", { name: "404" })).toBeVisible();
  });
});
