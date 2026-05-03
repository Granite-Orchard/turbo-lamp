import { availabilitiesApi } from "@/lib/api/availabilities";
import { updateAvailabilityAction } from "./actions";
import AvailabilityClient from "./availability-client";

export default async function Page() {
  const result = await availabilitiesApi.list();
  return (
    <AvailabilityClient
      initialData={result.sort((a, b) => a.dayOfWeek - b.dayOfWeek)}
      actions={{
        updateAvailabilityAction,
      }}
    />
  );
}
