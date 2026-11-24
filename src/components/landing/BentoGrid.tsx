import Link from "next/link";
import { Activity, ArrowUpRight, Brain, LineChart, ShieldCheck } from "lucide-react";
import { Card } from "@/components/ui/Card";

const capabilities = [
  {
    title: "Credit risk",
    description: "Assess repayment risk with signals that can be traced back to the borrower profile.",
    href: "/credit-risk",
    icon: LineChart,
    size: "sm:col-span-2 lg:col-span-7",
    tone: "bg-primary/[0.045]",
  },
  {
    title: "Fraud monitoring",
    description: "Surface unusual transaction patterns for review while they are still actionable.",
    href: "/fraud",
    icon: ShieldCheck,
    size: "sm:col-span-1 lg:col-span-5",
    tone: "bg-surface",
  },
  {
    title: "Explainable AI",
    description: "Review the factors behind a model assessment in plain language.",
    href: "/explainable-ai",
    icon: Brain,
    size: "sm:col-span-1 lg:col-span-4",
    tone: "bg-surface-elevated/60",
  },
  {
    title: "Cash flow forecasts",
    description: "Track expected inflows and outflows to understand near-term liquidity.",
    href: "/cash-flow",
    icon: Activity,
    size: "sm:col-span-1 lg:col-span-3",
    tone: "bg-surface",
  },
  {
    title: "Financial health",
    description: "Bring spending, savings, and cash flow signals into one borrower view.",
    href: "/financial-health",
    icon: LineChart,
    size: "sm:col-span-1 lg:col-span-5",
    tone: "bg-primary/[0.045]",
  },
];

export function BentoGrid() {
  return (
    <section id="platform" className="bg-background py-20 sm:py-24">
      <div className="mx-auto max-w-7xl px-5 sm:px-8 xl:px-10">
        <div className="mb-10 max-w-2xl sm:mb-12">
          <p className="mb-3 text-[11px] font-semibold uppercase tracking-[0.15em] text-primary">Platform</p>
          <h2 className="text-3xl font-semibold tracking-[-0.04em] text-foreground sm:text-4xl">A clearer view of financial risk.</h2>
          <p className="mt-4 max-w-[58ch] text-[14px] leading-6 text-foreground-secondary">Move from raw financial activity to decisions your team can review and explain.</p>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-5 lg:grid-cols-12">
          {capabilities.map((capability) => {
            const Icon = capability.icon;
            return (
              <Link key={capability.title} href={capability.href} className={`group rounded-[1.15rem] outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 ${capability.size}`}>
                <Card className={`flex h-full min-h-[190px] flex-col justify-between rounded-[1.15rem] border-border/70 p-5 transition-colors duration-200 group-hover:border-primary/35 group-hover:bg-surface sm:p-6 ${capability.tone}`}>
                  <div className="flex items-start justify-between gap-4">
                    <span className="grid h-10 w-10 place-items-center rounded-xl border border-primary/15 bg-background text-primary">
                      <Icon className="h-[18px] w-[18px]" strokeWidth={1.7} />
                    </span>
                    <ArrowUpRight className="h-4 w-4 text-foreground-muted transition-transform duration-200 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-primary" />
                  </div>
                  <div className="mt-8">
                    <h3 className="text-[17px] font-semibold tracking-[-0.02em] text-foreground">{capability.title}</h3>
                    <p className="mt-2 max-w-[45ch] text-[13px] leading-6 text-foreground-secondary">{capability.description}</p>
                  </div>
                </Card>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}

export default BentoGrid;
