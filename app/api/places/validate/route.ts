import { NextResponse } from "next/server";
import { z } from "zod";
import { geographicLocationSchema } from "@/lib/validations/geographic-location";
import {
  isWithinServiceArea,
  OUT_OF_SERVICE_AREA_MESSAGE,
  DEFAULT_SERVICE_AREA_RADIUS_MILES,
} from "@/lib/places/service-area-bounds";

const validateBodySchema = z.object({
  location: geographicLocationSchema,
  centerLat: z.number(),
  centerLng: z.number(),
  radiusMiles: z.number().positive().optional(),
});

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const parsed = validateBodySchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid request", details: parsed.error.flatten() },
      { status: 400 },
    );
  }

  const { location, centerLat, centerLng } = parsed.data;
  const radiusMiles =
    parsed.data.radiusMiles ?? DEFAULT_SERVICE_AREA_RADIUS_MILES;

  const valid = isWithinServiceArea(
    location,
    { latitude: centerLat, longitude: centerLng },
    radiusMiles,
  );

  if (!valid) {
    return NextResponse.json(
      {
        valid: false,
        code: "OUT_OF_SERVICE_AREA",
        error: OUT_OF_SERVICE_AREA_MESSAGE,
      },
      { status: 422 },
    );
  }

  return NextResponse.json({ valid: true, location });
}
