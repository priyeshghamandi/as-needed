import { z } from "zod";
import { WORKFORCE_PROFESSIONAL_ROLES } from "@/lib/validations/workforce-professional";
import {
  combineShiftDateTimes,
  isShiftDateInPast,
} from "@/lib/staffing-requests/shift-datetime";

export const STAFFING_PRIORITIES = ["normal", "high", "urgent"] as const;
export const SHIFT_TYPES = ["day", "evening", "night", "on_call", "custom"] as const;

const credentialsSchema = z
  .array(z.string().trim().min(2, "Each credential must be at least 2 characters").max(80))
  .max(20, "At most 20 credentials");

const sharedFields = {
  facilityId: z.string().uuid("Select a facility"),
  facilityUnit: z.string().max(120).optional().or(z.literal("")),
  title: z.string().min(3, "Title must be at least 3 characters").max(200),
  roleNeeded: z.enum(WORKFORCE_PROFESSIONAL_ROLES, { message: "Select a role" }),
  specialty: z.string().max(120).optional().or(z.literal("")),
  professionalsRequired: z.coerce
    .number()
    .int()
    .min(1, "At least 1 professional required")
    .max(50, "At most 50 professionals"),
  shiftDate: z.string().min(1, "Shift date is required"),
  startTime: z.string().min(1, "Start time is required"),
  endTime: z.string().min(1, "End time is required"),
  shiftType: z.enum(SHIFT_TYPES).optional().or(z.literal("")),
  priority: z.enum(STAFFING_PRIORITIES, { message: "Select priority" }),
  requiredCredentials: credentialsSchema.optional(),
  minYearsExperience: z.coerce
    .number()
    .int()
    .min(0)
    .max(40)
    .optional()
    .or(z.literal("").transform(() => undefined)),
  assignedCoordinatorId: z.string().uuid().optional().or(z.literal("")),
  notes: z.string().max(5000).optional().or(z.literal("")),
  facilityInstructions: z.string().max(5000).optional().or(z.literal("")),
};

function shiftRefine(
  data: {
    shiftDate: string;
    startTime: string;
    endTime: string;
  },
  ctx: z.RefinementCtx,
) {
  try {
    combineShiftDateTimes(data.shiftDate, data.startTime, data.endTime);
  } catch {
    ctx.addIssue({
      code: "custom",
      path: ["endTime"],
      message: "Enter valid start and end times",
    });
    return;
  }
  if (isShiftDateInPast(data.shiftDate, data.startTime)) {
    ctx.addIssue({
      code: "custom",
      path: ["shiftDate"],
      message: "Shift date cannot be in the past",
    });
  }
}

export const staffingRequestCreateSchema = z.object(sharedFields).superRefine(shiftRefine);

export const staffingRequestDraftSchema = z.object({
  facilityId: z.string().uuid("Select a facility"),
  title: z.string().min(3, "Title must be at least 3 characters").max(200),
  roleNeeded: z.enum(WORKFORCE_PROFESSIONAL_ROLES).optional(),
  specialty: z.string().max(120).optional().or(z.literal("")),
  professionalsRequired: z.coerce.number().int().min(1).max(50).optional(),
  priority: z.enum(STAFFING_PRIORITIES).optional(),
  assignedCoordinatorId: z.string().uuid().optional().or(z.literal("")),
  notes: z.string().max(5000).optional().or(z.literal("")),
});

export const staffingRequestFormSchema = z
  .object({
    ...sharedFields,
    saveAsDraft: z.boolean().default(false),
  })
  .superRefine((data, ctx) => {
    if (data.saveAsDraft) return;
    shiftRefine(data, ctx);
  });

export type StaffingRequestCreateInput = z.infer<typeof staffingRequestCreateSchema>;
export type StaffingRequestDraftInput = z.infer<typeof staffingRequestDraftSchema>;
export type StaffingRequestFormInput = z.infer<typeof staffingRequestFormSchema>;

export const updateStaffingRequestSchema = z.object({
  title: z.string().min(3).max(200).optional(),
  specialty: z.string().max(120).optional().or(z.literal("")),
  professionalsRequired: z.coerce.number().int().min(1).max(50).optional(),
  priority: z.enum(STAFFING_PRIORITIES).optional(),
  notes: z.string().max(5000).optional().or(z.literal("")),
  facilityInstructions: z.string().max(5000).optional().or(z.literal("")),
  assignedCoordinatorId: z.string().uuid().optional().nullable(),
});

export type UpdateStaffingRequestInput = z.infer<typeof updateStaffingRequestSchema>;

export const transitionStaffingRequestSchema = z.object({
  status: z.enum([
    "draft",
    "open",
    "matching",
    "partially_filled",
    "confirmed",
    "at_risk",
    "completed",
    "cancelled",
  ]),
});
