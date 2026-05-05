"use server";

import { availabilityOverridesApi } from "@/lib/api/availability-overrides";
import type { AvailabilityOverride } from "@/lib/types";
import { revalidatePath } from "next/cache";

export async function listAvailabilityOverridesAction(): Promise<
  AvailabilityOverride[]
> {
  return await availabilityOverridesApi.list();
}

export async function createAvailabilityOverrideAction(
  data: Partial<AvailabilityOverride>,
) {
  const result = await availabilityOverridesApi.create(data);
  revalidatePath("/dashboard/availability/overrides");
  return result;
}

export async function updateAvailabilityOverrideAction(
  id: string,
  data: Partial<AvailabilityOverride>,
) {
  const result = await availabilityOverridesApi.update(id, data);
  revalidatePath("/dashboard/availability/overrides");
  return result;
}

export async function deleteAvailabilityOverrideAction(id: string) {
  const result = await availabilityOverridesApi.delete(id);
  revalidatePath("/dashboard/availability/overrides");
  return result;
}
