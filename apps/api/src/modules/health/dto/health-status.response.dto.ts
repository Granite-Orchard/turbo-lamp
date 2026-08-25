import { Exclude, Expose } from 'class-transformer';

@Exclude()
export class HealthStatusResponseDto {
  @Expose()
  status: string;
}
