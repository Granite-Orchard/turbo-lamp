import { Card } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Star } from "lucide-react";

const testimonials = [
  {
    quote:
      "Veen has completely transformed how our team schedules meetings. What used to take 20+ emails now happens in seconds.",
    author: "Sarah Chen",
    role: "Product Lead at Vercel",
    initials: "SC",
  },
  {
    quote:
      "The AI recommendations are scary accurate. It somehow knows exactly when everyone is most productive and available.",
    author: "Marcus Johnson",
    role: "Engineering Manager at Stripe",
    initials: "MJ",
  },
  {
    quote:
      "We&apos;re saving 5+ hours per week just on scheduling. That&apos;s time we now spend actually building our product.",
    author: "Emily Rodriguez",
    role: "Founder at Startup",
    initials: "ER",
  },
];

export function Testimonials() {
  return (
    <section id="testimonials" className="py-20 md:py-32">
      <div className="mx-auto max-w-6xl px-6">
        <div className="mb-16 text-center">
          <h2 className="text-balance text-3xl font-bold text-foreground md:text-4xl lg:text-5xl">
            Loved by teams everywhere
          </h2>
          <p className="mt-4 text-pretty text-lg text-muted-foreground">
            See why thousands of teams trust Veen for their scheduling needs.
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          {testimonials.map((testimonial) => (
            <Card
              key={testimonial.author}
              className="flex flex-col border-border/50 bg-card/50 p-6"
            >
              <div className="mb-4 flex gap-1">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="h-4 w-4 fill-accent text-accent" />
                ))}
              </div>
              <blockquote className="flex-1 text-foreground">
                &ldquo;{testimonial.quote}&rdquo;
              </blockquote>
              <div className="mt-6 flex items-center gap-3">
                <Avatar className="h-10 w-10">
                  <AvatarFallback className="bg-accent/10 text-accent">
                    {testimonial.initials}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-medium text-foreground">
                    {testimonial.author}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {testimonial.role}
                  </p>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
