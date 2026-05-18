import {
  HealthCheckService,
  TerminusModule,
  TypeOrmHealthIndicator,
} from '@nestjs/terminus';
import { Test, TestingModule } from '@nestjs/testing';
import { HealthController } from './health.controller';
import { CacheHealthIndicator } from './indicators/cache-health.indicator';

describe('HealthController', () => {
  let controller: HealthController;

  const mockDb = { pingCheck: jest.fn() };
  const mockCache = { isHealthy: jest.fn() };
  const mockHealthCheck = { check: jest.fn() };

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      imports: [TerminusModule],
      controllers: [HealthController],
      providers: [
        { provide: TypeOrmHealthIndicator, useValue: mockDb },
        { provide: CacheHealthIndicator, useValue: mockCache },
        { provide: HealthCheckService, useValue: mockHealthCheck },
      ],
    }).compile();

    controller = module.get(HealthController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should return ok status', async () => {
    mockHealthCheck.check.mockResolvedValueOnce({
      status: 'ok',
      info: {
        database: { status: 'up' },
        cache: { status: 'up' },
      },
    });

    const result = await controller.check();

    expect(result).toEqual({
      status: 'ok',
      info: {
        database: { status: 'up' },
        cache: { status: 'up' },
      },
    });

    expect(mockHealthCheck.check).toHaveBeenCalledTimes(1);
  });
});
