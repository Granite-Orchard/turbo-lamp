import { Test, TestingModule } from '@nestjs/testing';
import { DataSource } from 'typeorm';
import { NotFoundException } from '@nestjs/common';
import { MeetingParticipantsController } from './meeting-participants.controller';
import { MeetingParticipantsService } from './meeting-participants.service';

describe('MeetingParticipantsController', () => {
  let controller: MeetingParticipantsController;

  const record = {
    id: 'p-1',
    userId: 'user-123',
    meetingGroupId: 'g-1',
    email: 'a@b.com',
    invitationState: 'PENDING',
    authState: 'PENDING',
    required: true,
  };

  const mockService = {
    create: jest.fn().mockResolvedValue(record),
    findAllBy: jest.fn().mockResolvedValue([record]),
    findOneBy: jest.fn().mockResolvedValue(record),
    update: jest.fn().mockResolvedValue(record),
    remove: jest.fn().mockResolvedValue({ affected: 1 }),
  };

  const repo = {
    findOneBy: jest.fn(),
    findOne: jest.fn(),
  };

  const mockDataSource = {
    getRepository: jest.fn().mockReturnValue(repo),
  };

  const req = {
    user: { userId: 'user-123', user: { email: 'a@b.com' } },
  } as any;

  beforeEach(async () => {
    jest.clearAllMocks();
    mockService.create.mockResolvedValue(record);
    mockService.findAllBy.mockResolvedValue([record]);
    mockService.findOneBy.mockResolvedValue(record);
    mockService.update.mockResolvedValue(record);
    mockService.remove.mockResolvedValue({ affected: 1 });
    const module: TestingModule = await Test.createTestingModule({
      controllers: [MeetingParticipantsController],
      providers: [
        { provide: MeetingParticipantsService, useValue: mockService },
        { provide: DataSource, useValue: mockDataSource },
      ],
    }).compile();

    controller = module.get<MeetingParticipantsController>(
      MeetingParticipantsController,
    );
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    it('should allow the group author to create a participant', async () => {
      repo.findOneBy.mockResolvedValue({ id: 'g-1', authorId: 'user-123' });
      const dto = { meetingGroupId: 'g-1', email: 'a@b.com' };
      const result = await controller.create(req, dto as any);
      expect(mockService.create).toHaveBeenCalledWith({
        ...dto,
        createdBy: 'user-123',
      });
      expect(result).toMatchObject(record);
    });

    it('should reject when the group does not exist', async () => {
      repo.findOneBy.mockResolvedValue(null);
      await expect(
        controller.create(req, { meetingGroupId: 'g-missing' } as any),
      ).rejects.toBeInstanceOf(NotFoundException);
      expect(mockService.create).not.toHaveBeenCalled();
    });

    it('should reject when the requester is not the group author', async () => {
      repo.findOneBy.mockResolvedValue({ id: 'g-1', authorId: 'someone-else' });
      await expect(
        controller.create(req, { meetingGroupId: 'g-1' } as any),
      ).rejects.toBeInstanceOf(NotFoundException);
      expect(mockService.create).not.toHaveBeenCalled();
    });
  });

  describe('findAll', () => {
    it('should allow the group author', async () => {
      repo.findOne.mockResolvedValue({
        id: 'g-1',
        authorId: 'user-123',
        participants: [{ userId: 'other' }],
      });
      const result = await controller.findAll(req, 'g-1');
      expect(mockService.findAllBy).toHaveBeenCalledWith([
        { meetingGroupId: 'g-1' },
      ]);
      expect(result).toEqual([record]);
    });

    it('should allow a group participant', async () => {
      repo.findOne.mockResolvedValue({
        id: 'g-1',
        authorId: 'other',
        participants: [{ userId: 'user-123' }],
      });
      await expect(controller.findAll(req, 'g-1')).resolves.toEqual([record]);
    });

    it('should reject a stranger', async () => {
      repo.findOne.mockResolvedValue({
        id: 'g-1',
        authorId: 'other',
        participants: [{ userId: 'other' }],
      });
      await expect(controller.findAll(req, 'g-1')).rejects.toBeInstanceOf(
        NotFoundException,
      );
      expect(mockService.findAllBy).not.toHaveBeenCalled();
    });

    it('should reject when the group has no participants listed', async () => {
      repo.findOne.mockResolvedValue({ id: 'g-1', authorId: 'other' });
      await expect(controller.findAll(req, 'g-1')).rejects.toBeInstanceOf(
        NotFoundException,
      );
    });

    it('should reject when the group does not exist', async () => {
      repo.findOne.mockResolvedValue(null);
      await expect(controller.findAll(req, 'g-missing')).rejects.toBeInstanceOf(
        NotFoundException,
      );
    });
  });

  describe('findOne', () => {
    it('should return the matching participant', async () => {
      const result = await controller.findOne(req, 'p-1');
      expect(mockService.findOneBy).toHaveBeenCalledWith([
        { id: 'p-1', userId: 'user-123' },
        { id: 'p-1', email: 'a@b.com' },
        { id: 'p-1', createdBy: 'user-123' },
      ]);
      expect(result).toMatchObject(record);
    });
  });

  describe('update', () => {
    it('should update an owned participant', async () => {
      mockService.findOneBy.mockResolvedValue(record);
      const dto = { required: false };
      const result = await controller.update(req, 'p-1', dto as any);
      expect(mockService.update).toHaveBeenCalledWith('p-1', dto);
      expect(result).toMatchObject(record);
    });

    it('should reject when the participant is not found', async () => {
      mockService.findOneBy.mockResolvedValue(null);
      await expect(
        controller.update(req, 'p-missing', {} as any),
      ).rejects.toBeInstanceOf(NotFoundException);
      expect(mockService.update).not.toHaveBeenCalled();
    });
  });

  describe('remove', () => {
    it('should remove an owned participant', async () => {
      mockService.findOneBy.mockResolvedValue(record);
      const result = await controller.remove(req, 'p-1');
      expect(mockService.remove).toHaveBeenCalledWith('p-1');
      expect(result).toMatchObject(record);
    });

    it('should reject when the participant is not found', async () => {
      mockService.findOneBy.mockResolvedValue(null);
      await expect(controller.remove(req, 'p-missing')).rejects.toBeInstanceOf(
        NotFoundException,
      );
      expect(mockService.remove).not.toHaveBeenCalled();
    });

    it('should throw when nothing was deleted', async () => {
      mockService.findOneBy.mockResolvedValue(record);
      mockService.remove.mockResolvedValue({ affected: 0 });
      await expect(controller.remove(req, 'p-1')).rejects.toThrow();
    });
  });
});
