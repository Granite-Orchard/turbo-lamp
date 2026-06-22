import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { NotFoundException } from '@nestjs/common';
import { MeetingAttendeesService } from './meeting-attendees.service';
import { MeetingAttendee } from './entities/meeting-attendee.entity';
import { CreateMeetingAttendeeDto } from './dto/create-meeting-attendee.dto';
import { UpdateMeetingAttendeeDto } from './dto/update-meeting-attendee.dto';

describe('MeetingAttendeesService', () => {
  let service: MeetingAttendeesService;
  let repository: Repository<MeetingAttendee>;

  const mockMeetingAttendee: MeetingAttendee = {
    id: '123e4567-e89b-12d3-a456-426614174000',
    meetingId: '123e4567-e89b-12d3-a456-426614174001',
    meeting: {} as any,
    userId: '123e4567-e89b-12d3-a456-426614174002',
    user: {} as any,
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
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MeetingAttendeesService,
        {
          provide: getRepositoryToken(MeetingAttendee),
          useValue: mockRepository,
        },
      ],
    }).compile();

    service = module.get<MeetingAttendeesService>(MeetingAttendeesService);
    repository = module.get<Repository<MeetingAttendee>>(
      getRepositoryToken(MeetingAttendee),
    );
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('create', () => {
    it('should create a new meeting attendee', async () => {
      const createDto: CreateMeetingAttendeeDto & { createdBy: string } = {
        meetingId: mockMeetingAttendee.meetingId,
        userId: mockMeetingAttendee.userId,
        createdBy: mockMeetingAttendee.userId,
      };

      mockRepository.create.mockReturnValue(mockMeetingAttendee);
      mockRepository.save.mockResolvedValue(mockMeetingAttendee);

      const result = await service.create(createDto);

      expect(mockRepository.create).toHaveBeenCalledWith(createDto);
      expect(mockRepository.save).toHaveBeenCalledWith(mockMeetingAttendee);
      expect(result).toEqual(mockMeetingAttendee);
    });
  });

  describe('findAll', () => {
    it('should return an array of meeting attendees', async () => {
      mockRepository.find.mockResolvedValue([mockMeetingAttendee]);

      const result = await service.findAll();

      expect(mockRepository.find).toHaveBeenCalled();
      expect(result).toEqual([mockMeetingAttendee]);
    });

    it('should return empty array when no attendees exist', async () => {
      mockRepository.find.mockResolvedValue([]);

      const result = await service.findAll();

      expect(result).toEqual([]);
    });
  });

  describe('findAllBy', () => {
    it('should return attendees matching the where clause', async () => {
      const where = { meetingId: mockMeetingAttendee.meetingId };
      mockRepository.find.mockResolvedValue([mockMeetingAttendee]);

      const result = await service.findAllBy(where);

      expect(mockRepository.find).toHaveBeenCalledWith({
        where,
        relations: undefined,
      });
      expect(result).toEqual([mockMeetingAttendee]);
    });

    it('should return attendees with relations', async () => {
      const where = { meetingId: mockMeetingAttendee.meetingId };
      const relations = { meeting: true };
      mockRepository.find.mockResolvedValue([mockMeetingAttendee]);

      const result = await service.findAllBy(where, relations);

      expect(mockRepository.find).toHaveBeenCalledWith({
        where,
        relations,
      });
    });
  });

  describe('findOne', () => {
    it('should return a meeting attendee by id', async () => {
      mockRepository.findOne.mockResolvedValue(mockMeetingAttendee);

      const result = await service.findOne(mockMeetingAttendee.id);

      expect(mockRepository.findOne).toHaveBeenCalledWith({
        where: { id: mockMeetingAttendee.id },
        relations: undefined,
      });
      expect(result).toEqual(mockMeetingAttendee);
    });

    it('should return null when attendee not found', async () => {
      mockRepository.findOne.mockResolvedValue(null);

      const result = await service.findOne('non-existent-id');

      expect(result).toBeNull();
    });
  });

  describe('findOneBy', () => {
    it('should return attendee by custom where clause', async () => {
      const where = { meetingId: mockMeetingAttendee.meetingId };
      mockRepository.findOne.mockResolvedValue(mockMeetingAttendee);

      const result = await service.findOneBy(where);

      expect(mockRepository.findOne).toHaveBeenCalledWith({
        where,
        relations: undefined,
      });
      expect(result).toEqual(mockMeetingAttendee);
    });
  });

  describe('update', () => {
    it('should update a meeting attendee', async () => {
      const updateDto: UpdateMeetingAttendeeDto = {
        meetingId: 'new-meeting-id',
      };

      mockRepository.findOne.mockResolvedValue(mockMeetingAttendee);
      mockRepository.update.mockResolvedValue({ affected: 1 });

      const result = await service.update(mockMeetingAttendee.id, updateDto);

      expect(mockRepository.update).toHaveBeenCalled();
      expect(result).toBeDefined();
    });

    it('should throw NotFoundException when attendee not found', async () => {
      const updateDto: UpdateMeetingAttendeeDto = {
        meetingId: 'new-meeting-id',
      };

      mockRepository.findOne.mockResolvedValue(null);

      await expect(service.update('non-existent-id', updateDto)).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('remove', () => {
    it('should soft delete a meeting attendee', async () => {
      mockRepository.findOne.mockResolvedValue(mockMeetingAttendee);
      mockRepository.delete.mockResolvedValue({ affected: 1 });

      const result = await service.remove(mockMeetingAttendee.id);

      expect(mockRepository.findOne).toHaveBeenCalled();
      expect(mockRepository.delete).toHaveBeenCalledWith(
        mockMeetingAttendee.id,
      );
      expect(result).toEqual({ affected: 1 });
    });

    it('should throw NotFoundException when attendee not found', async () => {
      mockRepository.findOne.mockResolvedValue(null);

      await expect(service.remove('non-existent-id')).rejects.toThrow(
        NotFoundException,
      );
    });
  });
});
