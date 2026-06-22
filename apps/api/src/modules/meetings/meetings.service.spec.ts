import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { EventBus } from '@nestjs/cqrs';
import { NotFoundException, BadRequestException } from '@nestjs/common';
import { MeetingsService } from './meetings.service';
import { Meeting } from './entities/meeting.entity';
import { CreateMeetingDto } from './dto/create-meeting.dto';
import { UpdateMeetingDto } from './dto/update-meeting.dto';
import { MeetingStatus } from '../../libs/constants';

describe('MeetingsService', () => {
  let service: MeetingsService;
  let repository: Repository<Meeting>;
  let eventBus: EventBus;

  const mockMeeting: Meeting = {
    id: '123e4567-e89b-12d3-a456-426614174000',
    meetingGroupId: '123e4567-e89b-12d3-a456-426614174001',
    meetingGroup: {} as any,
    start: new Date(Date.now() + 3600000),
    end: new Date(Date.now() + 7200000),
    status: MeetingStatus.SCHEDULED,
    attendees: [],
    createdAt: new Date(),
    updatedAt: new Date(),
    deletedAt: undefined,
    createdBy: undefined,
    updatedBy: undefined,
    deletedBy: undefined,
  };

  const mockRepository = {
    find: jest.fn(),
    findOne: jest.fn(),
    save: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
    delete: jest.fn(),
  };

  const mockEventBus = {
    publish: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MeetingsService,
        { provide: getRepositoryToken(Meeting), useValue: mockRepository },
        { provide: EventBus, useValue: mockEventBus },
      ],
    }).compile();

    service = module.get<MeetingsService>(MeetingsService);
    repository = module.get<Repository<Meeting>>(getRepositoryToken(Meeting));
    eventBus = module.get<EventBus>(EventBus);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('findAll', () => {
    it('should return an array of meetings', async () => {
      mockRepository.find.mockResolvedValue([mockMeeting]);

      const result = await service.findAll();

      expect(mockRepository.find).toHaveBeenCalled();
      expect(result).toEqual([mockMeeting]);
    });

    it('should return empty array when no meetings exist', async () => {
      mockRepository.find.mockResolvedValue([]);

      const result = await service.findAll();

      expect(mockRepository.find).toHaveBeenCalled();
      expect(result).toEqual([]);
    });
  });

  describe('findAllBy', () => {
    it('should return meetings with default relations', async () => {
      mockRepository.find.mockResolvedValue([mockMeeting]);

      const result = await service.findAllBy();

      expect(mockRepository.find).toHaveBeenCalledWith({
        where: undefined,
        relations: expect.objectContaining({
          attendees: true,
          meetingGroup: true,
        }),
      });
      expect(result).toEqual([mockMeeting]);
    });

    it('should return meetings with custom relations', async () => {
      const customRelations = { attendees: true };
      mockRepository.find.mockResolvedValue([mockMeeting]);

      const result = await service.findAllBy(undefined, customRelations);

      expect(mockRepository.find).toHaveBeenCalledWith({
        where: undefined,
        relations: expect.objectContaining(customRelations),
      });
      expect(result).toEqual([mockMeeting]);
    });
  });

  describe('findOne', () => {
    it('should return a meeting by id', async () => {
      mockRepository.findOne.mockResolvedValue(mockMeeting);

      const result = await service.findOne(mockMeeting.id);

      expect(mockRepository.findOne).toHaveBeenCalledWith({
        where: { id: mockMeeting.id },
        relations: undefined,
      });
      expect(result).toEqual(mockMeeting);
    });

    it('should return null when meeting not found', async () => {
      mockRepository.findOne.mockResolvedValue(null);

      const result = await service.findOne('non-existent-id');

      expect(result).toBeNull();
    });
  });

  describe('findOneBy', () => {
    it('should return a meeting by custom where clause', async () => {
      const where = { status: MeetingStatus.SCHEDULED };
      mockRepository.findOne.mockResolvedValue(mockMeeting);

      const result = await service.findOneBy(where);

      expect(mockRepository.findOne).toHaveBeenCalledWith({
        where,
        relations: undefined,
      });
      expect(result).toEqual(mockMeeting);
    });
  });

  describe('create', () => {
    it('should create a new meeting with SCHEDULED status', async () => {
      const createMeetingDto: CreateMeetingDto = {
        meetingGroupId: mockMeeting.meetingGroupId,
        start: mockMeeting.start,
        end: mockMeeting.end,
        status: MeetingStatus.SCHEDULED,
      };

      mockRepository.create.mockReturnValue(mockMeeting);
      mockRepository.save.mockResolvedValue(mockMeeting);

      const result = await service.create(createMeetingDto);

      expect(mockRepository.create).toHaveBeenCalledWith(createMeetingDto);
      expect(mockRepository.save).toHaveBeenCalledWith(mockMeeting);
      expect(mockEventBus.publish).toHaveBeenCalled();
      expect(result).toEqual(mockMeeting);
    });

    it('should default to SCHEDULED when no status is provided', async () => {
      const createMeetingDto = {
        meetingGroupId: mockMeeting.meetingGroupId,
        start: mockMeeting.start,
        end: mockMeeting.end,
      } as CreateMeetingDto;

      mockRepository.create.mockImplementation((dto) => ({
        ...mockMeeting,
        ...dto,
      }));
      mockRepository.save.mockResolvedValue(mockMeeting);

      await service.create(createMeetingDto);

      expect(mockRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({ status: MeetingStatus.SCHEDULED }),
      );
    });

    it('should throw BadRequestException when end <= start', async () => {
      const createMeetingDto: CreateMeetingDto = {
        meetingGroupId: mockMeeting.meetingGroupId,
        start: new Date(Date.now() + 7200000),
        end: new Date(Date.now() + 3600000),
        status: MeetingStatus.SCHEDULED,
      };

      await expect(service.create(createMeetingDto)).rejects.toThrow(
        BadRequestException,
      );
    });

    it('should throw BadRequestException when initial status is not SCHEDULED', async () => {
      const createMeetingDto: CreateMeetingDto = {
        meetingGroupId: mockMeeting.meetingGroupId,
        start: mockMeeting.start,
        end: mockMeeting.end,
        status: MeetingStatus.CANCELLED,
      };

      await expect(service.create(createMeetingDto)).rejects.toThrow(
        BadRequestException,
      );
    });
  });

  describe('update', () => {
    it('should update a meeting', async () => {
      const updateMeetingDto: UpdateMeetingDto = {
        status: MeetingStatus.CANCELLED,
      };

      mockRepository.findOne.mockResolvedValueOnce(mockMeeting);
      mockRepository.update.mockResolvedValue({ affected: 1 });
      mockRepository.findOne.mockResolvedValueOnce({
        ...mockMeeting,
        ...updateMeetingDto,
      });

      const result = await service.update(mockMeeting.id, updateMeetingDto);

      expect(mockRepository.update).toHaveBeenCalledWith(
        mockMeeting.id,
        updateMeetingDto,
      );
      expect(result).toEqual({ ...mockMeeting, ...updateMeetingDto });
    });

    it('should throw NotFoundException when meeting not found', async () => {
      const updateMeetingDto: UpdateMeetingDto = {
        status: MeetingStatus.CANCELLED,
      };

      mockRepository.findOne.mockResolvedValue(null);

      await expect(
        service.update('non-existent-id', updateMeetingDto),
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw BadRequestException for invalid status transition', async () => {
      const updateMeetingDto: UpdateMeetingDto = {
        status: MeetingStatus.SCHEDULED,
      };

      mockRepository.findOne.mockResolvedValue({
        ...mockMeeting,
        status: MeetingStatus.CANCELLED,
      });

      await expect(
        service.update(mockMeeting.id, updateMeetingDto),
      ).rejects.toThrow(BadRequestException);
    });

    it('should throw BadRequestException when end <= start', async () => {
      const updateMeetingDto: UpdateMeetingDto = {
        start: new Date(Date.now() + 7200000),
        end: new Date(Date.now() + 3600000),
      };

      mockRepository.findOne.mockResolvedValue(mockMeeting);

      await expect(
        service.update(mockMeeting.id, updateMeetingDto),
      ).rejects.toThrow(BadRequestException);
    });

    it('should throw NotFoundException when update affects no rows', async () => {
      const updateMeetingDto: UpdateMeetingDto = { start: new Date() };

      mockRepository.findOne.mockResolvedValue(mockMeeting);
      mockRepository.update.mockResolvedValue({ affected: 0 });

      await expect(
        service.update(mockMeeting.id, updateMeetingDto),
      ).rejects.toThrow(NotFoundException);
    });

    it('should validate times when only end is provided (start falls back to existing)', async () => {
      const updateMeetingDto: UpdateMeetingDto = {
        end: new Date(mockMeeting.start.getTime() - 3600000),
      };

      mockRepository.findOne.mockResolvedValue(mockMeeting);

      await expect(
        service.update(mockMeeting.id, updateMeetingDto),
      ).rejects.toThrow(BadRequestException);
    });

    it('should validate times when only start is provided (end falls back to existing)', async () => {
      const updateMeetingDto: UpdateMeetingDto = {
        start: new Date(mockMeeting.start.getTime() + 1800000),
      };

      mockRepository.findOne.mockResolvedValueOnce(mockMeeting);
      mockRepository.update.mockResolvedValue({ affected: 1 });
      mockRepository.findOne.mockResolvedValueOnce({
        ...mockMeeting,
        ...updateMeetingDto,
      });

      const result = await service.update(mockMeeting.id, updateMeetingDto);

      expect(mockRepository.update).toHaveBeenCalled();
      expect(result).toBeDefined();
    });
  });

  describe('remove', () => {
    it('should soft delete a meeting and publish MeetingDeletedEvent', async () => {
      mockRepository.findOne.mockResolvedValue(mockMeeting);
      mockRepository.delete.mockResolvedValue({ affected: 1 });

      const result = await service.remove(mockMeeting.id);

      expect(mockRepository.findOne).toHaveBeenCalled();
      expect(mockRepository.delete).toHaveBeenCalledWith(mockMeeting.id);
      expect(mockEventBus.publish).toHaveBeenCalled();
      expect(result).toEqual({ affected: 1 });
    });

    it('should throw NotFoundException when meeting not found', async () => {
      mockRepository.findOne.mockResolvedValue(null);

      await expect(service.remove('non-existent-id')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('validateStatusTransition (private)', () => {
    it('should handle unknown current status with empty allowed transitions', () => {
      expect(() =>
        (service as any).validateStatusTransition(
          'unknown-status',
          MeetingStatus.SCHEDULED,
        ),
      ).toThrow(BadRequestException);
    });
  });
});
