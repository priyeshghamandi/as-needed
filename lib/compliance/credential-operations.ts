import { and, eq } from "drizzle-orm";
import { db } from "@/drizzle/db";
import { CredentialTable } from "@/drizzle/schema";
import {
  canManualStatusTransition,
  canReopenReview,
  canRejectCredential,
  canVerifyCredential,
  isDirectVerifiedStatusUpdate,
} from "@/lib/compliance/credential-transitions";
import type { CredentialStatus } from "@/lib/compliance/credential-transitions";
import {
  assertProfessionalInAgency,
  findDuplicateCredentialWarning,
} from "@/lib/compliance/queries";
import type { CredentialInput, CredentialUpdateInput } from "@/lib/validations/credential";
import { parseDateField } from "@/lib/validations/credential";

export type CredentialOpResult =
  | { ok: true; id: string; warning?: string }
  | { ok: false; status: number; message: string };

async function getCredentialRow(agencyId: string, credentialId: string) {
  const [row] = await db
    .select({
      id: CredentialTable.id,
      status: CredentialTable.status,
    })
    .from(CredentialTable)
    .where(
      and(eq(CredentialTable.id, credentialId), eq(CredentialTable.agencyId, agencyId)),
    )
    .limit(1);

  return row ?? null;
}

export async function createCredentialCore(
  agencyId: string,
  input: CredentialInput,
): Promise<CredentialOpResult> {
  const inAgency = await assertProfessionalInAgency(agencyId, input.professionalId);
  if (!inAgency) {
    return { ok: false, status: 400, message: "Professional not found in this agency." };
  }

  const licenseNumber = input.licenseNumber?.trim() || null;
  const duplicate = await findDuplicateCredentialWarning(
    agencyId,
    input.professionalId,
    input.type.trim(),
    licenseNumber,
  );

  const [created] = await db
    .insert(CredentialTable)
    .values({
      agencyId,
      professionalId: input.professionalId,
      type: input.type.trim(),
      name: input.name.trim(),
      licenseNumber,
      issuingAuthority: input.issuingAuthority?.trim() || null,
      issuedAt: parseDateField(input.issuedAt),
      expiresAt: parseDateField(input.expiresAt),
      documentUrl: input.documentUrl?.trim() || null,
      status: "pending_review",
    })
    .returning({ id: CredentialTable.id });

  return {
    ok: true,
    id: created.id,
    warning: duplicate
      ? "A credential with this type and license number already exists for this professional."
      : undefined,
  };
}

export async function updateCredentialCore(
  agencyId: string,
  credentialId: string,
  input: CredentialUpdateInput,
): Promise<CredentialOpResult> {
  const row = await getCredentialRow(agencyId, credentialId);
  if (!row) return { ok: false, status: 404, message: "Credential not found." };

  const expiresAt = parseDateField(input.expiresAt);
  const issuedAt = parseDateField(input.issuedAt);

  if (expiresAt && issuedAt && new Date(expiresAt) < new Date(issuedAt)) {
    return {
      ok: false,
      status: 400,
      message: "Expiration must be on or after issue date.",
    };
  }

  await db
    .update(CredentialTable)
    .set({
      type: input.type.trim(),
      name: input.name.trim(),
      licenseNumber: input.licenseNumber?.trim() || null,
      issuingAuthority: input.issuingAuthority?.trim() || null,
      issuedAt,
      expiresAt,
      documentUrl: input.documentUrl?.trim() || null,
      updatedAt: new Date(),
    })
    .where(eq(CredentialTable.id, credentialId));

  return { ok: true, id: credentialId };
}

export async function verifyCredentialCore(
  agencyId: string,
  credentialId: string,
  verifiedByUserId: string,
): Promise<CredentialOpResult> {
  const row = await getCredentialRow(agencyId, credentialId);
  if (!row) return { ok: false, status: 404, message: "Credential not found." };

  if (!canVerifyCredential(row.status)) {
    return {
      ok: false,
      status: 409,
      message: "Only pending credentials can be verified.",
    };
  }

  const now = new Date();
  await db
    .update(CredentialTable)
    .set({
      status: "verified",
      verifiedByUserId,
      verifiedAt: now,
      reviewNotes: null,
      updatedAt: now,
    })
    .where(eq(CredentialTable.id, credentialId));

  return { ok: true, id: credentialId };
}

export async function rejectCredentialCore(
  agencyId: string,
  credentialId: string,
  reason: string,
): Promise<CredentialOpResult> {
  const row = await getCredentialRow(agencyId, credentialId);
  if (!row) return { ok: false, status: 404, message: "Credential not found." };

  if (!canRejectCredential(row.status)) {
    return {
      ok: false,
      status: 409,
      message: "Only pending credentials can be rejected.",
    };
  }

  const now = new Date();
  await db
    .update(CredentialTable)
    .set({
      status: "rejected",
      reviewNotes: reason.trim(),
      verifiedByUserId: null,
      verifiedAt: null,
      updatedAt: now,
    })
    .where(eq(CredentialTable.id, credentialId));

  return { ok: true, id: credentialId };
}

export async function updateCredentialStatusCore(
  agencyId: string,
  credentialId: string,
  status: CredentialStatus,
): Promise<CredentialOpResult> {
  const row = await getCredentialRow(agencyId, credentialId);
  if (!row) return { ok: false, status: 404, message: "Credential not found." };

  if (isDirectVerifiedStatusUpdate(status)) {
    return {
      ok: false,
      status: 400,
      message: "Use verify to set verified status.",
    };
  }

  if (status === "pending_review" && !canReopenReview(row.status)) {
    return {
      ok: false,
      status: 409,
      message: "Only rejected credentials can be reopened for review.",
    };
  }

  if (
    status !== "pending_review" &&
    !canManualStatusTransition(status) &&
    row.status !== status
  ) {
    return { ok: false, status: 409, message: "Invalid status transition." };
  }

  const updates: Partial<typeof CredentialTable.$inferInsert> = {
    status,
    updatedAt: new Date(),
  };

  if (status === "pending_review") {
    updates.verifiedByUserId = null;
    updates.verifiedAt = null;
    updates.reviewNotes = null;
  }

  await db.update(CredentialTable).set(updates).where(eq(CredentialTable.id, credentialId));

  return { ok: true, id: credentialId };
}

export async function deleteCredentialCore(
  agencyId: string,
  credentialId: string,
): Promise<CredentialOpResult> {
  const row = await getCredentialRow(agencyId, credentialId);
  if (!row) return { ok: false, status: 404, message: "Credential not found." };

  await db.delete(CredentialTable).where(eq(CredentialTable.id, credentialId));

  return { ok: true, id: credentialId };
}
