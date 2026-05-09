"use server";

import { revalidatePath } from "next/cache";
import { meetingAttendeesApi } from "@/lib/api/meeting-attendees";
import type { MeetingAttendee } from "@/lib/types";

export async function listMeetingAttendeesAction(): Promise<MeetingAttendee[]> {
  return await meetingAttendeesApi.list();
}

export async function createMeetingAttendeesAction(
  data: Partial<MeetingAttendee>,
) {
  const result = await meetingAttendeesApi.create(data);
  revalidatePath("/dashboard/meeting-attendees");
  return result;
}

export async function updateMeetingAttendeesAction(
  id: string,
  data: Partial<MeetingAttendee>,
) {
  const result = await meetingAttendeesApi.update(id, data);
  revalidatePath("/dashboard/meeting-attendees");
  return result;
}

export async function deleteMeetingAttendeesAction(id: string) {
  const result = await meetingAttendeesApi.delete(id);
  revalidatePath("/dashboard/meeting-attendees");
  return result;
}
