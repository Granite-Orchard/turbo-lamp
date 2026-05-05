"use server";

import { availabilitiesApi } from "@/lib/api/availabilities";
import { Availability } from "@/lib/types";
import { revalidatePath } from "next/cache";

export async function createAvailabilityAction(data: Partial<Availability>) {
  const result = await availabilitiesApi.create(data);
  revalidatePath("/dashboard/availability");
  return result;
}

export async function updateAvailabilityAction(
  id: string,
  data: Partial<Availability>,
) {
  const result = await availabilitiesApi.update(id, data);
  revalidatePath("/dashboard/availability");
  return result;
}

export async function deleteAvailabilityAction(id: string) {
  const result = await availabilitiesApi.delete(id);
  revalidatePath("/dashboard/availability");
  return result;
}

export async function listAvailabilitiesAction() {
  return await availabilitiesApi.list();
}
