export function groupSelectionAgencyIds(
  selections: { agencyId: string }[],
): string[] {
  return [...new Set(selections.map((s) => s.agencyId).filter(Boolean))];
}
