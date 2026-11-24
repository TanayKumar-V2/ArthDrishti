const controls = [
  {
    title: "Data handling",
    items: [
      { name: "Encryption", description: "Protect financial data in transit and at rest." },
      { name: "Privacy-aware processing", description: "Limit exposure of personal identifiers during analysis." },
    ],
  },
  {
    title: "Decision governance",
    items: [
      { name: "Explainable assessments", description: "Review the factors associated with each model output." },
      { name: "Model monitoring", description: "Track model behavior as data patterns change." },
    ],
  },
  {
    title: "Access and oversight",
    items: [
      { name: "Role-based permissions", description: "Separate access for customers, lending teams, and administrators." },
      { name: "Audit history", description: "Keep a record of access and changes for review." },
    ],
  },
];

export function SecurityTrust() {
  return (
    <section id="security" className="bg-background py-20 sm:py-24">
      <div className="mx-auto max-w-7xl px-5 sm:px-8 xl:px-10">
        <div className="max-w-2xl">
          <h2 className="text-3xl font-semibold tracking-[-0.04em] text-foreground sm:text-4xl">Trust is built into the review.</h2>
          <p className="mt-4 text-[14px] leading-6 text-foreground-secondary">Clear permissions, traceable decisions, and careful handling of financial data.</p>
        </div>

        <div className="mt-10 grid grid-cols-1 gap-8 border-t border-border/70 pt-8 md:grid-cols-3 md:gap-10">
          {controls.map((group) => (
            <div key={group.title} className="space-y-5">
              <h3 className="text-[14px] font-semibold text-foreground">{group.title}</h3>
              <div className="space-y-5">
                {group.items.map((item) => (
                  <div key={item.name}>
                    <p className="text-[13px] font-medium text-foreground">{item.name}</p>
                    <p className="mt-1.5 text-[12px] leading-5 text-foreground-secondary">{item.description}</p>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export default SecurityTrust;
