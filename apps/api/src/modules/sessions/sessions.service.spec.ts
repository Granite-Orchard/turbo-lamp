import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { NotFoundException } from '@nestjs/common';
import { SessionsService } from './sessions.service';
import { Session } from './entities/session.entity';
import { CreateSessionDto } from './dto/create-session.dto';
import { UpdateSessionDto } from './dto/update-session.dto';

describe('SessionsService', () => {
  let service: SessionsService;
  let repository: Repository<Session>;

  const mockSession: Session = {
    id: '123e4567-e89b-12d3-a456-426614174000',
    userId: '123e4567-e89b-12d3-a456-426614174001',
    user: {} as any,
    token: 'mock-jwt-token',
    expiresAt: new Date(Date.now() + 86400000),
    ipAddress: '127.0.0.1',
    userAgent: 'Mozilla/5.0',
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

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SessionsService,
        {
          provide: getRepositoryToken(Session),
          useValue: mockRepository,
        },
      ],
    }).compile();

    service = module.get<SessionsService>(SessionsService);
    repository = module.get<Repository<Session>>(getRepositoryToken(Session));
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('findAll', () => {
    it('should return an array of sessions', async () => {
      mockRepository.find.mockResolvedValue([mockSession]);

      const result = await service.findAll();

      expect(mockRepository.find).toHaveBeenCalled();
      expect(result).toEqual([mockSession]);
    });

    it('should return empty array when no sessions exist', async () => {
      mockRepository.find.mockResolvedValue([]);

      const result = await service.findAll();

      expect(mockRepository.find).toHaveBeenCalled();
      expect(result).toEqual([]);
    });
  });

  describe('findAllBy', () => {
    it('should return sessions matching the where clause', async () => {
      const where = { userId: mockSession.userId };
      mockRepository.find.mockResolvedValue([mockSession]);

      const result = await service.findAllBy(where);

      expect(mockRepository.find).toHaveBeenCalledWith({
        where,
        relations: undefined,
      });
      expect(result).toEqual([mockSession]);
    });

    it('should return sessions with relations', async () => {
      const where = { userId: mockSession.userId };
      const relations = { user: true };
      mockRepository.find.mockResolvedValue([mockSession]);

      const result = await service.findAllBy(where, relations);

      expect(mockRepository.find).toHaveBeenCalledWith({
        where,
        relations,
      });
      expect(result).toEqual([mockSession]);
    });
  });

  describe('findOne', () => {
    it('should return a session by id', async () => {
      mockRepository.findOne.mockResolvedValue(mockSession);

      const result = await service.findOne(mockSession.id);

      expect(mockRepository.findOne).toHaveBeenCalledWith({
        where: { id: mockSession.id },
        relations: undefined,
      });
      expect(result).toEqual(mockSession);
    });

    it('should return a session with relations', async () => {
      const relations = { user: true };
      mockRepository.findOne.mockResolvedValue(mockSession);

      const result = await service.findOne(mockSession.id, relations);

      expect(mockRepository.findOne).toHaveBeenCalledWith({
        where: { id: mockSession.id },
        relations,
      });
      expect(result).toEqual(mockSession);
    });

    it('should return null when session not found', async () => {
      mockRepository.findOne.mockResolvedValue(null);

      const result = await service.findOne('non-existent-id');

      expect(result).toBeNull();
    });
  });

  describe('findOneBy', () => {
    it('should return a session by custom where clause', async () => {
      const where = { token: mockSession.token };
      mockRepository.findOne.mockResolvedValue(mockSession);

      const result = await service.findOneBy(where);

      expect(mockRepository.findOne).toHaveBeenCalledWith({
        where,
        relations: undefined,
      });
      expect(result).toEqual(mockSession);
    });

    it('should return null when session not found', async () => {
      const where = { token: 'non-existent-token' };
      mockRepository.findOne.mockResolvedValue(null);

      const result = await service.findOneBy(where);

      expect(result).toBeNull();
    });
  });

  describe('create', () => {
    it('should create a new session', async () => {
      const createSessionDto: CreateSessionDto = {
        userId: mockSession.userId,
        token: mockSession.token,
        expiresAt: mockSession.expiresAt,
        ipAddress: mockSession.ipAddress,
        userAgent: mockSession.userAgent,
      };

      mockRepository.create.mockReturnValue(mockSession);
      mockRepository.save.mockResolvedValue(mockSession);

      const result = await service.create(createSessionDto);

      expect(mockRepository.create).toHaveBeenCalledWith(createSessionDto);
      expect(mockRepository.save).toHaveBeenCalledWith(mockSession);
      expect(result).toEqual(mockSession);
    });
  });

  describe('update', () => {
    it('should update a session', async () => {
      const updateSessionDto: UpdateSessionDto = {
        userAgent: 'Updated UserAgent',
      };

      mockRepository.update.mockResolvedValue({ affected: 1 });
      mockRepository.findOne.mockResolvedValue({
        ...mockSession,
        ...updateSessionDto,
      });

      const result = await service.update(mockSession.id, updateSessionDto);

      expect(mockRepository.update).toHaveBeenCalledWith(
        mockSession.id,
        updateSessionDto,
      );
      expect(result).toEqual({ ...mockSession, ...updateSessionDto });
    });

    it('should throw NotFoundException when session not found', async () => {
      const updateSessionDto: UpdateSessionDto = {
        userAgent: 'Updated UserAgent',
      };

      mockRepository.update.mockResolvedValue({ affected: 0 });

      await expect(
        service.update('non-existent-id', updateSessionDto),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('remove', () => {
    it('should soft delete a session', async () => {
      mockRepository.findOne.mockResolvedValue(mockSession);
      mockRepository.delete.mockResolvedValue({ affected: 1 });

      const result = await service.remove(mockSession.id);

      expect(mockRepository.findOne).toHaveBeenCalled();
      expect(mockRepository.delete).toHaveBeenCalledWith(mockSession.id);
      expect(result).toEqual({ affected: 1 });
    });

    it('should throw NotFoundException when session not found', async () => {
      mockRepository.findOne.mockResolvedValue(null);

      await expect(service.remove('non-existent-id')).rejects.toThrow(
        NotFoundException,
      );
    });
  });
});
