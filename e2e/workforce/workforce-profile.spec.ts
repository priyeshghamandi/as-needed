import { test, expect } from "@playwright/test";
import { loginAs, users } from "../fixtures/auth";

test.describe("WORK-E2E profile", () => {
  test("WORK-E2E-030: profile displays header and sections", async ({ page }) => {
    await loginAs(page, users.recruiter);
    await page.goto("/workforce");
    await page.getByRole("link", { name: "Jane Smith" }).first().click();
    await expect(page.getByRole("heading", { name: "Jane Smith" })).toBeVisible();
    await expect(page.getByText("Contact")).toBeVisible();
    await expect(page.getByText("Metrics")).toBeVisible();
  });

  test("WORK-E2E-031: send invite from profile", async ({ page }) => {
    await loginAs(page, users.recruiter);
    await page.goto("/workforce");
    await page.getByRole("link", { name: "Jane Smith" }).first().click();
    await page.getByRole("button", { name: /send invite/i }).click();
    await expect(page.getByText("Invite pending")).toBeVisible();
  });

  test("WORK-E2E-032: deactivate professional", async ({ page }) => {
    await loginAs(page, users.ownerA);
    await page.goto("/workforce");
    await page.getByRole("link", { name: "Pro2 E2E" }).first().click();
    await page.getByRole("button", { name: "Deactivate" }).first().click();
    await page
      .getByRole("dialog", { name: /deactivate professional/i })
      .getByRole("button", { name: "Deactivate" })
      .click();
    await expect(page.getByText("Inactive")).toBeVisible({ timeout: 15_000 });
    await page.goto("/workforce");
    await expect(page.getByRole("link", { name: "Pro2 E2E" })).toHaveCount(0);
    await page.getByLabel(/show inactive/i).check();
    await expect(page.getByRole("link", { name: "Pro2 E2E" }).first()).toBeVisible();
  });

  test("WORK-E2E-033: foreign agency id returns 404", async ({ page }) => {
    await loginAs(page, users.ownerA);
    await page.goto("/workforce/e2e00000-0000-4000-8000-0000000000b1");
    await expect(page.getByRole("heading", { name: "404" })).toBeVisible();
  });
});
