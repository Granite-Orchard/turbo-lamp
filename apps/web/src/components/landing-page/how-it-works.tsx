"use client";

import { useState } from "react";
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
  const [activeStep, setActiveStep] = useState(0);

  return (
    <section id="how-it-works" className="bg-background py-20 md:py-28">
      <div className="mx-auto max-w-300 px-6">
        <div className="flex flex-col items-center gap-6 text-center mb-16">
          <h2 className="text-7xl font-trocchi">How veen works</h2>
          <p className="text-xl max-w-99.5">
            Four simple steps to schedule with internal and external teams.
          </p>
        </div>

        <div className="flex flex-col lg:flex-row gap-16 items-center justify-center">
          {/* Steps list */}
          <div className="flex flex-col gap-10 w-full max-w-120">
            {steps.map((step, index) => (
              <button
                key={index}
                onClick={() => setActiveStep(index)}
                className={`flex flex-col gap-3 items-start text-left p-3 rounded-lg transition-opacity cursor-pointer ${
                  index === activeStep
                    ? "opacity-100"
                    : "opacity-20 hover:opacity-40"
                }`}
              >
                <h3 className="text-4xl font-trocchi">{step.title}</h3>
                <p className="text-xl max-w-99.5">{step.description}</p>
              </button>
            ))}
          </div>

          {/* Slide image */}
          <div className="w-full max-w-165.5 shrink-0">
            <Image
              key={activeStep}
              src={steps[activeStep].image}
              alt={steps[activeStep].title}
              width={662}
              height={500}
              className="w-full h-auto transition-opacity duration-300"
            />
          </div>
        </div>
      </div>
    </section>
  );
}
