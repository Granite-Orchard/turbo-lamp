import Image from "next/image";

const features = [
  {
    title: "Calendar Integrations",
    description:
      "Work with Google, Outlook, iCal, and every other major platform from day one.",
    bg: "/Backgrounds/Feature Section/feature 1 bg.svg",
    illustration: "/Feature Illustrations/Feature illustration 1.png",
    wide: false,
  },
  {
    title: "Built for Global Teams",
    description:
      "Automatically handles time zone adjustments for meeting times and preferences.",
    bg: "/Backgrounds/Feature Section/feature 2 bg.svg",
    illustration: "/Feature Illustrations/Feature illustration 2.png",
    wide: false,
  },
  {
    title: "Smart Scheduling and AI Assistance",
    description:
      "Veen analyzes everyone's availability simultaneously to identify the best meeting times. When schedules don't align, AI can help propose alternatives and negotiate a workable solution.",
    bg: "/Backgrounds/Feature Section/feature 3 bg.svg",
    illustration: "/Feature Illustrations/Feature illustration 3.png",
    wide: true,
  },
];

export function Features() {
  return (
    <section id="features" className="bg-background py-10 md:py-28">
      <div className="mx-auto max-w-300 px-6">
        <div className="flex flex-col items-center gap-6 text-center mb-16">
          <h2 className="max-w-250.75 font-trocchi">
            Everything you need for effortless scheduling
          </h2>
          <p className="max-w-113">
            Features that eliminate scheduling friction and save hours every
            week.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-9 md:grid-cols-[35%_1fr]">
          {features.map((feature) =>
            feature.wide ? (
              <div
                key={feature.title}
                className="col-span-1 md:col-span-2 relative overflow-hidden flex flex-col md:flex-row h-[640px] md:h-125"
              >
                {/* Background */}
                <Image
                  src={feature.bg}
                  alt=""
                  fill
                  sizes="(max-width: 768px) 100vw, 1200px"
                  className="object-cover"
                  aria-hidden
                  unoptimized
                />

                {/* Illustration — top on mobile (order-1), right half on desktop (order-2) */}
                <div className="relative z-10 order-1 md:order-2 w-full md:w-1/2 h-72 md:h-full shrink-0">
                  <Image
                    src={feature.illustration}
                    alt=""
                    fill
                    sizes="(max-width: 768px) 100vw, 600px"
                    className="object-contain object-center"
                    aria-hidden
                  />
                </div>

                {/* Text — bottom on mobile (order-2), left half on desktop (order-1) */}
                <div className="relative z-10 order-2 md:order-1 w-full md:w-1/2 flex flex-col justify-end px-8 md:px-10 pb-10 md:pb-20 gap-3">
                  <h3 className="font-trocchi">{feature.title}</h3>
                  <p className="medium-text">{feature.description}</p>
                </div>
              </div>
            ) : (
              <div
                key={feature.title}
                className="col-span-1 relative overflow-hidden h-140"
              >
                {/* Background */}
                <Image
                  src={feature.bg}
                  alt=""
                  fill
                  sizes="(max-width: 768px) 100vw, 420px"
                  className="object-cover"
                  aria-hidden
                  unoptimized
                />

                {/* Illustration — full width, no padding */}
                <Image
                  src={feature.illustration}
                  alt=""
                  width={1200}
                  height={800}
                  className="absolute top-0 left-0 w-full h-auto z-10"
                  aria-hidden
                />

                {/* Text — always pinned to bottom-20 */}
                <div className="absolute bottom-20 left-0 right-0 z-10 flex flex-col gap-3 px-6">
                  <h3 className="font-trocchi">{feature.title}</h3>
                  <p className="medium-text min-h-[3.1rem]">
                    {feature.description}
                  </p>
                </div>
              </div>
            ),
          )}
        </div>
      </div>
    </section>
  );
}
