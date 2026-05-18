import { Injectable, Inject } from '@nestjs/common';
import {
  HealthIndicatorService,
  HealthIndicatorResult,
} from '@nestjs/terminus';
import { CACHE_MANAGER, Cache } from '@nestjs/cache-manager';

@Injectable()
export class CacheHealthIndicator {
  constructor(
    private readonly healthIndicatorService: HealthIndicatorService,
    @Inject(CACHE_MANAGER)
    private readonly cacheManager: Cache,
  ) {}

  async isHealthy(key: string): Promise<HealthIndicatorResult> {
    const indicator = this.healthIndicatorService.check(key);

    try {
      const testKey = '__health_check__';

      await this.cacheManager.set(testKey, 'ok', 1000);

      const value = await this.cacheManager.get<string>(testKey);

      if (value !== 'ok') {
        return indicator.down({
          message: 'Cache value mismatch',
        });
      }

      return indicator.up();
    } catch (error) {
      return indicator.down({
        message: error instanceof Error ? error.message : 'Cache unreachable',
      });
    }
  }
}
