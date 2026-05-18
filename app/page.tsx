import type { Metadata } from "next";
import { PublicHome } from "@/components/public/public-home";
import { PublicSiteFooter } from "@/components/public/public-site-footer";
import { PublicSiteHeader } from "@/components/public/public-site-header";

export const metadata: Metadata = {
  title: "Healthcare staffing operations platform",
  description:
    "Run agency staffing operations and let facilities discover professionals through the AsNeeded marketplace.",
};

export default function HomePage() {
  return (
    <div className="min-h-screen bg-paper text-ink-900 flex flex-col">
      <PublicSiteHeader activePath="/" />
      <main className="flex-1">
        <PublicHome />
      </main>
      <PublicSiteFooter />
    </div>
  );
}
