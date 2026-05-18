import { Exclude, Expose } from 'class-transformer';

@Exclude()
export class AvailabilityOverrideResponseDto {
  @Expose()
  id: string;
  @Expose()
  userId: string;
  @Expose()
  date: string;
  @Expose()
  startTime: string;
  @Expose()
  endTime: string;
  @Expose()
  isAvailable: boolean;
}
