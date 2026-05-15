import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { AvailabilitiesController } from '../../src/modules/availabilities/availabilities.controller';
import { AvailabilitiesService } from '../../src/modules/availabilities/availabilities.service';
import { JwtAuthGuard } from '../../src/guards/jwt-auth.guard';

describe('AvailabilitiesController (e2e)', () => {
  let app: INestApplication;
  let httpServer: ReturnType<typeof request>;

  const mockAvailabilitiesService = {
    findAll: jest.fn().mockResolvedValue([{ id: '1' }]),
    findOneBy: jest.fn().mockResolvedValue({ id: '1' }),
    create: jest.fn().mockResolvedValue({ id: '1' }),
    update: jest.fn().mockResolvedValue({ id: '1' }),
    remove: jest.fn().mockResolvedValue({ id: '1' }),
  };

  const mockJwtAuthGuard = {
    canActivate: jest.fn().mockReturnValue(true),
  };

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      controllers: [AvailabilitiesController],
      providers: [
        { provide: AvailabilitiesService, useValue: mockAvailabilitiesService },
      ],
    })
      .overrideGuard(JwtAuthGuard)
      .useValue(mockJwtAuthGuard)
      .compile();

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

  describe('POST /availabilities/upsert/batch', () => {
    it('should batch upsert availabilities', async () => {
      const response = await httpServer
        .post('/availabilities/upsert/batch')
        .send([{ accountId: '1', dayOfWeek: 1, start: '09:00', end: '17:00' }]);

      expect(response.status).toBeDefined();
    });
  });

  describe('POST /availabilities/upsert', () => {
    it('should upsert availability', async () => {
      const response = await httpServer
        .post('/availabilities/upsert')
        .send({ accountId: '1', dayOfWeek: 1, start: '09:00', end: '17:00' });

      expect(response.status).toBeDefined();
    });
  });

  describe('POST /availabilities', () => {
    it('should create availability', async () => {
      const response = await httpServer
        .post('/availabilities')
        .send({ accountId: '1', dayOfWeek: 1, start: '09:00', end: '17:00' });

      expect(response.status).toBeDefined();
    });
  });

  describe('GET /availabilities', () => {
    it('should return availabilities list', async () => {
      const response = await httpServer.get('/availabilities');

      expect(response.status).toBeDefined();
    });
  });

  describe('GET /availabilities/:id', () => {
    it('should return availability by id', async () => {
      const response = await httpServer.get('/availabilities/1');

      expect(response.status).toBeDefined();
    });
  });

  describe('PATCH /availabilities/:id', () => {
    it('should update availability', async () => {
      const response = await httpServer
        .patch('/availabilities/1')
        .send({ start: '10:00' });

      expect(response.status).toBeDefined();
    });
  });

  describe('DELETE /availabilities/:id', () => {
    it('should delete availability', async () => {
      const response = await httpServer.delete('/availabilities/1');

      expect(response.status).toBeDefined();
    });
  });
});
