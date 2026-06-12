import Image from "next/image";

export function ProblemStatement() {
  return (
    <section className="relative w-full min-h-screen bg-black overflow-hidden flex items-center justify-center">
      {/* Background image */}
      <div className="absolute inset-0">
        <Image
          src="/Backgrounds/Problem Section]/problem-bg.svg"
          alt=""
          fill
          className="object-cover"
          aria-hidden
        />
      </div>

      {/* Content */}
      <div className="relative z-10 mx-auto max-w-[900px] px-6 text-center flex flex-col gap-12">
        <h2
          className="text-[clamp(2.25rem,5vw,3.75rem)] leading-tight text-white"
          style={{ fontFamily: "var(--font-trocchi, serif)" }}
        >
          The Meeting Problem{" "}
          <br className="hidden sm:block" />
          Nobody Bothered to Fix
        </h2>

        <p className="text-[1.25rem] sm:text-[1.5rem] md:text-[2rem] leading-[1.4] text-white">
          Booking a cross-company meeting is still a nightmare. Chasing replies,
          coordinating assistants, waiting on busy people, and getting hit with
          &ldquo;here&rsquo;s my Calendly link&rdquo; can turn a simple task into a
          multi-day process. Projects run longer. Deals fall through. Candidates
          accept other offers. All because finding a time to meet is still
          harder than it should be.
        </p>

        <p
          className="text-[clamp(2rem,4vw,3.375rem)] text-[#9bffac]"
          style={{ fontFamily: "var(--font-trocchi, serif)" }}
        >
          We fixed that.
        </p>
      </div>
    </section>
  );
}
