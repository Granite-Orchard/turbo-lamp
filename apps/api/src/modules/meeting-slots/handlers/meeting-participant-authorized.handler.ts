import { EventsHandler, IEventHandler } from '@nestjs/cqrs';
import { AvailabilitiesService } from '../../availabilities/availabilities.service';
import { CalendarsService } from '../../calendars/calendars.service';
import { MeetingGroupsService } from '../../meeting-groups/meeting-groups.service';
import { MeetingParticipantAuthorizedEvent } from '../../meeting-participants/events/meeting-participant-authorized.event';
import { MeetingSlotsService } from '../meeting-slots.service';

@EventsHandler(MeetingParticipantAuthorizedEvent)
export class MeetingParticipantAuthorizedHandler implements IEventHandler<MeetingParticipantAuthorizedEvent> {
  constructor(
    private readonly meetingGroupsService: MeetingGroupsService,
    private readonly meetingSlotsService: MeetingSlotsService,
    private readonly availabilitiesService: AvailabilitiesService,
    private readonly calendarsService: CalendarsService,
  ) {}

  async handle(event: MeetingParticipantAuthorizedEvent) {
    const { entity } = event;

    const meetingGroup = await this.meetingGroupsService.findOneBy({
      id: entity.meetingGroupId,
    });

    if (!meetingGroup) return;

    if (meetingGroup.authorId === entity.userId) return;

    const hasValidContext = await this.validateUserContext(entity.userId);
    if (!hasValidContext) {
      return;
    }

    await this.meetingSlotsService.calculate(
      entity.meetingGroupId,
      meetingGroup.authorId,
    );
  }

  private async validateUserContext(userId: string): Promise<boolean> {
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
