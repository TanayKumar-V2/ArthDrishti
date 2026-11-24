import Image from "next/image";
import Link from "next/link";
import { ArrowDownRight, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/Button";

export function Hero() {
  return (
    <section className="relative flex min-h-[calc(100dvh-72px)] items-center overflow-hidden bg-background pb-12 pt-20 sm:pb-14 sm:pt-20">
      <div className="mx-auto grid w-full max-w-7xl grid-cols-1 items-center gap-10 px-5 sm:px-8 lg:grid-cols-[0.88fr_1.12fr] lg:gap-14 xl:px-10">
        <div className="relative z-10 flex flex-col items-start gap-6">
          <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-primary">Financial intelligence for lending teams</p>
          <h1 className="max-w-[14ch] text-[2.8rem] font-semibold leading-[1.04] tracking-[-0.055em] text-foreground sm:text-5xl lg:text-[3.65rem]">
            Clarity for every credit decision.
          </h1>
          <p className="max-w-[48ch] text-[15px] leading-7 text-foreground-secondary sm:text-base">
            Credit risk, fraud signals, and cash flow forecasts, explained in one clear view.
          </p>
          <div className="flex flex-col gap-3 pt-1 sm:flex-row">
            <Button variant="primary" size="lg" asChild className="group rounded-full px-6 active:scale-[0.98]">
              <Link href="/dashboard" className="gap-2">
                Explore the platform
                <ArrowRight className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-0.5" />
              </Link>
            </Button>
            <Button variant="outline" size="lg" asChild className="rounded-full px-6 active:scale-[0.98]">
              <Link href="#process" className="gap-2">
                How it works
                <ArrowDownRight className="h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>

        <div className="relative mx-auto w-full max-w-[650px] lg:ml-auto">
          <div className="relative aspect-[1.08/1] overflow-hidden rounded-[1.35rem] border border-border/70 bg-surface-elevated sm:aspect-[1.22/1]">
            <Image
              src="https://images.unsplash.com/photo-1770626894265-bdb99db109f1"
              alt="Business owner working at a laptop in a bright office"
              fill
              preload
              sizes="(max-width: 1024px) 100vw, 55vw"
              className="object-cover object-center saturate-[0.82]"
            />
          </div>
        </div>
      </div>
    </section>
  );
}

export default Hero;
