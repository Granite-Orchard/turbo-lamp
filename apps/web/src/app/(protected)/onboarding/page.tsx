import { availabilitiesApi } from "@/lib/api/availabilities";
import { availabilityOverridesApi } from "@/lib/api/availability-overrides";
import { calendarsApi } from "@/lib/api/calendars";
import OnboardingClient from "./onboarding-client";
import {
  saveCalendarsAction,
  saveAvailabilitiesAction,
  saveAvailabilityOverridesAction,
} from "./actions";

export default async function Page() {
  const [externalCalendars, calendars, availabilities, overrides] =
    await Promise.all([
      calendarsApi.listExternal(),
      calendarsApi.list(),
      availabilitiesApi.list(),
      availabilityOverridesApi.list(),
    ]);

  return (
    <OnboardingClient
      initialData={{ externalCalendars, calendars, availabilities, overrides }}
      actions={{
        saveCalendarsAction,
        saveAvailabilitiesAction,
        saveAvailabilityOverridesAction,
      }}
    />
  );
}
