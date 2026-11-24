const capabilities = [
  "Credit and default risk",
  "Transaction monitoring",
  "Cash flow forecasts",
  "Explainable model outputs",
];

export function LiveIntelligenceStrip() {
  return (
    <section aria-label="Platform capabilities" className="border-y border-border/70 bg-surface">
      <div className="mx-auto grid max-w-7xl grid-cols-2 px-5 py-5 sm:px-8 lg:grid-cols-4 lg:px-10">
        {capabilities.map((capability, index) => (
          <div key={capability} className={`flex min-h-12 items-center justify-center px-3 text-center text-[12px] font-medium text-foreground-secondary sm:text-[13px] ${index % 2 === 1 ? "border-l border-border/70" : ""} ${index > 0 ? "lg:border-l" : ""}`}>
            {capability}
          </div>
        ))}
      </div>
    </section>
  );
}

export default LiveIntelligenceStrip;
