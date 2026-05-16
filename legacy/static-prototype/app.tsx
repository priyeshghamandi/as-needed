// App composition
declare const React: any;
declare const ReactDOM: any;
declare const window: any;

(() => {
const {
  TopNav, Hero, TrustBar, Problems, PlatformOverview, MultiUser,
  FeatureGrid, Workflow, Metrics, Trust, FinalCTA, Footer,
} = window;

function App() {
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

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(<App />);
})();
