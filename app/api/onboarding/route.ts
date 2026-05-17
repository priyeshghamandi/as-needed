import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { requireAuthContext, assertCanManageOnboarding } from "@/lib/auth/authorization";
import { db } from "@/drizzle/db";
import { AgencyTable, FacilityTable, HealthcareProfessionalTable } from "@/drizzle/schema";

export async function GET() {
  try {
    const { context } = await requireAuthContext();
    const agencyId = context.agencyId;

    if (!agencyId) {
      return NextResponse.json({ error: "Agency context required" }, { status: 403 });
    }

    await assertCanManageOnboarding(context.userId, agencyId);

    const agencies = await db
      .select({
        id: AgencyTable.id,
        name: AgencyTable.name,
        phone: AgencyTable.phone,
        website: AgencyTable.website,
        logoUrl: AgencyTable.logoUrl,
        description: AgencyTable.description,
        staffingSpecialties: AgencyTable.staffingSpecialties,
        operationalContactName: AgencyTable.operationalContactName,
        operationalContactEmail: AgencyTable.operationalContactEmail,
        serviceAreaRadiusMiles: AgencyTable.serviceAreaRadiusMiles,
        primaryServiceAreaName: AgencyTable.primaryServiceAreaName,
        primaryServiceAreaPlaceId: AgencyTable.primaryServiceAreaPlaceId,
        primaryServiceAreaCity: AgencyTable.primaryServiceAreaCity,
        primaryServiceAreaState: AgencyTable.primaryServiceAreaState,
        primaryServiceAreaCountry: AgencyTable.primaryServiceAreaCountry,
        primaryServiceAreaLat: AgencyTable.primaryServiceAreaLat,
        primaryServiceAreaLng: AgencyTable.primaryServiceAreaLng,
        onboardingCurrentStep: AgencyTable.onboardingCurrentStep,
        onboardingCompletedAt: AgencyTable.onboardingCompletedAt,
        onboardingProgress: AgencyTable.onboardingProgress,
      })
      .from(AgencyTable)
      .where(eq(AgencyTable.id, agencyId))
      .limit(1);

    const agency = agencies[0];
    if (!agency) {
      return NextResponse.json({ error: "Agency not found" }, { status: 404 });
    }

    const [professionalsResult, facilitiesResult] = await Promise.all([
      db
        .select({ id: HealthcareProfessionalTable.id })
        .from(HealthcareProfessionalTable)
        .where(eq(HealthcareProfessionalTable.agencyId, agencyId)),
      db
        .select({ id: FacilityTable.id })
        .from(FacilityTable)
        .where(eq(FacilityTable.agencyId, agencyId)),
    ]);

    return NextResponse.json({
      agency,
      professionalsCount: professionalsResult.length,
      facilitiesCount: facilitiesResult.length,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unauthorized";
    const status = message.includes("Only agency") ? 403 : 401;
    return NextResponse.json({ error: message }, { status });
  }
}
