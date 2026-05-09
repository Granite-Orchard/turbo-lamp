import {
  listAvailabilitiesAction,
  updateAvailabilityAction,
} from "@/lib/actions/availabilities";
import AvailabilityClient from "./availability-client";

export default async function Page() {
  const result = await listAvailabilitiesAction();
  return (
    <AvailabilityClient
      initialData={result.sort((a, b) => a.dayOfWeek - b.dayOfWeek)}
      actions={{
        updateAvailabilityAction,
      }}
    />
  );
}
