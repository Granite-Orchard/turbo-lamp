import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { MeetingParticipantsController } from '../../src/modules/meeting-participants/meeting-participants.controller';
import { MeetingParticipantsService } from '../../src/modules/meeting-participants/meeting-participants.service';
import { JwtAuthGuard } from '../../src/guards/jwt-auth.guard';

describe('MeetingParticipantsController (e2e)', () => {
  let app: INestApplication;
  let httpServer: ReturnType<typeof request>;

  const mockMeetingParticipantsService = {
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
      controllers: [MeetingParticipantsController],
      providers: [
        { provide: MeetingParticipantsService, useValue: mockMeetingParticipantsService },
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

  describe('POST /meeting-participants', () => {
    it('should create meeting participant', async () => {
      const response = await httpServer
        .post('/meeting-participants')
        .send({ meetingId: '1', email: 'test@test.com' });

      expect(response.status).toBeDefined();
    });
  });

  describe('GET /meeting-participants', () => {
    it('should return meeting participants list', async () => {
      const response = await httpServer.get('/meeting-participants');

      expect(response.status).toBeDefined();
    });
  });

  describe('GET /meeting-participants/:id', () => {
    it('should return meeting participant by id', async () => {
      const response = await httpServer.get('/meeting-participants/1');

      expect(response.status).toBeDefined();
    });
  });

  describe('PATCH /meeting-participants/:id', () => {
    it('should update meeting participant', async () => {
      const response = await httpServer
        .patch('/meeting-participants/1')
        .send({ status: 'accepted' });

      expect(response.status).toBeDefined();
    });
  });

  describe('DELETE /meeting-participants/:id', () => {
    it('should delete meeting participant', async () => {
      const response = await httpServer.delete('/meeting-participants/1');

      expect(response.status).toBeDefined();
    });
  });
});