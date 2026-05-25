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
    this.logger.debug('handle invoked', {
      correlationId: 'a177a2df-f3a7-47c2-952e-64aef818f2e5',
      event,
    });
    const { entity } = event;
    if (!entity.externalEventId) {
      this.logger.warn('no external event to cleanup', {
        correlationId: '9d608495-b1d6-463d-b9ec-55dfb669b8fe',
      });
      return;
    }
    if (!entity.meetingGroup) {
      this.logger.warn('no meeting group to cleanup', {
        correlationId: 'b76083e6-0e1b-4261-a430-6825febef9ba',
      });
      return;
    }
    if (!entity.meetingGroup.calendar) {
      this.logger.warn('no calendar to cleanup', {
        correlationId: '8df183b1-bcd3-4f39-918d-bbabe44baf51',
      });
      return;
    }
    if (!entity.meetingGroup.calendar.account) {
      this.logger.warn('no account to cleanup', {
        correlationId: '29e8a0dc-493e-4da8-88dd-e378e480651f',
      });
      return;
    }
    const result = await this.externalCalendarService.deleteEvent('google', {
      account: entity.meetingGroup.calendar.account,
      eventId: entity.externalEventId,
    });
    this.logger.debug('delete event result', {
      correlationId: '09e86ce3-5e70-4be1-a229-8d6460da35e5',
      result,
    });
  }
}
