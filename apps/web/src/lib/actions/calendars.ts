"use server";

import { calendarsApi } from "@/lib/api/calendars";
import { Calendar } from "@/lib/types";

export async function listCalendarsAction() {
  return await calendarsApi.list();
}

export async function listExternalCalendarsAction() {
  return await calendarsApi.listExternal();
}

export async function createCalendarAction(data: Partial<Calendar>) {
  return await calendarsApi.create(data);
}

export async function updateCalendarAction(
  id: string,
  data: Partial<Calendar>,
) {
  return await calendarsApi.update(id, data);
}

export async function deleteCalendarAction(id: string) {
  return await calendarsApi.delete(id);
}
