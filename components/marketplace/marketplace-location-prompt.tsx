"use client";

import { useEffect, useState } from "react";
import {
  MARKETPLACE_LOCATION_COOKIE,
  parseMarketplaceLocationCookie,
} from "@/lib/marketplace/location-cookie";

export function MarketplaceLocationPrompt() {
  const [displayName, setDisplayName] = useState<string | null>(null);
  const [checked, setChecked] = useState(false);

  useEffect(() => {
    const match = document.cookie
      .split("; ")
      .find((row) => row.startsWith(`${MARKETPLACE_LOCATION_COOKIE}=`));
    if (!match) {
      setChecked(true);
      return;
    }
    const raw = decodeURIComponent(match.split("=").slice(1).join("="));
    const parsed = parseMarketplaceLocationCookie(raw);
    setDisplayName(parsed?.displayName ?? null);
    setChecked(true);
  }, []);

  if (!checked) return null;

  if (displayName) {
    return (
      <p className="mt-6 inline-flex items-center gap-2 rounded-full border border-teal-200 bg-teal-50 px-4 py-2 text-[13px] text-teal-900">
        <span className="w-1.5 h-1.5 rounded-full bg-teal-600" aria-hidden />
        Showing professionals near <span className="font-medium">{displayName}</span>
      </p>
    );
  }

  return (
    <div
      className="mt-6 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-[13px] text-amber-900 max-w-xl"
      role="status"
    >
      Set your <span className="font-medium">facility location</span> in the header to browse
      nurses and other professionals available in your area.
    </div>
  );
}
