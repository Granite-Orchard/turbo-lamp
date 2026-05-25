import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import { EventBus } from '@nestjs/cqrs';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { MeetingParticipantsService } from './meeting-participants.service';
import { MeetingParticipant } from './entities/meeting-participant.entity';
import { CreateMeetingParticipantDto } from './dto/create-meeting-participant.dto';
import { UpdateMeetingParticipantDto } from './dto/update-meeting-participant.dto';
import { TokenService } from '../auth/token.service';
import { VerificationsService } from '../verifications/verifications.service';
import {
  ParticipantAuthState,
  ParticipantInvitationState,
} from '../../libs/constants';

describe('MeetingParticipantsService', () => {
  let service: MeetingParticipantsService;
  let repository: Repository<MeetingParticipant>;

  const mockParticipant: MeetingParticipant = {
    id: '123e4567-e89b-12d3-a456-426614174000',
    meetingGroupId: '123e4567-e89b-12d3-a456-426614174001',
    meetingGroup: {} as any,
    userId: '123e4567-e89b-12d3-a456-426614174002',
    user: {} as any,
    email: 'participant@example.com',
    invitationState: ParticipantInvitationState.PENDING,
    authState: ParticipantAuthState.UNAUTHORIZED,
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
  };

  const mockConfigService = {
    get: jest.fn().mockReturnValue(3600),
  };

  const mockTokenService = {
    randomHash: jest.fn().mockReturnValue('mock-hash'),
    sign: jest.fn().mockReturnValue('mock-token'),
  };

  const mockVerificationService = {
    create: jest.fn(),
  };

  const mockEventBus = {
    publish: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MeetingParticipantsService,
        {
          provide: getRepositoryToken(MeetingParticipant),
          useValue: mockRepository,
        },
        { provide: ConfigService, useValue: mockConfigService },
        { provide: TokenService, useValue: mockTokenService },
        { provide: VerificationsService, useValue: mockVerificationService },
        { provide: EventBus, useValue: mockEventBus },
      ],
    }).compile();

    service = module.get<MeetingParticipantsService>(
      MeetingParticipantsService,
    );
    repository = module.get<Repository<MeetingParticipant>>(
      getRepositoryToken(MeetingParticipant),
    );
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('findAll', () => {
    it('should return an array of participants', async () => {
      mockRepository.find.mockResolvedValue([mockParticipant]);

      const result = await service.findAll();

      expect(mockRepository.find).toHaveBeenCalled();
      expect(result).toEqual([mockParticipant]);
    });
  });

  describe('findAllBy', () => {
    it('should return participants matching where clause', async () => {
      const where = { meetingGroupId: mockParticipant.meetingGroupId };
      mockRepository.find.mockResolvedValue([mockParticipant]);

      const result = await service.findAllBy(where);

      expect(mockRepository.find).toHaveBeenCalledWith({
        where,
        relations: undefined,
      });
      expect(result).toEqual([mockParticipant]);
    });
  });

  describe('findOne', () => {
    it('should return participant by id', async () => {
      mockRepository.findOne.mockResolvedValue(mockParticipant);

      const result = await service.findOne(mockParticipant.id);

      expect(result).toEqual(mockParticipant);
    });
  });

  describe('findOneBy', () => {
    it('should return participant by custom where clause', async () => {
      const where = { email: mockParticipant.email };
      mockRepository.findOne.mockResolvedValue(mockParticipant);

      const result = await service.findOneBy(where);

      expect(result).toEqual(mockParticipant);
    });
  });

  describe('create', () => {
    it('should create participant with default states', async () => {
      const createDto: CreateMeetingParticipantDto & { createdBy: string } = {
        meetingGroupId: mockParticipant.meetingGroupId,
        userId: mockParticipant.userId,
        email: mockParticipant.email,
        createdBy: 'author-id',
      };

      mockRepository.create.mockReturnValue(mockParticipant);
      mockRepository.save.mockResolvedValue(mockParticipant);

      const result = await service.create(createDto);

      expect(result).toEqual(mockParticipant);
    });

    it('should create participant and create verification when not authorized', async () => {
      const createDto: CreateMeetingParticipantDto & { createdBy: string } = {
        meetingGroupId: mockParticipant.meetingGroupId,
        email: mockParticipant.email,
        createdBy: 'author-id',
        authState: ParticipantAuthState.UNAUTHORIZED,
      };

      mockRepository.create.mockReturnValue(mockParticipant);
      mockRepository.save.mockResolvedValue(mockParticipant);

      const result = await service.create(createDto);

      expect(mockVerificationService.create).toHaveBeenCalled();
      expect(result).toEqual(mockParticipant);
    });

    it('should create participant and skip verification when already AUTHORIZED', async () => {
      const createDto: CreateMeetingParticipantDto & { createdBy: string } = {
        meetingGroupId: mockParticipant.meetingGroupId,
        email: mockParticipant.email,
        createdBy: 'author-id',
        authState: ParticipantAuthState.AUTHORIZED,
      };

      mockRepository.create.mockReturnValue(mockParticipant);
      mockRepository.save.mockResolvedValue(mockParticipant);

      const result = await service.create(createDto);

      expect(mockVerificationService.create).not.toHaveBeenCalled();
      expect(result).toEqual(mockParticipant);
    });
  });

  describe('update', () => {
    it('should update participant', async () => {
      const updateDto: UpdateMeetingParticipantDto = {
        authState: ParticipantAuthState.AUTHORIZED,
      };

      mockRepository.findOne
        .mockResolvedValueOnce({
          ...mockParticipant,
          invitationState: ParticipantInvitationState.PENDING,
          authState: ParticipantAuthState.UNAUTHORIZED,
        })
        .mockResolvedValueOnce({
          ...mockParticipant,
          invitationState: ParticipantInvitationState.PENDING,
          authState: ParticipantAuthState.AUTHORIZED,
        });
      mockRepository.update.mockResolvedValue({ affected: 1 });

      const result = await service.update(mockParticipant.id, updateDto);

      expect(mockRepository.update).toHaveBeenCalled();
      expect(result).toBeDefined();
    });

    it('should throw NotFoundException when participant not found', async () => {
      mockRepository.findOne.mockResolvedValue(null);

      await expect(service.update('non-existent-id', {})).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should throw BadRequestException for invalid invitation state transition', async () => {
      const updateDto: UpdateMeetingParticipantDto = {
        invitationState: ParticipantInvitationState.PENDING,
      };

      mockRepository.findOne.mockResolvedValue({
        ...mockParticipant,
        invitationState: ParticipantInvitationState.DECLINED,
      });

      await expect(
        service.update(mockParticipant.id, updateDto),
      ).rejects.toThrow(BadRequestException);
    });

    it('should throw BadRequestException when transitioning from accepted to pending', async () => {
      mockRepository.findOne.mockResolvedValue({
        ...mockParticipant,
        invitationState: ParticipantInvitationState.ACCEPTED,
      });

      await expect(
        service.update(mockParticipant.id, {
          invitationState: ParticipantInvitationState.PENDING,
        }),
      ).rejects.toThrow(BadRequestException);
    });

    it('should throw NotFoundException when update affects no rows', async () => {
      mockRepository.findOne.mockResolvedValue(mockParticipant);
      mockRepository.update.mockResolvedValue({ affected: 0 });

      await expect(
        service.update(mockParticipant.id, { invitationState: ParticipantInvitationState.ACCEPTED }),
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw BadRequestException for invalid auth state transition', async () => {
      mockRepository.findOne.mockResolvedValue({
        ...mockParticipant,
        authState: ParticipantAuthState.UNAUTHORIZED,
      });

      await expect(
        service.update(mockParticipant.id, {
          authState: 'invalid' as ParticipantAuthState,
        }),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('remove', () => {
    it('should soft delete participant', async () => {
      mockRepository.findOne.mockResolvedValue(mockParticipant);
      mockRepository.softDelete.mockResolvedValue({ affected: 1 });

      const result = await service.remove(mockParticipant.id);

      expect(mockRepository.findOne).toHaveBeenCalled();
      expect(mockRepository.softDelete).toHaveBeenCalledWith(
        mockParticipant.id,
      );
      expect(result).toEqual({ affected: 1 });
    });

    it('should throw NotFoundException when participant not found', async () => {
      mockRepository.findOne.mockResolvedValue(null);

      await expect(service.remove('non-existent-id')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('validateInvitationStateTransition (private)', () => {
    it('should handle unknown current state with empty allowed transitions', () => {
      expect(() =>
        (service as any).validateInvitationStateTransition(
          'unknown-state' as any,
          ParticipantInvitationState.PENDING,
        ),
      ).toThrow(BadRequestException);
    });
  });

  describe('validateAuthStateTransition (private)', () => {
    it('should handle unknown current state with empty allowed transitions', () => {
      expect(() =>
        (service as any).validateAuthStateTransition(
          'unknown-state' as any,
          ParticipantAuthState.AUTHORIZED,
        ),
      ).toThrow(BadRequestException);
    });
  });
});
