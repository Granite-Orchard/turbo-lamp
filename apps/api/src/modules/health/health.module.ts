import { Module } from '@nestjs/common';
import { HealthController } from './health.controller';
import { TerminusModule } from '@nestjs/terminus';
import { CacheHealthIndicator } from './indicators/cache-health.indicator';

@Module({
  imports: [TerminusModule],
  providers: [CacheHealthIndicator],
  controllers: [HealthController],
})
export class HealthModule {}
