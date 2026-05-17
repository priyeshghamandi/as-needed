import Link from "next/link";
import { Icon } from "@/components/primitives";

export function OnboardingBanner() {
  return (
    <div className="border-b border-amber-200 bg-amber-50 px-6 py-3">
      <div className="max-w-[1240px] mx-auto flex items-center gap-3">
        <span className="w-6 h-6 rounded-full bg-amber-100 text-amber-700 inline-flex items-center justify-center shrink-0">
          <Icon name="alert-triangle" className="w-3.5 h-3.5" />
        </span>
        <p className="text-[13px] text-amber-900 flex-1">
          <span className="font-medium">Finish setting up your agency</span> — complete your profile and service area to unlock staffing requests and auto-matching.
        </p>
        <Link
          href="/onboarding"
          className="inline-flex items-center gap-1.5 h-8 px-3 rounded-full bg-amber-700 text-white text-[12px] font-medium hover:bg-amber-800 shrink-0"
        >
          Complete setup <Icon name="arrow-right" className="w-3.5 h-3.5" />
        </Link>
      </div>
    </div>
  );
}
