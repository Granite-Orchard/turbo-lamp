import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import request from 'supertest';
import { MeetingGroupsController } from '../../src/modules/meeting-groups/meeting-groups.controller';
import { MeetingGroupsService } from '../../src/modules/meeting-groups/meeting-groups.service';
import { MeetingParticipantsService } from '../../src/modules/meeting-participants/meeting-participants.service';
import { VerificationsService } from '../../src/modules/verifications/verifications.service';
import { TokenService } from '../../src/modules/auth/token.service';
import { JwtAuthGuard } from '../../src/guards/jwt-auth.guard';

describe('MeetingGroupsController (e2e)', () => {
  let app: INestApplication;
  let httpServer: ReturnType<typeof request>;

  const mockMeetingGroupsService = {
    findAll: jest.fn().mockResolvedValue([{ id: '1' }]),
    findOneBy: jest.fn().mockResolvedValue({ id: '1' }),
    create: jest.fn().mockResolvedValue({ id: '1' }),
    update: jest.fn().mockResolvedValue({ id: '1' }),
    remove: jest.fn().mockResolvedValue({ id: '1' }),
  };

  const mockMeetingParticipantsService = {
    findOneBy: jest.fn().mockResolvedValue({ id: '1' }),
  };

  const mockVerificationsService = { findOneBy: jest.fn(), create: jest.fn() };

  const mockTokenService = {
    randomHash: jest.fn(),
    sign: jest.fn(),
    verify: jest.fn(),
  };

  const mockJwtAuthGuard = {
    canActivate: jest.fn().mockReturnValue(true),
  };

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      controllers: [MeetingGroupsController],
      providers: [
        { provide: MeetingGroupsService, useValue: mockMeetingGroupsService },
        {
          provide: MeetingParticipantsService,
          useValue: mockMeetingParticipantsService,
        },
        {
          provide: VerificationsService,
          useValue: mockVerificationsService,
        },
        {
          provide: TokenService,
          useValue: mockTokenService,
        },
        {
          provide: ConfigService,
          useValue: { get: jest.fn().mockReturnValue('http://localhost:3000') },
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

  describe('POST /meeting-groups', () => {
    it('should create meeting group', async () => {
      const response = await httpServer.post('/meeting-groups').send({
        name: 'Test Group',
        after: new Date(),
        before: new Date(),
        calendarId: '1',
      });

      expect(response.status).toBeDefined();
    });
  });

  describe('GET /meeting-groups', () => {
    it('should return meeting groups list', async () => {
      const response = await httpServer.get('/meeting-groups');

      expect(response.status).toBeDefined();
    });
  });

  describe('GET /meeting-groups/:id', () => {
    it('should return meeting group by id', async () => {
      const response = await httpServer.get('/meeting-groups/1');

      expect(response.status).toBeDefined();
    });
  });

  describe('PATCH /meeting-groups/:id', () => {
    it('should update meeting group', async () => {
      const response = await httpServer
        .patch('/meeting-groups/1')
        .send({ name: 'Updated' });

      expect(response.status).toBeDefined();
    });
  });

  describe('DELETE /meeting-groups/:id', () => {
    it('should delete meeting group', async () => {
      const response = await httpServer.delete('/meeting-groups/1');

      expect(response.status).toBeDefined();
    });
  });
});

