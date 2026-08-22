import { Inject, Injectable, Logger, OnModuleDestroy } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  HealthIndicatorResult,
  HealthIndicatorService,
} from '@nestjs/terminus';
import { Redis } from 'ioredis';
import {
  CACHE_HEALTH_PING_INTERVAL_DEFAULT,
  EnvironmentVariables,
} from '../../../libs/constants';

export const REDIS_HEALTH_CLIENT = 'REDIS_HEALTH_CLIENT';

@Injectable()
export class CacheHealthIndicator implements OnModuleDestroy {
  private readonly logger: Logger = new Logger(CacheHealthIndicator.name);
  private lastResult?: HealthIndicatorResult;
  private lastPingAt = 0;
  private inFlight?: Promise<void>;

  constructor(
    private readonly healthIndicatorService: HealthIndicatorService,
    private readonly configService: ConfigService,
    @Inject(REDIS_HEALTH_CLIENT) private readonly redis: Redis,
  ) {}

  async isHealthy(key: string): Promise<HealthIndicatorResult> {
    const now = Date.now();
    const intervalMs =
      this.configService.get<number>(
        EnvironmentVariables.CACHE_HEALTH_PING_INTERVAL_MS,
      ) ?? CACHE_HEALTH_PING_INTERVAL_DEFAULT;

    if (this.lastPingAt && now - this.lastPingAt < intervalMs) {
      return this.lastResult!;
    }

    this.ensurePing(key);
    await this.inFlight;

    return this.lastResult!;
  }

  onModuleDestroy(): void {
    this.redis.disconnect();
  }

  private ensurePing(key: string): void {
    if (!this.inFlight) {
      this.inFlight = this.ping(key)
        .catch(() => {
          this.logger.warn('Cache health ping failed unexpectedly');
        })
        .finally(() => {
          this.inFlight = undefined;
        });
    }
  }

  private async ping(key: string): Promise<void> {
    const indicator = this.healthIndicatorService.check(key);

    try {
      const reply: string = await this.redis.ping();

      if (reply !== 'PONG') {
        this.lastResult = indicator.down({
          message: `Unexpected ping reply: ${reply}`,
        });
      } else {
        this.lastResult = indicator.up();
      }
    } catch (error) {
      this.lastResult = indicator.down({
        message: error instanceof Error ? error.message : 'Cache unreachable',
      });
    } finally {
      this.lastPingAt = Date.now();
    }
  }
}
