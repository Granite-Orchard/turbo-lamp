import { Injectable } from '@nestjs/common';
import { Account } from '../accounts/entities/account.entity';
import { GoogleCalendarProvider } from './providers/google-calendar.provider';

export type CalendarProviderType = 'google';

export type Calendar = {
  calendarId: string;
  providerId: string;
  name?: string;
  description?: string;
  timezone?: string;
  primary?: boolean;
  accessRole?: string;
};

export type CalendarEventTime = {
  dateTime: string;
  timeZone?: string;
};

export type CalendarEventAttendee = {
  email: string;
};

export type CalendarEventReminderOverride = {
  method: string;
  minutes: string;
};

export type CalendarEventReminder = {
  useDefault: boolean;
  overrides?: CalendarEventReminderOverride[];
};

export type CalendarEvent = {
  id?: string;
  summary?: string;
  description?: string;
  location?: string;
  attendees?: CalendarEventAttendee[];
  reminders?: CalendarEventReminder;
  start: CalendarEventTime;
  end: CalendarEventTime;
};

export type ListEventsParams = {
  account: Account;
  calendarId?: string;
  timeMin?: string;
  timeMax?: string;
};

export type GetEventParams = {
  account: Account;
  calendarId?: string;
  eventId: string;
};

export type CreateEventParams = {
  account: Account;
  calendarId?: string;
  event: CalendarEvent;
};

export type UpdateEventParams = {
  account: Account;
  calendarId?: string;
  eventId: string;
  patch: Partial<CalendarEvent>;
};

export type DeleteEventParams = {
  account: Account;
  calendarId?: string;
  eventId: string;
};

export type ListCalendarsParams = {
  account: Account;
};

export type GetTimezoneParams = {
  account: Account;
};

export interface CalendarProvider {
  getTimezone(params: GetTimezoneParams): Promise<string>;
  listCalendars(params: ListCalendarsParams): Promise<Calendar[]>;
  listEvents(params: ListEventsParams): Promise<CalendarEvent[]>;
  getEvent(params: GetEventParams): Promise<CalendarEvent>;
  createEvent(params: CreateEventParams): Promise<CalendarEvent>;
  updateEvent(params: UpdateEventParams): Promise<CalendarEvent>;
  deleteEvent(params: DeleteEventParams): Promise<{ success: true }>;
}

@Injectable()
export class ExternalCalendarService {
  private providers: Record<CalendarProviderType, CalendarProvider>;

  constructor(private readonly google: GoogleCalendarProvider) {
    this.providers = {
      google,
    };
  }

  private resolve(provider: CalendarProviderType): CalendarProvider {
    const instance = this.providers[provider];
    if (!instance) throw new Error(`Unsupported provider: ${provider}`);
    return instance;
  }

  getTimezone(provider: CalendarProviderType, params: GetTimezoneParams) {
    return this.resolve(provider).getTimezone(params);
  }

  listCalendars(provider: CalendarProviderType, params: ListCalendarsParams) {
    return this.resolve(provider).listCalendars(params);
  }

  listEvents(provider: CalendarProviderType, params: ListEventsParams) {
    return this.resolve(provider).listEvents(params);
  }

  getEvent(provider: CalendarProviderType, params: GetEventParams) {
    return this.resolve(provider).getEvent(params);
  }

  createEvent(provider: CalendarProviderType, params: CreateEventParams) {
    return this.resolve(provider).createEvent(params);
  }

  updateEvent(provider: CalendarProviderType, params: UpdateEventParams) {
    return this.resolve(provider).updateEvent(params);
  }

  deleteEvent(provider: CalendarProviderType, params: DeleteEventParams) {
    return this.resolve(provider).deleteEvent(params);
  }
}
