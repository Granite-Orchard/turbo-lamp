import { Inject, Logger } from '@nestjs/common';
import { EventsHandler, IEventHandler } from '@nestjs/cqrs';
import { ExternalCalendarService } from '../../calendars/external-calendar.service';
import { MeetingDeletedEvent } from '../events/meeting-deleted.event';

@EventsHandler(MeetingDeletedEvent)
export class MeetingDeletedHandler implements IEventHandler<MeetingDeletedEvent> {
  private readonly logger = new Logger(MeetingDeletedHandler.name);

  constructor(
    @Inject(ExternalCalendarService)
    private readonly externalCalendarService: ExternalCalendarService,
  ) {}

  async handle(event: MeetingDeletedEvent) {
    const { entity } = event;
    if (!entity.externalEventId) {
      this.logger.warn('no external event to cleanup');
      return;
    }
    if (!entity.meetingGroup) {
      this.logger.warn('no meeting group to cleanup');
      return;
    }
    if (!entity.meetingGroup.calendar) {
      this.logger.warn('no calendar to cleanup');
      return;
    }
    if (!entity.meetingGroup.calendar.account) {
      this.logger.warn('no account to cleanup');
      return;
    }
    const result = await this.externalCalendarService.deleteEvent('google', {
      account: entity.meetingGroup.calendar.account,
      eventId: entity.externalEventId,
    });
    this.logger.debug('delete event result', result);
  }
}
