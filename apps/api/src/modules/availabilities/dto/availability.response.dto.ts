import { Exclude, Expose } from 'class-transformer';

@Exclude()
export class AvailabilityResponseDto {
  @Expose()
  id: string;
  @Expose()
  userId: string;
  @Expose()
  dayOfWeek: number;
  @Expose()
  startTime: string;
  @Expose()
  endTime: string;
  @Expose()
  isAvailable: boolean;
}
