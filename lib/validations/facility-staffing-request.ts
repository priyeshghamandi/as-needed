import { z } from "zod";
import { WORKFORCE_PROFESSIONAL_ROLES } from "@/lib/validations/workforce-professional";
import {
  combineShiftDateTimes,
  isShiftDateInPast,
} from "@/lib/staffing-requests/shift-datetime";

export const FACILITY_STAFFING_PRIORITIES = ["normal", "high", "urgent"] as const;

export const facilityStaffingRequestSchema = z
  .object({
    title: z.string().trim().min(3, "Title must be at least 3 characters").max(200),
    roleNeeded: z.enum(WORKFORCE_PROFESSIONAL_ROLES, { message: "Select a role" }),
    specialty: z.string().trim().max(120).optional().or(z.literal("")),
    professionalsRequired: z
      .number({ error: "Professionals required is required" })
      .int()
      .min(1, "At least 1 professional required")
      .max(50, "At most 50 professionals"),
    shiftDate: z.string().min(1, "Shift date is required"),
    startTime: z.string().min(1, "Start time is required"),
    endTime: z.string().min(1, "End time is required"),
    priority: z.enum(FACILITY_STAFFING_PRIORITIES, { message: "Select priority" }),
    notes: z.string().trim().max(2000).optional().or(z.literal("")),
    facilityInstructions: z.string().trim().max(2000).optional().or(z.literal("")),
  })
  .superRefine((data, ctx) => {
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
  });

export type FacilityStaffingRequestInput = z.infer<typeof facilityStaffingRequestSchema>;

export function suggestFacilityRequestTitle(
  roleNeeded: FacilityStaffingRequestInput["roleNeeded"],
  facilityName: string,
): string {
  const roleLabel =
    roleNeeded === "rn"
      ? "RN"
      : roleNeeded === "cna"
        ? "CNA"
        : roleNeeded === "lpn"
          ? "LPN"
          : roleNeeded === "emt"
            ? "EMT"
            : roleNeeded.toUpperCase();
  return `${roleLabel} coverage — ${facilityName}`;
}
