import { Header } from "@/components/landing-page/header";
import { Hero } from "@/components/landing-page/hero";
import { ProblemStatement } from "@/components/landing-page/problem-statement";
import { HowItWorks } from "@/components/landing-page/how-it-works";
import { Features } from "@/components/landing-page/features";
import { WaitlistSection } from "@/components/landing-page/waitlist-section";
import { Footer } from "@/components/landing-page/footer";
import { createWaitlistAction } from "@/lib/actions/waitlist";

export default function Home() {
  return (
    <main className="min-h-screen">
      <Header />
      <Hero />
      <ProblemStatement />
      <div className="h-5 md:h-10 lg:hidden bg-background" />
      <HowItWorks />
      <div className="h-5 md:h-10 lg:hidden bg-background" />
      <Features />
      <WaitlistSection actions={{ createWaitlistAction }} />
      <Footer />
    </main>
  );
}
