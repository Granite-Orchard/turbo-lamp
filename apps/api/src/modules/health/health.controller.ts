import { Controller, Get } from '@nestjs/common';
import { ApiExcludeController } from '@nestjs/swagger';
import {
  HealthCheck,
  HealthCheckService,
  TypeOrmHealthIndicator,
} from '@nestjs/terminus';
import { CacheHealthIndicator } from './indicators/cache-health.indicator';

@ApiExcludeController()
@Controller({ path: 'health', version: '1' })
export class HealthController {
  constructor(
    private readonly db: TypeOrmHealthIndicator,
    private readonly health: HealthCheckService,
    private readonly cache: CacheHealthIndicator,
  ) {}

  @Get()
  @HealthCheck()
  check() {
    return this.health.check([
      () => this.db.pingCheck('database'),
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
