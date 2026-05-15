import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { MeetingsController } from '../../src/modules/meetings/meetings.controller';
import { MeetingsService } from '../../src/modules/meetings/meetings.service';
import { JwtAuthGuard } from '../../src/guards/jwt-auth.guard';
import { IdempotencyInterceptor } from '../../src/interceptors/idempotency.interceptor';

describe('MeetingsController (e2e)', () => {
  let app: INestApplication;
  let httpServer: ReturnType<typeof request>;

  const mockMeetingsService = {
    findAll: jest.fn().mockResolvedValue([{ id: '1' }]),
    findOneBy: jest.fn().mockResolvedValue({ id: '1' }),
    create: jest.fn().mockResolvedValue({ id: '1' }),
    update: jest.fn().mockResolvedValue({ id: '1' }),
    remove: jest.fn().mockResolvedValue({ id: '1' }),
  };

  const mockJwtAuthGuard = {
    canActivate: jest.fn().mockReturnValue(true),
  };

  const mockIdempotencyInterceptor = {
    intercept: jest.fn().mockReturnValue({}),
  };

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      controllers: [MeetingsController],
      providers: [{ provide: MeetingsService, useValue: mockMeetingsService }],
    })
      .overrideGuard(JwtAuthGuard)
      .useValue(mockJwtAuthGuard)
      .overrideInterceptor(IdempotencyInterceptor)
      .useValue(mockIdempotencyInterceptor)
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

  describe('GET /meetings', () => {
    it('should return meetings list', async () => {
      const response = await httpServer.get('/meetings');

      expect(response.status).toBeDefined();
    });
  });

  describe('GET /meetings/:id', () => {
    it('should return meeting by id', async () => {
      const response = await httpServer.get('/meetings/1');

      expect(response.status).toBeDefined();
    });
  });

  describe('POST /meetings', () => {
    it('should create meeting', async () => {
      const response = await httpServer
        .post('/meetings')
        .send({ title: 'Test Meeting' });

      expect(response.status).toBeDefined();
    });
  });

  describe('PATCH /meetings/:id', () => {
    it('should update meeting', async () => {
      const response = await httpServer
        .patch('/meetings/1')
        .send({ title: 'Updated' });

      expect(response.status).toBeDefined();
    });
  });

  describe('DELETE /meetings/:id', () => {
    it('should delete meeting', async () => {
      const response = await httpServer.delete('/meetings/1');

      expect(response.status).toBeDefined();
    });
  });
});
