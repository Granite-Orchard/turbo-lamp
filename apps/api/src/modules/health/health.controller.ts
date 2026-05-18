import { Controller, Get } from '@nestjs/common';
import {
  DiskHealthIndicator,
  HealthCheck,
  HealthCheckService,
  MemoryHealthIndicator,
  TypeOrmHealthIndicator,
} from '@nestjs/terminus';
import { CacheHealthIndicator } from './indicators/cache-health.indicator';
import { ApiExcludeController } from '@nestjs/swagger';

@ApiExcludeController()
@Controller({ path: 'health', version: '1' })
export class HealthController {
  constructor(
    private readonly db: TypeOrmHealthIndicator,
    private readonly health: HealthCheckService,
    private readonly disk: DiskHealthIndicator,
    private readonly memory: MemoryHealthIndicator,
    private readonly cache: CacheHealthIndicator,
  ) {}

  @Get()
  @HealthCheck()
  check() {
    return this.health.check([
      () => this.db.pingCheck('database'),
      () =>
        this.disk.checkStorage('storage', { path: '/', thresholdPercent: 0.5 }),
      () => this.memory.checkHeap('memory_heap', 150 * 1024 * 1024),
      () => this.cache.isHealthy('cache'),
    ]);
  }

  @Get('live')
  liveness() {
    return { status: 'live' };
  }

  @Get('ready')
  readiness() {
    return { status: 'ready' };
  }
}
