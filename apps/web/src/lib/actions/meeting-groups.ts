"use server";

import { meetingGroupsApi } from "../api/meeting-groups";
import { MeetingGroup } from "@/lib/types";

export async function getMeetingGroupAction(id: string): Promise<MeetingGroup> {
  return await meetingGroupsApi.get(id);
}

export async function listMeetingGroupsAction(): Promise<MeetingGroup[]> {
  return await meetingGroupsApi.list();
}

export async function createMeetingGroupAction(
  data: Partial<MeetingGroup>,
): Promise<MeetingGroup> {
  return await meetingGroupsApi.create(data);
}

export async function updateMeetingGroupAction(
  id: string,
  data: Partial<MeetingGroup>,
): Promise<MeetingGroup> {
  return await meetingGroupsApi.update(id, data);
}

export async function deleteMeetingGroupAction(id: string): Promise<void> {
  await meetingGroupsApi.delete(id);
}
