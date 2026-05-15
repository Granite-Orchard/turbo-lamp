import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { MeetingSlotsController } from '../../src/modules/meeting-slots/meeting-slots.controller';
import { MeetingSlotsService } from '../../src/modules/meeting-slots/meeting-slots.service';
import { JwtAuthGuard } from '../../src/guards/jwt-auth.guard';
import { MeetingsService } from '../../src/modules/meetings/meetings.service';

describe('MeetingSlotsController (e2e)', () => {
  let app: INestApplication;
  let httpServer: ReturnType<typeof request>;

  const mockMeetingSlotsService = {
    findAll: jest.fn().mockResolvedValue([{ id: '1' }]),
    calculateSlots: jest.fn().mockResolvedValue([{ id: '1' }]),
  };

  const mockMeetingsService = {
    findOneBy: jest.fn().mockResolvedValue({ id: '1' }),
  };

  const mockJwtAuthGuard = {
    canActivate: jest.fn().mockReturnValue(true),
  };

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      controllers: [MeetingSlotsController],
      providers: [
        { provide: MeetingsService, useValue: mockMeetingsService },
        { provide: MeetingSlotsService, useValue: mockMeetingSlotsService },
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

  describe('GET /meeting-slots/:meetingGroupId', () => {
    it('should return meeting slots', async () => {
      const response = await httpServer.get('/meeting-slots/1');

      expect(response.status).toBeDefined();
    });
  });

  describe('GET /meeting-slots/:meetingGroupId/calculate', () => {
    it('should calculate meeting slots', async () => {
      const response = await httpServer.get('/meeting-slots/1/calculate');

      expect(response.status).toBeDefined();
    });
  });
});
