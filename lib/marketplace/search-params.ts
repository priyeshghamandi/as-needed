import { z } from "zod";
import { WORKFORCE_PROFESSIONAL_ROLES } from "@/lib/validations/workforce-professional";
import type { CustomerLocationContext } from "@/lib/marketplace/types";
import { isCustomerLocationValid } from "@/lib/marketplace/geo-eligibility";

export const MARKETPLACE_URGENCY_VALUES = ["asap", "this_week", "flexible"] as const;
export const MARKETPLACE_SORT_VALUES = ["relevance", "recently_active"] as const;
export const MARKETPLACE_SHIFT_TYPES = ["day", "night", "weekend", "on_call"] as const;

function todayIsoDateLocal(): string {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

const roleEnum = z.enum(WORKFORCE_PROFESSIONAL_ROLES);

const ROLE_ALIASES: Record<string, z.infer<typeof roleEnum>> = {
  rn: "rn",
  RN: "rn",
  cna: "cna",
  CNA: "cna",
  lpn: "lpn",
  LPN: "lpn",
  emt: "emt",
  EMT: "emt",
  cnm: "cnm",
  CNM: "cnm",
  cns: "cns",
  CNS: "cns",
  other: "other",
};

export function normalizeMarketplaceRoleParam(
  raw: string | null | undefined,
): z.infer<typeof roleEnum> | null {
  if (!raw?.trim()) return null;
  const key = raw.trim();
  return ROLE_ALIASES[key] ?? ROLE_ALIASES[key.toLowerCase()] ?? null;
}

export const marketplaceSearchQuerySchema = z
  .object({
    role: z.string().min(1, "Select a role"),
    lat: z.coerce.number().finite().optional(),
    lng: z.coerce.number().finite().optional(),
    needStart: z
      .string()
      .regex(/^\d{4}-\d{2}-\d{2}$/, "Use YYYY-MM-DD")
      .optional(),
    needEnd: z
      .string()
      .regex(/^\d{4}-\d{2}-\d{2}$/, "Use YYYY-MM-DD")
      .optional(),
    urgency: z.enum(MARKETPLACE_URGENCY_VALUES).optional(),
    shiftType: z.enum(MARKETPLACE_SHIFT_TYPES).optional(),
    sort: z.enum(MARKETPLACE_SORT_VALUES).default("relevance"),
    page: z.coerce.number().int().min(1).default(1),
  })
  .superRefine((data, ctx) => {
    const role = normalizeMarketplaceRoleParam(data.role);
    if (!role) {
      ctx.addIssue({ code: "custom", path: ["role"], message: "Select a valid role" });
    }

    const hasWindow = Boolean(data.needStart && data.needEnd);
    const hasUrgency = Boolean(data.urgency);
    if (!hasWindow && !hasUrgency) {
      ctx.addIssue({
        code: "custom",
        path: ["urgency"],
        message: "Add an availability window or select urgency",
      });
    }

    if (data.needStart && !data.needEnd) {
      ctx.addIssue({
        code: "custom",
        path: ["needEnd"],
        message: "End date is required when start date is set",
      });
    }

    if (data.needEnd && !data.needStart) {
      ctx.addIssue({
        code: "custom",
        path: ["needStart"],
        message: "Start date is required when end date is set",
      });
    }

    if (data.needStart && data.needEnd) {
      const today = todayIsoDateLocal();
      if (data.needStart < today) {
        ctx.addIssue({
          code: "custom",
          path: ["needStart"],
          message: "Start date cannot be in the past",
        });
      }
      const start = new Date(`${data.needStart}T00:00:00`);
      const end = new Date(`${data.needEnd}T00:00:00`);
      if (end < start) {
        ctx.addIssue({
          code: "custom",
          path: ["needEnd"],
          message: "End date must be on or after start date",
        });
      }
      const spanDays = (end.getTime() - start.getTime()) / 86_400_000;
      if (spanDays > 30) {
        ctx.addIssue({
          code: "custom",
          path: ["needEnd"],
          message: "Availability window cannot exceed 30 days",
        });
      }
    }
  });

export type MarketplaceSearchQuery = z.infer<typeof marketplaceSearchQuerySchema>;

export type ParsedMarketplaceSearch = {
  role: z.infer<typeof roleEnum>;
  customerLocation: CustomerLocationContext;
  needStart: string | null;
  needEnd: string | null;
  urgency: (typeof MARKETPLACE_URGENCY_VALUES)[number] | null;
  shiftType: (typeof MARKETPLACE_SHIFT_TYPES)[number] | null;
  sort: (typeof MARKETPLACE_SORT_VALUES)[number];
  page: number;
};

export function parseMarketplaceSearchInput(
  input: MarketplaceSearchQuery,
  cookieLocation: CustomerLocationContext | null,
): { ok: true; data: ParsedMarketplaceSearch } | { ok: false; error: string } {
  const parsed = marketplaceSearchQuerySchema.safeParse(input);
  if (!parsed.success) {
    const first = parsed.error.issues[0]?.message ?? "Invalid search parameters";
    return { ok: false, error: first };
  }

  const role = normalizeMarketplaceRoleParam(parsed.data.role);
  if (!role) return { ok: false, error: "Select a valid role" };

  const customerLocation: CustomerLocationContext | null =
    isCustomerLocationValid({
      latitude: parsed.data.lat!,
      longitude: parsed.data.lng!,
    })
      ? { latitude: parsed.data.lat!, longitude: parsed.data.lng! }
      : cookieLocation;

  if (!isCustomerLocationValid(customerLocation)) {
    return { ok: false, error: "Facility location is required to search" };
  }

  return {
    ok: true,
    data: {
      role,
      customerLocation,
      needStart: parsed.data.needStart ?? null,
      needEnd: parsed.data.needEnd ?? null,
      urgency: parsed.data.urgency ?? null,
      shiftType: parsed.data.shiftType ?? null,
      sort: parsed.data.sort,
      page: parsed.data.page,
    },
  };
}

export function marketplaceSearchQueryFromUrl(
  searchParams: URLSearchParams,
): MarketplaceSearchQuery {
  return {
    role: searchParams.get("role") ?? "",
    lat: searchParams.get("lat") ? Number(searchParams.get("lat")) : undefined,
    lng: searchParams.get("lng") ? Number(searchParams.get("lng")) : undefined,
    needStart: searchParams.get("needStart") ?? undefined,
    needEnd: searchParams.get("needEnd") ?? undefined,
    urgency:
      (searchParams.get("urgency") as (typeof MARKETPLACE_URGENCY_VALUES)[number] | null) ??
      undefined,
    shiftType:
      (searchParams.get("shiftType") as (typeof MARKETPLACE_SHIFT_TYPES)[number] | null) ??
      undefined,
    sort:
      (searchParams.get("sort") as (typeof MARKETPLACE_SORT_VALUES)[number] | null) ??
      "relevance",
    page: searchParams.get("page") ? Number(searchParams.get("page")) : 1,
  };
}
