import { test, expect } from "@playwright/test";
import { loginAs, users } from "../fixtures/auth";

test("OPS-E2E-050: mobile layout 375px", async ({ page }) => {
  await page.setViewportSize({ width: 375, height: 812 });
  await loginAs(page, users.ownerA);
  await page.goto("/dashboard");
  await expect(page.getByText("Open Requests")).toBeVisible();
  const scrollWidth = await page.evaluate(() => document.documentElement.scrollWidth);
  const clientWidth = await page.evaluate(() => document.documentElement.clientWidth);
  expect(scrollWidth).toBeLessThanOrEqual(clientWidth + 2);
});

test("OPS-E2E-051: desktop layout 1280px", async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 800 });
  await loginAs(page, users.ownerA);
  await page.goto("/dashboard");
  await expect(page.getByText("Active Staffing Requests")).toBeVisible();
  await expect(page.getByText("Available Workforce")).toBeVisible();
  const requestsPanel = page.getByText("Active Staffing Requests").locator("xpath=ancestor::section[1]");
  const workforcePanel = page.getByText("Available Workforce").locator("xpath=ancestor::section[1]");
  const reqBox = await requestsPanel.boundingBox();
  const wfBox = await workforcePanel.boundingBox();
  expect(reqBox).not.toBeNull();
  expect(wfBox).not.toBeNull();
  if (reqBox && wfBox) {
    expect(reqBox.y).toBeCloseTo(wfBox.y, 0);
    expect(reqBox.x).toBeLessThan(wfBox.x);
  }
});
