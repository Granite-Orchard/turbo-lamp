import { Exclude, Expose } from 'class-transformer';

@Exclude()
export class CalendarResponseDto {
  @Expose()
  id: string;
  @Expose()
  userId: string;
  @Expose()
  accountId: string;
  @Expose()
  providerId: string;
  @Expose()
  externalId: string;
  @Expose()
  name: string;
  @Expose()
  timezone: string;
  @Expose()
  enabled: boolean;
}
