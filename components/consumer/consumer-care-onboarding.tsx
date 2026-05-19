"use client";

import Link from "next/link";

export function ConsumerCareOnboarding({ userName }: { userName: string }) {
  return (
    <div className="min-h-screen bg-paper flex items-center justify-center px-4">
      <div className="max-w-md text-center space-y-4">
        <h1 className="text-[24px] font-medium tracking-tight">
          Hi {userName}, we need your care location
        </h1>
        <p className="text-[14px] text-ink-600 leading-relaxed">
          Your account is missing a home care site. Please contact support or sign up again
          with a valid home address.
        </p>
        <Link
          href="/signup/care"
          className="inline-flex h-10 items-center px-5 rounded-full bg-ink-900 text-paper text-[13px] font-medium"
        >
          Back to signup
        </Link>
      </div>
    </div>
  );
}
