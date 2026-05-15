import { NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { ExternalCalendarService } from '../calendars/external-calendar.service';
import { CalendarNotFoundException } from '../calendars/exceptions/calendar.exception';
import { MeetingGroup } from '../meeting-groups/entities/meeting-group.entity';
import { MeetingGroupsService } from '../meeting-groups/meeting-groups.service';
import { MeetingSlot } from './entities/meeting-slot.entity';
import { MeetingSlotsService } from './meeting-slots.service';

describe('MeetingSlotsService', () => {
  let service: MeetingSlotsService;

  const mockMeetingSlot: MeetingSlot = {
    id: '123e4567-e89b-12d3-a456-426614174000',
    meetingGroupId: '123e4567-e89b-12d3-a456-426614174001',
    meetingGroup: {} as MeetingGroup,
    start: new Date(Date.now() + 86400000),
    end: new Date(Date.now() + 90000000),
    rank: 0,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockRepository = {
    find: jest.fn(),
    findOne: jest.fn(),
    save: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
    softDelete: jest.fn(),
    upsert: jest.fn(),
  };

  const mockMeetingGroupService = {
    findOneBy: jest.fn(),
  };

  const mockExternalCalendarService = {
    listEvents: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MeetingSlotsService,
        { provide: getRepositoryToken(MeetingSlot), useValue: mockRepository },
        { provide: MeetingGroupsService, useValue: mockMeetingGroupService },
        {
          provide: ExternalCalendarService,
          useValue: mockExternalCalendarService,
        },
      ],
    }).compile();

    service = module.get<MeetingSlotsService>(MeetingSlotsService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('findAll', () => {
    it('should return an array of meeting slots', async () => {
      mockRepository.find.mockResolvedValue([mockMeetingSlot]);

      const result = await service.findAll();

      expect(mockRepository.find).toHaveBeenCalled();
      expect(result).toEqual([mockMeetingSlot]);
    });

    it('should return empty array when no meeting slots exist', async () => {
      mockRepository.find.mockResolvedValue([]);

      const result = await service.findAll();

      expect(result).toEqual([]);
    });
  });

  describe('findAllBy', () => {
    it('should return meeting slots matching the where clause', async () => {
      const where = { meetingGroupId: mockMeetingSlot.meetingGroupId };
      mockRepository.find.mockResolvedValue([mockMeetingSlot]);

      const result = await service.findAllBy(where);

      expect(mockRepository.find).toHaveBeenCalledWith({
        where,
        relations: undefined,
      });
      expect(result).toEqual([mockMeetingSlot]);
    });

    it('should return meeting slots with relations', async () => {
      const where = { meetingGroupId: mockMeetingSlot.meetingGroupId };
      const relations = { meetingGroup: true };
      mockRepository.find.mockResolvedValue([mockMeetingSlot]);

      await service.findAllBy(where, relations);

      expect(mockRepository.find).toHaveBeenCalledWith({
        where,
        relations,
      });
    });
  });

  describe('findOne', () => {
    it('should return a meeting slot by id', async () => {
      mockRepository.findOne.mockResolvedValue(mockMeetingSlot);

      const result = await service.findOne(mockMeetingSlot.id);

      expect(mockRepository.findOne).toHaveBeenCalledWith({
        where: { id: mockMeetingSlot.id },
        relations: undefined,
      });
      expect(result).toEqual(mockMeetingSlot);
    });

    it('should return null when meeting slot not found', async () => {
      mockRepository.findOne.mockResolvedValue(null);

      const result = await service.findOne('non-existent-id');

      expect(result).toBeNull();
    });
  });

  describe('findOneBy', () => {
    it('should return a meeting slot by custom where clause', async () => {
      const where = { meetingGroupId: mockMeetingSlot.meetingGroupId };
      mockRepository.findOne.mockResolvedValue(mockMeetingSlot);

      const result = await service.findOneBy(where);

      expect(mockRepository.findOne).toHaveBeenCalledWith({
        where,
        relations: undefined,
      });
      expect(result).toEqual(mockMeetingSlot);
    });
  });

  describe('upsert', () => {
    it('should upsert a meeting slot', async () => {
      const dto = {
        meetingGroupId: mockMeetingSlot.meetingGroupId,
        start: mockMeetingSlot.start,
        end: mockMeetingSlot.end,
        rank: 0,
      };

      mockRepository.upsert.mockResolvedValue({ affected: 1 });
      mockRepository.findOne.mockResolvedValue(mockMeetingSlot);

      const result = await service.upsert(dto);

      expect(mockRepository.upsert).toHaveBeenCalledWith(dto, {
        skipUpdateIfNoValuesChanged: true,
        conflictPaths: ['meetingGroupId', 'rank'],
      });
      expect(result).toEqual(mockMeetingSlot);
    });
  });

  describe('create', () => {
    it('should create a new meeting slot', async () => {
      const dto = {
        meetingGroupId: mockMeetingSlot.meetingGroupId,
        start: mockMeetingSlot.start,
        end: mockMeetingSlot.end,
        rank: 0,
        createdBy: '123e4567-e89b-12d3-a456-426614174001',
      };

      mockRepository.create.mockReturnValue(mockMeetingSlot);
      mockRepository.save.mockResolvedValue(mockMeetingSlot);

      const result = await service.create(dto);

      expect(mockRepository.create).toHaveBeenCalledWith(dto);
      expect(mockRepository.save).toHaveBeenCalledWith(mockMeetingSlot);
      expect(result).toEqual(mockMeetingSlot);
    });
  });

  describe('update', () => {
    it('should update a meeting slot', async () => {
      const dto = { rank: 1 };

      mockRepository.update.mockResolvedValue({ affected: 1 });
      mockRepository.findOne.mockResolvedValue({ ...mockMeetingSlot, rank: 1 });

      const result = await service.update(mockMeetingSlot.id, dto);

      expect(mockRepository.update).toHaveBeenCalledWith(
        mockMeetingSlot.id,
        dto,
      );
      expect(result).toEqual({ ...mockMeetingSlot, rank: 1 });
    });

    it('should throw NotFoundException when meeting slot not found', async () => {
      mockRepository.update.mockResolvedValue({ affected: 0 });

      await expect(
        service.update('non-existent-id', { rank: 1 }),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('remove', () => {
    it('should soft delete a meeting slot', async () => {
      mockRepository.findOne.mockResolvedValue(mockMeetingSlot);
      mockRepository.softDelete.mockResolvedValue({ affected: 1 });

      const result = await service.remove(mockMeetingSlot.id);

      expect(mockRepository.findOne).toHaveBeenCalled();
      expect(mockRepository.softDelete).toHaveBeenCalledWith(
        mockMeetingSlot.id,
      );
      expect(result).toEqual({ affected: 1 });
    });

    it('should throw NotFoundException when meeting slot not found', async () => {
      mockRepository.findOne.mockResolvedValue(null);

      await expect(service.remove('non-existent-id')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('calculate', () => {
    const mockMeetingGroup = {
      id: 'group-123',
      authorId: 'author-user-id',
      after: new Date('2024-01-01T00:00:00Z'),
      before: new Date('2024-01-31T23:59:59Z'),
      duration: 60,
      participants: [
        {
          userId: 'author-user-id',
          user: {
            accounts: [{ providerId: 'google' }],
            calendars: [
              {
                enabled: true,
                providerId: 'google',
                externalId: 'cal-1',
                timezone: 'UTC',
              },
            ],
            availabilities: [
              {
                dayOfWeek: 1,
                startTime: '09:00',
                endTime: '17:00',
                isAvailable: true,
              },
            ],
            availabilityOverrides: [],
          },
        },
        {
          userId: 'participant-1',
          user: {
            accounts: [{ providerId: 'google' }],
            calendars: [
              {
                enabled: true,
                providerId: 'google',
                externalId: 'cal-2',
                timezone: 'UTC',
              },
            ],
            availabilities: [
              {
                dayOfWeek: 1,
                startTime: '09:00',
                endTime: '17:00',
                isAvailable: true,
              },
            ],
            availabilityOverrides: [],
          },
        },
      ],
    };

    it('should continue calculation when calendar returns 404', async () => {
      mockMeetingGroupService.findOneBy.mockResolvedValue(mockMeetingGroup);
      mockRepository.delete.mockResolvedValue({ affected: 1 });
      mockRepository.find.mockResolvedValue([]);
      mockRepository.create.mockReturnValue(mockMeetingSlot);
      mockRepository.save.mockResolvedValue(mockMeetingSlot);
      mockRepository.findOne.mockResolvedValue(mockMeetingSlot);
      mockRepository.upsert.mockResolvedValue({ affected: 1 });

      mockExternalCalendarService.listEvents
        .mockRejectedValueOnce(
          new CalendarNotFoundException('Calendar not found'),
        )
        .mockResolvedValueOnce([
          {
            id: 'event-1',
            start: { dateTime: '2024-01-15T10:00:00Z' },
            end: { dateTime: '2024-01-15T11:00:00Z' },
          },
        ]);

      const result = await service.calculate('group-123', 'author-user-id');

      expect(result).toBeDefined();
      expect(mockExternalCalendarService.listEvents).toHaveBeenCalledTimes(2);
    });

    it('should log warning for non-404 errors but continue calculation', async () => {
      mockMeetingGroupService.findOneBy.mockResolvedValue(mockMeetingGroup);
      mockRepository.delete.mockResolvedValue({ affected: 1 });
      mockRepository.find.mockResolvedValue([]);
      mockRepository.create.mockReturnValue(mockMeetingSlot);
      mockRepository.save.mockResolvedValue(mockMeetingSlot);
      mockRepository.findOne.mockResolvedValue(mockMeetingSlot);
      mockRepository.upsert.mockResolvedValue({ affected: 1 });

      const error = new Error('Network error');
      mockExternalCalendarService.listEvents
        .mockRejectedValueOnce(error)
        .mockResolvedValueOnce([
          {
            id: 'event-1',
            start: { dateTime: '2024-01-15T10:00:00Z' },
            end: { dateTime: '2024-01-15T11:00:00Z' },
          },
        ]);

      const result = await service.calculate('group-123', 'author-user-id');

      expect(result).toBeDefined();
    });
  });
});
