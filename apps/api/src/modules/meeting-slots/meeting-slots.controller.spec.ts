import { Test, TestingModule } from '@nestjs/testing';
import { MeetingSlotsController } from './meeting-slots.controller';
import { MeetingSlotsService } from './meeting-slots.service';

describe('MeetingSlotsController', () => {
  let controller: MeetingSlotsController;

  const mockService = {
    findAll: jest.fn().mockResolvedValue([]),
    create: jest.fn().mockResolvedValue({}),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [MeetingSlotsController],
      providers: [{ provide: MeetingSlotsService, useValue: mockService }],
    }).compile();

    controller = module.get<MeetingSlotsController>(MeetingSlotsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});