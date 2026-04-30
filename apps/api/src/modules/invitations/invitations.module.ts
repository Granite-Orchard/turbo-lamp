import { Module } from '@nestjs/common';
import { InvitationsService } from './invitations.service';
import { MeetingParticipantsModule } from '../meeting-participants/meeting-participants.module';

@Module({
  imports: [MeetingParticipantsModule],
  providers: [InvitationsService],
  exports: [InvitationsService],
})
export class InvitationsModule {}
