import { BadRequestException, NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { MeetingGroupStatus } from '../../libs/constants';
import { TokenService } from '../auth/token.service';
import { Calendar } from '../calendars/entities/calendar.entity';
import { User } from '../users/entities/user.entity';
import { VerificationsService } from '../verifications/verifications.service';
import { CreateMeetingGroupDto } from './dto/create-meeting-group.dto';
import { UpdateMeetingGroupDto } from './dto/update-meeting-group.dto';
import { MeetingGroup } from './entities/meeting-group.entity';
import { MeetingGroupsService } from './meeting-groups.service';
import { ConfigService } from '@nestjs/config';

describe('MeetingGroupsService', () => {
  let service: MeetingGroupsService;

  const mockMeetingGroup: MeetingGroup = {
    id: '123e4567-e89b-12d3-a456-426614174000',
    authorId: '123e4567-e89b-12d3-a456-426614174001',
    author: {} as User,
    calendarId: '123e4567-e89b-12d3-a456-426614174002',
    calendar: {} as Calendar,
    summary: 'Test Meeting Group',
    description: 'Test Description',
    location: 'Test Location',
    duration: 60,
    after: new Date(Date.now() + 86400000),
    before: new Date(Date.now() + 172800000),
    timezone: 'America/New_York',
    status: MeetingGroupStatus.OPEN,
    meeting: undefined,
    slots: [],
    participants: [],
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
  };

  const mockVerificationsService = {
    create: jest.fn(),
    findOneBy: jest.fn(),
  };

  const mockTokenService = {
    randomHash: jest.fn(),
    sign: jest.fn(),
    verify: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MeetingGroupsService,
        {
          provide: getRepositoryToken(MeetingGroup),
          useValue: mockRepository,
        },
        {
          provide: VerificationsService,
          useValue: mockVerificationsService,
        },
        {
          provide: TokenService,
          useValue: mockTokenService,
        },
        {
          provide: ConfigService,
          useValue: { get: jest.fn().mockReturnValue('http://localhost:3001') },
        },
      ],
    }).compile();

    service = module.get<MeetingGroupsService>(MeetingGroupsService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('findAll', () => {
    it('should return an array of meeting groups', async () => {
      mockRepository.find.mockResolvedValue([mockMeetingGroup]);

      const result = await service.findAll();

      expect(mockRepository.find).toHaveBeenCalled();
      expect(result).toEqual([mockMeetingGroup]);
    });

    it('should return empty array when no meeting groups exist', async () => {
      mockRepository.find.mockResolvedValue([]);

      const result = await service.findAll();

      expect(result).toEqual([]);
    });
  });

  describe('findAllBy', () => {
    it('should return meeting groups with default relations', async () => {
      mockRepository.find.mockResolvedValue([mockMeetingGroup]);

      const result = await service.findAllBy({});

      expect(mockRepository.find).toHaveBeenCalledWith({
        where: {},
        relations: expect.objectContaining({
          participants: true,
          calendar: true,
        }) as { participants: boolean; calendar: boolean },
      });
      expect(result).toEqual([mockMeetingGroup]);
    });

    it('should merge custom relations with defaults', async () => {
      const customRelations = { participants: true };
      mockRepository.find.mockResolvedValue([mockMeetingGroup]);

      await service.findAllBy({}, customRelations);

      expect(mockRepository.find).toHaveBeenCalledWith({
        where: {},
        relations: expect.objectContaining(customRelations) as {
          participants: boolean;
        },
      });
    });
  });

  describe('findOne', () => {
    it('should return a meeting group by id', async () => {
      mockRepository.findOne.mockResolvedValue(mockMeetingGroup);

      const result = await service.findOne(mockMeetingGroup.id);

      expect(mockRepository.findOne).toHaveBeenCalledWith({
        where: { id: mockMeetingGroup.id },
        relations: undefined,
      });
      expect(result).toEqual(mockMeetingGroup);
    });

    it('should return null when meeting group not found', async () => {
      mockRepository.findOne.mockResolvedValue(null);

      const result = await service.findOne('non-existent-id');

      expect(result).toBeNull();
    });
  });

  describe('findOneBy', () => {
    it('should return meeting group by custom where clause', async () => {
      const where = { status: MeetingGroupStatus.OPEN };
      mockRepository.findOne.mockResolvedValue(mockMeetingGroup);

      const result = await service.findOneBy(where);

      expect(mockRepository.findOne).toHaveBeenCalledWith({
        where,
        relations: undefined,
      });
      expect(result).toEqual(mockMeetingGroup);
    });
  });

  describe('create', () => {
    it('should create a meeting group with OPEN status by default', async () => {
      const createDto: CreateMeetingGroupDto & { createdBy: string } = {
        authorId: mockMeetingGroup.authorId,
        calendarId: mockMeetingGroup.calendarId,
        summary: mockMeetingGroup.summary,
        description: mockMeetingGroup.description,
        location: mockMeetingGroup.location,
        duration: 60,
        after: new Date(Date.now() + 86400000),
        before: new Date(Date.now() + 172800000),
        timezone: 'America/New_York',
        status: MeetingGroupStatus.OPEN,
        createdBy: mockMeetingGroup.authorId,
      };

      mockRepository.create.mockReturnValue(mockMeetingGroup);
      mockRepository.save.mockResolvedValue(mockMeetingGroup);

      const result = await service.create(createDto);

      expect(mockRepository.create).toHaveBeenCalledWith(createDto);
      expect(mockRepository.save).toHaveBeenCalledWith(mockMeetingGroup);
      expect(result).toEqual(mockMeetingGroup);
    });

    it('should default to OPEN when no status is provided', async () => {
      const createDto = {
        authorId: mockMeetingGroup.authorId,
        calendarId: mockMeetingGroup.calendarId,
        summary: mockMeetingGroup.summary,
        description: mockMeetingGroup.description,
        location: mockMeetingGroup.location,
        duration: 60,
        after: new Date(Date.now() + 86400000),
        before: new Date(Date.now() + 172800000),
        timezone: 'America/New_York',
        createdBy: mockMeetingGroup.authorId,
      } as CreateMeetingGroupDto & { createdBy: string };

      mockRepository.create.mockImplementation((dto) => ({
        ...mockMeetingGroup,
        ...dto,
      }));
      mockRepository.save.mockResolvedValue(mockMeetingGroup);

      await service.create(createDto);

      expect(mockRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({ status: MeetingGroupStatus.OPEN }),
      );
    });

    it('should throw BadRequestException when after >= before', async () => {
      const createDto: CreateMeetingGroupDto & { createdBy: string } = {
        authorId: mockMeetingGroup.authorId,
        calendarId: mockMeetingGroup.calendarId,
        summary: mockMeetingGroup.summary,
        duration: 60,
        after: new Date(Date.now() + 172800000),
        before: new Date(Date.now() + 86400000),
        timezone: 'America/New_York',
        createdBy: mockMeetingGroup.authorId,
        status: MeetingGroupStatus.OPEN,
      };

      await expect(service.create(createDto)).rejects.toThrow(
        BadRequestException,
      );
    });

    it('should throw BadRequestException when duration <= 0', async () => {
      const createDto: CreateMeetingGroupDto & { createdBy: string } = {
        authorId: mockMeetingGroup.authorId,
        calendarId: mockMeetingGroup.calendarId,
        summary: mockMeetingGroup.summary,
        duration: 0,
        after: new Date(Date.now() + 86400000),
        before: new Date(Date.now() + 172800000),
        timezone: 'America/New_York',
        createdBy: mockMeetingGroup.authorId,
        status: MeetingGroupStatus.OPEN,
      };

      await expect(service.create(createDto)).rejects.toThrow(
        BadRequestException,
      );
    });

    it('should throw BadRequestException when initial status is not OPEN', async () => {
      const createDto: CreateMeetingGroupDto & { createdBy: string } = {
        authorId: mockMeetingGroup.authorId,
        calendarId: mockMeetingGroup.calendarId,
        summary: mockMeetingGroup.summary,
        duration: 60,
        after: new Date(Date.now() + 86400000),
        before: new Date(Date.now() + 172800000),
        timezone: 'America/New_York',
        createdBy: mockMeetingGroup.authorId,
        status: MeetingGroupStatus.FINALIZED,
      };

      await expect(service.create(createDto)).rejects.toThrow(
        BadRequestException,
      );
    });
  });

  describe('update', () => {
    it('should update a meeting group', async () => {
      const updateDto: UpdateMeetingGroupDto = {
        summary: 'Updated Summary',
      };

      mockRepository.findOne.mockResolvedValue(mockMeetingGroup);
      mockRepository.update.mockResolvedValue({ affected: 1 });

      const result = await service.update(mockMeetingGroup.id, updateDto);

      expect(mockRepository.update).toHaveBeenCalled();
      expect(result).toBeDefined();
    });

    it('should throw NotFoundException when meeting group not found', async () => {
      const updateDto: UpdateMeetingGroupDto = { summary: 'Updated' };
      mockRepository.findOne.mockResolvedValue(null);

      await expect(
        service.update('non-existent-id', updateDto),
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw BadRequestException for invalid status transition', async () => {
      const updateDto: UpdateMeetingGroupDto = {
        status: MeetingGroupStatus.OPEN,
      };

      mockRepository.findOne.mockResolvedValue({
        ...mockMeetingGroup,
        status: MeetingGroupStatus.CANCELLED,
      });

      await expect(
        service.update(mockMeetingGroup.id, updateDto),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('remove', () => {
    it('should soft delete a meeting group', async () => {
      mockRepository.findOne.mockResolvedValue(mockMeetingGroup);
      mockRepository.softDelete.mockResolvedValue({ affected: 1 });

      const result = await service.remove(mockMeetingGroup.id);

      expect(mockRepository.findOne).toHaveBeenCalled();
      expect(mockRepository.softDelete).toHaveBeenCalledWith(
        mockMeetingGroup.id,
      );
      expect(result).toEqual({ affected: 1 });
    });

    it('should throw NotFoundException when meeting group not found', async () => {
      mockRepository.findOne.mockResolvedValue(null);

      await expect(service.remove('non-existent-id')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('generateMagicLink', () => {
    const meetingGroupId = '123e4567-e89b-12d3-a456-426614174000';
    const mockHash = 'mock-random-hash';
    const mockSignedValue = 'mock-signed-token';

    beforeEach(() => {
      mockTokenService.randomHash.mockReturnValue(mockHash);
      mockTokenService.sign.mockReturnValue(mockSignedValue);
      mockVerificationsService.create.mockResolvedValue({
        identifier: mockHash,
      });
    });

    it('should generate a magic link with verification and token', async () => {
      const result = await service.generateMagicLink(meetingGroupId);

      expect(mockTokenService.randomHash).toHaveBeenCalled();
      expect(mockTokenService.sign).toHaveBeenCalled();
      expect(mockVerificationsService.create).toHaveBeenCalledWith({
        identifier: mockHash,
        value: mockSignedValue,
        expiresAt: expect.any(Date),
      });
      expect(result).toContain(meetingGroupId);
      expect(result).toContain('accept?token=');
      expect(result).toContain(mockHash);
    });

    it('should use BACKEND_URL from config', async () => {
      const backendUrl = 'https://example.com';
      const configGet = jest.fn().mockReturnValue(backendUrl);
      const module: TestingModule = await Test.createTestingModule({
        providers: [
          MeetingGroupsService,
          {
            provide: getRepositoryToken(MeetingGroup),
            useValue: mockRepository,
          },
          {
            provide: VerificationsService,
            useValue: mockVerificationsService,
          },
          {
            provide: TokenService,
            useValue: mockTokenService,
          },
          {
            provide: ConfigService,
            useValue: { get: configGet },
          },
        ],
      }).compile();

      const svc = module.get<MeetingGroupsService>(MeetingGroupsService);
      const result = await svc.generateMagicLink(meetingGroupId);

      expect(configGet).toHaveBeenCalledWith('BACKEND_URL');
      expect(result).toContain(backendUrl);
    });
  });

  describe('validateStatusTransition', () => {
    it('should throw BadRequestException for unknown current status', () => {
      expect(() =>
        service.validateStatusTransition(
          'unknown' as MeetingGroupStatus,
          MeetingGroupStatus.OPEN,
        ),
      ).toThrow(BadRequestException);
    });
  });
});
