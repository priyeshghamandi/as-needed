import { NextResponse } from "next/server";
import {
  ForbiddenError,
  UnauthorizedError,
} from "@/lib/auth/authorization";
import { requireLinkedProviderContext } from "@/lib/auth/provider-context";
import {
  listProviderShifts,
  type ProviderShiftTab,
} from "@/lib/provider/provider-shifts";

const TABS: ProviderShiftTab[] = ["invites", "upcoming", "past"];

export async function GET(request: Request) {
  try {
    const { professional } = await requireLinkedProviderContext();
    const { searchParams } = new URL(request.url);
    const tabParam = searchParams.get("tab") ?? "invites";
    const tab = TABS.includes(tabParam as ProviderShiftTab)
      ? (tabParam as ProviderShiftTab)
      : "invites";

    const items = await listProviderShifts(professional.id, tab);
    return NextResponse.json({ tab, items });
  } catch (error) {
    if (error instanceof UnauthorizedError) {
      return NextResponse.json({ error: error.message }, { status: 401 });
    }
    if (error instanceof ForbiddenError) {
      return NextResponse.json({ error: error.message }, { status: 403 });
    }
    console.error("GET /api/provider/shifts failed", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
