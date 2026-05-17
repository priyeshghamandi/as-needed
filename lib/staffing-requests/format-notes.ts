export function formatFacilityInstructions(
  unit: string | undefined,
  instructions: string | undefined,
): string | null {
  const trimmedUnit = unit?.trim();
  const trimmedInstructions = instructions?.trim();
  if (!trimmedUnit && !trimmedInstructions) return null;
  if (trimmedUnit && trimmedInstructions) {
    return `Unit/Dept: ${trimmedUnit}\n${trimmedInstructions}`;
  }
  if (trimmedUnit) return `Unit/Dept: ${trimmedUnit}`;
  return trimmedInstructions ?? null;
}

export function appendMinExperienceToNotes(
  notes: string | undefined,
  minYears: number | undefined,
): string | null {
  const base = notes?.trim() ?? "";
  if (minYears == null || Number.isNaN(minYears)) {
    return base || null;
  }
  const line = `Min experience: ${minYears} years`;
  if (!base) return line;
  if (base.includes(line)) return base;
  return `${base}\n${line}`;
}
