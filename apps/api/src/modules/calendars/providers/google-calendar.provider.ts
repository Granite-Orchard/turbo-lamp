import { HttpService } from '@nestjs/axios';
import {
  Injectable,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import { firstValueFrom } from 'rxjs';
import { GoogleAuthManager } from '../../auth/managers/google-auth.manager';
import {
  Calendar,
  CalendarEvent,
  CalendarProvider,
  CreateEventParams,
  DeleteEventParams,
  GetEventParams,
  GetTimezoneParams,
  ListCalendarsParams,
  ListEventsParams,
  UpdateEventParams,
} from '../external-calendar.service';

type GoogleCalendarEvent = {
  id: string;
  status?: string;
  summary?: string;
  description?: string;
  location?: string;
  attendees?: { email: string }[];
  start: { dateTime: string; date?: string; timeZone?: string };
  end: { dateTime: string; date?: string; timeZone?: string };
};

type GoogleCalendarListItem = {
  id: string;
  summary?: string;
  description?: string;
  timeZone?: string;
  accessRole?: string;
  primary?: boolean;
};

type GoogleCalendarListResponse = {
  items: GoogleCalendarListItem[];
};

type GoogleCalendarSettingsResponse = {
  kind: string;
  id: string;
  value: string;
};

// TODO: implement cache manager here to mitigate rate limiting?
@Injectable()
export class GoogleCalendarProvider implements CalendarProvider {
  private readonly logger: Logger = new Logger(GoogleCalendarProvider.name);
  private readonly baseUrl = 'https://www.googleapis.com/calendar/v3';

  constructor(
    private readonly http: HttpService,
    private readonly auth: GoogleAuthManager,
  ) {}

  async getTimezone(params: GetTimezoneParams): Promise<string> {
    const accessToken = await this.auth.getValidAccessToken(params.account);
    const { data } = await firstValueFrom<{
      data: GoogleCalendarSettingsResponse;
    }>(
      this.http.get(`${this.baseUrl}/users/me/settings/timezone`, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      }),
    );
    return data.value;
  }

  async listCalendars(params: ListCalendarsParams): Promise<Calendar[]> {
    const accessToken = await this.auth.getValidAccessToken(params.account);

    const { data } = await firstValueFrom<{ data: GoogleCalendarListResponse }>(
      this.http.get(`${this.baseUrl}/users/me/calendarList`, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      }),
    );

    return (data.items ?? []).reduce<Calendar[]>((acc, c) => {
      if (c.id.includes('group.v.calendar.google.com')) {
        return acc;
      }

      acc.push({
        providerId: params.account.providerId,
        calendarId: c.id,
        name: c.summary,
        description: c.description,
        timezone: c.timeZone,
        accessRole: c.accessRole,
        primary: c.primary || false,
      });

      return acc;
    }, []);
  }

  async listEvents(params: ListEventsParams): Promise<CalendarEvent[]> {
    try {
      const accessToken = await this.auth.getValidAccessToken(params.account);

      const { timeMin, timeMax, calendarId = 'primary' } = params;

      const { data } = await firstValueFrom<{
        data: { items: GoogleCalendarEvent[] };
      }>(
        this.http.get(`${this.baseUrl}/calendars/${calendarId}/events`, {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
          params: {
            timeMin,
            timeMax,
            singleEvents: true,
            orderBy: 'startTime',
          },
        }),
      );

      return (data.items ?? []).map((e) => ({
        id: e.id,
        summary: e.summary,
        description: e.description,
        status: e.status,
        start: {
          dateTime: e.start.dateTime,
          timeZone: e.start?.timeZone ?? '',
        },
        end: {
          dateTime: e.end.dateTime,
          timeZone: e.start?.timeZone ?? '',
        },
      }));
    } catch (err: any) {
      throw new InternalServerErrorException(err);
    }
  }

  async getEvent(params: GetEventParams): Promise<CalendarEvent> {
    const accessToken = await this.auth.getValidAccessToken(params.account);

    const { eventId, calendarId = 'primary' } = params;

    const { data } = await firstValueFrom<{ data: GoogleCalendarEvent }>(
      this.http.get(
        `${this.baseUrl}/calendars/${calendarId}/events/${eventId}`,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        },
      ),
    );

    return {
      id: data.id,
      summary: data.summary,
      description: data.description,
      start: {
        dateTime: data.start.dateTime,
      },
      end: {
        dateTime: data.end.dateTime,
      },
    };
  }

  async createEvent(params: CreateEventParams): Promise<CalendarEvent> {
    const accessToken = await this.auth.getValidAccessToken(params.account);

    const { calendarId = 'primary', event } = params;

    const { data } = await firstValueFrom<{ data: GoogleCalendarEvent }>(
      this.http.post(
        `${this.baseUrl}/calendars/${calendarId}/events?sendUpdates=all`,
        event,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
          },
        },
      ),
    );

    return {
      id: data.id,
      summary: data.summary,
      description: data.description,
      location: data.location,
      attendees: data.attendees,
      reminders: {
        useDefault: true,
      },
      start: {
        dateTime: data.start.dateTime,
      },
      end: {
        dateTime: data.end.dateTime,
      },
    };
  }

  async updateEvent(params: UpdateEventParams): Promise<CalendarEvent> {
    const accessToken = await this.auth.getValidAccessToken(params.account);

    const { eventId, calendarId = 'primary', patch } = params;

    const { data } = await firstValueFrom<{ data: GoogleCalendarEvent }>(
      this.http.patch(
        `${this.baseUrl}/calendars/${calendarId}/events/${eventId}`,
        patch,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
          },
        },
      ),
    );

    return {
      id: data.id,
      summary: data.summary,
      description: data.description,
      start: {
        dateTime: data.start.dateTime,
      },
      end: {
        dateTime: data.end.dateTime,
      },
    };
  }

  async deleteEvent(params: DeleteEventParams): Promise<{ success: true }> {
    const accessToken = await this.auth.getValidAccessToken(params.account);

    const { eventId, calendarId = 'primary' } = params;

    await firstValueFrom(
      this.http.delete(
        `${this.baseUrl}/calendars/${calendarId}/events/${eventId}`,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        },
      ),
    );

    return { success: true };
  }
}
