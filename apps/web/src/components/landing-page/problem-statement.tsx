import Image from "next/image";

export function ProblemStatement() {
  return (
    <section className="relative w-full min-h-screen bg-primary flex items-center justify-center">
      {/* Background image */}
      <div className="absolute inset-0">
        <Image
          src="/Backgrounds/Problem Section]/problem-bg.svg"
          alt="problem statement background"
          fill
          className="object-cover"
          aria-hidden
        />
      </div>

      {/* Content */}
      <div className="z-10 mx-auto max-w-225 px-6 text-center flex flex-col gap-12">
        <h2 className="text-7xl leading-tight text-primary-foreground font-trocchi">
          The Meeting Problem <br className="hidden sm:block" />
          Nobody Bothered to Fix
        </h2>

        <p className="text-3xl text-primary-foreground">
          Booking a cross-company meeting is still a nightmare. Chasing replies,
          coordinating assistants, waiting on busy people, and getting hit with
          &ldquo;here&rsquo;s my Calendly link&rdquo; can turn a simple task
          into a multi-day process. Projects run longer. Deals fall through.
          Candidates accept other offers. All because finding a time to meet is
          still harder than it should be.
        </p>

        <p className="text-6xl text-brand-green font-trocchi">We fixed that.</p>
      </div>
    </section>
  );
}
