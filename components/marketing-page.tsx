"use client";

import {
  TopNav,
  Hero,
  TrustBar,
  Problems,
  PlatformOverview,
  MultiUser,
  FeatureGrid,
  Workflow,
  Metrics,
  Trust,
  FinalCTA,
  Footer,
} from "@/components/sections";

export function MarketingPage() {
  return (
    <div className="min-h-screen bg-paper text-ink-900">
      <TopNav />
      <main>
        <Hero />
        <TrustBar />
        <Problems />
        <PlatformOverview />
        <MultiUser />
        <FeatureGrid />
        <Workflow />
        <Metrics />
        <Trust />
        <FinalCTA />
      </main>
      <Footer />
    </div>
  );
}
