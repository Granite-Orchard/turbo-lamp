import { z } from "zod";

export const isoDateTimeSchema = z.iso.datetime();
export const isoDateSchema = z.string().regex(/^\d{4}-\d{2}-\d{2}$/);
export const hhmmSchema = z.string().regex(/^([01]\d|2[0-3]):([0-5]\d)$/);

export const loginSchema = z.object({
  username: z.email(),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters.")
    .regex(/[A-Z]/, "Password must include at least one uppercase letter")
    .regex(
      /[!@#$%^&*(),.?":{}|<>]/,
      "Password must include at least one special character",
    ),
});

export const registerSchema = loginSchema
  .extend({
    timezone: z.string().optional(),
    confirmPassword: z
      .string()
      .min(8, "Password must be at least 8 characters.")
      .regex(/[A-Z]/, "Password must include at least one uppercase letter")
      .regex(
        /[!@#$%^&*(),.?":{}|<>]/,
        "Password must include at least one special character",
      ),
  })
  .refine((value) => value.password === value.confirmPassword, {
    path: ["confirmPassword"],
    message: "Password and confirm password must match",
  });

export const calendarSchema = z.object({
  id: z.uuid().optional(),
  userId: z.uuid().optional(),
  providerId: z.string().min(1),
  externalId: z.string().min(1),
  name: z.string().min(1),
  timezone: z.string().min(1),
  enabled: z.boolean(),
  createdAt: isoDateTimeSchema.optional(),
  updatedAt: isoDateTimeSchema.optional(),
});

export const createCalendarSchema = z.object(calendarSchema.shape).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const updateCalendarSchema = createCalendarSchema.partial();

export const availabilitySchema = z
  .object({
    id: z.uuid().optional(),
    userId: z.uuid().optional(),
    dayOfWeek: z.number().int().min(0).max(6),
    startTime: hhmmSchema,
    endTime: hhmmSchema,
    isAvailable: z.boolean(),
    createdAt: isoDateTimeSchema.optional(),
    updatedAt: isoDateTimeSchema.optional(),
  })
  .refine((value) => value.startTime < value.endTime, {
    path: ["endTime"],
    message: "endTime must be later than startTime",
  });

export const availabilityOverrideSchema = z
  .object({
    id: z.uuid().optional(),
    userId: z.uuid().optional(),
    date: isoDateSchema,
    startTime: hhmmSchema,
    endTime: hhmmSchema,
    isAvailable: z.boolean(),
    createdAt: isoDateTimeSchema.optional(),
    updatedAt: isoDateTimeSchema.optional(),
  })
  .refine((value) => value.startTime < value.endTime, {
    path: ["endTime"],
    message: "endTime must be later than startTime",
  });

export const meetingGroupStatusSchema = z.enum([
  "open",
  "finalized",
  "cancelled",
]);

export const meetingGroupSchema = z
  .object({
    id: z.uuid().optional(),
    creatorId: z.uuid().optional(),
    summary: z.string().min(1),
    description: z.string().optional(),
    magicLink: z.string().optional(),
    location: z.string().optional(),
    duration: z.number().int().positive(),
    after: isoDateTimeSchema,
    before: isoDateTimeSchema,
    calendarId: z.uuid(),
    status: meetingGroupStatusSchema.optional(),
    timezone: z.string().optional(),
    createdAt: isoDateTimeSchema.optional(),
    updatedAt: isoDateTimeSchema.optional(),
  })
  .refine((value) => value.after < value.before, {
    path: ["before"],
    message: "before must be later than after",
  });

export const meetingParticipantInvitationStateSchema = z.enum([
  "pending",
  "accepted",
  "declined",
]);

export const meetingParticipantAuthStateSchema = z.enum([
  "unauthorized",
  "authorized",
  "not_required",
]);

export const meetingParticipantSchema = z
  .object({
    id: z.uuid(),
    userId: z.uuid().nullable().optional(),
    meetingGroupId: z.uuid(),
    email: z.email(),
    required: z.boolean(),
    invitationState: meetingParticipantInvitationStateSchema,
    authState: meetingParticipantAuthStateSchema,
    createdAt: isoDateTimeSchema.optional(),
    updatedAt: isoDateTimeSchema.optional(),
  })
  .refine((value) => Boolean(value.userId) || Boolean(value.email), {
    path: ["email"],
    message: "Either userId or email is required",
  });

export const meetingSlotSchema = z
  .object({
    id: z.uuid().optional(),
    meetingGroupId: z.uuid().optional(),
    start: isoDateTimeSchema,
    end: isoDateTimeSchema,
    rank: z.number().optional(),
    createdAt: isoDateTimeSchema.optional(),
  })
  .refine((value) => value.start < value.end, {
    path: ["end"],
    message: "end must be later than start",
  });

export const meetingSchema = z
  .object({
    id: z.uuid().optional(),
    meetingGroupId: z.uuid(),
    start: isoDateTimeSchema,
    end: isoDateTimeSchema,
    createdAt: isoDateTimeSchema.optional(),
    updatedAt: isoDateTimeSchema.optional(),
  })
  .refine((value) => value.start < value.end, {
    path: ["end"],
    message: "end must be later than start",
  });

export const meetingAttendeeSchema = z.object({
  id: z.uuid().optional(),
  meetingId: z.uuid(),
  userId: z.uuid().nullable().optional(),
  externalEventId: z.string().min(1),
  email: z.email(),
  createdAt: isoDateTimeSchema.optional(),
  updatedAt: isoDateTimeSchema.optional(),
});

export const createMeetingGroupSchema = z
  .object(meetingGroupSchema.shape)
  .omit({
    id: true,
    magicLink: true,
    timezone: true,
    creatorId: true,
    createdAt: true,
    updatedAt: true,
  });

export const updateMeetingGroupSchema = createMeetingGroupSchema.partial();

export const createAvailabilitySchema = z
  .object(availabilitySchema.shape)
  .omit({
    id: true,
    userId: true,
    createdAt: true,
    updatedAt: true,
  });

export const updateAvailabilitySchema = createAvailabilitySchema.partial();

export const createAvailabilityOverrideSchema = z
  .object(availabilityOverrideSchema.shape)
  .omit({
    id: true,
    userId: true,
    createdAt: true,
    updatedAt: true,
  });

export const updateAvailabilityOverrideSchema =
  createAvailabilityOverrideSchema.partial();

export const createMeetingParticipantSchema = z
  .object(meetingParticipantSchema.shape)
  .omit({
    id: true,
    createdAt: true,
    updatedAt: true,
    authState: true,
    invitationState: true,
  });

export const meetingStatusSchema = z.enum(["scheduled", "cancelled"]);

export const createMeetingSchema = z.object({
  meetingGroupId: z.uuid(),
  start: isoDateTimeSchema,
  end: isoDateTimeSchema,
  status: meetingStatusSchema.optional(),
});

export const updateMeetingSchema = createMeetingSchema.partial();

export const createParticipantSchema = z
  .object(meetingParticipantSchema.shape)
  .omit({
    id: true,
    createdAt: true,
    updatedAt: true,
  });

export const updateParticipantSchema = createParticipantSchema.partial();

export const createMeetingAttendeeSchema = z
  .object(meetingAttendeeSchema.shape)
  .omit({
    id: true,
    createdAt: true,
    updatedAt: true,
  });

export const updateMeetingAttendeeSchema =
  createMeetingAttendeeSchema.partial();
