import { EventsHandler, IEventHandler } from '@nestjs/cqrs';
import { MeetingGroupsService } from '../../meeting-groups/meeting-groups.service';
import { MeetingParticipantAuthorizedEvent } from '../../meeting-participants/events/meeting-participant-authorized.event';
import { MeetingSlotsService } from '../meeting-slots.service';

@EventsHandler(MeetingParticipantAuthorizedEvent)
export class MeetingParticipantAuthorizedHandler implements IEventHandler<MeetingParticipantAuthorizedEvent> {
  constructor(
    private readonly meetingGroupsService: MeetingGroupsService,
    private readonly meetingSlotsService: MeetingSlotsService,
  ) {}

  async handle(event: MeetingParticipantAuthorizedEvent) {
    const { entity } = event;

    const meetingGroup = await this.meetingGroupsService.findOneBy({
      id: entity.meetingGroupId,
    });

    if (!meetingGroup) return;

    if (meetingGroup.authorId === entity.userId) return;

    await this.meetingSlotsService.calculate(
      entity.meetingGroupId,
      meetingGroup.authorId,
    );
  }
}
