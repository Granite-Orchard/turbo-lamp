import { Exclude, Expose, Type } from 'class-transformer';
import { MeetingAttendeeResponseDto } from '../../meeting-attendees/dto/meeting-attendee.response.dto';

@Exclude()
export class MeetingResponseDto {
  @Expose()
  id: string;

  @Expose()
  externalEventId?: string;

  @Expose()
  meetingGroupId: string;

  @Expose()
  start: Date;

  @Expose()
  end: Date;

  @Expose()
  status: string;

  @Expose()
  @Type(() => MeetingAttendeeResponseDto)
  attendees: MeetingAttendeeResponseDto[];
}
