import { Exclude, Expose } from 'class-transformer';

@Exclude()
export class MeetingAttendeeResponseDto {
  @Expose()
  id: string;
  @Expose()
  meetingId: string;
  @Expose()
  email: string;
}
