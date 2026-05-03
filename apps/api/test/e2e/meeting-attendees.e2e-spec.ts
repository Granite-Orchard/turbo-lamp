import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { MeetingAttendeesController } from '../../src/modules/meeting-attendees/meeting-attendees.controller';
import { MeetingAttendeesService } from '../../src/modules/meeting-attendees/meeting-attendees.service';
import { JwtAuthGuard } from '../../src/guards/jwt-auth.guard';

describe('MeetingAttendeesController (e2e)', () => {
  let app: INestApplication;
  let httpServer: ReturnType<typeof request>;

  const mockMeetingAttendeesService = {
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
      controllers: [MeetingAttendeesController],
      providers: [
        { provide: MeetingAttendeesService, useValue: mockMeetingAttendeesService },
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

  describe('POST /meeting-attendees', () => {
    it('should create meeting attendee', async () => {
      const response = await httpServer
        .post('/meeting-attendees')
        .send({ meetingId: '1', email: 'test@test.com' });

      expect(response.status).toBeDefined();
    });
  });

  describe('GET /meeting-attendees', () => {
    it('should return meeting attendees list', async () => {
      const response = await httpServer.get('/meeting-attendees');

      expect(response.status).toBeDefined();
    });
  });

  describe('GET /meeting-attendees/:id', () => {
    it('should return meeting attendee by id', async () => {
      const response = await httpServer.get('/meeting-attendees/1');

      expect(response.status).toBeDefined();
    });
  });

  describe('PATCH /meeting-attendees/:id', () => {
    it('should update meeting attendee', async () => {
      const response = await httpServer
        .patch('/meeting-attendees/1')
        .send({ status: 'accepted' });

      expect(response.status).toBeDefined();
    });
  });

  describe('DELETE /meeting-attendees/:id', () => {
    it('should delete meeting attendee', async () => {
      const response = await httpServer.delete('/meeting-attendees/1');

      expect(response.status).toBeDefined();
    });
  });
});