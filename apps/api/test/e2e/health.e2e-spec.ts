import { Test, TestingModule } from '@nestjs/testing';
import {
  INestApplication,
  ValidationPipe,
  ServiceUnavailableException,
} from '@nestjs/common';
import request, { SuperTest, Test as SupertestRequest } from 'supertest';

import { HealthController } from '../../src/modules/health/health.controller';
import { CacheHealthIndicator } from '../../src/modules/health/indicators/cache-health.indicator';

import {
  DiskHealthIndicator,
  HealthCheckService,
  MemoryHealthIndicator,
  TerminusModule,
  TypeOrmHealthIndicator,
} from '@nestjs/terminus';

describe('HealthController (integration)', () => {
  let app: INestApplication;
  let httpServer: SuperTest<SupertestRequest>;

  const mockDb = {
    pingCheck: jest.fn(),
  };

  const mockDisk = {
    checkStorage: jest.fn(),
  };

  const mockMemory = {
    checkHeap: jest.fn(),
  };

  const mockCache = {
    isHealthy: jest.fn(),
  };

  const mockHealthCheck = {
    check: jest.fn(),
  };

  beforeAll(async () => {
    jest.clearAllMocks();

    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [TerminusModule],
      controllers: [HealthController],
      providers: [
        { provide: TypeOrmHealthIndicator, useValue: mockDb },
        { provide: DiskHealthIndicator, useValue: mockDisk },
        { provide: MemoryHealthIndicator, useValue: mockMemory },
        { provide: CacheHealthIndicator, useValue: mockCache },
        { provide: HealthCheckService, useValue: mockHealthCheck },
      ],
    }).compile();

    app = moduleFixture.createNestApplication();

    app.useGlobalPipes(
      new ValidationPipe({
        transform: true,
      }),
    );

    await app.init();

    httpServer = request(app.getHttpServer());
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  afterAll(async () => {
    await app?.close();
  });

  describe('/health (GET)', () => {
    it('should return healthy status', async () => {
      mockHealthCheck.check.mockResolvedValueOnce({
        status: 'ok',
        info: {
          database: { status: 'up' },
          disk: { status: 'up' },
          memory_heap: { status: 'up' },
          cache: { status: 'up' },
        },
      });

      const response = await httpServer.get('/health');

      expect(response.status).toBe(200);
      expect(response.body).toEqual({
        status: 'ok',
        info: {
          database: { status: 'up' },
          disk: { status: 'up' },
          memory_heap: { status: 'up' },
          cache: { status: 'up' },
        },
      });

      expect(mockHealthCheck.check).toHaveBeenCalledTimes(1);
    });

    it('should return unhealthy status', async () => {
      mockHealthCheck.check.mockRejectedValueOnce(
        new ServiceUnavailableException({
          status: 'error',
          error: {
            database: { status: 'down' },
          },
        }),
      );

      const response = await httpServer.get('/health');

      expect(response.status).toBe(503);
      expect(response.body.status).toBe('error');
      expect(response.body.error.database.status).toBe('down');
    });
  });
});
