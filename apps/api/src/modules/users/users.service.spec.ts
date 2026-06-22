import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { NotFoundException } from '@nestjs/common';
import { UsersService } from './users.service';
import { User } from './entities/user.entity';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';

describe('UsersService', () => {
  let service: UsersService;

  const mockUser: User = {
    id: '123e4567-e89b-12d3-a456-426614174000',
    name: 'Test User',
    email: 'test@example.com',
    emailVerified: true,
    timezone: 'America/New_York',
    image: 'https://example.com/avatar.jpg',
    createdAt: new Date(),
    updatedAt: new Date(),
    deletedAt: undefined,
    createdBy: undefined,
    updatedBy: undefined,
    deletedBy: undefined,
    accounts: [],
    sessions: [],
    meetingGroups: [],
    attendances: [],
    participations: [],
    availabilities: [],
    availabilityOverrides: [],
    calendars: [],
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

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        {
          provide: getRepositoryToken(User),
          useValue: mockRepository,
        },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('create', () => {
    it('should create a new user', async () => {
      const createUserDto: CreateUserDto = {
        name: 'Test User',
        email: 'test@example.com',
        emailVerified: true,
        timezone: 'America/New_York',
      };

      mockRepository.create.mockReturnValue(mockUser);
      mockRepository.save.mockResolvedValue(mockUser);

      const result = await service.create(createUserDto);

      expect(mockRepository.create).toHaveBeenCalledWith(createUserDto);
      expect(mockRepository.save).toHaveBeenCalledWith(mockUser);
      expect(result).toEqual(mockUser);
    });

    it('should throw error when create fails', async () => {
      const createUserDto: CreateUserDto = {
        name: 'Test User',
        email: 'test@example.com',
        emailVerified: true,
        timezone: 'America/New_York',
      };

      mockRepository.create.mockReturnValue(mockUser);
      mockRepository.save.mockRejectedValue(new Error('DB error'));

      await expect(service.create(createUserDto)).rejects.toThrow('DB error');
    });
  });

  describe('findOne', () => {
    it('should return a user by id', async () => {
      mockRepository.findOne.mockResolvedValue(mockUser);

      const result = await service.findOne(mockUser.id);

      expect(mockRepository.findOne).toHaveBeenCalledWith({
        where: { id: mockUser.id },
        relations: undefined,
      });
      expect(result).toEqual(mockUser);
    });

    it('should return a user with relations', async () => {
      const relations = { accounts: true };
      mockRepository.findOne.mockResolvedValue(mockUser);

      const result = await service.findOne(mockUser.id, relations);

      expect(mockRepository.findOne).toHaveBeenCalledWith({
        where: { id: mockUser.id },
        relations,
      });
      expect(result).toEqual(mockUser);
    });

    it('should return null when user not found', async () => {
      mockRepository.findOne.mockResolvedValue(null);

      const result = await service.findOne('non-existent-id');

      expect(result).toBeNull();
    });
  });

  describe('findOneBy', () => {
    it('should return a user by custom where clause', async () => {
      const where = { email: 'test@example.com' };
      mockRepository.findOne.mockResolvedValue(mockUser);

      const result = await service.findOneBy(where);

      expect(mockRepository.findOne).toHaveBeenCalledWith({
        where,
        relations: undefined,
      });
      expect(result).toEqual(mockUser);
    });

    it('should return null when user not found', async () => {
      const where = { email: 'non-existent@example.com' };
      mockRepository.findOne.mockResolvedValue(null);

      const result = await service.findOneBy(where);

      expect(result).toBeNull();
    });
  });

  describe('update', () => {
    it('should update a user', async () => {
      const updateUserDto: UpdateUserDto = {
        name: 'Updated Name',
      };

      mockRepository.update.mockResolvedValue({ affected: 1 });
      mockRepository.findOne.mockResolvedValue({
        ...mockUser,
        ...updateUserDto,
      });

      const result = await service.update(mockUser.id, updateUserDto);

      expect(mockRepository.update).toHaveBeenCalledWith(
        mockUser.id,
        updateUserDto,
      );
      expect(result).toEqual({ ...mockUser, ...updateUserDto });
    });

    it('should throw NotFoundException when user not found', async () => {
      const updateUserDto: UpdateUserDto = {
        name: 'Updated Name',
      };

      mockRepository.update.mockResolvedValue({ affected: 0 });

      await expect(
        service.update('non-existent-id', updateUserDto),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('remove', () => {
    it('should soft delete a user', async () => {
      mockRepository.findOne.mockResolvedValue(mockUser);
      mockRepository.delete.mockResolvedValue({ affected: 1 });

      const result = await service.remove(mockUser.id);

      expect(mockRepository.findOne).toHaveBeenCalled();
      expect(mockRepository.delete).toHaveBeenCalledWith(mockUser.id);
      expect(result).toEqual({ affected: 1 });
    });

    it('should throw NotFoundException when user not found', async () => {
      mockRepository.findOne.mockResolvedValue(null);

      await expect(service.remove('non-existent-id')).rejects.toThrow(
        NotFoundException,
      );
    });
  });
});
