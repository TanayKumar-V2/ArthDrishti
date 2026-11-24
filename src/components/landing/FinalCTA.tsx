import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/Button";

export function FinalCTA() {
  return (
    <section className="border-t border-border/70 bg-surface py-16 sm:py-20">
      <div className="mx-auto flex max-w-7xl flex-col gap-7 px-5 sm:px-8 md:flex-row md:items-end md:justify-between xl:px-10">
        <div className="max-w-2xl">
          <h2 className="text-3xl font-semibold tracking-[-0.04em] text-foreground sm:text-4xl">Make room for better decisions.</h2>
          <p className="mt-4 max-w-[55ch] text-[14px] leading-6 text-foreground-secondary">Talk with our team about bringing clearer financial intelligence into your lending workflow.</p>
        </div>
        <Button variant="outline" size="lg" asChild className="group w-full rounded-full px-6 sm:w-auto active:scale-[0.98]">
          <Link href="mailto:contact@arthdrishti.com" className="gap-2">
            Contact the team
            <ArrowRight className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-0.5" />
          </Link>
        </Button>
      </div>
    </section>
  );
}

export default FinalCTA;
