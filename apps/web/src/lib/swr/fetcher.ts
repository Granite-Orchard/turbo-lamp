import { meetingParticipantsClientApi } from "@/lib/api/meeting-participants.client";

export const meetingParticipantsFetcher = {
  list: (meetingGroupId: string) =>
    meetingParticipantsClientApi.list(meetingGroupId),

  get: (id: string) => meetingParticipantsClientApi.get(id),
};
