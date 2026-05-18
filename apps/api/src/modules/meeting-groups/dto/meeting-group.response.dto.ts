import { Exclude, Expose } from 'class-transformer';

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
}
