import { ConfigService } from '@nestjs/config';
import { TerminusModule } from '@nestjs/terminus';
import { Test } from '@nestjs/testing';
import {
  CacheHealthIndicator,
  REDIS_HEALTH_CLIENT,
} from './cache-health.indicator';

describe('CacheHealthIndicator', () => {
  let indicator: CacheHealthIndicator;
  let redis: { ping: jest.Mock; disconnect: jest.Mock };

  const intervalMs = 1_000;

  beforeEach(async () => {
    redis = {
      ping: jest.fn().mockResolvedValue('PONG'),
      disconnect: jest.fn(),
    };

    const module = await Test.createTestingModule({
      imports: [TerminusModule],
      providers: [
        CacheHealthIndicator,
        { provide: REDIS_HEALTH_CLIENT, useValue: redis },
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn().mockImplementation((key: string) => {
              if (key === 'CACHE_HEALTH_PING_INTERVAL_MS') return intervalMs;
              return undefined;
            }),
          },
        },
      ],
    }).compile();

    indicator = module.get(CacheHealthIndicator);

    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('pings on first call and reports up', async () => {
    const result = await indicator.isHealthy('cache');

    expect(redis.ping).toHaveBeenCalledTimes(1);
    expect(result).toEqual({ cache: { status: 'up' } });
  });

  it('reuses cached result within the ping window', async () => {
    await indicator.isHealthy('cache');
    await jest.advanceTimersByTimeAsync(500);

    const result = await indicator.isHealthy('cache');

    expect(redis.ping).toHaveBeenCalledTimes(1);
    expect(result).toEqual({ cache: { status: 'up' } });
  });

  it('pings again after the window expires', async () => {
    await indicator.isHealthy('cache');
    await jest.advanceTimersByTimeAsync(intervalMs + 1);

    const result = await indicator.isHealthy('cache');

    expect(redis.ping).toHaveBeenCalledTimes(2);
    expect(result).toEqual({ cache: { status: 'up' } });
  });

  it('reports down and caches it when ping fails', async () => {
    redis.ping.mockRejectedValueOnce(new Error('ECONNREFUSED'));

    const first = await indicator.isHealthy('cache');
    expect(first.cache.status).toBe('down');

    await jest.advanceTimersByTimeAsync(500);

    const second = await indicator.isHealthy('cache');
    expect(redis.ping).toHaveBeenCalledTimes(1);
    expect(second.cache.status).toBe('down');
  });

  it('dedupes concurrent pings', async () => {
    let resolvePing!: () => void;
    redis.ping.mockImplementation(
      () =>
        new Promise((resolve) => {
          resolvePing = () => resolve('PONG');
        }),
    );

    const first = indicator.isHealthy('cache');
    const second = indicator.isHealthy('cache');

    resolvePing();
    await Promise.all([first, second]);

    expect(redis.ping).toHaveBeenCalledTimes(1);
  });

  it('disconnects the client on module destroy', () => {
    indicator.onModuleDestroy();

    expect(redis.disconnect).toHaveBeenCalledTimes(1);
  });
});
