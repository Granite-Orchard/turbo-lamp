import Image from "next/image";

export function Hero() {
  return (
    <section className="pt-40 pb-20">
      <div className="mx-auto max-w-300 px-6 flex flex-col items-center gap-12 text-center">
        <h1 className="text-7xl max-w-4xl font-trocchi">
          Schedule multi-company meetings without all the back and forth
        </h1>

        <p className="text-xl max-w-166.75">
          The easiest way to find a time to meet when you don&apos;t have access
          to everyone&apos;s calendar.
        </p>

        <a
          href="#waitlist"
          className="flex items-center justify-center bg-brand-yellow font-medium text-xl px-6 py-3.5 rounded-lg border hover:bg-brand-yellow/80"
        >
          Join the waitlist
        </a>

        <div className="w-full max-w-246.75 mt-4">
          <Image
            src="/hero-illustration.png"
            alt="Veen scheduling illustration"
            width={987}
            height={584}
            className="w-full h-auto"
          />
        </div>
      </div>
    </section>
  );
}
