"use server";

import { meetingsApi } from "@/lib/api/meetings";
import { Meeting } from "@/lib/types";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

export async function getMeetingAction(id: string): Promise<Meeting> {
  return await meetingsApi.get(id);
}

export async function listMeetingsAction(): Promise<Meeting[]> {
  return await meetingsApi.list();
}

export async function createMeetingAction(data: Partial<Meeting>) {
  const result = await meetingsApi.create(data);
  revalidatePath("/dashboard/meetings", "layout");
  return result;
}

export async function updateMeetingAction(id: string, data: Partial<Meeting>) {
  const result = await meetingsApi.update(id, data);
  revalidatePath("/dashboard/meetings", "layout");
  return result;
}

export async function deleteMeetingAction(id: string) {
  await meetingsApi.delete(id);
  revalidatePath("/dashboard/meetings", "layout");
  redirect("/dashboard/meetings");
}
