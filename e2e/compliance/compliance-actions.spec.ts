import { test, expect } from "@playwright/test";
import { loginAs, users } from "../fixtures/auth";

const AGENCY_B_CREDENTIAL_ID = "e2e00000-0000-4000-8000-0000000000c6";

test.describe("COMP-E2E actions", () => {
  test.describe.configure({ mode: "serial" });

  test.beforeEach(async ({ page }) => {
    await loginAs(page, users.compliance);
    await page.goto("/compliance");
  });

  test("COMP-E2E-020: verify pending credential", async ({ page }) => {
    await page.getByRole("cell", { name: "BLS Certification" }).click();
    await page.getByRole("button", { name: "Verify" }).click();
    await expect(page.getByText("Verified").first()).toBeVisible();
    await page.reload();
    await page.getByLabel("Status").selectOption("verified");
    await expect(page.getByRole("cell", { name: "BLS Certification" })).toBeVisible();
  });

  test("COMP-E2E-021: reject with reason", async ({ page }) => {
    await page.getByRole("button", { name: /add credential/i }).first().click();
    await page.getByLabel(/credential name/i).fill("E2E Reject Target");
    await page.getByRole("dialog").getByRole("button", { name: "Add credential" }).click();
    await page.getByRole("cell", { name: "E2E Reject Target" }).click();
    await page.getByRole("button", { name: "Reject" }).click();
    await page.locator("textarea").fill("Incomplete documentation for E2E test.");
    await page.getByRole("button", { name: "Reject" }).last().click();
    await expect(
      page.locator('aside[aria-label="Credential details"]').getByText("Rejected"),
    ).toBeVisible();
  });

  test("COMP-E2E-022: create credential", async ({ page }) => {
    await page.getByRole("button", { name: /add credential/i }).first().click();
    await page.getByLabel(/credential name/i).fill("E2E New Credential");
    await page.getByRole("dialog").getByRole("button", { name: "Add credential" }).click();
    await expect(page.getByRole("cell", { name: "E2E New Credential" })).toBeVisible();
  });

  test("COMP-E2E-023: edit credential name", async ({ page }) => {
    await page.getByRole("cell", { name: "ACLS" }).click();
    await page.getByRole("button", { name: "Edit" }).click();
    await page.locator('input[value="ACLS"]').fill("ACLS Updated");
    await page.getByRole("button", { name: "Save" }).click();
    await expect(page.getByRole("cell", { name: "ACLS Updated" })).toBeVisible();
  });

  test("COMP-E2E-024: delete credential with confirm", async ({ page }) => {
    await page.getByRole("cell", { name: "Rejected Cert" }).click();
    await page.getByRole("button", { name: "Delete" }).click();
    await page.getByRole("button", { name: "Delete" }).last().click();
    await expect(page.getByRole("cell", { name: "Rejected Cert" })).not.toBeVisible();
  });

  test("COMP-E2E-025: cross-agency credential not found", async ({ page }) => {
    const res = await page.request.get(`/api/compliance/credentials/${AGENCY_B_CREDENTIAL_ID}`);
    expect(res.status()).toBe(404);
  });

  test("COMP-E2E-026: manual mark expired", async ({ page }) => {
    await page.getByRole("cell", { name: /ACLS/ }).click();
    await page
      .locator('aside[aria-label="Credential details"]')
      .locator("select")
      .selectOption("expired");
    await expect(
      page
        .locator('aside[aria-label="Credential details"] .rounded-full')
        .filter({ hasText: "Expired" })
        .first(),
    ).toBeVisible();
  });
});
