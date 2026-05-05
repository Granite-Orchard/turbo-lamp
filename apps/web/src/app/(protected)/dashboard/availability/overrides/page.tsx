import {
  listAvailabilityOverridesAction,
  createAvailabilityOverrideAction,
  updateAvailabilityOverrideAction,
  deleteAvailabilityOverrideAction,
} from "@/lib/actions/availability-overrides";
import OverridesClient from "./overrides-client";

export default async function Page() {
  const initialData = await listAvailabilityOverridesAction();
  return (
    <OverridesClient
      initialData={initialData}
      actions={{
        createAvailabilityOverrideAction,
        updateAvailabilityOverrideAction,
        deleteAvailabilityOverrideAction,
      }}
    />
  );
}
