"use server";

import { meetingParticipantsApi } from "@/lib/api/meeting-participants";
import { MeetingParticipant } from "@/lib/types";

export async function createMeetingGroupParticipantAction(
  data: Partial<MeetingParticipant>,
): Promise<MeetingParticipant> {
  return await meetingParticipantsApi.create(data);
}
