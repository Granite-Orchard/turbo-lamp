import { calendarsApi } from "../../../../lib/api/calendars";
import { createCalendarAction, toggleCalendarAction } from "./actions";
import SettingsClient from "./settings-client";

export default async function Page() {
  const [externalCalendars, calendars] = await Promise.all([
    calendarsApi.listExternal(),
    calendarsApi.list(),
  ]);

  return (
    <SettingsClient
      initialData={{
        calendars,
        externalCalendars,
      }}
      actions={{
        toggleCalendarEnabledAction: toggleCalendarAction,
        createCalendarAction: createCalendarAction,
      }}
    />
  );
}
