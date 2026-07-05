import type { Waitlist } from "@/lib/types";
import { createWaitlistSchema } from "../schemas";
import { serverRequest } from "./server";

export const waitlistApi = {
  create: async (data: Partial<Waitlist>) => {
    const payload = createWaitlistSchema.parse(data);
    return await serverRequest<Waitlist>(
      `/waitlist?_rid=${crypto.randomUUID()}`,
      "POST",
      payload,
    );
  },
};
