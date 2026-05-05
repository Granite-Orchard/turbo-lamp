import { serverRequest } from "@/lib/api/client";
import {
  createAvailabilityOverrideSchema,
  updateAvailabilityOverrideSchema,
} from "@/lib/schemas";
import type { AvailabilityOverride } from "@/lib/types";

export const availabilityOverridesApi = {
  get: async (id: string) =>
    await serverRequest<AvailabilityOverride>(
      `/availability-overrides/${id}`,
      "GET",
    ),

  list: async () => {
    return await serverRequest<AvailabilityOverride[]>(
      `/availability-overrides`,
      "GET",
    );
  },

  create: async (data: Partial<AvailabilityOverride>) => {
    const payload = createAvailabilityOverrideSchema.parse(data);
    return await serverRequest<AvailabilityOverride>(
      `/availability-overrides?_rid=${crypto.randomUUID()}`,
      "POST",
      payload,
    );
  },

  upsert: async (data: Partial<AvailabilityOverride>) => {
    const payload = createAvailabilityOverrideSchema.parse(data);
    return await serverRequest<AvailabilityOverride>(
      `/availability-overrides/upsert?_rid=${crypto.randomUUID()}`,
      "POST",
      payload,
    );
  },

  update: async (id: string, data: Partial<AvailabilityOverride>) => {
    const payload = updateAvailabilityOverrideSchema.parse(data);
    return await serverRequest<AvailabilityOverride>(
      `/availability-overrides/${id}`,
      "PATCH",
      payload,
    );
  },

  delete: async (id: string) =>
    await serverRequest<void>(`/availability-overrides/${id}`, "DELETE"),
};
