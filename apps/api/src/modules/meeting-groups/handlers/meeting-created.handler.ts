import { Inject, Logger } from '@nestjs/common';
import { EventsHandler, IEventHandler } from '@nestjs/cqrs';
import { ExternalCalendarService } from '../../calendars/external-calendar.service';
import { MeetingAttendeesService } from '../../meeting-attendees/meeting-attendees.service';
import { MeetingCreatedEvent } from '../../meetings/events/meeting-created.event';
import { MeetingGroupsService } from '../meeting-groups.service';

@EventsHandler(MeetingCreatedEvent)
export class MeetingCreatedHandler implements IEventHandler<MeetingCreatedEvent> {
  private readonly logger = new Logger(MeetingCreatedHandler.name);

  constructor(
    @Inject(MeetingGroupsService)
    private readonly meetingGroupsService: MeetingGroupsService,
    @Inject(MeetingAttendeesService)
    private readonly meetingAttendeesService: MeetingAttendeesService,
    @Inject(ExternalCalendarService)
    private readonly externalCalendarService: ExternalCalendarService,
  ) {}

  async handle(event: MeetingCreatedEvent) {
    const { entity } = event;
    const meetingGroup = await this.meetingGroupsService.findOne(
      entity.meetingGroupId,
      {
        participants: { user: { accounts: true } },
        calendar: { account: true },
      },
    );
    if (!meetingGroup) {
      this.logger.warn(`MeetingGroup not found for meeting ${entity.id}`);
      return;
    }

    const authorProviderAccount = meetingGroup.calendar.account;

    if (!authorProviderAccount) {
      this.logger.warn(
        `No provider account for author ${meetingGroup.authorId}`,
      );
      return;
    }

    const participants = meetingGroup.participants;

    if (participants.length === 0) {
      this.logger.log(
        `No valid participants to invite for meeting ${entity.id}`,
      );
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

    const results = await Promise.allSettled(
      participants.map((participant) =>
        this.meetingAttendeesService.create({
          userId: participant.userId!,
          meetingId: entity.id,
          externalEventId: externalEvent.id!,
          email: participant.user ? participant.user.email : participant.email,
          createdBy: meetingGroup.authorId,
        }),
      ),
    );

    const failed = results.filter((r) => r.status === 'rejected');
    if (failed.length > 0) {
      this.logger.error(
        `Failed to create ${failed.length} attendees for meeting ${entity.id}`,
      );
    }
  }
}
