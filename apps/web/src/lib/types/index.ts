export interface WeeklyAvailability {
  id: string;
  dayOfWeek: number; // 0-6 (Sunday-Saturday)
  startTime: string; // HH:mm format
  endTime: string; // HH:mm format
  isAvailable: boolean;
}
export interface Login {
  username: string;
  password: string;
}

export interface Register {
  username: string;
  password: string;
  confirmPassword: string;
  timezone?: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  emailVerified: boolean;
  image?: string;
  timezone?: string;
}

export interface Profile {
  id: string;
  userId: string;
  user: User;
  accountId: string;
  providerId: string;
}

// Calendar types
export interface Calendar {
  id: string;
  userId: string;
  providerId: string;
  externalId: string;
  name: string;
  timezone: string;
  enabled: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ExternalCalendar {
  calendarId: string;
  providerId: string;
  name?: string;
  description?: string;
  timezone?: string;
  primary?: boolean;
  accessRole?: string;
}

// Availability types
export type DayOfWeek =
  | "Monday"
  | "Tuesday"
  | "Wednesday"
  | "Thursday"
  | "Friday"
  | "Saturday"
  | "Sunday";

export interface TimeBlock {
  start_time: string; // HH:MM
  end_time: string; // HH:MM
}

export interface Availability {
  id: string;
  userId: string;
  dayOfWeek: number;
  startTime: string;
  endTime: string;
  isAvailable: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface AvailabilityOverride {
  id: string;
  userId: string;
  date: string; // ISO date string
  startTime: string;
  endTime: string;
  isAvailable: boolean;
  createdAt: string;
  updatedAt: string;
}

// Meeting Group types
export type MeetingGroupStatus = "open" | "finalized" | "cancelled";

export interface MeetingGroup {
  id: string;
  authorId: string;
  summary: string;
  description?: string;
  magicLink?: string;
  location?: string;
  duration: number;
  after: string;
  before: string;
  calendarId: string;
  status: MeetingGroupStatus;
  timezone: string;
  createdAt: string;
  updatedAt: string;
  participants: MeetingParticipant[];
  meeting?: Meeting;
}

export interface CreateMeetingGroupPayload {
  calendarId: string;
  summary: string;
  description?: string;
  location?: string;
  duration: number;
  after: string;
  before: string;
  timezone: string;
}

// Meeting Participant types
export type ParticipantInvitationState = "pending" | "accepted" | "declined";
export type ParticipantAuthState =
  | "unauthorized"
  | "authorized"
  | "not_required";

export interface MeetingParticipant {
  id: string;
  user?: User;
  userId?: string;
  meetingGroupId: string;
  meetingGroup?: MeetingGroup;
  email: string;
  required: boolean;
  invitationState: ParticipantInvitationState;
  authState: ParticipantAuthState;
  createdAt: string;
  updatedAt: string;
}

// Meeting Slot types
export interface MeetingSlot {
  id: string;
  meetingGroupId: string;
  meetingGroup?: MeetingGroup;
  start: string;
  end: string;
  rank?: number;
  // participants_available?: string[];
  createdAt?: string;
}

export type CalculatedSlots = MeetingSlot[];

// Meeting types
export interface Meeting {
  id: string;
  meetingGroupId: string;
  start: string;
  end: string;
  status: string;
  meetingGroup?: MeetingGroup;
  attendees?: MeetingAttendee[];
  createdAt: string;
  updatedAt: string;
}

export interface CreateMeetingPayload {
  meetingGroupId: string;
  start: string;
  end: string;
}

export interface MeetingAttendee {
  id: string;
  userId: string;
  user?: User;
  externalEventId: string;
  email: string;
  meetingId: string;
  meeting?: Meeting;
  createdAt: string;
  updatedAt: string;
}

export interface CreateMeetingAttendeePayload {
  meetingId: string;
  userId: string;
  externalEventId: string;
  email: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  per_page: number;
}

export interface ApiError {
  message: string;
  code?: string;
  details?: Record<string, string[]>;
}
