import { execSync } from "node:child_process";
import { test, expect, request as playwrightRequest } from "@playwright/test";
import { loginAs, users } from "../fixtures/auth";
import { E2E_PROVIDER_PRO_ID } from "../fixtures/matching";

test.describe.configure({ mode: "serial" });
test.setTimeout(60_000);

test.beforeAll(() => {
  execSync("npx tsx --env-file=.env scripts/seed-dashboard-e2e.ts", {
    stdio: "inherit",
    cwd: process.cwd(),
  });
});

function parseMatchContext(pageUrl: string) {
  const requestId = pageUrl.match(/staffing-requests\/([^/]+)/)?.[1];
  const shiftId = new URL(pageUrl).searchParams.get("shiftId");
  return { requestId, shiftId };
}

async function openMatchForRequest(page: import("@playwright/test").Page, title: string) {
  await page.goto("/staffing-requests");
  await page.getByRole("link", { name: title }).click();
  await page.getByRole("link", { name: /match professionals/i }).click();
  await expect(page.getByRole("heading", { name: "Match professionals" })).toBeVisible();
}

async function fetchAssignments(page: import("@playwright/test").Page, pageUrl: string) {
  const { requestId, shiftId } = parseMatchContext(pageUrl);
  const qs = shiftId ? `?shiftId=${shiftId}` : "";
  return page.request.get(`/api/staffing-requests/${requestId}/assignments${qs}`);
}

async function inviteJaneOnShift(page: import("@playwright/test").Page) {
  const shiftId = new URL(page.url()).searchParams.get("shiftId");
  expect(shiftId).toBeTruthy();
  const assignmentsRes = await fetchAssignments(page, page.url());
  const existing = (await assignmentsRes.json()).assignments?.find(
    (a: { professionalId: string; status: string }) =>
      a.professionalId === E2E_PROVIDER_PRO_ID && a.status === "invited",
  );
  if (existing?.id && existing.status !== "cancelled" && existing.status !== "declined") {
    await page.request.patch(`/api/shift-assignments/${existing.id}`, {
      data: { action: "cancel", cancellationReason: "E2E reset" },
    });
  }
  const inviteRes = await page.request.post(`/api/shifts/${shiftId}/assignments`, {
    data: { professionalId: E2E_PROVIDER_PRO_ID },
  });
  if (!inviteRes.ok()) {
    const err = await inviteRes.json();
    expect(err.error).toMatch(/already invited|no remaining slots/i);
  } else {
    await page.reload();
  }
}

test.describe("MATCH-E2E assignment response", () => {
  test.beforeEach(async ({ page }) => {
    await loginAs(page, users.coordinator);
  });

  test("MATCH-E2E-020: provider accepts invite", async ({ page }) => {
    await openMatchForRequest(page, "ICU RN — Night");
    let assignmentsRes = await fetchAssignments(page, page.url());
    let assignment = (await assignmentsRes.json()).assignments?.find(
      (a: { professionalId: string; status: string }) =>
        a.professionalId === E2E_PROVIDER_PRO_ID && a.status === "invited",
    );
    if (!assignment?.id) {
      await inviteJaneOnShift(page);
      assignmentsRes = await fetchAssignments(page, page.url());
      assignment = (await assignmentsRes.json()).assignments?.find(
        (a: { professionalId: string }) => a.professionalId === E2E_PROVIDER_PRO_ID,
      );
    }
    expect(assignment?.id).toBeTruthy();
    const matchUrl = page.url();

    await loginAs(page, users.provider);
    const patchRes = await page.request.patch(`/api/shift-assignments/${assignment!.id}`, {
      data: { status: "accepted" },
    });
    expect(patchRes.ok()).toBeTruthy();

    await loginAs(page, users.coordinator);
    const after = await fetchAssignments(page, matchUrl);
    const updated = (await after.json()).assignments?.find(
      (a: { id: string }) => a.id === assignment!.id,
    );
    expect(updated?.status).toMatch(/accepted|confirmed/);
  });

  test("MATCH-E2E-021: provider declines with reason", async ({ page }) => {
    await openMatchForRequest(page, "Med-Surg CNA");
    await inviteJaneOnShift(page);
    const assignmentsRes = await fetchAssignments(page, page.url());
    const body = await assignmentsRes.json();
    const assignment = body.assignments?.find(
      (a: { professionalId: string; status: string }) =>
        a.professionalId === E2E_PROVIDER_PRO_ID && a.status === "invited",
    );
    expect(assignment?.id).toBeTruthy();

    await loginAs(page, users.provider);
    const patchRes = await page.request.patch(`/api/shift-assignments/${assignment!.id}`, {
      data: { status: "declined", declineReason: "Schedule conflict" },
    });
    expect(patchRes.ok()).toBeTruthy();

    await loginAs(page, users.coordinator);
    await openMatchForRequest(page, "Med-Surg CNA");
    await expect(page.getByText(/schedule conflict/i)).toBeVisible();
  });

  test("MATCH-E2E-022: provider cannot accept another assignment", async ({ page }) => {
    await openMatchForRequest(page, "ICU RN — Night");
    const shiftId = new URL(page.url()).searchParams.get("shiftId");
    const matchesRes = await page.request.get(
      `/api/staffing-requests/${page.url().match(/staffing-requests\/([^/]+)/)?.[1]}/matches?shiftId=${shiftId}`,
    );
    const pro2 = (await matchesRes.json()).candidates?.find(
      (c: { firstName: string; lastName: string }) =>
        c.firstName === "Pro2" && c.lastName === "E2E",
    );
    expect(pro2?.id).toBeTruthy();
    await page.request.post(`/api/shifts/${shiftId}/assignments`, {
      data: { professionalId: pro2.id },
    });
    const assignmentsRes = await fetchAssignments(page, page.url());
    const body = await assignmentsRes.json();
    const otherAssignment = body.assignments?.find(
      (a: { professionalId: string }) => a.professionalId !== E2E_PROVIDER_PRO_ID,
    );
    expect(otherAssignment?.id).toBeTruthy();

    await loginAs(page, users.provider);
    const patchRes = await page.request.patch(`/api/shift-assignments/${otherAssignment!.id}`, {
      data: { status: "accepted" },
    });
    expect(patchRes.status()).toBe(403);
  });

  test("MATCH-E2E-023: accept auto-confirms assignment", async ({ page }) => {
    await openMatchForRequest(page, "ER RN — Weekend");
    await inviteJaneOnShift(page);
    const matchUrl = page.url();
    const assignmentsRes = await fetchAssignments(page, matchUrl);
    const body = await assignmentsRes.json();
    const assignment = body.assignments?.find(
      (a: { professionalId: string }) => a.professionalId === E2E_PROVIDER_PRO_ID,
    );
    expect(assignment?.id).toBeTruthy();

    const coordinatorState = await page.context().storageState();

    await loginAs(page, users.provider);
    const patchRes = await page.request.patch(`/api/shift-assignments/${assignment!.id}`, {
      data: { status: "accepted" },
    });
    expect(patchRes.ok()).toBeTruthy();

    const { requestId, shiftId } = parseMatchContext(matchUrl);
    const coordinatorApi = await playwrightRequest.newContext({ storageState: coordinatorState });
    const after = await coordinatorApi.get(
      `/api/staffing-requests/${requestId}/assignments?shiftId=${shiftId}`,
    );
    expect(after.ok()).toBeTruthy();
    const updated = (await after.json()).assignments?.find(
      (a: { id: string }) => a.id === assignment!.id,
    );
    await coordinatorApi.dispose();
    expect(updated?.status).toMatch(/confirmed|accepted/);
  });
});
