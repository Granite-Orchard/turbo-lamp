import { Suspense } from "react";
import OnboardingAuthClient from "./onboarding-auth-client";

export default function Page() {
  return (
    <Suspense>
      <OnboardingAuthClient />
    </Suspense>
  );
}
