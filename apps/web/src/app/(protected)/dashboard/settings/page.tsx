import {
  createCalendarAction,
  listCalendarsAction,
  listExternalCalendarsAction,
  updateCalendarAction,
} from "@/lib/actions/calendars";
import SettingsClient from "./settings-client";

export default async function Page() {
  const [externalCalendars, calendars] = await Promise.all([
    listExternalCalendarsAction(),
    listCalendarsAction(),
  ]);

  return (
    <SettingsClient
      initialData={{
        calendars,
        externalCalendars,
      }}
      actions={{
        toggleCalendarEnabledAction: updateCalendarAction,
        createCalendarAction: createCalendarAction,
      }}
    />
  );
}
