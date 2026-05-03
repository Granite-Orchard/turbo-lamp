import { Test, TestingModule } from '@nestjs/testing';
import { MeetingGroupsController } from './meeting-groups.controller';
import { MeetingGroupsService } from './meeting-groups.service';
import { MeetingParticipantsService } from '../meeting-participants/meeting-participants.service';

describe('MeetingGroupsController', () => {
  let controller: MeetingGroupsController;

  const mockService = {
    create: jest.fn().mockResolvedValue({ id: '1', name: 'Group 1' }),
    findAll: jest.fn().mockResolvedValue([{ id: '1', name: 'Group 1' }]),
  };

  const mockParticipantService = {
    findOneBy: jest.fn().mockResolvedValue({}),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [MeetingGroupsController],
      providers: [
        { provide: MeetingGroupsService, useValue: mockService },
        { provide: MeetingParticipantsService, useValue: mockParticipantService },
      ],
    }).compile();

    controller = module.get<MeetingGroupsController>(MeetingGroupsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});