export function shouldMarkRequestAtRisk(
  filledCount: number,
  professionalsRequired: number,
  earliestShiftStart: Date | null,
  now: Date = new Date(),
): boolean {
  if (filledCount >= professionalsRequired) return false;
  if (!earliestShiftStart) return false;
  const msUntilStart = earliestShiftStart.getTime() - now.getTime();
  return msUntilStart > 0 && msUntilStart < 24 * 60 * 60 * 1000;
}
