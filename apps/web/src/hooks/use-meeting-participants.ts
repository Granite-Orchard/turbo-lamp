import useSWR from "swr";

import { meetingParticipantKeys } from "@/lib/swr/keys";
import { meetingParticipantsClientApi } from "@/lib/api/meeting-participants.client";
import { MeetingParticipant } from "@/lib/types";

export function useMeetingParticipants(
  meetingGroupId?: string,
  fallbackData?: MeetingParticipant[],
) {
  const swr = useSWR(
    meetingGroupId ? meetingParticipantKeys.list(meetingGroupId) : null,

    ([, , id]) => meetingParticipantsClientApi.list(id),

    {
      fallbackData,
      refreshInterval: 6000,
      dedupingInterval: 2000,
      revalidateOnFocus: true,
      revalidateOnReconnect: true,
    },
  );

  return {
    participants: swr.data ?? [],
    isLoading: swr.isLoading && !swr.data,
    error: swr.error,
  };
}
