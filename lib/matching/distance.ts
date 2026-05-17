export { distanceMiles, isWithinServiceArea } from "@/lib/places/service-area-bounds";

export function parseCoordinate(value: string | null | undefined): number | null {
  if (value == null || value === "") return null;
  const n = Number(value);
  return Number.isFinite(n) ? n : null;
}
