import { Exclude, Expose } from 'class-transformer';

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
}
