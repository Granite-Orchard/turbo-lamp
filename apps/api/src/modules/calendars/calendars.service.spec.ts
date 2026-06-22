import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { EventBus } from '@nestjs/cqrs';
import { NotFoundException } from '@nestjs/common';
import { CalendarsService } from './calendars.service';
import { Calendar } from './entities/calendar.entity';
import { CreateCalendarDto } from './dto/create-calendar.dto';
import { UpdateCalendarDto } from './dto/update-calendar.dto';
import { CalendarProvider } from '../../libs/constants';

describe('CalendarsService', () => {
  let service: CalendarsService;
  let repository: Repository<Calendar>;
  let eventBus: EventBus;

  const mockCalendar: Calendar = {
    id: '123e4567-e89b-12d3-a456-426614174000',
    accountId: '123e4567-e89b-12d3-a456-426614174001',
    account: {} as any,
    userId: '123e4567-e89b-12d3-a456-426614174002',
    user: {} as any,
    providerId: CalendarProvider.GOOGLE,
    externalId: 'external-calendar-id',
    name: 'Test Calendar',
    timezone: 'America/New_York',
    enabled: true,
    meetingGroups: [],
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
    upsert: jest.fn(),
  };

  const mockEventBus = {
    publish: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CalendarsService,
        { provide: getRepositoryToken(Calendar), useValue: mockRepository },
        { provide: EventBus, useValue: mockEventBus },
      ],
    }).compile();

    service = module.get<CalendarsService>(CalendarsService);
    repository = module.get<Repository<Calendar>>(getRepositoryToken(Calendar));
    eventBus = module.get<EventBus>(EventBus);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('findAll', () => {
    it('should return an array of calendars', async () => {
      mockRepository.find.mockResolvedValue([mockCalendar]);

      const result = await service.findAll();

      expect(mockRepository.find).toHaveBeenCalled();
      expect(result).toEqual([mockCalendar]);
    });

    it('should return empty array when no calendars exist', async () => {
      mockRepository.find.mockResolvedValue([]);

      const result = await service.findAll();

      expect(result).toEqual([]);
    });
  });

  describe('findAllBy', () => {
    it('should return calendars matching where clause', async () => {
      const where = { userId: mockCalendar.userId };
      mockRepository.find.mockResolvedValue([mockCalendar]);

      const result = await service.findAllBy(where);

      expect(mockRepository.find).toHaveBeenCalledWith({
        where,
        relations: undefined,
      });
      expect(result).toEqual([mockCalendar]);
    });

    it('should return calendars with relations', async () => {
      const where = { userId: mockCalendar.userId };
      const relations = { account: true };
      mockRepository.find.mockResolvedValue([mockCalendar]);

      const result = await service.findAllBy(where, relations);

      expect(mockRepository.find).toHaveBeenCalledWith({ where, relations });
    });
  });

  describe('findOne', () => {
    it('should return a calendar by id', async () => {
      mockRepository.findOne.mockResolvedValue(mockCalendar);

      const result = await service.findOne(mockCalendar.id);

      expect(mockRepository.findOne).toHaveBeenCalledWith({
        where: { id: mockCalendar.id },
        relations: undefined,
      });
      expect(result).toEqual(mockCalendar);
    });

    it('should return null when calendar not found', async () => {
      mockRepository.findOne.mockResolvedValue(null);

      const result = await service.findOne('non-existent-id');

      expect(result).toBeNull();
    });
  });

  describe('findOneBy', () => {
    it('should return calendar by custom where clause', async () => {
      const where = { externalId: mockCalendar.externalId };
      mockRepository.findOne.mockResolvedValue(mockCalendar);

      const result = await service.findOneBy(where);

      expect(mockRepository.findOne).toHaveBeenCalledWith({
        where,
        relations: undefined,
      });
      expect(result).toEqual(mockCalendar);
    });
  });

  describe('upsert', () => {
    it('should upsert a calendar and publish event', async () => {
      const dto: CreateCalendarDto & { accountId: string; createdBy: string } =
        {
          accountId: mockCalendar.accountId,
          userId: mockCalendar.userId,
          externalId: mockCalendar.externalId,
          providerId: mockCalendar.providerId,
          name: mockCalendar.name,
          timezone: mockCalendar.timezone,
          enabled: true,
          createdBy: mockCalendar.userId,
        };

      mockRepository.upsert.mockResolvedValue({ affected: 1 });
      mockRepository.findOne.mockResolvedValue(mockCalendar);

      const result = await service.upsert(dto);

      expect(mockRepository.upsert).toHaveBeenCalledWith(dto, {
        skipUpdateIfNoValuesChanged: true,
        conflictPaths: ['userId', 'externalId', 'providerId'],
      });
      expect(mockEventBus.publish).toHaveBeenCalled();
      expect(result).toEqual(mockCalendar);
    });

    it('should not publish event when result is null after upsert', async () => {
      const dto: CreateCalendarDto & { accountId: string; createdBy: string } =
        {
          accountId: mockCalendar.accountId,
          userId: mockCalendar.userId,
          externalId: mockCalendar.externalId,
          providerId: mockCalendar.providerId,
          name: mockCalendar.name,
          timezone: mockCalendar.timezone,
          enabled: true,
          createdBy: mockCalendar.userId,
        };

      mockRepository.upsert.mockResolvedValue({ affected: 1 });
      mockRepository.findOne.mockResolvedValue(null);

      const result = await service.upsert(dto);

      expect(mockEventBus.publish).not.toHaveBeenCalled();
      expect(result).toBeNull();
    });
  });

  describe('create', () => {
    it('should create a calendar and publish event', async () => {
      const dto: CreateCalendarDto & { accountId: string; createdBy: string } =
        {
          accountId: mockCalendar.accountId,
          userId: mockCalendar.userId,
          externalId: mockCalendar.externalId,
          providerId: mockCalendar.providerId,
          name: mockCalendar.name,
          timezone: mockCalendar.timezone,
          enabled: true,
          createdBy: mockCalendar.userId,
        };

      mockRepository.create.mockReturnValue(mockCalendar);
      mockRepository.save.mockResolvedValue(mockCalendar);

      const result = await service.create(dto);

      expect(mockRepository.create).toHaveBeenCalledWith(dto);
      expect(mockRepository.save).toHaveBeenCalledWith(mockCalendar);
      expect(mockEventBus.publish).toHaveBeenCalled();
      expect(result).toEqual(mockCalendar);
    });
  });

  describe('update', () => {
    it('should update a calendar', async () => {
      const dto: UpdateCalendarDto = { name: 'Updated Calendar' };

      mockRepository.update.mockResolvedValue({ affected: 1 });

      await service.update(mockCalendar.id, dto);

      expect(mockRepository.update).toHaveBeenCalledWith(mockCalendar.id, dto);
    });

    it('should throw NotFoundException when calendar not found', async () => {
      mockRepository.update.mockResolvedValue({ affected: 0 });

      await expect(service.update('non-existent-id', {})).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('remove', () => {
    it('should soft delete a calendar', async () => {
      mockRepository.findOne.mockResolvedValue(mockCalendar);
      mockRepository.delete.mockResolvedValue({ affected: 1 });

      const result = await service.remove(mockCalendar.id);

      expect(mockRepository.findOne).toHaveBeenCalled();
      expect(mockRepository.delete).toHaveBeenCalledWith(mockCalendar.id);
      expect(result).toEqual({ affected: 1 });
    });

    it('should throw NotFoundException when calendar not found', async () => {
      mockRepository.findOne.mockResolvedValue(null);

      await expect(service.remove('non-existent-id')).rejects.toThrow(
        NotFoundException,
      );
    });
  });
});
