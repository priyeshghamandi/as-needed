import { execSync } from "node:child_process";
import { test, expect } from "@playwright/test";
import { loginAs, users } from "../fixtures/auth";
const OUT_OF_SERVICE_AREA_MESSAGE =
  "This location is outside your agency's service area.";
import {
  ensureProfileStep,
  fillProfileStep,
  fillServiceAreaStep,
  pickLocationSuggestion,
  saveProfileAndContinue,
  saveServiceAreaAndContinue,
  skipFacilitiesStep,
  skipProfessionalsStep,
  skipTeamStep,
  submitFacilitiesContinue,
  submitProfessionalsContinue,
  stubPlacesApi,
} from "./helpers";

function resetOnboardingSeed() {
  execSync("npx tsx --env-file=.env scripts/seed-onboarding-e2e.ts", {
    stdio: "pipe",
    cwd: process.cwd(),
  });
}

test.describe.configure({ mode: "serial" });

test.describe("ONB-E2E wizard", () => {
  test.beforeEach(async ({ page }) => {
    resetOnboardingSeed();
    await stubPlacesApi(page);
  });

  test("ONB-E2E-010: resume lands on profile (welcome skipped)", async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 800 });
    await loginAs(page, users.onboardFlow);
    await ensureProfileStep(page);
    await expect(page.getByText(/Step 02 · Agency profile/i)).toBeVisible();
    await page.getByRole("button", { name: /^back$/i }).click();
    await expect(page.getByRole("button", { name: /start setup/i })).toBeVisible();
    await page.getByRole("button", { name: /start setup/i }).click();
    await expect(page.getByText(/Step 02 · Agency profile/i)).toBeVisible();
  });

  test("ONB-E2E-011: profile step validation", async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 800 });
    await loginAs(page, users.onboardFlow);
    await ensureProfileStep(page);
    await page.getByRole("button", { name: /save & continue/i }).click();
    await expect(page.getByText(/required|at least/i).first()).toBeVisible();
    await fillProfileStep(page);
    await page.getByRole("button", { name: /save & continue/i }).click();
    await expect(page.getByText(/Step 03 · Service area/i)).toBeVisible();
  });

  test("ONB-E2E-012: service area radius and continue", async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 800 });
    await loginAs(page, users.onboardFlow);
    await ensureProfileStep(page);
    await saveProfileAndContinue(page);
    await fillServiceAreaStep(page, 10);
    await page.getByRole("button", { name: /save & continue/i }).click();
    await expect(page.getByText(/Step 04 · Operations team/i)).toBeVisible();
  });

  test("ONB-E2E-013: team step skip", async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 800 });
    await loginAs(page, users.onboardFlow);
    await ensureProfileStep(page);
    await saveProfileAndContinue(page);
    await saveServiceAreaAndContinue(page);
    await skipTeamStep(page);
    await expect(page.getByText(/Step 05 · Workforce/i)).toBeVisible();
  });

  test("ONB-E2E-014: add healthcare professional in service area", async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 800 });
    await stubPlacesApi(page);
    await loginAs(page, users.onboardFlow);
    await ensureProfileStep(page);
    await saveProfileAndContinue(page);
    await saveServiceAreaAndContinue(page);
    await skipTeamStep(page);
    await page.getByPlaceholder("Andrea").fill("Alex");
    await page.getByPlaceholder("Martinez").fill("Rivera");
    await page.getByPlaceholder("rn@email.com").fill("alex-in-area@example.com");
    await pickLocationSuggestion(
      page,
      /City, metro, or ZIP/i,
      "San Francisco",
      /San Francisco.*CA/i,
    );
    await submitProfessionalsContinue(page);
  });

  test("ONB-E2E-015: reject professional outside service area", async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 800 });
    await loginAs(page, users.onboardFlow);
    await ensureProfileStep(page);
    await saveProfileAndContinue(page);
    await fillServiceAreaStep(page, 10);
    await page.getByRole("button", { name: /save & continue/i }).click();
    await skipTeamStep(page);
    await page.getByPlaceholder("Andrea").fill("Far");
    await page.getByPlaceholder("Martinez").fill("Away");
    await page.getByPlaceholder("rn@email.com").fill("far-away@example.com");
    await pickLocationSuggestion(page, /City, metro, or ZIP/i, "New York", /New York.*NY/i);
    await page.getByRole("button", { name: /^continue$/i }).click();
    await expect(
      page.getByText(new RegExp(OUT_OF_SERVICE_AREA_MESSAGE.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "i")),
    ).toBeVisible();
  });

  test("ONB-E2E-016: duplicate professional email rejected", async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 800 });
    await loginAs(page, users.onboardFlow);
    await ensureProfileStep(page);
    await saveProfileAndContinue(page);
    await saveServiceAreaAndContinue(page);
    await skipTeamStep(page);
    const email = "hp-dup@example.com";
    await page.getByPlaceholder("Andrea").fill("First");
    await page.getByPlaceholder("Martinez").fill("Pro");
    await page.getByPlaceholder("rn@email.com").fill(email);
    await pickLocationSuggestion(page, /City, metro, or ZIP/i, "San Francisco", /San Francisco.*CA/i);
    await submitProfessionalsContinue(page);
    await page.getByRole("button", { name: /^back$/i }).click();
    await page.getByRole("button", { name: /add another professional/i }).click();
    await page.getByPlaceholder("Andrea").nth(1).fill("Second");
    await page.getByPlaceholder("Martinez").nth(1).fill("Pro");
    await page.getByPlaceholder("rn@email.com").nth(1).fill(email);
    await pickLocationSuggestion(page, /City, metro, or ZIP/i, "Oakland", /Oakland.*CA/i);
    await page.getByRole("button", { name: /^continue$/i }).click();
    await expect(
      page.getByText(/professional with this email already exists/i),
    ).toBeVisible();
  });

  test("ONB-E2E-017: facilities step skip", async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 800 });
    await loginAs(page, users.onboardFlow);
    await ensureProfileStep(page);
    await saveProfileAndContinue(page);
    await saveServiceAreaAndContinue(page);
    await skipTeamStep(page);
    await skipProfessionalsStep(page);
    await skipFacilitiesStep(page);
    await expect(page.getByText(/Your workspace is ready to/i)).toBeVisible();
  });

  test("ONB-E2E-018: complete onboarding redirects to dashboard", async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 800 });
    await loginAs(page, users.onboardFlow);
    await ensureProfileStep(page);
    await saveProfileAndContinue(page);
    await saveServiceAreaAndContinue(page);
    await skipTeamStep(page);
    await skipProfessionalsStep(page);
    await skipFacilitiesStep(page);
    await page.getByRole("button", { name: /go to operations dashboard/i }).click();
    await expect(page).toHaveURL(/\/dashboard/);
    await expect(page.getByText(/Finish setting up your agency/i)).not.toBeVisible();
  });

  test("ONB-E2E-019: dashboard banner links to onboarding", async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 800 });
    await loginAs(page, users.onboardPersist);
    await page.goto("/dashboard");
    await expect(page.getByText(/Finish setting up your agency/i)).toBeVisible();
    await page.getByRole("link", { name: /complete setup/i }).click();
    await expect(page).toHaveURL(/\/onboarding/);
    await expect(page.getByText(/Step 05 · Workforce/i)).toBeVisible();
    await expect(page.getByRole("button", { name: /start setup/i })).not.toBeVisible();
  });

  test("ONB-E2E-022: duplicate facility contact email rejected", async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 800 });
    await loginAs(page, users.onboardFlow);
    await ensureProfileStep(page);
    await saveProfileAndContinue(page);
    await saveServiceAreaAndContinue(page);
    await skipTeamStep(page);
    await skipProfessionalsStep(page);
    const email = "facility-dup@example.com";
    await page.getByPlaceholder("Mercy Mt. Sinai Medical Center").first().fill("Hospital A");
    await page.getByPlaceholder("Director of Nursing").first().fill("Pat Lee");
    await page.getByPlaceholder("director@mercyhealth.org").first().fill(email);
    await page.getByPlaceholder("(555) 010-2841").first().fill("+1 555 010 9999");
    await page.getByRole("checkbox", { name: /Send portal invite/i }).first().uncheck();
    await pickLocationSuggestion(page, /City, metro, or ZIP/i, "San Francisco", /San Francisco.*CA/i);
    await page.getByRole("button", { name: /add another/i }).click();
    await page.getByPlaceholder("Mercy Mt. Sinai Medical Center").nth(1).fill("Hospital B");
    await page.getByPlaceholder("Director of Nursing").nth(1).fill("Pat Two");
    await page.getByPlaceholder("director@mercyhealth.org").nth(1).fill(email);
    await page.getByPlaceholder("(555) 010-2841").nth(1).fill("+1 555 010 9998");
    await pickLocationSuggestion(page, /City, metro, or ZIP/i, "Oakland", /Oakland.*CA/i);
    await page.getByRole("button", { name: /^continue$/i }).click();
    await expect(
      page.getByText(/facility with this contact email already exists/i),
    ).toBeVisible();
  });
});
