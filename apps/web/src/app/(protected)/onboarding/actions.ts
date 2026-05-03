"use server";

import { revalidatePath } from "next/cache";
import { availabilitiesApi } from "@/lib/api/availabilities";
import { availabilityOverridesApi } from "@/lib/api/availability-overrides";
import { calendarsApi } from "@/lib/api/calendars";
import {
  calendarSchema,
  createAvailabilityOverrideSchema,
  createAvailabilitySchema,
} from "@/lib/schemas";
import type { Availability, AvailabilityOverride, Calendar } from "@/lib/types";

export async function saveCalendarsAction(data: Calendar[]) {
  const payload = data.map((calendar) =>
    calendarSchema
      .pick({
        providerId: true,
        externalId: true,
        name: true,
        timezone: true,
        enabled: true,
      })
      .parse({
        providerId: calendar.providerId,
        externalId: calendar.externalId,
        name: calendar.name ?? "Calendar",
        timezone: calendar.timezone ?? "America/Halifax",
        enabled: true,
      }),
  );

  const result = await calendarsApi.batchUpsert(payload);
  revalidatePath("/onboarding");
  return result;
}

export async function saveAvailabilitiesAction(data: Availability[]) {
  const payload = data.map((d) =>
    createAvailabilitySchema.parse({
      dayOfWeek: d.dayOfWeek,
      startTime: d.startTime,
      endTime: d.endTime,
      isAvailable: d.isAvailable,
    }),
  );
  const result = await availabilitiesApi.batchUpsert(payload);
  revalidatePath("/onboarding");
  return result;
}
export async function saveAvailabilityOverridesAction(
  data: AvailabilityOverride[],
) {
  const payload = data.map((override) =>
    createAvailabilityOverrideSchema.parse({
      date: override.date,
      startTime: override.startTime,
      endTime: override.endTime,
      isAvailable: override.isAvailable,
    }),
  );

  const result = await Promise.all(
    payload.map((override) => availabilityOverridesApi.upsert(override)),
  );
  revalidatePath("/onboarding");
  return result;
}
