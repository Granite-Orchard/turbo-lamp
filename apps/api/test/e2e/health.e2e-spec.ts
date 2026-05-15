import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { HealthController } from '../../src/modules/health/health.controller';

describe('HealthController (e2e)', () => {
  let app: INestApplication;
  let httpServer: ReturnType<typeof request>;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      controllers: [HealthController],
      providers: [],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe({ transform: true }));
    await app.init();

    httpServer = request(app.getHttpServer());
  });

  afterAll(async () => {
    if (app) {
      await app.close();
    }
  });

  describe('/health (GET)', () => {
    it('should return 200 with status', async () => {
      const response = await httpServer.get('/health');

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('status');
    });
  });
});
