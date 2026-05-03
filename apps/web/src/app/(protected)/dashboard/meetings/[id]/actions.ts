"use server";

import { redirect } from "next/navigation";
import { meetingsApi } from "@/lib/api/meetings";

export async function cancelMeetingAction(id: string) {
  await meetingsApi.delete(id);
  redirect("/dashboard/meetings");
}
