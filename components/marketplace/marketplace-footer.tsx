import Link from "next/link";
import { MarketplaceLogo } from "@/components/marketplace/marketplace-logo";

export function MarketplaceFooter() {
  return (
    <footer className="border-t border-ink-200 bg-white mt-16">
      <div className="max-w-[1240px] mx-auto px-4 sm:px-8 py-10 grid grid-cols-1 md:grid-cols-3 gap-8 text-[13px]">
        <div className="space-y-3">
          <MarketplaceLogo />
          <p className="text-ink-600 max-w-sm">
            Discover healthcare professionals and submit staffing requests fulfilled by licensed
            agencies.
          </p>
        </div>
        <div>
          <h3 className="font-mono text-[10px] uppercase tracking-wider text-ink-500 mb-3">
            Discover
          </h3>
          <ul className="space-y-2 text-ink-700">
            <li>
              <Link href="/marketplace/search" className="hover:underline">
                Search professionals
              </Link>
            </li>
            <li>
              <Link href="/marketplace/categories" className="hover:underline">
                Browse categories
              </Link>
            </li>
          </ul>
        </div>
        <div>
          <h3 className="font-mono text-[10px] uppercase tracking-wider text-ink-500 mb-3">
            Platform
          </h3>
          <ul className="space-y-2 text-ink-700">
            <li>
              <Link href="/signup" className="hover:underline">
                Agency signup
              </Link>
            </li>
            <li>
              <Link href="/login" className="hover:underline">
                Sign in
              </Link>
            </li>
            <li>
              <Link href="/login" className="hover:underline">
                Agency sign in
              </Link>
            </li>
          </ul>
        </div>
      </div>
      <div className="max-w-[1240px] mx-auto px-4 sm:px-8 py-4 border-t border-ink-100 text-[12px] text-ink-500">
        © {new Date().getFullYear()} AsNeeded. Agency-mediated staffing only.
      </div>
    </footer>
  );
}
