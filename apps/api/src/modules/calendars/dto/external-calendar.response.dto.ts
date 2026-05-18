import { Exclude, Expose } from 'class-transformer';

@Exclude()
export class ExternalCalendarResponseDto {
  @Expose()
  calendarId: string;
  @Expose()
  providerId: string;
  @Expose()
  name?: string;
  @Expose()
  description?: string;
  @Expose()
  timezone?: string;
  @Expose()
  primary?: boolean;
  @Expose()
  accessRole?: string;
}
