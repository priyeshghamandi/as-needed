/** True when two time ranges overlap (touching endpoints are not overlap). */
export function shiftsOverlap(
  aStart: Date,
  aEnd: Date,
  bStart: Date,
  bEnd: Date,
): boolean {
  return aStart < bEnd && bStart < aEnd;
}

export function availabilityBlocksOverlap(
  aStart: Date,
  aEnd: Date,
  bStart: Date,
  bEnd: Date,
): boolean {
  return shiftsOverlap(aStart, aEnd, bStart, bEnd);
}
