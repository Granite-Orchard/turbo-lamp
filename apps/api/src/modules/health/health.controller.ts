import { Controller, Get } from '@nestjs/common';
import { ApiExcludeController } from '@nestjs/swagger';
import { SkipThrottle } from '@nestjs/throttler';
import {
  HealthCheck,
  HealthCheckService,
  TypeOrmHealthIndicator,
} from '@nestjs/terminus';
import { plainToInstance } from 'class-transformer';
import { CacheHealthIndicator } from './indicators/cache-health.indicator';
import { HealthCheckResponseDto } from './dto/health-check.response.dto';
import { HealthStatusResponseDto } from './dto/health-status.response.dto';

@SkipThrottle({ short: true, medium: true, long: true })
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
  async check(): Promise<HealthCheckResponseDto> {
    const result = await this.health.check([
      () => this.db.pingCheck('database'),
      () => this.cache.isHealthy('cache'),
    ]);
    return plainToInstance(HealthCheckResponseDto, result, {
      excludeExtraneousValues: true,
    });
  }

  @Get('/live')
  liveness(): HealthStatusResponseDto {
    return plainToInstance(HealthStatusResponseDto, { status: 'live' }, {
      excludeExtraneousValues: true,
    });
  }

  @Get('ready')
  readiness(): HealthStatusResponseDto {
    return plainToInstance(HealthStatusResponseDto, { status: 'ready' }, {
      excludeExtraneousValues: true,
    });
  }
}
