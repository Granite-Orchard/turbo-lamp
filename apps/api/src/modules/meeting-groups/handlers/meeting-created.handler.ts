import { Inject, Logger } from '@nestjs/common';
import { EventsHandler, IEventHandler } from '@nestjs/cqrs';
import { ExternalCalendarService } from '../../calendars/external-calendar.service';
import { MeetingAttendeesService } from '../../meeting-attendees/meeting-attendees.service';
import { MeetingCreatedEvent } from '../../meetings/events/meeting-created.event';
import { MeetingGroupsService } from '../meeting-groups.service';
import { MeetingsService } from '../../meetings/meetings.service';

@EventsHandler(MeetingCreatedEvent)
export class MeetingCreatedHandler implements IEventHandler<MeetingCreatedEvent> {
  private readonly logger = new Logger(MeetingCreatedHandler.name);

  constructor(
    @Inject(MeetingsService)
    private readonly meetingService: MeetingsService,
    @Inject(MeetingGroupsService)
    private readonly meetingGroupsService: MeetingGroupsService,
    @Inject(MeetingAttendeesService)
    private readonly meetingAttendeesService: MeetingAttendeesService,
    @Inject(ExternalCalendarService)
    private readonly externalCalendarService: ExternalCalendarService,
  ) {}

  async handle(event: MeetingCreatedEvent) {
    this.logger.warn('handle invoked', {
      correlationId: '40d216a5-7c1d-43c8-9a2d-c9747e4c8cd0',
      event,
    });
    const { entity } = event;
    const meetingGroup = await this.meetingGroupsService.findOne(
      entity.meetingGroupId,
      {
        participants: { user: { accounts: true } },
        calendar: { account: true },
        meeting: true,
      },
    );
    if (!meetingGroup) {
      this.logger.warn(`MeetingGroup not found for meeting ${entity.id}`, {
        correlationId: '6cedd968-7b97-4377-bce9-60fe242db16f',
      });
      return;
    }

    const authorProviderAccount = meetingGroup.calendar.account;

    if (!authorProviderAccount) {
      this.logger.warn(
        `No provider account for author ${meetingGroup.authorId}`,
        { correlationId: '0d0d51a6-ef20-4d5c-ac8f-afa21bbdece9' },
      );
      return;
    }

    const participants = meetingGroup.participants;

    if (participants.length === 0) {
      this.logger.warn(
        `No valid participants to invite for meeting ${entity.id}`,
        { correlationId: '35e8a6e9-47cf-4536-80ab-18bd829f1051' },
      );
      return;
    }

    const externalCalendarId = meetingGroup.calendar.externalId;

    const externalEvent = await this.externalCalendarService.createEvent(
      'google',
      {
        account: authorProviderAccount,
        calendarId: externalCalendarId,
        event: {
          summary: meetingGroup.summary,
          description: meetingGroup.description,
          attendees: participants
            .filter((p) => p.userId !== meetingGroup.authorId && p.user)
            .map((participant) => {
              return { email: participant.user.email };
            }),
          reminders: { useDefault: true },
          start: {
            dateTime: new Date(entity.start).toISOString(),
          },
          end: {
            dateTime: new Date(entity.end).toISOString(),
          },
        },
      },
    );

    await this.meetingService.update(meetingGroup.meeting.id, {
      externalEventId: externalEvent.id,
    });

    const results = await Promise.allSettled(
      participants.map((participant) =>
        this.meetingAttendeesService.create({
          userId: participant.userId!,
          meetingId: entity.id,
          email: participant.user ? participant.user.email : participant.email,
          createdBy: meetingGroup.authorId,
        }),
      ),
    );

    const failed = results.filter((r) => r.status === 'rejected');
    if (failed.length > 0) {
      this.logger.error(
        `Failed to create ${failed.length} attendees for meeting ${entity.id}`,
        failed,
      );
    }
  }
}
