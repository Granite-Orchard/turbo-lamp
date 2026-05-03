"use server";

import { redirect } from "next/navigation";
import { meetingsApi } from "@/lib/api/meetings";
import { revalidatePath } from "next/cache";

export async function cancelMeetingAction(id: string) {
  await meetingsApi.delete(id);
  revalidatePath("/dashboard/meetings");
  redirect("/dashboard/meetings");
}
