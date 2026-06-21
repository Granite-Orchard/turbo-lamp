"use client";

import { Button } from "@/components/ui/button";
import { Check } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

const plans = [
  {
    name: "Free",
    description: "For individuals getting started",
    price: { monthly: 0, yearly: 0 },
    features: [
      "Up to 5 meetings per month",
      "Basic calendar integration",
      "Email notifications",
      "1 calendar connection",
    ],
    cta: "Get started",
    popular: false,
  },
  {
    name: "Pro",
    description: "For professionals and small teams",
    price: { monthly: 12, yearly: 10 },
    features: [
      "Unlimited meetings",
      "AI-powered scheduling",
      "Priority time suggestions",
      "Up to 5 calendar connections",
      "Custom meeting links",
      "Advanced analytics",
      "Priority support",
    ],
    cta: "Start free trial",
    popular: true,
  },
  {
    name: "Team",
    description: "For growing teams and organizations",
    price: { monthly: 29, yearly: 24 },
    features: [
      "Everything in Pro",
      "Unlimited team members",
      "Shared team calendars",
      "Admin dashboard",
      "SSO authentication",
      "API access",
      "Custom branding",
      "Dedicated support",
    ],
    cta: "Contact sales",
    popular: false,
  },
];

const faqs = [
  {
    question: "Can I try Veen before committing?",
    answer:
      "Yes! All paid plans come with a 14-day free trial. No credit card required to start.",
  },
  {
    question: "What happens when my trial ends?",
    answer:
      "You can continue with a paid plan or downgrade to Free. Your data is always safe.",
  },
  {
    question: "Can I change plans later?",
    answer:
      "Absolutely. Upgrade, downgrade, or cancel anytime from your account settings.",
  },
  {
    question: "Do you offer discounts for nonprofits?",
    answer:
      "Yes, we offer 50% off for verified nonprofits and educational institutions. Contact us for details.",
  },
];

export function PricingSection() {
  const [isYearly, setIsYearly] = useState(false);

  return (
    <section id="pricing" className="relative py-24 md:py-32">
      {/* Background */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute left-1/2 top-0 h-[600px] w-[800px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-accent/5 blur-3xl" />
      </div>

      <div className="relative mx-auto max-w-6xl px-6">
        <div className="mx-auto max-w-2xl text-center">
          <h1 className="text-balance text-4xl font-semibold tracking-tight text-foreground md:text-5xl">
            Simple, transparent pricing
          </h1>
          <p className="mt-4 text-lg text-muted-foreground">
            Choose the plan that fits your needs. All plans include a 14-day
            free trial.
          </p>

          {/* Billing toggle */}
          <div className="mt-8 flex items-center justify-center gap-4">
            <span
              className={`text-sm ${!isYearly ? "text-foreground" : "text-muted-foreground"}`}
            >
              Monthly
            </span>
            <button
              onClick={() => setIsYearly(!isYearly)}
              className={`relative h-6 w-11 rounded-full transition-colors ${
                isYearly ? "bg-accent" : "bg-secondary"
              }`}
            >
              <span
                className={`absolute top-1 h-4 w-4 rounded-full bg-foreground transition-transform ${
                  isYearly ? "left-6" : "left-1"
                }`}
              />
            </button>
            <span
              className={`text-sm ${isYearly ? "text-foreground" : "text-muted-foreground"}`}
            >
              Yearly
              <span className="ml-1.5 rounded-full bg-accent/20 px-2 py-0.5 text-xs text-accent">
                Save 20%
              </span>
            </span>
          </div>
        </div>

        {/* Pricing cards */}
        <div className="mt-16 grid gap-8 lg:grid-cols-3">
          {plans.map((plan) => (
            <div
              key={plan.name}
              className={`relative rounded-2xl border p-8 ${
                plan.popular
                  ? "border-accent bg-accent/5"
                  : "border-border/50 bg-card/50"
              }`}
            >
              {plan.popular && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <span className="rounded-full bg-accent px-3 py-1 text-xs font-medium text-accent-foreground">
                    Most popular
                  </span>
                </div>
              )}

              <div className="mb-6">
                <h3 className="text-lg font-semibold text-foreground">
                  {plan.name}
                </h3>
                <p className="mt-1 text-sm text-muted-foreground">
                  {plan.description}
                </p>
              </div>

              <div className="mb-6">
                <span className="text-4xl font-semibold text-foreground">
                  ${isYearly ? plan.price.yearly : plan.price.monthly}
                </span>
                {plan.price.monthly > 0 && (
                  <span className="text-muted-foreground">/month</span>
                )}
              </div>

              <Link href="/register">
                <Button
                  className={`w-full ${plan.popular ? "bg-accent text-accent-foreground hover:bg-accent/90" : ""}`}
                  variant={plan.popular ? "default" : "outline"}
                >
                  {plan.cta}
                </Button>
              </Link>

              <ul className="mt-8 flex flex-col gap-3">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex items-start gap-3">
                    <Check className="mt-0.5 h-4 w-4 shrink-0 text-accent" />
                    <span className="text-sm text-muted-foreground">
                      {feature}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* FAQ */}
        <div className="mx-auto mt-24 max-w-3xl">
          <h2 className="text-center text-2xl font-semibold text-foreground">
            Frequently asked questions
          </h2>
          <div className="mt-12 grid gap-8 md:grid-cols-2">
            {faqs.map((faq) => (
              <div key={faq.question}>
                <h3 className="font-medium text-foreground">{faq.question}</h3>
                <p className="mt-2 text-sm text-muted-foreground">
                  {faq.answer}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* CTA */}
        <div className="mt-24 text-center">
          <p className="text-muted-foreground">
            Need a custom plan for your enterprise?
          </p>
          <Link href="#">
            <Button variant="link" className="text-accent">
              Contact our sales team
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
}
