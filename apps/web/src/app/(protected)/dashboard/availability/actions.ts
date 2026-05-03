"use server";

import { availabilitiesApi } from "@/lib/api/availabilities";
import { updateAvailabilitySchema } from "@/lib/schemas";
import { Availability } from "@/lib/types";
import { revalidatePath } from "next/cache";

export async function updateAvailabilityAction(
  id: string,
  data: Partial<Availability>,
) {
  const payload = updateAvailabilitySchema.parse(data);
  const result = await availabilitiesApi.update(id, payload);
  revalidatePath("/dashboard/availability");
  return result;
}
