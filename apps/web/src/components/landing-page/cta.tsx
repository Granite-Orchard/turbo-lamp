import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";

export function CTA() {
  return (
    <section className="border-y border-border/50 bg-secondary/20 py-20 md:py-32">
      <div className="mx-auto max-w-6xl px-6">
        <div className="relative overflow-hidden rounded-2xl border border-border/50 bg-card p-8 md:p-12 lg:p-16">
          {/* Background accent */}
          <div className="pointer-events-none absolute -right-20 -top-20 h-64 w-64 rounded-full bg-accent/10 blur-3xl" />
          <div className="pointer-events-none absolute -bottom-20 -left-20 h-64 w-64 rounded-full bg-accent/10 blur-3xl" />

          <div className="relative text-center">
            <h2 className="text-balance text-3xl font-bold text-foreground md:text-4xl lg:text-5xl">
              Ready to eliminate scheduling friction?
            </h2>
            <p className="mx-auto mt-4 max-w-2xl text-pretty text-lg text-muted-foreground">
              Join 50,000+ teams who have reclaimed their time with Veen.
              Start for free, no credit card required.
            </p>
            <div className="mt-8 flex flex-col items-center justify-center gap-4 sm:flex-row">
              <Button size="lg" className="gap-2">
                Get started for free
                <ArrowRight className="h-4 w-4" />
              </Button>
              <Button variant="outline" size="lg">
                Talk to sales
              </Button>
            </div>
            <p className="mt-6 text-sm text-muted-foreground">
              Free forever for individuals. Team plans start at $8/user/month.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
