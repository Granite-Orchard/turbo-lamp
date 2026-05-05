"use server";

import { MeetingParticipant } from "@/lib/types";
import { createMeetingGroupParticipantAction } from "@/lib/actions/meeting-participants";

export async function createMeetingGroupParticipantsAction(
  data: Partial<MeetingParticipant>[],
): Promise<MeetingParticipant[]> {
  const result = [];
  for (const participant of data) {
    const response = await createMeetingGroupParticipantAction(participant);
    result.push(response);
  }
  return result;
}
