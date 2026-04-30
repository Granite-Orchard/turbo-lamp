"use server";

import { meetingGroupsApi } from "@/lib/api/meeting-groups";
import {
  createMeetingGroupSchema,
  createMeetingParticipantSchema,
} from "@/lib/schemas";
import { MeetingGroup, MeetingParticipant } from "@/lib/types";
import { revalidatePath } from "next/cache";
import { meetingParticipantsApi } from "../../../../lib/api/meeting-participants";

export async function createMeetingGroupAction(data: Partial<MeetingGroup>) {
  const payload = createMeetingGroupSchema.parse(data);
  const result = await meetingGroupsApi.create(payload);
  revalidatePath("/dashboard/meeting-groups");
  return result;
}

export async function updateMeetingGroupAction(
  id: string,
  data: Partial<MeetingGroup>,
) {
  const payload = createMeetingGroupSchema.parse(data);
  const result = await meetingGroupsApi.update(id, payload);
  revalidatePath("/dashboard/meeting-groups");
  return result;
}

export async function deleteMeetingGroupAction(id: string) {
  const result = await meetingGroupsApi.delete(id);
  revalidatePath("/dashboard/meeting-groups");
  return result;
}

export async function createMeetingGroupParticipantAction(
  data: Partial<MeetingParticipant>[],
) {
  const payload = data.map((d) => createMeetingParticipantSchema.parse(d));
  const promises = payload.map((p) =>
    meetingParticipantsApi.create({ ...p, userId: p.userId ?? undefined }),
  );
  return await Promise.all(promises);
}
