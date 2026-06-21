"use server";

import { revalidatePath } from "next/cache";
import { calendarsApi } from "@/lib/api/calendars";
import { Calendar } from "@/lib/types";

export async function listCalendarsAction() {
  return await calendarsApi.list();
}

export async function listExternalCalendarsAction() {
  return await calendarsApi.listExternal();
}

export async function createCalendarAction(data: Partial<Calendar>) {
  const result = await calendarsApi.create(data);
  revalidatePath("/dashboard/settings");
  return result;
}

export async function updateCalendarAction(
  id: string,
  data: Partial<Calendar>,
) {
  const result = await calendarsApi.update(id, data);
  revalidatePath("/dashboard/settings");
  return result;
}

export async function deleteCalendarAction(id: string) {
  const result = await calendarsApi.delete(id);
  revalidatePath("/dashboard/settings");
  return result;
}
