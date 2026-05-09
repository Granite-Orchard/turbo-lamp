"use server";

import { meetingSlotsApi } from "@/lib/api/meeting-slots";

export async function listMeetingSlotsAction(id: string) {
  return await meetingSlotsApi.list(id);
}

export async function calculateMeetingSlotsAction(id: string) {
  return await meetingSlotsApi.calculate(id);
}
