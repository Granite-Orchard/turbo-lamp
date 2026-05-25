import { Injectable, Logger } from '@nestjs/common';
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
  /**
   * Gets the user's timezone setting.
   */
  getTimezone(params: GetTimezoneParams): Promise<string>;
  /**
   * Lists all calendars accessible by the user.
   */
  listCalendars(params: ListCalendarsParams): Promise<Calendar[]>;
  /**
   * Lists events from an external calendar.
   * @throws CalendarNotFoundException - When calendar doesn't exist (404)
   * @throws CalendarAccessDeniedException - When access denied (403)
   * @throws InternalServerErrorException - For other errors
   */
  listEvents(params: ListEventsParams): Promise<CalendarEvent[]>;
  /**
   * Gets a single event by ID.
   */
  getEvent(params: GetEventParams): Promise<CalendarEvent>;
  /**
   * Creates a new calendar event.
   */
  createEvent(params: CreateEventParams): Promise<CalendarEvent>;
  /**
   * Updates an existing calendar event.
   */
  updateEvent(params: UpdateEventParams): Promise<CalendarEvent>;
  /**
   * Deletes a calendar event.
   */
  deleteEvent(params: DeleteEventParams): Promise<{ success: true }>;
}

@Injectable()
export class ExternalCalendarService {
  private readonly logger: Logger = new Logger(ExternalCalendarService.name);
  private providers: Record<CalendarProviderType, CalendarProvider>;

  constructor(private readonly google: GoogleCalendarProvider) {
    this.providers = {
      google,
    };
  }

  private resolve(provider: CalendarProviderType): CalendarProvider {
    this.logger.debug('resolve invoked', {
      correlationId: '68bd107d-830a-491d-a7b5-1165e0d15e5b',
      provider,
    });
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
