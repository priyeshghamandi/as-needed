import "../../scripts/preload-env";
import { describe, expect, it } from "vitest";
import { hashPassword, verifyPassword } from "./password";
import { getPostLoginRedirect } from "./redirects";
import { toPublicUser } from "./safe-user";
import * as authValidations from "@/lib/validations/auth";
import { agencySignupSchema } from "@/lib/validations/agency-signup";
import { createInviteSchema } from "@/lib/validations/invite";
import {
  createAgencySignup,
  DuplicateEmailError,
} from "@/lib/services/agency-signup";
import { createUserInvite, InviteError, acceptUserInvite } from "@/lib/services/invites";
import { eq } from "drizzle-orm";
import { db } from "@/drizzle/db";
import { AgencyTable, UserInviteTable, UserRoleTable, UserTable } from "@/drizzle/schema";
import { randomBytes } from "crypto";
import { getInviteByToken } from "@/lib/services/invites";

const serviceArea = {
  displayName: "Austin, TX",
  placeId: "auth-test-place",
  city: "Austin",
  state: "TX",
  country: "US",
  latitude: 30.27,
  longitude: -97.74,
};

describe("Auth module unit/integration", () => {
  it("AUTH-T003: password hashing uses argon2", async () => {
    const hash = await hashPassword("TestPass123!");
    expect(hash).not.toContain("TestPass123!");
    expect(hash.startsWith("$argon2")).toBe(true);
    expect(await verifyPassword("TestPass123!", hash)).toBe(true);
    expect(await verifyPassword("wrong", hash)).toBe(false);
  });

  it("AUTH-T004: weak password rejected by schema", () => {
    const parsed = agencySignupSchema.safeParse({
      agencyName: "Test Agency",
      agencyType: "per-diem",
      ownerName: "Owner",
      phone: "5551234567",
      email: `weak-${Date.now()}@test.com`,
      password: "short",
      acceptedTerms: true,
      workforceSize: "1-25",
      serviceArea,
    });
    expect(parsed.success).toBe(false);
  });

  it("AUTH-T006: invalid login payloads rejected", () => {
    expect(authValidations.loginSchema.safeParse({ email: "a@b.com", password: "" }).success).toBe(
      false,
    );
    expect(authValidations.loginSchema.safeParse({ email: "bad", password: "x" }).success).toBe(
      false,
    );
  });

  it("AUTH-T012: role-based redirects", () => {
    expect(getPostLoginRedirect([{ role: "agency_owner", agencyId: "a" }])).toBe("/dashboard");
    expect(getPostLoginRedirect([{ role: "staffing_coordinator", agencyId: "a" }])).toBe(
      "/dashboard",
    );
    expect(getPostLoginRedirect([{ role: "provider", agencyId: "a" }])).toBe("/my-shifts");
    expect(getPostLoginRedirect([{ role: "facility_user", agencyId: "a" }])).toBe(
      "/facility/dashboard",
    );
  });

  it("AUTH-T017: invalid invite token rejected by schema", () => {
    expect(
      authValidations.acceptInviteSchema.safeParse({
        token: "abc",
        name: "Test User",
        password: "password1",
      }).success,
    ).toBe(false);
  });

  it("AUTH-T022: sensitive fields excluded from public user", () => {
    const pub = toPublicUser({
      id: "1",
      email: "a@b.com",
      name: "A",
      passwordHash: "secret",
    });
    expect("passwordHash" in pub).toBe(false);
  });

  it("AUTH-T023: invalid invite API payload rejected by schema", () => {
    expect(createInviteSchema.safeParse({ email: "bad", role: "invalid" }).success).toBe(false);
  });

  it("AUTH-T001/T002: agency signup creates records and blocks duplicate email", async () => {
    const email = `auth-test-${Date.now()}@example.com`;
    const input = {
      agencyName: "Auth Test Agency",
      agencyType: "per-diem" as const,
      ownerName: "Auth Tester",
      phone: "5551234567",
      email,
      password: "SecurePass123!",
      acceptedTerms: true as const,
      workforceSize: "1-25" as const,
      serviceArea,
    };

    const created = await createAgencySignup(input);
    expect(created.userId).toBeTruthy();
    expect(created.agencyId).toBeTruthy();

    const [userRow] = await db
      .select({ passwordHash: UserTable.passwordHash })
      .from(UserTable)
      .where(eq(UserTable.email, email))
      .limit(1);
    expect(userRow?.passwordHash).toBeTruthy();
    expect(userRow?.passwordHash).not.toContain("SecurePass123!");

    await expect(createAgencySignup(input)).rejects.toBeInstanceOf(DuplicateEmailError);
  });

  it("AUTH-T014/T017: invite creation and invalid token rejection", async () => {
    const [owner] = await db
      .select({ id: UserTable.id })
      .from(UserTable)
      .where(eq(UserTable.email, "e2e-dash-owner-a@example.com"))
      .limit(1);
    const [agency] = await db.select({ id: AgencyTable.id }).from(AgencyTable).limit(1);
    expect(owner?.id).toBeTruthy();
    expect(agency?.id).toBeTruthy();

    const invite = await createUserInvite(
      {
        email: `invite-${Date.now()}@example.com`,
        role: "staffing_coordinator",
        inviteType: "agency_staff",
      },
      owner!.id,
      agency!.id,
    );
    expect(invite.token).toBeTruthy();

    await expect(
      acceptUserInvite({
        token: "not-a-real-token-value",
        name: "Bad Invite",
        password: "password123",
      }),
    ).rejects.toBeInstanceOf(InviteError);
  });

  it("AUTH-T013: user cannot access another agency", async () => {
    const agencies = await db.select({ id: AgencyTable.id }).from(AgencyTable).limit(2);
    expect(agencies.length).toBeGreaterThanOrEqual(2);

    const ownerARoles = await db
      .select({ agencyId: UserRoleTable.agencyId, role: UserRoleTable.role })
      .from(UserRoleTable)
      .innerJoin(UserTable, eq(UserRoleTable.userId, UserTable.id))
      .where(eq(UserTable.email, "e2e-dash-owner-a@example.com"));

    const agencyBId = agencies.find((a) => !ownerARoles.some((r) => r.agencyId === a.id))?.id;
    expect(agencyBId).toBeTruthy();

    const hasAccess = ownerARoles.some(
      (row) =>
        row.role === "platform_admin" ||
        (row.agencyId === agencyBId &&
          ["agency_owner", "agency_admin", "staffing_coordinator", "recruiter", "compliance_manager"].includes(
            row.role,
          )),
    );
    expect(hasAccess).toBe(false);
  });

  it("AUTH-T016: expired invite token rejected", async () => {
    const [owner] = await db
      .select({ id: UserTable.id })
      .from(UserTable)
      .where(eq(UserTable.email, "e2e-dash-owner-a@example.com"))
      .limit(1);
    const [agency] = await db.select({ id: AgencyTable.id }).from(AgencyTable).limit(1);
    const token = randomBytes(24).toString("hex");
    const expiredAt = new Date(Date.now() - 60_000);

    await db.insert(UserInviteTable).values({
      token,
      email: `expired-${Date.now()}@example.com`,
      role: "staffing_coordinator",
      inviteType: "agency_staff",
      agencyId: agency!.id,
      invitedByUserId: owner!.id,
      status: "pending",
      expiresAt: expiredAt,
    });

    const invite = await getInviteByToken(token);
    expect(invite?.status).toBe("expired");

    await expect(
      acceptUserInvite({
        token,
        name: "Expired User",
        password: "password123",
      }),
    ).rejects.toMatchObject({ code: "EXPIRED" });
  });
});
