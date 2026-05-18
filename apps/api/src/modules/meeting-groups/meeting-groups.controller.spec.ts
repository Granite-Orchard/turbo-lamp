import { Test, TestingModule } from '@nestjs/testing';
import { MeetingGroupsController } from './meeting-groups.controller';
import { MeetingGroupsService } from './meeting-groups.service';
import { MeetingParticipantsService } from '../meeting-participants/meeting-participants.service';
import { VerificationsService } from '../verifications/verifications.service';
import { TokenService } from '../auth/token.service';
import { ConfigService } from '@nestjs/config';
import { DataSource } from 'typeorm';

describe('MeetingGroupsController', () => {
  let controller: MeetingGroupsController;

  const mockService = {
    create: jest.fn().mockResolvedValue({ id: '1', name: 'Group 1' }),
    findAll: jest.fn().mockResolvedValue([{ id: '1', name: 'Group 1' }]),
  };

  const mockParticipantService = {
    findOneBy: jest.fn().mockResolvedValue({}),
  };

  const mockDataSource = {
    transaction: jest.fn(async (cb) => cb(mockManager)),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [MeetingGroupsController],
      providers: [
        { provide: DataSource, useValue: mockDataSource },
        { provide: MeetingGroupsService, useValue: mockService },
        {
          provide: MeetingParticipantsService,
          useValue: mockParticipantService,
        },
        {
          provide: VerificationsService,
          useValue: { findOneBy: jest.fn(), create: jest.fn() },
        },
        {
          provide: TokenService,
          useValue: {
            randomHash: jest.fn(),
            sign: jest.fn(),
            verify: jest.fn(),
          },
        },
        {
          provide: ConfigService,
          useValue: { get: jest.fn().mockReturnValue('http://localhost:3000') },
        },
      ],
    }).compile();

    controller = module.get<MeetingGroupsController>(MeetingGroupsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
