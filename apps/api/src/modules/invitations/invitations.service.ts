import { Inject, Injectable, Logger } from '@nestjs/common';
import {
  ParticipantAuthState,
  ParticipantInvitationState,
} from '../../libs/constants';
import { Account } from '../accounts/entities/account.entity';
import { MeetingParticipantsService } from '../meeting-participants/meeting-participants.service';

@Injectable()
export class InvitationsService {
  private readonly logger: Logger = new Logger(InvitationsService.name);

  constructor(
    @Inject(MeetingParticipantsService)
    private readonly meetingParticipantsService: MeetingParticipantsService,
  ) {}

  async acceptInvitation(id: string, user: Account): Promise<void> {
    await this.meetingParticipantsService.update(id, {
      userId: user.userId,
      invitationState: ParticipantInvitationState.ACCEPTED,
      authState:
        user.user.calendars.length > 0
          ? ParticipantAuthState.AUTHORIZED
          : undefined,
    });
  }
}
