"use client";

import { useActionState } from "react";
import Image from "next/image";
import type { Waitlist } from "@/lib/types";

const benefits = [
  {
    icon: "/icons/queue-list.svg",
    title: "Early Access",
    description: "Skip the queue and get access before public launch.",
  },
  {
    icon: "/icons/puzzle-piece.svg",
    title: "Shape the product",
    description: "Talk directly with the team and influence what gets built.",
  },
  {
    icon: "/icons/currency-dollar.svg",
    title: "Free For One Year",
    description: "The first 100 members get Veen free for their first year.",
  },
  {
    icon: "/icons/receipt-percent.svg",
    title: "50% Off For Life",
    description: "Continue after the first year at a permanent discount.",
  },
];

type WaitlistActions = {
  createWaitlistAction: (data: Partial<Waitlist>) => Promise<Waitlist>;
};

type WaitlistState = { ok: true } | { ok: false; error: string } | null;

export function WaitlistSection({ actions }: { actions: WaitlistActions }) {
  const [state, formAction, isPending] = useActionState<
    WaitlistState,
    FormData
  >(async (_prev, formData) => {
    const email = formData.get("email") as string;
    try {
      await actions.createWaitlistAction({ email });
      return { ok: true as const };
    } catch (e) {
      return { ok: false as const, error: (e as Error).message };
    }
  }, null);

  return (
    <section id="waitlist" className="w-full bg-accent py-10 md:py-28">
      <div className="mx-auto max-w-300 px-6">
        <div className="flex flex-col lg:flex-row gap-16 items-stretch">
          {/* Left — photo, no border radius */}
          <div className="relative w-full lg:w-[45%] min-h-125 shrink-0 overflow-hidden">
            <Image
              src="/Backgrounds/CTA/cta-img.jpg"
              alt="Team meeting"
              fill
              sizes="(max-width: 1024px) 100vw, 540px"
              className="object-cover"
            />
          </div>

          {/* Right — heading, benefits, email signup */}
          <div className="flex flex-col gap-8 flex-1 justify-between">
            {/* Top: heading + description */}
            <div className="flex flex-col gap-4">
              <h2 className="font-trocchi">Why join the waitlist?</h2>
              <p>
                Early supporters will help shape the future of Veen and receive
                launch benefits that won&apos;t be available later.
              </p>
            </div>

            {/* Benefits grid — 1 col on mobile, 2 col on sm+ */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-6">
              {benefits.map((benefit) => (
                <div
                  key={benefit.title}
                  className="flex flex-col gap-2 pb-6 border-b border-border"
                >
                  <Image
                    src={benefit.icon}
                    alt=""
                    width={32}
                    height={32}
                    aria-hidden
                    unoptimized
                  />
                  <h3 className="font-medium">
                    {benefit.title}
                  </h3>
                  <p className="small-text">{benefit.description}</p>
                </div>
              ))}
            </div>

            {/* Email signup — aligned to right column */}
            <div className="flex flex-col gap-3">
              {state?.ok ? (
                <p className="font-medium text-brand-green">
                  You&apos;re on the list! We&apos;ll be in touch soon.
                </p>
              ) : (
                <>
                  <form
                    action={formAction}
                    className="flex flex-col gap-3"
                  >
                    <input
                      className="bg-background border border-border rounded-lg px-5 py-3 w-full"
                      type="email"
                      name="email"
                      placeholder="you@company.com"
                      required
                    />
                    <div className="flex flex-col sm:flex-row gap-3">
                      <button
                        type="submit"
                        disabled={isPending}
                        className="w-full sm:w-auto bg-brand-yellow rounded-lg px-5 py-3 font-medium hover:bg-brand-yellow/80 transition-colors disabled:opacity-50"
                      >
                        {isPending ? "Joining…" : "Join the waitlist"}
                      </button>
                      <button
                        type="button"
                        className="w-full sm:w-auto bg-primary rounded-lg px-5 py-3 text-primary-foreground font-medium hover:bg-primary/80 transition-colors"
                      >
                        Get Updates
                      </button>
                    </div>
                  </form>
                  {state?.ok === false && (
                    <p className="small-text text-destructive">
                      Something went wrong. Please try again.
                    </p>
                  )}
                </>
              )}
              <p className="small-text text-muted-foreground text-center">
                No spam. Unsubscribe anytime. Early access ships Q4 2026.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
