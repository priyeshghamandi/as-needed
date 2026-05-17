export interface FillRateInput {
  professionalsRequired: number;
  filledCount: number;
}

export function computeFillRate(requests: FillRateInput[]): number {
  if (requests.length === 0) return 0;
  const requiredSlots = requests.reduce((sum, r) => sum + r.professionalsRequired, 0);
  if (requiredSlots === 0) return 0;
  const filledSlots = requests.reduce(
    (sum, r) => sum + Math.min(r.filledCount, r.professionalsRequired),
    0,
  );
  return Math.round((filledSlots / requiredSlots) * 100);
}
