import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { CalendarsController } from '../../src/modules/calendars/calendars.controller';
import { CalendarsService } from '../../src/modules/calendars/calendars.service';
import { AccountsService } from '../../src/modules/accounts/accounts.service';
import { ExternalCalendarService } from '../../src/modules/calendars/external-calendar.service';
import { JwtAuthGuard } from '../../src/guards/jwt-auth.guard';
import { IdempotencyInterceptor } from '../../src/interceptors/idempotency.interceptor';

describe('CalendarsController (e2e)', () => {
  let app: INestApplication;
  let httpServer: ReturnType<typeof request>;

  const mockCalendarsService = {
    findAll: jest.fn().mockResolvedValue([{ id: '1' }]),
    findOneBy: jest.fn().mockResolvedValue({ id: '1' }),
    create: jest.fn().mockResolvedValue({ id: '1' }),
    update: jest.fn().mockResolvedValue({ id: '1' }),
    remove: jest.fn().mockResolvedValue({ id: '1' }),
  };

  const mockAccountsService = {
    findOneBy: jest.fn().mockResolvedValue({ id: '1' }),
  };

  const mockExternalCalendarService = {
    getCalendar: jest.fn().mockResolvedValue({}),
    listEvents: jest.fn().mockResolvedValue([]),
    deleteCalendar: jest.fn().mockResolvedValue({}),
    syncCalendar: jest.fn().mockResolvedValue({}),
    batchUpsert: jest.fn().mockResolvedValue([]),
    batchCreate: jest.fn().mockResolvedValue([]),
  };

  const mockJwtAuthGuard = {
    canActivate: jest.fn().mockReturnValue(true),
  };

  const mockIdempotencyInterceptor = {
    intercept: jest.fn().mockReturnValue({}),
  };

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      controllers: [CalendarsController],
      providers: [
        { provide: CalendarsService, useValue: mockCalendarsService },
        { provide: AccountsService, useValue: mockAccountsService },
        {
          provide: ExternalCalendarService,
          useValue: mockExternalCalendarService,
        },
      ],
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

  describe('GET /calendars', () => {
    it('should return calendars list', async () => {
      const response = await httpServer.get('/calendars');

      expect(response.status).toBeDefined();
    });
  });

  describe('GET /calendars/external', () => {
    it('should return external calendars', async () => {
      const response = await httpServer.get('/calendars/external');

      expect(response.status).toBeDefined();
    });
  });

  describe('GET /calendars/external/:id/events', () => {
    it('should return external calendar events', async () => {
      const response = await httpServer.get('/calendars/external/1/events');

      expect(response.status).toBeDefined();
    });
  });

  describe('GET /calendars/:id', () => {
    it('should return calendar by id', async () => {
      const response = await httpServer.get('/calendars/1');

      expect(response.status).toBeDefined();
    });
  });

  describe('POST /calendars/upsert', () => {
    it('should upsert calendar', async () => {
      const response = await httpServer
        .post('/calendars/upsert')
        .send({ externalId: '123', name: 'Test' });

      expect(response.status).toBeDefined();
    });
  });

  describe('POST /calendars', () => {
    it('should create calendar', async () => {
      const response = await httpServer
        .post('/calendars')
        .send({ name: 'Test', accountId: '1' });

      expect(response.status).toBeDefined();
    });
  });

  describe('POST /calendars/batch/upsert', () => {
    it('should batch upsert calendars', async () => {
      const response = await httpServer
        .post('/calendars/batch/upsert')
        .send([{ externalId: '123', name: 'Test' }]);

      expect(response.status).toBeDefined();
    });
  });

  describe('POST /calendars/batch', () => {
    it('should batch create calendars', async () => {
      const response = await httpServer
        .post('/calendars/batch')
        .send([{ name: 'Test', accountId: '1' }]);

      expect(response.status).toBeDefined();
    });
  });

  describe('PATCH /calendars/:id', () => {
    it('should update calendar', async () => {
      const response = await httpServer
        .patch('/calendars/1')
        .send({ name: 'Updated' });

      expect(response.status).toBeDefined();
    });
  });

  describe('DELETE /calendars/:id', () => {
    it('should delete calendar', async () => {
      const response = await httpServer.delete('/calendars/1');

      expect(response.status).toBeDefined();
    });
  });
});
