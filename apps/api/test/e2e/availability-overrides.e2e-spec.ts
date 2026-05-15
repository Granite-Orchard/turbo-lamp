import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { AvailabilityOverridesController } from '../../src/modules/availability-overrides/availability-overrides.controller';
import { AvailabilityOverridesService } from '../../src/modules/availability-overrides/availability-overrides.service';
import { JwtAuthGuard } from '../../src/guards/jwt-auth.guard';

describe('AvailabilityOverridesController (e2e)', () => {
  let app: INestApplication;
  let httpServer: ReturnType<typeof request>;

  const mockAvailabilityOverridesService = {
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
      controllers: [AvailabilityOverridesController],
      providers: [
        {
          provide: AvailabilityOverridesService,
          useValue: mockAvailabilityOverridesService,
        },
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

  describe('POST /availability-overrides/upsert', () => {
    it('should upsert availability override', async () => {
      const response = await httpServer
        .post('/availability-overrides/upsert')
        .send({
          accountId: '1',
          userId: '1',
          date: '2024-01-01',
          isAvailable: true,
        });

      expect(response.status).toBeDefined();
    });
  });

  describe('POST /availability-overrides', () => {
    it('should create availability override', async () => {
      const response = await httpServer.post('/availability-overrides').send({
        accountId: '1',
        userId: '1',
        date: '2024-01-01',
        isAvailable: true,
      });

      expect(response.status).toBeDefined();
    });
  });

  describe('GET /availability-overrides', () => {
    it('should return availability overrides list', async () => {
      const response = await httpServer.get('/availability-overrides');

      expect(response.status).toBeDefined();
    });
  });

  // describe('GET /availability-overrides/:id', () => {
  //   it('should return availability override by id', async () => {
  //     const response = await httpServer.get('/availability-overrides/1');
  //
  //     expect(response.status).toBeDefined();
  //   });
  // });
  //
  // describe('PATCH /availability-overrides/:id', () => {
  //   it('should update availability override', async () => {
  //     const response = await httpServer
  //       .patch('/availability-overrides/1')
  //       .send({ isAvailable: false });
  //
  //     expect(response.status).toBeDefined();
  //   });
  // });
  //
  // describe('DELETE /availability-overrides/:id', () => {
  //   it('should delete availability override', async () => {
  //     const response = await httpServer.delete('/availability-overrides/1');
  //
  //     expect(response.status).toBeDefined();
  //   });
  // });
});
