"use server";

import { revalidatePath } from "next/cache";
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
  const result = await meetingGroupsApi.create(data);
  revalidatePath("/dashboard/meeting-groups");
  return result;
}

export async function updateMeetingGroupAction(
  id: string,
  data: Partial<MeetingGroup>,
): Promise<MeetingGroup> {
  const result = await meetingGroupsApi.update(id, data);
  revalidatePath("/dashboard/meeting-groups", "layout");
  return result;
}

export async function deleteMeetingGroupAction(id: string): Promise<void> {
  await meetingGroupsApi.delete(id);
  revalidatePath("/dashboard/meeting-groups");
}
