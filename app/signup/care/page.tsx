import Link from "next/link";
import { ConsumerCareSignupForm } from "@/components/consumer-care-signup-form";
import { AsNeededLogo } from "@/components/public/as-needed-logo";

export const metadata = {
  title: "Find home care — Sign up",
};

type PageProps = {
  searchParams: Promise<{ callbackUrl?: string }>;
};

export default async function SignupCarePage({ searchParams }: PageProps) {
  const { callbackUrl } = await searchParams;

  return (
    <div className="min-h-screen bg-paper text-ink-900">
      <header className="border-b border-ink-200/70">
        <div className="max-w-[1100px] mx-auto px-4 sm:px-8 h-14 flex items-center justify-between">
          <Link href="/">
            <AsNeededLogo />
          </Link>
          <Link href="/login" className="text-[13px] text-ink-700 hover:underline">
            Sign in
          </Link>
        </div>
      </header>

      <main className="max-w-[1100px] mx-auto px-4 sm:px-8 py-12">
        <p className="text-[11px] font-mono uppercase tracking-wider text-teal-700">
          Home care
        </p>
        <h1 className="mt-3 text-[32px] font-medium tracking-tight">
          Create your care account
        </h1>
        <p className="mt-2 text-[15px] text-ink-600 max-w-xl leading-relaxed">
          Sign up to browse local professionals and submit staffing requests. Agencies
          coordinate fulfillment — you are not hiring directly on AsNeeded.
        </p>
        <div className="mt-8">
          <ConsumerCareSignupForm callbackUrl={callbackUrl} />
        </div>
      </main>
    </div>
  );
}
