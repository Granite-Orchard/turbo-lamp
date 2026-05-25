import { EventsHandler, IEventHandler } from '@nestjs/cqrs';
import { AvailabilitiesService } from '../../availabilities/availabilities.service';
import { CalendarsService } from '../../calendars/calendars.service';
import { MeetingGroupsService } from '../../meeting-groups/meeting-groups.service';
import { MeetingParticipantAuthorizedEvent } from '../../meeting-participants/events/meeting-participant-authorized.event';
import { MeetingSlotsService } from '../meeting-slots.service';
import { Logger } from '@nestjs/common';

@EventsHandler(MeetingParticipantAuthorizedEvent)
export class MeetingParticipantAuthorizedHandler implements IEventHandler<MeetingParticipantAuthorizedEvent> {
  private readonly logger: Logger = new Logger(
    MeetingParticipantAuthorizedHandler.name,
  );
  constructor(
    private readonly meetingGroupsService: MeetingGroupsService,
    private readonly meetingSlotsService: MeetingSlotsService,
    private readonly availabilitiesService: AvailabilitiesService,
    private readonly calendarsService: CalendarsService,
  ) {}

  async handle(event: MeetingParticipantAuthorizedEvent) {
    this.logger.debug('handle invoked', {
      correlationId: '771f9d1c-55e4-4110-b1fe-f1f0173357b1',
      event,
    });
    const { entity } = event;

    const meetingGroup = await this.meetingGroupsService.findOneBy({
      id: entity.meetingGroupId,
    });

    if (!meetingGroup) return;

    if (meetingGroup.authorId === entity.userId) return;

    const hasValidContext = await this.validateUserContext(entity.userId!);
    if (!hasValidContext) {
      return;
    }

    await this.meetingSlotsService.calculate(
      entity.meetingGroupId,
      meetingGroup.authorId,
    );
  }

  private async validateUserContext(userId: string): Promise<boolean> {
    this.logger.debug('validateUserContext invoked', {
      correlationId: '52dc11a1-d5f1-4c3d-98c6-a1ab09b8a5ae',
      userId,
    });
    const availabilities = await this.availabilitiesService.findAllBy({
      userId,
    });
    if (availabilities.length === 0) {
      return false;
    }

    const calendars = await this.calendarsService.findAllBy({
      userId,
      enabled: true,
    });
    if (calendars.length === 0) {
      return false;
    }

    return true;
  }
}
