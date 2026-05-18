import { Exclude, Expose } from 'class-transformer';

@Exclude()
export class MeetingSlotResponseDto {
  @Expose()
  id: string;

  @Expose()
  meetingGroupId: string;

  @Expose()
  start: Date;

  @Expose()
  end: Date;

  @Expose()
  rank: number;
}
