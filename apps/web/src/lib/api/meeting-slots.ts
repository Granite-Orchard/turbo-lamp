import type { MeetingSlot } from "@/lib/types";
import { serverRequest } from "./server";

export const meetingSlotsApi = {
  list: async (id: string) =>
    await serverRequest<MeetingSlot[]>(`/meeting-slots/${id}`, "GET"),

  calculate: async (meetingGroupId: string) =>
    await serverRequest<MeetingSlot[]>(
      `/meeting-slots/${meetingGroupId}/calculate`,
      "GET",
    ),
};
