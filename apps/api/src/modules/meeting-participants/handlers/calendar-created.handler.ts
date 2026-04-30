import { Inject, Logger } from '@nestjs/common';
import { EventsHandler, IEventHandler } from '@nestjs/cqrs';
import { ParticipantAuthState } from '../../../libs/constants';
import { CalendarCreatedEvent } from '../../calendars/events/calendar-created.event';
import { MeetingParticipantsService } from '../meeting-participants.service';

@EventsHandler(CalendarCreatedEvent)
export class CalendarCreatedHandler implements IEventHandler<CalendarCreatedEvent> {
  private readonly logger = new Logger(CalendarCreatedHandler.name);

  constructor(
    @Inject(MeetingParticipantsService)
    private readonly meetingParticipantsService: MeetingParticipantsService,
  ) {}

  async handle(event: CalendarCreatedEvent) {
    const { entity } = event;
    const participations = await this.meetingParticipantsService.findAllBy({
      userId: entity.userId,
      authState: ParticipantAuthState.UNAUTHORIZED,
    });
    if (participations.length === 0) return;
    const promises = participations.map((p) =>
      this.meetingParticipantsService.update(p.id, {
        authState: ParticipantAuthState.AUTHORIZED,
      }),
    );
    await Promise.all(promises);
  }
}
