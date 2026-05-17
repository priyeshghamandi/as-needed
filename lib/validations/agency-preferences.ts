import { z } from "zod";

const NOTIFICATION_FLOOR = ["info", "important", "urgent"] as const;

function isValidTimezone(tz: string): boolean {
  try {
    Intl.DateTimeFormat(undefined, { timeZone: tz });
    return true;
  } catch {
    return false;
  }
}

export const agencyPreferencesSchema = z.object({
  timezone: z
    .string()
    .min(1)
    .refine(isValidTimezone, "Select a valid timezone"),
  weekStartsOn: z.union([z.literal(0), z.literal(1)]),
  defaultNotificationPriorityFloor: z.enum(NOTIFICATION_FLOOR),
  showCriticalBannerOnDashboard: z.boolean(),
  dateFormat: z.enum(["mdy", "dmy"]),
});

export type AgencyPreferences = z.infer<typeof agencyPreferencesSchema>;

export const DEFAULT_AGENCY_PREFERENCES: AgencyPreferences = {
  timezone: "America/New_York",
  weekStartsOn: 0,
  defaultNotificationPriorityFloor: "important",
  showCriticalBannerOnDashboard: true,
  dateFormat: "mdy",
};

export function parseAgencyPreferences(
  raw: Record<string, unknown> | null | undefined,
): AgencyPreferences {
  const merged = { ...DEFAULT_AGENCY_PREFERENCES, ...(raw ?? {}) };
  const parsed = agencyPreferencesSchema.safeParse(merged);
  return parsed.success ? parsed.data : DEFAULT_AGENCY_PREFERENCES;
}

export function mergeAgencyPreferences(
  existing: Record<string, unknown> | null | undefined,
  patch: AgencyPreferences,
): AgencyPreferences {
  return parseAgencyPreferences({ ...(existing ?? {}), ...patch });
}
