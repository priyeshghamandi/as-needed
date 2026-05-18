export function generatePublicSlug(
  firstName: string,
  lastName: string,
  professionalId: string,
): string {
  const slugBase = `${firstName}-${lastName}-${professionalId.slice(0, 8)}`
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 120);

  return slugBase || `professional-${professionalId.slice(0, 8)}`;
}
