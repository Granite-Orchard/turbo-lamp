import { listAvailabilitiesAction } from "@/lib/actions/availabilities";
import { listAvailabilityOverridesAction } from "@/lib/actions/availability-overrides";
import {
  listCalendarsAction,
  listExternalCalendarsAction,
} from "@/lib/actions/calendars";
import {
  saveAvailabilitiesAction,
  saveAvailabilityOverridesAction,
  saveCalendarsAction,
} from "./actions";
import OnboardingClient from "./onboarding-client";

export default async function Page() {
  const [externalCalendars, calendars, availabilities, overrides] =
    await Promise.all([
      listExternalCalendarsAction(),
      listCalendarsAction(),
      listAvailabilitiesAction(),
      listAvailabilityOverridesAction(),
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
