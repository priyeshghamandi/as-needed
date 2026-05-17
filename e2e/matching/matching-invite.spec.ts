import { test, expect } from "@playwright/test";
import { loginAs, users } from "../fixtures/auth";
import { E2E_PROVIDER_PRO_ID } from "../fixtures/matching";

async function openMatchForRequest(page: import("@playwright/test").Page, title: string) {
  await page.goto("/staffing-requests");
  await page.getByRole("link", { name: title }).click();
  await page.getByRole("link", { name: /match professionals/i }).click();
  await expect(page.getByRole("heading", { name: "Match professionals" })).toBeVisible();
}

async function expectInviteSent(page: import("@playwright/test").Page) {
  await expect(page.getByRole("status")).toContainText(/invite sent/i, { timeout: 10_000 });
}

test.describe("MATCH-E2E invite", () => {
  test.beforeEach(async ({ page }) => {
    await loginAs(page, users.coordinator);
  });

  test("MATCH-E2E-010: candidate list shows workforce", async ({ page }) => {
    await openMatchForRequest(page, "Med-Surg CNA");
    await expect(page.getByText("Jane Smith")).toBeVisible();
    await expect(page.getByText("Pro2 E2E")).toBeVisible();
  });

  test("MATCH-E2E-011: filter available only", async ({ page }) => {
    await openMatchForRequest(page, "Med-Surg CNA");
    const url = new URL(page.url());
    url.searchParams.set("availableOnly", "1");
    await page.goto(url.toString());
    await expect(page).toHaveURL(/availableOnly=1/);
    await expect(page.getByText("Pro3 E2E")).not.toBeVisible();
    await expect(page.getByText("Jane Smith")).toBeVisible();
  });

  test("MATCH-E2E-013: duplicate invite blocked", async ({ page }) => {
    await openMatchForRequest(page, "ER RN — Weekend");
    const shiftId = new URL(page.url()).searchParams.get("shiftId");
    expect(shiftId).toBeTruthy();
    const matchesRes = await page.request.get(
      `/api/staffing-requests/${page.url().match(/staffing-requests\/([^/]+)/)?.[1]}/matches?shiftId=${shiftId}`,
    );
    const pro2 = (await matchesRes.json()).candidates?.find(
      (c: { firstName: string; lastName: string }) =>
        c.firstName === "Pro2" && c.lastName === "E2E",
    );
    expect(pro2?.id).toBeTruthy();

    const first = await page.request.post(`/api/shifts/${shiftId}/assignments`, {
      data: { professionalId: pro2.id },
    });
    expect(first.ok()).toBeTruthy();
    const duplicate = await page.request.post(`/api/shifts/${shiftId}/assignments`, {
      data: { professionalId: pro2.id },
    });
    expect(duplicate.ok()).toBeFalsy();
    expect(duplicate.status()).toBeGreaterThanOrEqual(400);
  });

  test("MATCH-E2E-012: send single invite", async ({ page }) => {
    await openMatchForRequest(page, "Med-Surg CNA");
    const shiftId = new URL(page.url()).searchParams.get("shiftId");
    const matchesRes = await page.request.get(
      `/api/staffing-requests/${page.url().match(/staffing-requests\/([^/]+)/)?.[1]}/matches?shiftId=${shiftId}`,
    );
    const pro2 = (await matchesRes.json()).candidates?.find(
      (c: { firstName: string; lastName: string }) =>
        c.firstName === "Pro2" && c.lastName === "E2E",
    );
    expect(pro2?.id).toBeTruthy();
    const inviteRes = await page.request.post(`/api/shifts/${shiftId}/assignments`, {
      data: { professionalId: pro2.id },
    });
    expect(inviteRes.ok()).toBeTruthy();
    await page.reload();
    await expect(page.getByText("Invited", { exact: true }).first()).toBeVisible();
  });

  test("MATCH-E2E-014: bulk invite", async ({ page }) => {
    await openMatchForRequest(page, "ICU RN — Night");
    const requestId = page.url().match(/staffing-requests\/([^/]+)/)?.[1];
    const shiftId = new URL(page.url()).searchParams.get("shiftId");
    const matchesRes = await page.request.get(
      `/api/staffing-requests/${requestId}/matches?shiftId=${shiftId}`,
    );
    const candidates = (await matchesRes.json()).candidates ?? [];
    const pro2 = candidates.find(
      (c: { firstName: string; lastName: string }) => c.firstName === "Pro2" && c.lastName === "E2E",
    );
    expect(pro2?.id).toBeTruthy();

    const bulkRes = await page.request.post(`/api/shifts/${shiftId}/assignments/bulk`, {
      data: { professionalIds: [E2E_PROVIDER_PRO_ID, pro2.id] },
    });
    expect(bulkRes.ok()).toBeTruthy();
    await page.reload();
    await expect(page.getByText("Invited", { exact: true }).first()).toBeVisible();
  });

  test("MATCH-E2E-015: cancel invite", async ({ page }) => {
    await openMatchForRequest(page, "ICU RN — Night");
    const shiftId = new URL(page.url()).searchParams.get("shiftId");
    const requestId = page.url().match(/staffing-requests\/([^/]+)/)?.[1];
    const listRes = await page.request.get(
      `/api/staffing-requests/${requestId}/assignments?shiftId=${shiftId}`,
    );
    let janeAssignment = (await listRes.json()).assignments?.find(
      (a: { professionalId: string; status: string }) =>
        a.professionalId === E2E_PROVIDER_PRO_ID && a.status === "invited",
    );
    if (!janeAssignment?.id) {
      const inviteRes = await page.request.post(`/api/shifts/${shiftId}/assignments`, {
        data: { professionalId: E2E_PROVIDER_PRO_ID },
      });
      expect(inviteRes.ok()).toBeTruthy();
      const refreshed = await page.request.get(
        `/api/staffing-requests/${requestId}/assignments?shiftId=${shiftId}`,
      );
      janeAssignment = (await refreshed.json()).assignments?.find(
        (a: { professionalId: string; status: string }) =>
          a.professionalId === E2E_PROVIDER_PRO_ID && a.status === "invited",
      );
    }
    expect(janeAssignment?.id).toBeTruthy();

    const cancelRes = await page.request.patch(`/api/shift-assignments/${janeAssignment.id}`, {
      data: { action: "cancel", cancellationReason: "E2E cancel test" },
    });
    expect(cancelRes.ok()).toBeTruthy();

    const afterRes = await page.request.get(
      `/api/staffing-requests/${requestId}/assignments?shiftId=${shiftId}`,
    );
    const afterJane = (await afterRes.json()).assignments?.find(
      (a: { id: string }) => a.id === janeAssignment.id,
    );
    expect(afterJane?.status).toBe("cancelled");
  });

  test("MATCH-E2E-016: cannot invite when shift full", async ({ page }) => {
    await openMatchForRequest(page, "Med-Surg CNA");
    const shiftId = new URL(page.url()).searchParams.get("shiftId");
    const janeRes = await page.request.post(`/api/shifts/${shiftId}/assignments`, {
      data: { professionalId: E2E_PROVIDER_PRO_ID },
    });
    expect(janeRes.ok()).toBeFalsy();
    expect(janeRes.status()).toBeGreaterThanOrEqual(400);
  });
});
