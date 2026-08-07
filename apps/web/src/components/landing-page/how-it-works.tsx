"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";

const steps = [
  {
    title: "Create a meeting",
    description:
      "Connect your calendar and setup the duration, location, and any specific scheduling rules.",
    image: "/slider/slide-1 image.svg",
  },
  {
    title: "Add participants",
    description:
      "Invite attendees directly via email or share a custom meeting link.",
    image: "/slider/slide-2 image.svg",
  },
  {
    title: "They share availability",
    description:
      "Participants can connect their calendar or simply provide preferences.",
    image: "/slider/slide-3 image.svg",
  },
  {
    title: "Veen finds the perfect time",
    description:
      "We analyze timezones, schedule gaps, and preferred working hours to pinpoint the ideal overlap for everyone.",
    image: "/slider/slide-4 image.svg",
  },
];

export function HowItWorks() {
  // Mobile: click-based step switching
  const [mobileStep, setMobileStep] = useState(0);

  // Desktop: GSAP scroll refs
  const sectionRef = useRef<HTMLElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const stepRefs = useRef<(HTMLDivElement | null)[]>([]);
  const imageRefs = useRef<(HTMLDivElement | null)[]>([]);
  const currentStepRef = useRef(0);

  useEffect(() => {
    let mm: import("gsap").MatchMedia | undefined;

    const init = async () => {
      try {
        const gsapMod = await import("gsap");
        const stMod = await import("gsap/ScrollTrigger");
        const gsap = gsapMod.gsap;
        const ScrollTrigger = stMod.ScrollTrigger;
        gsap.registerPlugin(ScrollTrigger);

        mm = gsap.matchMedia();

        mm.add("(min-width: 1024px)", () => {
          const section = sectionRef.current!;
          section.style.height = `${(steps.length + 1) * 100}vh`;

          stepRefs.current.forEach((el, i) => {
            if (el) gsap.set(el, { opacity: i === 0 ? 1 : 0.15 });
          });
          imageRefs.current.forEach((el, i) => {
            if (el) gsap.set(el, { opacity: i === 0 ? 1 : 0 });
          });
          currentStepRef.current = 0;

          const ctx = gsap.context(() => {
            ScrollTrigger.create({
              trigger: section,
              start: "top top",
              end: "bottom bottom",
              pin: contentRef.current!,
              onUpdate(self) {
                const newStep = Math.min(
                  Math.floor(self.progress * steps.length),
                  steps.length - 1
                );
                if (newStep !== currentStepRef.current) {
                  const prev = currentStepRef.current;
                  gsap.to(imageRefs.current[prev], { opacity: 0, duration: 0.55, ease: "power2.inOut", overwrite: true });
                  gsap.to(stepRefs.current[prev], { opacity: 0.15, duration: 0.4, ease: "power2.out", overwrite: true });
                  gsap.to(imageRefs.current[newStep], { opacity: 1, duration: 0.55, ease: "power2.inOut", overwrite: true });
                  gsap.to(stepRefs.current[newStep], { opacity: 1, duration: 0.4, ease: "power2.out", overwrite: true });
                  currentStepRef.current = newStep;
                }
              },
            });
          });

          return () => {
            section.style.height = "";
            ctx.revert();
          };
        });
      } catch {
        // GSAP not installed — mobile click-based fallback is still active
      }
    };

    init();
    return () => mm?.revert();
  }, []);

  return (
    <section ref={sectionRef} id="how-it-works" className="bg-background">
      <div
        ref={contentRef}
        className="py-10 lg:py-20 lg:h-screen lg:flex lg:flex-col lg:justify-center"
      >
        <div className="mx-auto max-w-[1200px] px-6 w-full">
          {/* Section header */}
          <div className="flex flex-col items-center gap-4 text-center mb-10">
            <h2
              className="text-foreground font-trocchi"
            >
              How veen works
            </h2>
            <p className="text-foreground max-w-[398px]">
              Four simple steps to schedule with internal and external teams.
            </p>
          </div>

          {/* ── Mobile: click-based ── */}
          <div className="lg:hidden flex flex-col gap-8">
            <div className="flex flex-col">
              {steps.map((step, index) => (
                <button
                  key={index}
                  onClick={() => setMobileStep(index)}
                  className={`flex flex-col gap-2 items-start text-left px-2 py-4 border-b border-border transition-opacity duration-300 ${
                    index === mobileStep ? "opacity-100" : "opacity-20"
                  }`}
                >
                  <h3 className="text-foreground font-trocchi">
                    {step.title}
                  </h3>
                  <p className="small-text text-foreground/70">
                    {step.description}
                  </p>
                </button>
              ))}
            </div>

            {/* Active slide image */}
            <div className="w-full bg-white rounded-xl overflow-hidden">
              <Image
                key={mobileStep}
                src={steps[mobileStep].image}
                alt={steps[mobileStep].title}
                width={662}
                height={500}
                className="w-full h-auto"
                unoptimized
              />
            </div>
          </div>

          {/* ── Desktop: GSAP scroll-based ── */}
          <div className="hidden lg:flex gap-16 items-center justify-center">
            {/* Step list */}
            <div className="flex flex-col gap-8 w-full max-w-[480px]">
              {steps.map((step, index) => (
                <div
                  key={index}
                  ref={(el) => { stepRefs.current[index] = el; }}
                  className="flex flex-col gap-3 items-start text-left"
                >
                  <h3 className="text-foreground font-trocchi">
                    {step.title}
                  </h3>
                  <p className="medium-text text-foreground/70 max-w-[398px]">
                    {step.description}
                  </p>
                </div>
              ))}
            </div>

            {/* Crossfading image panel */}
            <div className="relative w-full max-w-[662px] shrink-0 bg-white rounded-xl overflow-hidden">
              {/* Invisible spacer to hold container dimensions */}
              <Image
                src={steps[0].image}
                alt=""
                width={662}
                height={500}
                className="w-full h-auto opacity-0 pointer-events-none"
                aria-hidden
                unoptimized
              />
              {steps.map((step, index) => (
                <div
                  key={index}
                  ref={(el) => { imageRefs.current[index] = el; }}
                  className="absolute inset-0"
                  style={{ opacity: index === 0 ? 1 : 0 }}
                >
                  <Image
                    src={step.image}
                    alt={step.title}
                    width={662}
                    height={500}
                    className="w-full h-auto"
                    unoptimized
                  />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
