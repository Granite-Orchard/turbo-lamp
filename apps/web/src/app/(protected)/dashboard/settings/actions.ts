"use server";

import { calendarsApi } from "@/lib/api/calendars";
import { Calendar } from "@/lib/types";
import { createCalendarSchema } from "../../../../lib/schemas";

export async function createCalendarAction(data: Partial<Calendar>) {
  const payload = createCalendarSchema.parse(data);
  return await calendarsApi.create(payload);
}

export async function toggleCalendarAction(
  id: string,
  data: Partial<Calendar>,
) {
  return await calendarsApi.update(id, data);
}
