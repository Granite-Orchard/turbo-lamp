import type { Meeting } from "@/lib/types";
import { serverRequest } from "./server";
import { createMeetingSchema, updateMeetingSchema } from "../schemas";

export const meetingsApi = {
  list: async () => {
    return await serverRequest<Meeting[]>(`/meetings`, "GET");
  },

  get: async (id: string) =>
    await serverRequest<Meeting>(`/meetings/${id}`, "GET"),

  create: async (data: Partial<Meeting>) => {
    const payload = createMeetingSchema.parse(data);
    return await serverRequest<Meeting>(
      `/meetings?_rid=${crypto.randomUUID()}`,
      "POST",
      payload,
    );
  },

  update: async (id: string, data: Partial<Meeting>) => {
    const payload = updateMeetingSchema.parse(data);
    return await serverRequest<Meeting>(`/meetings/${id}`, "PATCH", payload);
  },

  delete: async (id: string) =>
    await serverRequest<void>(`/meetings/${id}`, "DELETE"),
};
