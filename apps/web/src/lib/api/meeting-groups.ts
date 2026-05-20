import type { MeetingGroup } from "@/lib/types";
import { serverRequest } from "./server";
import {
  createMeetingGroupSchema,
  updateMeetingGroupSchema,
} from "@/lib/schemas";

export const meetingGroupsApi = {
  list: async () => {
    return await serverRequest<MeetingGroup[]>(`/meeting-groups`, "GET");
  },

  get: async (id: string) =>
    await serverRequest<MeetingGroup>(`/meeting-groups/${id}`, "GET"),

  create: async (data: Partial<MeetingGroup>) => {
    const payload = createMeetingGroupSchema.parse(data);
    return await serverRequest<MeetingGroup>(
      `/meeting-groups?_rid=${crypto.randomUUID()}`,
      "POST",
      payload,
    );
  },

  update: async (id: string, data: Partial<MeetingGroup>) => {
    const payload = updateMeetingGroupSchema.parse(data);
    return await serverRequest<MeetingGroup>(
      `/meeting-groups/${id}`,
      "PATCH",
      payload,
    );
  },

  delete: async (id: string) =>
    await serverRequest<void>(`/meeting-groups/${id}`, "DELETE"),
};
