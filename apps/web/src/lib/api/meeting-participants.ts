import type { MeetingParticipant } from "@/lib/types";
import {
  createMeetingParticipantSchema,
  updateParticipantSchema,
} from "../schemas";
import { serverRequest } from "./server";

export const meetingParticipantsApi = {
  get: async (id: string) =>
    await serverRequest<MeetingParticipant>(
      `/meeting-participants/${id}`,
      "GET",
    ),

  create: async (data: Partial<MeetingParticipant>) => {
    const payload = createMeetingParticipantSchema.parse(data);
    return await serverRequest<MeetingParticipant>(
      `/meeting-participants?_rid=${crypto.randomUUID()}`,
      "POST",
      payload,
    );
  },

  update: async (id: string, data: Partial<MeetingParticipant>) => {
    const payload = updateParticipantSchema.parse(data);
    return await serverRequest<MeetingParticipant>(
      `/meeting-participants/${id}`,
      "PATCH",
      payload,
    );
  },

  delete: async (id: string) =>
    await serverRequest<void>(`/meeting-participants/${id}`, "DELETE"),
};
