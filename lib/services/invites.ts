import { randomBytes } from "crypto";
import { eq } from "drizzle-orm";
import { db } from "@/drizzle/db";
import {
  AgencyTable,
  UserInviteTable,
  UserRoleTable,
  UserTable,
} from "@/drizzle/schema";
import { hashPassword } from "@/lib/auth/password";
import type { CreateInviteInput } from "@/lib/validations/invite";
import type { AcceptInviteInput } from "@/lib/validations/auth";

const INVITE_TTL_DAYS = 7;

export class InviteError extends Error {
  readonly code:
    | "INVALID"
    | "EXPIRED"
    | "ALREADY_ACCEPTED"
    | "EMAIL_EXISTS"
    | "NOT_FOUND";

  constructor(
    code: InviteError["code"],
    message: string,
  ) {
    super(message);
    this.name = "InviteError";
    this.code = code;
  }
}

function generateInviteToken(): string {
  return randomBytes(24).toString("hex");
}

export async function createUserInvite(
  input: CreateInviteInput,
  invitedByUserId: string,
  agencyId: string,
) {
  const email = input.email.trim().toLowerCase();
  const token = generateInviteToken();
  const expiresAt = new Date(
    Date.now() + INVITE_TTL_DAYS * 24 * 60 * 60 * 1000,
  );

  const [invite] = await db
    .insert(UserInviteTable)
    .values({
      token,
      email,
      role: input.role,
      inviteType: input.inviteType,
      agencyId,
      facilityId: input.facilityId ?? null,
      invitedByUserId,
      status: "pending",
      expiresAt,
    })
    .returning({
      id: UserInviteTable.id,
      token: UserInviteTable.token,
      email: UserInviteTable.email,
      role: UserInviteTable.role,
      expiresAt: UserInviteTable.expiresAt,
    });

  return invite;
}

export async function getInviteByToken(token: string) {
  const rows = await db
    .select({
      id: UserInviteTable.id,
      token: UserInviteTable.token,
      email: UserInviteTable.email,
      role: UserInviteTable.role,
      inviteType: UserInviteTable.inviteType,
      agencyId: UserInviteTable.agencyId,
      facilityId: UserInviteTable.facilityId,
      status: UserInviteTable.status,
      expiresAt: UserInviteTable.expiresAt,
      agencyName: AgencyTable.name,
    })
    .from(UserInviteTable)
    .innerJoin(AgencyTable, eq(UserInviteTable.agencyId, AgencyTable.id))
    .where(eq(UserInviteTable.token, token))
    .limit(1);

  const invite = rows[0];
  if (!invite) return null;

  if (
    invite.status === "pending" &&
    invite.expiresAt.getTime() < Date.now()
  ) {
    return { ...invite, status: "expired" as const };
  }

  return invite;
}

function assertInviteUsable(invite: NonNullable<Awaited<ReturnType<typeof getInviteByToken>>>) {
  if (invite.status === "accepted") {
    throw new InviteError("ALREADY_ACCEPTED", "This invite has already been used.");
  }

  if (invite.status === "revoked" || invite.status === "expired") {
    throw new InviteError("INVALID", "This invite is no longer valid.");
  }

  if (invite.expiresAt.getTime() < Date.now()) {
    throw new InviteError("EXPIRED", "This invite has expired. Request a new invite.");
  }
}

export async function acceptUserInvite(input: AcceptInviteInput) {
  const invite = await getInviteByToken(input.token.trim());

  if (!invite) {
    throw new InviteError("NOT_FOUND", "Invite not found. Check your link and try again.");
  }

  assertInviteUsable(invite);

  const email = invite.email.trim().toLowerCase();

  const existing = await db
    .select({ id: UserTable.id })
    .from(UserTable)
    .where(eq(UserTable.email, email))
    .limit(1);

  if (existing.length > 0) {
    throw new InviteError(
      "EMAIL_EXISTS",
      "An account with this email already exists. Sign in instead.",
    );
  }

  const passwordHash = await hashPassword(input.password);

  return db.transaction(async (tx) => {
    const [user] = await tx
      .insert(UserTable)
      .values({
        name: input.name.trim(),
        email,
        passwordHash,
        status: "active",
      })
      .returning({ id: UserTable.id, email: UserTable.email, name: UserTable.name });

    await tx.insert(UserRoleTable).values({
      userId: user.id,
      role: invite.role,
      agencyId: invite.agencyId,
    });

    await tx
      .update(UserInviteTable)
      .set({
        status: "accepted",
        acceptedAt: new Date(),
        updatedAt: new Date(),
      })
      .where(eq(UserInviteTable.id, invite.id));

    return {
      user,
      role: invite.role,
      agencyId: invite.agencyId,
      email,
      password: input.password,
    };
  });
}
