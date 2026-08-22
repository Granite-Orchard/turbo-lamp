import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { MeetingsController } from './meetings.controller';
import { MeetingsService } from './meetings.service';
import { JwtAuthGuard } from '../../guards/jwt-auth.guard';
import { IdempotencyInterceptor } from '../../interceptors/idempotency.interceptor';

describe('MeetingsController', () => {
  let controller: MeetingsController;

  const meeting = {
    id: '1',
    title: 'Meeting 1',
    meetingGroup: { authorId: 'user-123' },
    attendees: [],
  };

  const mockMeetingsService = {
    findAllBy: jest.fn(),
    findOneBy: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
  };

  const mockJwtAuthGuard = {
    canActivate: jest.fn().mockReturnValue(true),
  };

  const req = { user: { userId: 'user-123' } } as any;

  beforeEach(async () => {
    jest.clearAllMocks();
    mockMeetingsService.findAllBy.mockResolvedValue([meeting]);
    mockMeetingsService.findOneBy.mockResolvedValue(meeting);
    mockMeetingsService.create.mockResolvedValue({ id: 'new', title: 'New' });
    mockMeetingsService.update.mockResolvedValue({ id: '1', title: 'Updated' });
    mockMeetingsService.remove.mockResolvedValue({ affected: 1 });

    const module: TestingModule = await Test.createTestingModule({
      controllers: [MeetingsController],
      providers: [{ provide: MeetingsService, useValue: mockMeetingsService }],
    })
      .overrideGuard(JwtAuthGuard)
      .useValue(mockJwtAuthGuard)
      .overrideInterceptor(IdempotencyInterceptor)
      .useValue({ intercept: jest.fn().mockReturnValue({}) })
      .compile();

    controller = module.get<MeetingsController>(MeetingsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('findAll', () => {
    it('should return meetings array', async () => {
      const result = await controller.findAll(req);
      expect(mockMeetingsService.findAllBy).toHaveBeenCalled();
      expect(result).toHaveLength(1);
    });
  });

  describe('findOne', () => {
    it('should allow the meeting group author', async () => {
      const result = await controller.findOne(req, '1');
      expect(result).toHaveProperty('id');
    });

    it('should allow a meeting attendee', async () => {
      mockMeetingsService.findOneBy.mockResolvedValue({
        ...meeting,
        meetingGroup: { authorId: 'other' },
        attendees: [{ userId: 'user-123' }],
      });
      await expect(controller.findOne(req, '1')).resolves.toHaveProperty('id');
    });

    it('should reject a stranger', async () => {
      mockMeetingsService.findOneBy.mockResolvedValue({
        ...meeting,
        meetingGroup: { authorId: 'other' },
        attendees: [{ userId: 'other' }],
      });
      await expect(controller.findOne(req, '1')).rejects.toBeInstanceOf(
        NotFoundException,
      );
    });

    it('should reject when the meeting does not exist', async () => {
      mockMeetingsService.findOneBy.mockResolvedValue(null);
      await expect(controller.findOne(req, 'missing')).rejects.toBeInstanceOf(
        NotFoundException,
      );
    });
  });

  describe('create', () => {
    it('should create meeting', async () => {
      const result = await controller.create(req, { title: 'New' } as any);
      expect(mockMeetingsService.create).toHaveBeenCalledWith({
        title: 'New',
      });
      expect(result).toHaveProperty('id');
    });
  });

  describe('update', () => {
    it('should update meeting', async () => {
      const result = await controller.update(req, '1', { title: 'Updated' });
      expect(mockMeetingsService.update).toHaveBeenCalledWith('1', {
        title: 'Updated',
      });
      expect(result).toHaveProperty('id');
    });

    it('should reject when the meeting is not found', async () => {
      mockMeetingsService.findOneBy.mockResolvedValue(null);
      await expect(
        controller.update(req, 'missing', {} as any),
      ).rejects.toBeInstanceOf(NotFoundException);
      expect(mockMeetingsService.update).not.toHaveBeenCalled();
    });
  });

  describe('remove', () => {
    it('should delete meeting', async () => {
      mockMeetingsService.remove.mockResolvedValue({ affected: 1 });
      const result = await controller.remove(req, '1');
      expect(result).toHaveProperty('id');
    });

    it('should reject when the meeting is not found', async () => {
      mockMeetingsService.findOneBy.mockResolvedValue(null);
      await expect(controller.remove(req, 'missing')).rejects.toBeInstanceOf(
        NotFoundException,
      );
      expect(mockMeetingsService.remove).not.toHaveBeenCalled();
    });

    it('should throw when nothing was deleted', async () => {
      mockMeetingsService.remove.mockResolvedValue({ affected: 0 });
      await expect(controller.remove(req, '1')).rejects.toThrow();
    });
  });
});