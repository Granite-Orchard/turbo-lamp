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

export function WaitlistSection({
  actions,
}: {
  actions: WaitlistActions;
}) {
  const [state, formAction, isPending] = useActionState<WaitlistState, FormData>(
    async (_prev, formData) => {
      const email = formData.get("email") as string;
      try {
        await actions.createWaitlistAction({ email });
        return { ok: true as const };
      } catch (e) {
        return { ok: false as const, error: (e as Error).message };
      }
    },
    null,
  );

  return (
    <section id="waitlist" className="w-full bg-amber-50 py-20 md:py-28">
      <div className="mx-auto max-w-300 px-6">
        <div className="flex flex-col lg:flex-row gap-16 items-stretch">
          {/* Left — photo, no border radius */}
          <div className="relative w-full lg:w-[45%] min-h-125 shrink-0 overflow-hidden">
            <Image
              src="/Backgrounds/CTA/cta-img.jpg"
              alt="Team meeting"
              fill
              className="object-cover"
            />
          </div>

          {/* Right — heading, benefits, email signup */}
          <div className="flex flex-col gap-8 flex-1 justify-between">
            {/* Top: heading + description */}
            <div className="flex flex-col gap-4">
              <h2 className="text-6xl font-trocchi">Why join the waitlist?</h2>
              <p className="text-md">
                Early supporters will help shape the future of Veen and receive
                launch benefits that won&apos;t be available later.
              </p>
            </div>

            {/* Benefits 2×2 grid */}
            <div className="grid grid-cols-2 gap-x-8 gap-y-6">
              {benefits.map((benefit) => (
                <div
                  key={benefit.title}
                  className="flex flex-col gap-2 pb-6 border-b border-primary/20"
                >
                  <Image
                    src={benefit.icon}
                    alt=""
                    width={32}
                    height={32}
                    aria-hidden
                  />
                  <h3 className="text-xl font-medium leading-tight">
                    {benefit.title}
                  </h3>
                  <p className="text-sm">{benefit.description}</p>
                </div>
              ))}
            </div>

            {/* Email signup — aligned to right column */}
            <div className="flex flex-col gap-3">
              {state?.ok ? (
                <p className="text-lg font-medium text-green-700">
                  You&apos;re on the list! We&apos;ll be in touch soon.
                </p>
              ) : (
                <>
                  <form action={formAction} className="flex flex-col sm:flex-row gap-3">
                    <input
                      className="bg-primary-foreground border border-primary/25 rounded-lg px-5 py-3"
                      type="email"
                      name="email"
                      placeholder="you@company.com"
                      required
                    />
                    <button
                      type="submit"
                      disabled={isPending}
                      className="bg-brand-yellow rounded-lg px-2 py-3 font-medium hover:bg-brand-yellow/80 transition-colors disabled:opacity-50"
                    >
                      {isPending ? "Joining…" : "Join the waitlist"}
                    </button>
                    <button type="button" className="bg-primary rounded-lg px-2 py-3 text-secondary font-medium hover:bg-primary/80 transition-colors">
                      Get Updates
                    </button>
                  </form>
                  {state?.ok === false && (
                    <p className="text-sm text-red-600">
                      Something went wrong: {state.error}. Please try again.
                    </p>
                  )}
                </>
              )}
              <p className="text-sm text-primary/60 text-center">
                No spam. Unsubscribe anytime. Early access ships Q4 2026.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
