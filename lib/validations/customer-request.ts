import { z } from "zod";
import { WORKFORCE_PROFESSIONAL_ROLES } from "@/lib/validations/workforce-professional";
import { SHIFT_TYPES } from "@/lib/validations/staffing-request";

export const CUSTOMER_REQUEST_MAX_SELECTIONS = 5;

export const customerRequestCreateSchema = z
  .object({
    facilityId: z.string().uuid("Select a facility"),
    professionalIds: z
      .array(z.string().uuid())
      .min(1, "Select at least one professional")
      .max(CUSTOMER_REQUEST_MAX_SELECTIONS, "At most 5 professionals per request"),
    roleNeeded: z.enum(WORKFORCE_PROFESSIONAL_ROLES, { message: "Role is required" }),
    title: z.string().min(3, "Title must be at least 3 characters").max(200),
    availabilityStart: z.string().min(1, "Start date and time are required"),
    availabilityEnd: z.string().min(1, "End date and time are required"),
    shiftType: z.enum(SHIFT_TYPES).optional().or(z.literal("")),
    professionalsRequired: z.coerce
      .number()
      .int()
      .min(1)
      .max(CUSTOMER_REQUEST_MAX_SELECTIONS),
    notes: z.string().max(2000).optional().or(z.literal("")),
  })
  .superRefine((data, ctx) => {
    const start = new Date(data.availabilityStart);
    const end = new Date(data.availabilityEnd);
    if (Number.isNaN(start.getTime())) {
      ctx.addIssue({
        code: "custom",
        path: ["availabilityStart"],
        message: "Enter a valid start date and time",
      });
    }
    if (Number.isNaN(end.getTime())) {
      ctx.addIssue({
        code: "custom",
        path: ["availabilityEnd"],
        message: "Enter a valid end date and time",
      });
    }
    if (!Number.isNaN(start.getTime()) && !Number.isNaN(end.getTime()) && end <= start) {
      ctx.addIssue({
        code: "custom",
        path: ["availabilityEnd"],
        message: "End must be after start",
      });
    }
    if (
      !Number.isNaN(start.getTime()) &&
      start.getTime() < Date.now() - 60_000
    ) {
      ctx.addIssue({
        code: "custom",
        path: ["availabilityStart"],
        message: "Availability window cannot start in the past",
      });
    }
    if (data.professionalsRequired > data.professionalIds.length) {
      ctx.addIssue({
        code: "custom",
        path: ["professionalsRequired"],
        message: "Professionals required cannot exceed selected professionals",
      });
    }
  });

export type CustomerRequestCreateInput = z.infer<typeof customerRequestCreateSchema>;

export function assertSameProfessionalRole(roles: string[]): boolean {
  if (roles.length === 0) return true;
  const first = roles[0];
  return roles.every((r) => r === first);
}
