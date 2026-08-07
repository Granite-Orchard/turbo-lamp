import Image from "next/image";

export function ProblemStatement() {
  return (
    <section className="relative w-full min-h-[600px] md:min-h-screen bg-primary dark:bg-primary-foreground flex items-center justify-center py-15 md:py-0">
      {/* Background image */}
      <div className="absolute inset-0">
        <Image
          src="/Backgrounds/Problem Section]/problem-bg.svg"
          alt=""
          fill
          sizes="100vw"
          className="object-cover"
          aria-hidden
          unoptimized
        />
      </div>

      {/* Content */}
      <div className="z-10 mx-auto max-w-225 px-6 text-center flex flex-col gap-12">
        <h2 className="text-primary-foreground dark:text-primary font-trocchi">
          The Meeting Problem <br className="hidden sm:block" />
          Nobody Bothered to Fix
        </h2>

        <p className="subtitle text-primary-foreground dark:text-primary">
          Booking a cross-company meeting is still a nightmare. Chasing replies,
          coordinating assistants, waiting on busy people, and getting hit with
          &ldquo;here&rsquo;s my Calendly link&rdquo; can turn a simple task
          into a multi-day process. Projects run longer. Deals fall through.
          Candidates accept other offers. All because finding a time to meet is
          still harder than it should be.
        </p>

        <p className="text-fluid-h1 text-brand-green font-trocchi">We fixed that.</p>
      </div>
    </section>
  );
}
