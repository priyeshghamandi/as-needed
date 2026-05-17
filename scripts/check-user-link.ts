import { eq, sql } from "drizzle-orm";
import { db } from "../drizzle/db";
import {
  CredentialTable,
  HealthcareProfessionalTable,
  UserInviteTable,
  UserRoleTable,
  UserTable,
} from "../drizzle/schema";
import { linkProfessionalToUserOnInvite } from "../lib/workforce/link-professional-on-invite";
import {
  computeShiftReadiness,
  deriveComplianceStatus,
} from "../lib/workforce/shift-readiness";

const email = (process.argv[2] ?? "test@test.com").toLowerCase();
const shouldFix = process.argv.includes("--fix");

async function main() {
  const users = await db
    .select({ id: UserTable.id, email: UserTable.email, name: UserTable.name })
    .from(UserTable)
    .where(eq(UserTable.email, email));

  const pros = await db
    .select({
      id: HealthcareProfessionalTable.id,
      userId: HealthcareProfessionalTable.userId,
      agencyId: HealthcareProfessionalTable.agencyId,
      email: HealthcareProfessionalTable.email,
      firstName: HealthcareProfessionalTable.firstName,
      lastName: HealthcareProfessionalTable.lastName,
      availabilityStatus: HealthcareProfessionalTable.availabilityStatus,
    })
    .from(HealthcareProfessionalTable)
    .where(sql`lower(${HealthcareProfessionalTable.email}) = ${email.toLowerCase()}`);

  const invites = await db
    .select({
      status: UserInviteTable.status,
      role: UserInviteTable.role,
      inviteType: UserInviteTable.inviteType,
      agencyId: UserInviteTable.agencyId,
      acceptedAt: UserInviteTable.acceptedAt,
    })
    .from(UserInviteTable)
    .where(eq(UserInviteTable.email, email.toLowerCase()));

  let roles: { role: string; agencyId: string | null }[] = [];
  if (users[0]) {
    roles = await db
      .select({ role: UserRoleTable.role, agencyId: UserRoleTable.agencyId })
      .from(UserRoleTable)
      .where(eq(UserRoleTable.userId, users[0].id));
  }

  if (shouldFix && users[0] && pros[0] && !pros[0].userId && roles[0]?.role === "provider") {
    const linkedId = await linkProfessionalToUserOnInvite(db, {
      userId: users[0].id,
      email,
      agencyId: pros[0].agencyId,
    });
    console.log(JSON.stringify({ fixed: Boolean(linkedId), professionalId: linkedId }, null, 2));
    return;
  }

  let operational: Record<string, unknown> | undefined;
  if (pros[0]) {
    const creds = await db
      .select({ status: CredentialTable.status, name: CredentialTable.name })
      .from(CredentialTable)
      .where(eq(CredentialTable.professionalId, pros[0].id));
    const compliance = deriveComplianceStatus(creds);
    operational = {
      availabilityStatus: pros[0].availabilityStatus,
      compliance,
      shiftReadiness: computeShiftReadiness(pros[0].availabilityStatus, compliance),
      credentials: creds,
    };
  }

  console.log(JSON.stringify({ users, roles, professionals: pros, invites, operational }, null, 2));
}

main().catch(console.error);
