import { Test, TestingModule } from '@nestjs/testing';
import { DataSource } from 'typeorm';
import { NotFoundException } from '@nestjs/common';
import { MeetingAttendeesController } from './meeting-attendees.controller';
import { MeetingAttendeesService } from './meeting-attendees.service';

describe('MeetingAttendeesController', () => {
  let controller: MeetingAttendeesController;

  const record = { id: 'a-1', meetingId: 'm-1', email: 'a@b.com' };

  const mockService = {
    create: jest.fn().mockResolvedValue(record),
    findAllBy: jest.fn().mockResolvedValue([record]),
    findOneBy: jest.fn().mockResolvedValue(record),
    update: jest.fn().mockResolvedValue(record),
    remove: jest.fn().mockResolvedValue({ affected: 1 }),
  };

  const meetingRepo = { findOne: jest.fn() };
  const groupRepo = { findOne: jest.fn() };

  const mockDataSource = {
    getRepository: jest.fn().mockImplementation((entity) => {
      if (entity.name === 'Meeting') return meetingRepo;
      return groupRepo;
    }),
  };

  const req = { user: { userId: 'user-123' } } as any;

  beforeEach(async () => {
    jest.clearAllMocks();
    mockService.create.mockResolvedValue(record);
    mockService.findAllBy.mockResolvedValue([record]);
    mockService.findOneBy.mockResolvedValue(record);
    mockService.update.mockResolvedValue(record);
    mockService.remove.mockResolvedValue({ affected: 1 });
    const module: TestingModule = await Test.createTestingModule({
      controllers: [MeetingAttendeesController],
      providers: [
        { provide: MeetingAttendeesService, useValue: mockService },
        { provide: DataSource, useValue: mockDataSource },
      ],
    }).compile();

    controller = module.get<MeetingAttendeesController>(
      MeetingAttendeesController,
    );
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    beforeEach(() => {
      meetingRepo.findOne.mockResolvedValue({
        id: 'm-1',
        meetingGroupId: 'g-1',
      });
    });

    it('should allow the group author to add an attendee', async () => {
      groupRepo.findOne.mockResolvedValue({
        id: 'g-1',
        authorId: 'user-123',
        participants: [],
      });
      const dto = { meetingId: 'm-1', email: 'a@b.com' };
      const result = await controller.create(req, dto as any);
      expect(mockService.create).toHaveBeenCalledWith({
        ...dto,
        createdBy: 'user-123',
      });
      expect(result).toMatchObject(record);
    });

    it('should allow a group participant to add an attendee', async () => {
      groupRepo.findOne.mockResolvedValue({
        id: 'g-1',
        authorId: 'other',
        participants: [{ userId: 'user-123' }],
      });
      await expect(
        controller.create(req, { meetingId: 'm-1' } as any),
      ).resolves.toMatchObject(record);
    });

    it('should reject when the meeting does not exist', async () => {
      meetingRepo.findOne.mockResolvedValue(null);
      await expect(
        controller.create(req, { meetingId: 'm-missing' } as any),
      ).rejects.toBeInstanceOf(NotFoundException);
      expect(mockService.create).not.toHaveBeenCalled();
    });

    it('should reject when the meeting group does not exist', async () => {
      groupRepo.findOne.mockResolvedValue(null);
      await expect(
        controller.create(req, { meetingId: 'm-1' } as any),
      ).rejects.toBeInstanceOf(NotFoundException);
      expect(mockService.create).not.toHaveBeenCalled();
    });

    it('should reject a stranger', async () => {
      groupRepo.findOne.mockResolvedValue({
        id: 'g-1',
        authorId: 'other',
        participants: [{ userId: 'other' }],
      });
      await expect(
        controller.create(req, { meetingId: 'm-1' } as any),
      ).rejects.toBeInstanceOf(NotFoundException);
      expect(mockService.create).not.toHaveBeenCalled();
    });

    it('should reject when the group has no participants listed', async () => {
      groupRepo.findOne.mockResolvedValue({ id: 'g-1', authorId: 'other' });
      await expect(
        controller.create(req, { meetingId: 'm-1' } as any),
      ).rejects.toBeInstanceOf(NotFoundException);
      expect(mockService.create).not.toHaveBeenCalled();
    });
  });

  describe('findAll', () => {
    it('should return attendees for the requester', async () => {
      const result = await controller.findAll(req);
      expect(mockService.findAllBy).toHaveBeenCalledWith([
        { createdBy: 'user-123' },
        { userId: 'user-123' },
      ]);
      expect(result).toEqual([record]);
    });
  });

  describe('findOne', () => {
    it('should return the matching attendee', async () => {
      const result = await controller.findOne(req, 'a-1');
      expect(mockService.findOneBy).toHaveBeenCalledWith([
        { id: 'a-1', createdBy: 'user-123' },
        { id: 'a-1', userId: 'user-123' },
      ]);
      expect(result).toMatchObject(record);
    });

    it('should reject when the attendee is not found', async () => {
      mockService.findOneBy.mockResolvedValue(null);
      await expect(controller.findOne(req, 'a-missing')).rejects.toBeInstanceOf(
        NotFoundException,
      );
    });
  });

  describe('update', () => {
    it('should update an owned attendee', async () => {
      const dto = { email: 'new@b.com' };
      const result = await controller.update(req, 'a-1', dto as any);
      expect(mockService.update).toHaveBeenCalledWith('a-1', dto);
      expect(result).toMatchObject(record);
    });

    it('should reject when the attendee is not found', async () => {
      mockService.findOneBy.mockResolvedValue(null);
      await expect(
        controller.update(req, 'a-missing', {} as any),
      ).rejects.toBeInstanceOf(NotFoundException);
      expect(mockService.update).not.toHaveBeenCalled();
    });
  });

  describe('remove', () => {
    it('should remove an owned attendee', async () => {
      const result = await controller.remove(req, 'a-1');
      expect(mockService.remove).toHaveBeenCalledWith('a-1');
      expect(result).toMatchObject(record);
    });

    it('should reject when the attendee is not found', async () => {
      mockService.findOneBy.mockResolvedValue(null);
      await expect(controller.remove(req, 'a-missing')).rejects.toBeInstanceOf(
        NotFoundException,
      );
      expect(mockService.remove).not.toHaveBeenCalled();
    });

    it('should throw when nothing was deleted', async () => {
      mockService.remove.mockResolvedValue({ affected: 0 });
      await expect(controller.remove(req, 'a-1')).rejects.toThrow();
    });
  });
});
