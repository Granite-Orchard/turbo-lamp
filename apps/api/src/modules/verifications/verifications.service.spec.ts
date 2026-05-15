import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { DataSource, FindOptionsRelations } from 'typeorm';
import { EventBus } from '@nestjs/cqrs';
import { NotFoundException } from '@nestjs/common';
import { VerificationsService } from './verifications.service';
import { Verification } from './entities/verification.entity';
import { CreateVerificationDto } from './dto/create-verification.dto';
import { UpdateVerificationDto } from './dto/update-verification.dto';
import { TokenService } from '../auth/token.service';
import {
  SanitizedRoutes,
  VerificationType,
  VerificationValue,
} from '../../libs/constants';

describe('VerificationsService', () => {
  let service: VerificationsService;

  const mockVerification: Verification = {
    id: '123e4567-e89b-12d3-a456-426614174000',
    identifier: 'test-identifier',
    value: 'test-value',
    expiresAt: new Date(Date.now() + 86400000),
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
    softDelete: jest.fn(),
    remove: jest.fn(),
  };

  const mockDataSource = {
    transaction: jest.fn(),
  };

  const mockTokenService = {
    verify: jest.fn(),
  };

  const mockEventBus = {
    publish: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        VerificationsService,
        { provide: getRepositoryToken(Verification), useValue: mockRepository },
        { provide: DataSource, useValue: mockDataSource },
        { provide: TokenService, useValue: mockTokenService },
        { provide: EventBus, useValue: mockEventBus },
      ],
    }).compile();

    service = module.get<VerificationsService>(VerificationsService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('findAll', () => {
    it('should return an array of verifications', async () => {
      mockRepository.find.mockResolvedValue([mockVerification]);

      const result = await service.findAll();

      expect(mockRepository.find).toHaveBeenCalled();
      expect(result).toEqual([mockVerification]);
    });

    it('should return empty array when no verifications exist', async () => {
      mockRepository.find.mockResolvedValue([]);

      const result = await service.findAll();

      expect(result).toEqual([]);
    });
  });

  describe('findAllBy', () => {
    it('should return verifications matching the where clause', async () => {
      const where = { identifier: 'test-identifier' };
      mockRepository.find.mockResolvedValue([mockVerification]);

      const result = await service.findAllBy(where);

      expect(mockRepository.find).toHaveBeenCalledWith({
        where,
        relations: undefined,
      });
      expect(result).toEqual([mockVerification]);
    });

    it('should return verifications with relations', async () => {
      const where = { identifier: 'test-identifier' };
      const relations = { user: true };
      mockRepository.find.mockResolvedValue([mockVerification]);

      await service.findAllBy(
        where,
        relations as FindOptionsRelations<Verification>,
      );

      expect(mockRepository.find).toHaveBeenCalledWith({
        where,
        relations,
      });
    });
  });

  describe('findOne', () => {
    it('should return a verification by id', async () => {
      mockRepository.findOne.mockResolvedValue(mockVerification);

      const result = await service.findOne(mockVerification.id);

      expect(mockRepository.findOne).toHaveBeenCalledWith({
        where: { id: mockVerification.id },
        relations: undefined,
      });
      expect(result).toEqual(mockVerification);
    });

    it('should return null when verification not found', async () => {
      mockRepository.findOne.mockResolvedValue(null);

      const result = await service.findOne('non-existent-id');

      expect(result).toBeNull();
    });
  });

  describe('findOneBy', () => {
    it('should return a verification by custom where clause', async () => {
      const where = { identifier: 'test-identifier' };
      mockRepository.findOne.mockResolvedValue(mockVerification);

      const result = await service.findOneBy(where);

      expect(mockRepository.findOne).toHaveBeenCalledWith({
        where,
        relations: undefined,
      });
      expect(result).toEqual(mockVerification);
    });

    it('should return null when verification not found', async () => {
      const where = { identifier: 'non-existent' };
      mockRepository.findOne.mockResolvedValue(null);

      const result = await service.findOneBy(where);

      expect(result).toBeNull();
    });
  });

  describe('consume', () => {
    it('should consume and remove verification', async () => {
      const mockManager = {
        getRepository: jest.fn().mockReturnValue({
          findOne: jest.fn().mockResolvedValue(mockVerification),
          remove: jest.fn().mockResolvedValue(mockVerification),
        }),
      };

      mockDataSource.transaction.mockImplementation((cb) => cb(mockManager));

      const result = await service.consume('test-identifier');

      expect(mockManager.getRepository).toHaveBeenCalledWith(Verification);
      expect(result).toEqual(mockVerification);
    });

    it('should return null when verification not found', async () => {
      const mockManager = {
        getRepository: jest.fn().mockReturnValue({
          findOne: jest.fn().mockResolvedValue(null),
        }),
      };

      mockDataSource.transaction.mockImplementation((cb) => cb(mockManager));

      const result = await service.consume('non-existent');

      expect(result).toBeNull();
    });
  });

  describe('create', () => {
    it('should create a verification with empty value', async () => {
      const createDto: CreateVerificationDto = {
        identifier: 'test-identifier',
        value: '',
        expiresAt: new Date(),
      };

      mockRepository.create.mockReturnValue(mockVerification);
      mockRepository.save.mockResolvedValue(mockVerification);

      const result = await service.create(createDto);

      expect(mockRepository.create).toHaveBeenCalledWith(createDto);
      expect(mockRepository.save).toHaveBeenCalledWith(mockVerification);
      expect(mockTokenService.verify).not.toHaveBeenCalled();
      expect(result).toEqual(mockVerification);
    });

    it('should create verification and publish event for meeting invitation', async () => {
      const createDto: CreateVerificationDto = {
        identifier: 'test-identifier',
        value: 'jwt-token',
        expiresAt: new Date(),
      };

      const payload: VerificationValue = {
        type: VerificationType.EMAIL_INVITATION,
        id: '123',
        to: '',
        after: SanitizedRoutes.DASHBOARD,
      };

      mockRepository.create.mockReturnValue(mockVerification);
      mockRepository.save.mockResolvedValue(mockVerification);
      mockTokenService.verify.mockResolvedValue(payload);

      const result = await service.create(createDto);

      expect(mockTokenService.verify).toHaveBeenCalledWith(createDto.value);
      expect(mockEventBus.publish).toHaveBeenCalled();
      expect(result).toEqual(mockVerification);
    });
  });

  describe('update', () => {
    it('should update a verification', async () => {
      const updateDto: UpdateVerificationDto = {
        expiresAt: new Date(),
      };

      mockRepository.update.mockResolvedValue({ affected: 1 });
      mockRepository.findOne.mockResolvedValue(mockVerification);

      const result = await service.update(mockVerification.id, updateDto);

      expect(mockRepository.update).toHaveBeenCalledWith(
        mockVerification.id,
        updateDto,
      );
      expect(result).toEqual(mockVerification);
    });

    it('should throw NotFoundException when verification not found', async () => {
      mockRepository.update.mockResolvedValue({ affected: 0 });

      await expect(service.update('non-existent-id', {})).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('remove', () => {
    it('should soft delete a verification', async () => {
      mockRepository.findOne.mockResolvedValue(mockVerification);
      mockRepository.softDelete.mockResolvedValue({ affected: 1 });

      const result = await service.remove(mockVerification.id);

      expect(mockRepository.findOne).toHaveBeenCalled();
      expect(mockRepository.softDelete).toHaveBeenCalledWith(
        mockVerification.id,
      );
      expect(result).toEqual({ affected: 1 });
    });

    it('should throw NotFoundException when verification not found', async () => {
      mockRepository.findOne.mockResolvedValue(null);

      await expect(service.remove('non-existent-id')).rejects.toThrow(
        NotFoundException,
      );
    });
  });
});
