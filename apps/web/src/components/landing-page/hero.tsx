import Image from "next/image";

export function Hero() {
  return (
    <section className="relative overflow-hidden pt-40 pb-20 bg-white">
      <div className="mx-auto max-w-[1200px] px-6 flex flex-col items-center gap-12 text-center">
        <h1
          className="text-[clamp(2.5rem,5.5vw,4.2rem)] leading-[1.1] text-black max-w-4xl"
          style={{ fontFamily: "var(--font-trocchi, serif)" }}
        >
          Schedule multi-company meetings without all the back and forth
        </h1>

        <p className="text-[1.25rem] leading-[1.4] text-black max-w-[667px]">
          The easiest way to find a time to meet when you don&apos;t have access
          to everyone&apos;s calendar.
        </p>

        <a
          href="#waitlist"
          className="inline-flex items-center justify-center bg-[#ffbc08] text-black font-medium text-[1.25rem] px-6 py-3.5 rounded-lg border border-white/20 hover:bg-[#f0b000] transition-colors"
        >
          Join the waitlist
        </a>

        <div className="w-full max-w-[987px] mt-4">
          <Image
            src="/hero-illustration.png"
            alt="Veen scheduling illustration"
            width={987}
            height={584}
            className="w-full h-auto"
            priority
          />
        </div>
      </div>
    </section>
  );
}
