import type { MeetingAttendee } from "@/lib/types";
import {
  createMeetingAttendeeSchema,
  updateMeetingAttendeeSchema,
} from "../schemas";
import { serverRequest } from "./client";

export const meetingAttendeesApi = {
  get: async (id: string) =>
    await serverRequest<MeetingAttendee>(`/meeting-attendees/${id}`, "GET"),

  list: async () => {
    return await serverRequest<MeetingAttendee[]>(`/meeting-attendees`, "GET");
  },

  create: async (data: Partial<MeetingAttendee>) => {
    const payload = createMeetingAttendeeSchema.parse(data);

    return await serverRequest<MeetingAttendee>(
      `/meeting-attendees?_rid=${crypto.randomUUID()}`,
      "POST",
      payload,
    );
  },

  update: async (id: string, data: Partial<MeetingAttendee>) => {
    const payload = updateMeetingAttendeeSchema.parse(data);
    return await serverRequest<MeetingAttendee>(
      `/meeting-attendees/${id}`,
      "PATCH",
      payload,
    );
  },

  delete: async (id: string) =>
    await serverRequest<void>(`/meeting-attendees/${id}`, "DELETE"),
};
