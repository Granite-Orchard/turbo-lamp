import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { TerminusModule } from '@nestjs/terminus';
import Redis from 'ioredis';
import { EnvironmentVariables } from '../../libs/constants';
import { HealthController } from './health.controller';
import {
  CacheHealthIndicator,
  REDIS_HEALTH_CLIENT,
} from './indicators/cache-health.indicator';

@Module({
  imports: [TerminusModule],
  providers: [
    CacheHealthIndicator,
    {
      provide: REDIS_HEALTH_CLIENT,
      inject: [ConfigService],
      useFactory: (config: ConfigService) => {
        const redis = new Redis(
          config.get<string>(EnvironmentVariables.REDIS_CACHE_URL)!,
          {
            lazyConnect: true,
            enableOfflineQueue: false,
            connectTimeout: 5_000,
            commandTimeout: 2_000,
            maxRetriesPerRequest: 1,
          },
        );
        redis.on('error', () => undefined);
        return redis;
      },
    },
  ],
  controllers: [HealthController],
})
export class HealthModule {}
