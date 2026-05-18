import { Exclude, Expose } from 'class-transformer';

@Exclude()
export class MeetingParticipantResponseDto {
  @Expose()
  id: string;

  @Expose()
  userId?: string;

  @Expose()
  meetingGroupId: string;

  @Expose()
  email: string;

  @Expose()
  invitationState: string;

  @Expose()
  authState: string;

  @Expose()
  required: boolean;
}
