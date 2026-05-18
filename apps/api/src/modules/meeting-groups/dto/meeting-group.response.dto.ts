import { Exclude, Expose, Type } from 'class-transformer';
import { MeetingParticipantResponseDto } from '../../meeting-participants/dto/meeting-participant.response.dto';
import { MeetingSlotResponseDto } from '../../meeting-slots/dto/meeting-slot.response.dto';

@Exclude()
export class MeetingGroupResponseDto {
  @Expose()
  id: string;

  @Expose()
  status: string;

  @Expose()
  authorId: string;

  @Expose()
  calendarId: string;

  @Expose()
  summary: string;

  @Expose()
  magicLink?: string;

  @Expose()
  description?: string;

  @Expose()
  location?: string;

  @Expose()
  duration: number;

  @Expose()
  after: Date;

  @Expose()
  before: Date;

  @Expose()
  timezone: string;

  @Expose()
  @Type(() => MeetingParticipantResponseDto)
  participants: MeetingParticipantResponseDto[];

  @Expose()
  @Type(() => MeetingSlotResponseDto)
  slots: MeetingSlotResponseDto[];
}
