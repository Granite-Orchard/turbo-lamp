import { createCalendarSchema, updateCalendarSchema } from "@/lib/schemas";
import type { Calendar, ExternalCalendar } from "@/lib/types";
import { serverRequest } from "./server";

export const calendarsApi = {
  list: async () => {
    return await serverRequest<Calendar[]>(`/calendars`, "GET");
  },

  get: async (id: string) =>
    await serverRequest<Calendar>(`/calendars/${id}`, "GET"),

  create: async (data: Partial<Calendar>) => {
    const payload = createCalendarSchema.parse(data);
    return await serverRequest<Calendar>(
      `/calendars?_rid=${crypto.randomUUID()}`,
      "POST",
      payload,
    );
  },

  upsert: async (data: Partial<Calendar>) => {
    const payload = createCalendarSchema.parse(data);
    return await serverRequest<Calendar>(
      `/calendars/upsert?_rid=${crypto.randomUUID()}`,
      "POST",
      payload,
    );
  },

  update: async (id: string, data: Partial<Calendar>) => {
    const payload = updateCalendarSchema.parse(data);
    return await serverRequest<Calendar>(`/calendars/${id}`, "PATCH", payload);
  },

  delete: async (id: string) =>
    await serverRequest<void>(`/calendars/${id}`, "DELETE"),

  listExternal: async () =>
    await serverRequest<ExternalCalendar[]>("/calendars/external", "GET"),
};
