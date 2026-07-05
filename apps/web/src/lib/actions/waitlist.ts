"use server";

import { waitlistApi } from "@/lib/api/waitlist";
import { Waitlist } from "@/lib/types";

export async function createWaitlistAction(data: Partial<Waitlist>) {
  const result = await waitlistApi.create(data);
  return result;
}
