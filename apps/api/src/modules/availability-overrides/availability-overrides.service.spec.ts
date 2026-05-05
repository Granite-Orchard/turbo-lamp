import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { NotFoundException } from '@nestjs/common';
import { AvailabilityOverridesService } from './availability-overrides.service';
import { AvailabilityOverride } from './entities/availability-override.entity';
import { CreateAvailabilityOverrideDto } from './dto/create-availability-override.dto';
import { UpdateAvailabilityOverrideDto } from './dto/update-availability-override.dto';

describe('AvailabilityOverridesService', () => {
  let service: AvailabilityOverridesService;
  let repository: Repository<AvailabilityOverride>;

  const mockOverride: AvailabilityOverride = {
    id: '123e4567-e89b-12d3-a456-426614174000',
    userId: '123e4567-e89b-12d3-a456-426614174001',
    user: {} as any,
    date: '2024-01-15',
    startTime: '09:00',
    endTime: '17:00',
    isAvailable: true,
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
    softDelete: jest.fn(),
    upsert: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AvailabilityOverridesService,
        {
          provide: getRepositoryToken(AvailabilityOverride),
          useValue: mockRepository,
        },
      ],
    }).compile();

    service = module.get<AvailabilityOverridesService>(
      AvailabilityOverridesService,
    );
    repository = module.get<Repository<AvailabilityOverride>>(
      getRepositoryToken(AvailabilityOverride),
    );
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('upsert', () => {
    it('should upsert an availability override', async () => {
      const dto: CreateAvailabilityOverrideDto & {
        createdBy: string;
        userId: string;
      } = {
        userId: mockOverride.userId,
        date: mockOverride.date,
        startTime: mockOverride.startTime,
        endTime: mockOverride.endTime,
        isAvailable: mockOverride.isAvailable,
        createdBy: mockOverride.userId,
      };

      mockRepository.upsert.mockResolvedValue({ affected: 1 });
      mockRepository.findOne.mockResolvedValue(mockOverride);

      const result = await service.upsert(dto);

      expect(mockRepository.upsert).toHaveBeenCalledWith(dto, {
        skipUpdateIfNoValuesChanged: true,
        conflictPaths: ['userId', 'date', 'startTime', 'endTime'],
      });
      expect(result).toEqual(mockOverride);
    });
  });

  describe('create', () => {
    it('should create a new availability override', async () => {
      const dto: CreateAvailabilityOverrideDto & {
        createdBy: string;
        userId: string;
      } = {
        userId: mockOverride.userId,
        date: mockOverride.date,
        startTime: mockOverride.startTime,
        endTime: mockOverride.endTime,
        isAvailable: mockOverride.isAvailable,
        createdBy: mockOverride.userId,
      };

      mockRepository.create.mockReturnValue(mockOverride);
      mockRepository.save.mockResolvedValue(mockOverride);

      const result = await service.create(dto);

      expect(mockRepository.create).toHaveBeenCalledWith(dto);
      expect(mockRepository.save).toHaveBeenCalledWith(mockOverride);
      expect(result).toEqual(mockOverride);
    });
  });

  describe('findAll', () => {
    it('should return an array of overrides', async () => {
      mockRepository.find.mockResolvedValue([mockOverride]);

      const result = await service.findAll();

      expect(mockRepository.find).toHaveBeenCalled();
      expect(result).toEqual([mockOverride]);
    });
  });

  describe('findAllBy', () => {
    it('should return overrides matching where clause', async () => {
      const where = { userId: mockOverride.userId };
      mockRepository.find.mockResolvedValue([mockOverride]);

      const result = await service.findAllBy(where);

      expect(mockRepository.find).toHaveBeenCalledWith({
        where,
        relations: undefined,
      });
      expect(result).toEqual([mockOverride]);
    });
  });

  describe('findOne', () => {
    it('should return override by id', async () => {
      mockRepository.findOne.mockResolvedValue(mockOverride);

      const result = await service.findOne(mockOverride.id);

      expect(result).toEqual(mockOverride);
    });
  });

  describe('findOneBy', () => {
    it('should return override by custom where clause', async () => {
      const where = { userId: mockOverride.userId, date: mockOverride.date };
      mockRepository.findOne.mockResolvedValue(mockOverride);

      const result = await service.findOneBy(where);

      expect(result).toEqual(mockOverride);
    });
  });

  describe('update', () => {
    it('should update an override', async () => {
      const dto: UpdateAvailabilityOverrideDto = { startTime: '10:00' };

      mockRepository.update.mockResolvedValue({ affected: 1 });
      mockRepository.findOne.mockResolvedValue({ ...mockOverride, ...dto });

      const result = await service.update(mockOverride.id, dto);

      expect(mockRepository.update).toHaveBeenCalledWith(mockOverride.id, dto);
      expect(result).toEqual({ ...mockOverride, ...dto });
    });

    it('should throw NotFoundException when override not found', async () => {
      mockRepository.update.mockResolvedValue({ affected: 0 });

      await expect(service.update('non-existent-id', {})).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('remove', () => {
    it('should soft delete an override', async () => {
      mockRepository.findOne.mockResolvedValue(mockOverride);
      mockRepository.softDelete.mockResolvedValue({ affected: 1 });

      const result = await service.remove(mockOverride.id);

      expect(mockRepository.findOne).toHaveBeenCalled();
      expect(mockRepository.softDelete).toHaveBeenCalledWith(mockOverride.id);
      expect(result).toEqual({ affected: 1 });
    });

    it('should throw NotFoundException when override not found', async () => {
      mockRepository.findOne.mockResolvedValue(null);

      await expect(service.remove('non-existent-id')).rejects.toThrow(
        NotFoundException,
      );
    });
  });
});
