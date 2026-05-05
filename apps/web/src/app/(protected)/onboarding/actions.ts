"use server";

import { availabilitiesApi } from "@/lib/api/availabilities";
import { availabilityOverridesApi } from "@/lib/api/availability-overrides";
import { calendarsApi } from "@/lib/api/calendars";
import type { Availability, AvailabilityOverride, Calendar } from "@/lib/types";
import { revalidatePath } from "next/cache";

export async function saveCalendarsAction(data: Partial<Calendar>[]) {
  const result = await Promise.all(data.map((d) => calendarsApi.upsert(d)));
  revalidatePath("/onboarding");
  return result;
}

export async function saveAvailabilitiesAction(data: Partial<Availability>[]) {
  const result = await Promise.all(
    data.map((d) => availabilitiesApi.upsert(d)),
  );
  revalidatePath("/onboarding");
  return result;
}
export async function saveAvailabilityOverridesAction(
  data: AvailabilityOverride[],
) {
  const result = await Promise.all(
    data.map((d) =>
      availabilityOverridesApi.upsert({ ...d, date: d.date.slice(0, 10) }),
    ),
  );
  revalidatePath("/onboarding");
  return result;
}
