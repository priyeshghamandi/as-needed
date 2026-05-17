import { z } from "zod";

const inviteRoles = [
  "agency_admin",
  "staffing_coordinator",
  "recruiter",
  "compliance_manager",
  "provider",
  "facility_user",
] as const;

const agencyStaffRoles = [
  "agency_admin",
  "staffing_coordinator",
  "recruiter",
  "compliance_manager",
] as const;

export const createInviteSchema = z
  .object({
    email: z
      .string()
      .trim()
      .toLowerCase()
      .pipe(z.email({ message: "Enter a valid email" })),
    role: z.enum(inviteRoles),
    inviteType: z.enum(["agency_staff", "provider", "facility_user"]),
    facilityId: z.string().uuid().optional(),
  })
  .superRefine((data, ctx) => {
    if (data.inviteType === "agency_staff") {
      if (!agencyStaffRoles.includes(data.role as (typeof agencyStaffRoles)[number])) {
        ctx.addIssue({
          code: "custom",
          path: ["role"],
          message: "Invalid role for agency staff invite",
        });
      }
    }

    if (data.inviteType === "provider" && data.role !== "provider") {
      ctx.addIssue({
        code: "custom",
        path: ["role"],
        message: "Provider invites must use the provider role",
      });
    }

    if (data.inviteType === "facility_user") {
      if (data.role !== "facility_user") {
        ctx.addIssue({
          code: "custom",
          path: ["role"],
          message: "Facility invites must use the facility_user role",
        });
      }
      if (!data.facilityId) {
        ctx.addIssue({
          code: "custom",
          path: ["facilityId"],
          message: "Facility is required for facility user invites",
        });
      }
    }
  });

export type CreateInviteInput = z.infer<typeof createInviteSchema>;
