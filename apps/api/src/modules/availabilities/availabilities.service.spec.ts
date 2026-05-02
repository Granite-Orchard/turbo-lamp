import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { NotFoundException } from '@nestjs/common';
import { AvailabilitiesService } from './availabilities.service';
import { Availability } from './entities/availability.entity';
import { CreateAvailabilityDto } from './dto/create-availability.dto';
import { UpdateAvailabilityDto } from './dto/update-availability.dto';

describe('AvailabilitiesService', () => {
  let service: AvailabilitiesService;
  let repository: Repository<Availability>;

  const mockAvailability: Availability = {
    id: '123e4567-e89b-12d3-a456-426614174000',
    userId: '123e4567-e89b-12d3-a456-426614174001',
    user: {} as any,
    dayOfWeek: 1,
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
        AvailabilitiesService,
        { provide: getRepositoryToken(Availability), useValue: mockRepository },
      ],
    }).compile();

    service = module.get<AvailabilitiesService>(AvailabilitiesService);
    repository = module.get<Repository<Availability>>(
      getRepositoryToken(Availability),
    );
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('upsert', () => {
    it('should upsert an availability', async () => {
      const dto: CreateAvailabilityDto & { userId: string; createdBy: string } =
        {
          userId: mockAvailability.userId,
          dayOfWeek: mockAvailability.dayOfWeek,
          startTime: mockAvailability.startTime,
          endTime: mockAvailability.endTime,
          isAvailable: mockAvailability.isAvailable,
          createdBy: mockAvailability.userId,
        };

      mockRepository.upsert.mockResolvedValue({ affected: 1 });
      mockRepository.findOne.mockResolvedValue(mockAvailability);

      const result = await service.upsert(dto);

      expect(mockRepository.upsert).toHaveBeenCalledWith(dto, {
        skipUpdateIfNoValuesChanged: true,
        conflictPaths: [
          'userId',
          'dayOfWeek',
          'startTime',
          'endTime',
          'isAvailable',
        ],
      });
      expect(result).toEqual(mockAvailability);
    });
  });

  describe('create', () => {
    it('should create a new availability', async () => {
      const dto: CreateAvailabilityDto & { userId: string; createdBy: string } =
        {
          userId: mockAvailability.userId,
          dayOfWeek: mockAvailability.dayOfWeek,
          startTime: mockAvailability.startTime,
          endTime: mockAvailability.endTime,
          isAvailable: mockAvailability.isAvailable,
          createdBy: mockAvailability.userId,
        };

      mockRepository.create.mockReturnValue(mockAvailability);
      mockRepository.save.mockResolvedValue(mockAvailability);

      const result = await service.create(dto);

      expect(mockRepository.create).toHaveBeenCalledWith(dto);
      expect(mockRepository.save).toHaveBeenCalledWith(mockAvailability);
      expect(result).toEqual(mockAvailability);
    });
  });

  describe('findAll', () => {
    it('should return an array of availabilities', async () => {
      mockRepository.find.mockResolvedValue([mockAvailability]);

      const result = await service.findAll();

      expect(mockRepository.find).toHaveBeenCalled();
      expect(result).toEqual([mockAvailability]);
    });
  });

  describe('findAllBy', () => {
    it('should return availabilities matching where clause', async () => {
      const where = { userId: mockAvailability.userId };
      mockRepository.find.mockResolvedValue([mockAvailability]);

      const result = await service.findAllBy(where);

      expect(mockRepository.find).toHaveBeenCalledWith({
        where,
        relations: undefined,
      });
      expect(result).toEqual([mockAvailability]);
    });
  });

  describe('findOne', () => {
    it('should return an availability by id', async () => {
      mockRepository.findOne.mockResolvedValue(mockAvailability);

      const result = await service.findOne(mockAvailability.id);

      expect(result).toEqual(mockAvailability);
    });
  });

  describe('findOneBy', () => {
    it('should return availability by custom where clause', async () => {
      const where = { userId: mockAvailability.userId, dayOfWeek: 1 };
      mockRepository.findOne.mockResolvedValue(mockAvailability);

      const result = await service.findOneBy(where);

      expect(result).toEqual(mockAvailability);
    });
  });

  describe('update', () => {
    it('should update an availability', async () => {
      const dto: UpdateAvailabilityDto = { startTime: '10:00' };

      mockRepository.update.mockResolvedValue({ affected: 1 });
      mockRepository.findOne.mockResolvedValue({ ...mockAvailability, ...dto });

      const result = await service.update(mockAvailability.id, dto);

      expect(mockRepository.update).toHaveBeenCalledWith(
        mockAvailability.id,
        dto,
      );
      expect(result).toEqual({ ...mockAvailability, ...dto });
    });

    it('should throw NotFoundException when availability not found', async () => {
      mockRepository.update.mockResolvedValue({ affected: 0 });

      await expect(service.update('non-existent-id', {})).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('remove', () => {
    it('should soft delete an availability', async () => {
      mockRepository.findOne.mockResolvedValue(mockAvailability);
      mockRepository.softDelete.mockResolvedValue({ affected: 1 });

      const result = await service.remove(mockAvailability.id);

      expect(mockRepository.findOne).toHaveBeenCalled();
      expect(mockRepository.softDelete).toHaveBeenCalledWith(
        mockAvailability.id,
      );
      expect(result).toEqual({ affected: 1 });
    });

    it('should throw NotFoundException when availability not found', async () => {
      mockRepository.findOne.mockResolvedValue(null);

      await expect(service.remove('non-existent-id')).rejects.toThrow(
        NotFoundException,
      );
    });
  });
});
