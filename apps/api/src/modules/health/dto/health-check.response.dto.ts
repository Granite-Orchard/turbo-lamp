import { Exclude, Expose } from 'class-transformer';

@Exclude()
export class HealthIndicatorDetailDto {
  @Expose()
  status: 'up' | 'down' | 'shutting_down';
}

@Exclude()
export class HealthCheckResponseDto {
  @Expose()
  status: 'ok' | 'error' | 'shutting_down';
  @Expose()
  info: Record<string, HealthIndicatorDetailDto>;
  @Expose()
  error: Record<string, HealthIndicatorDetailDto>;
  @Expose()
  details: Record<string, HealthIndicatorDetailDto>;
}
