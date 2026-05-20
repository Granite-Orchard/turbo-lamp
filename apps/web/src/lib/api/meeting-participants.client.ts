import type { MeetingParticipant } from "@/lib/types";
import {
  createMeetingParticipantSchema,
  updateParticipantSchema,
} from "../schemas";
import { clientRequest } from "./client";

export const meetingParticipantsClientApi = {
  list: async (id: string) => {
    return await clientRequest<MeetingParticipant[]>(
      `/meeting-participants/meeting-group/${id}`,
      "GET",
    );
  },

  get: async (id: string) =>
    await clientRequest<MeetingParticipant>(
      `/meeting-participants/${id}`,
      "GET",
    ),

  create: async (data: Partial<MeetingParticipant>) => {
    const payload = createMeetingParticipantSchema.parse(data);
    return await clientRequest<MeetingParticipant>(
      `/meeting-participants?_rid=${crypto.randomUUID()}`,
      "POST",
      payload,
    );
  },

  update: async (id: string, data: Partial<MeetingParticipant>) => {
    const payload = updateParticipantSchema.parse(data);
    return await clientRequest<MeetingParticipant>(
      `/meeting-participants/${id}`,
      "PATCH",
      payload,
    );
  },

  delete: async (id: string) =>
    await clientRequest<void>(`/meeting-participants/${id}`, "DELETE"),
};
