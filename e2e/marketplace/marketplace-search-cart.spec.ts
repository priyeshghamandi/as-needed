import { test, expect } from "@playwright/test";

test.describe("Marketplace Search Cart", () => {
  test("MPS-E2E-CART-001: continue CTA links to login with callback", async ({ page }) => {
    await page.goto("/marketplace/search");
    await page.evaluate(() => {
      sessionStorage.setItem(
        "marketplace_request_cart",
        JSON.stringify({
          professionalIds: ["00000000-0000-0000-0000-000000000001"],
          role: "rn",
          needStart: null,
          needEnd: null,
          urgency: "flexible",
          shiftType: null,
          locationDisplayName: "Test City",
        }),
      );
    });
    await page.reload();
    await expect(page.getByRole("link", { name: /continue to request/i })).toBeVisible();
    await expect(page.getByRole("link", { name: /continue to request/i })).toHaveAttribute(
      "href",
      /login\?callbackUrl=/,
    );
  });
});
