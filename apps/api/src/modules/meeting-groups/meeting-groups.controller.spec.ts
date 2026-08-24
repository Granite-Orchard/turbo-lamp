import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { MeetingGroupsController } from './meeting-groups.controller';
import { MeetingGroupsService } from './meeting-groups.service';
import { VerificationsService } from '../verifications/verifications.service';
import { TokenService } from '../auth/token.service';
import { ConfigService } from '@nestjs/config';
import { DataSource } from 'typeorm';
import { VerificationType } from '../../libs/constants';

describe('MeetingGroupsController', () => {
  let controller: MeetingGroupsController;

  const group = {
    id: 'g-1',
    status: 'OPEN',
    authorId: 'user-123',
    calendarId: 'c-1',
    summary: 'Sync',
    duration: 30,
    after: new Date('2026-01-01T00:00:00Z'),
    before: new Date('2026-01-02T00:00:00Z'),
    timezone: 'UTC',
    participants: [{ userId: 'user-123' }],
    slots: [],
  };

  const mockService = {
    findAllBy: jest.fn().mockResolvedValue([group]),
    findOneBy: jest.fn().mockResolvedValue(group),
    validateMeetingGroupConstraints: jest.fn(),
    generateMagicLink: jest.fn().mockResolvedValue('magic-link'),
    update: jest.fn().mockResolvedValue(group),
    remove: jest.fn().mockResolvedValue({ affected: 1 }),
  };

  const mockManager = {
    getRepository: jest.fn().mockImplementation((entity) => {
      if (entity.name === 'MeetingParticipant') {
        return {
          save: jest.fn().mockImplementation((data) => data),
        };
      }
      if (entity.name === 'Verification') {
        return {
          save: jest.fn().mockImplementation((data) => data),
        };
      }
      return {
        save: jest.fn().mockResolvedValue(group),
        update: jest.fn().mockResolvedValue({ affected: 1 }),
      };
    }),
  };

  const mockDataSource = {
    transaction: jest.fn(async (cb) => cb(mockManager)),
  };

  const mockVerificationService = {
    findOneBy: jest.fn(),
  };

  const mockTokenService = {
    randomHash: jest.fn().mockReturnValue('hash'),
    sign: jest.fn().mockReturnValue('signed-jwt'),
    verify: jest.fn(),
  };

  const mockConfigService = {
    get: jest.fn().mockReturnValue('https://veen.me'),
  };

  const req = {
    user: { userId: 'user-123', user: { email: 'a@b.com' } },
  } as any;

  beforeEach(async () => {
    jest.clearAllMocks();
    mockService.findAllBy.mockResolvedValue([group]);
    mockService.findOneBy.mockResolvedValue(group);
    mockService.validateMeetingGroupConstraints.mockImplementation(
      () => undefined,
    );
    mockService.generateMagicLink.mockResolvedValue('magic-link');
    mockService.update.mockResolvedValue(group);
    mockService.remove.mockResolvedValue({ affected: 1 });
    mockTokenService.randomHash.mockReturnValue('hash');
    mockTokenService.sign.mockReturnValue('signed-jwt');
    mockConfigService.get.mockReturnValue('https://veen.me');
    const module: TestingModule = await Test.createTestingModule({
      controllers: [MeetingGroupsController],
      providers: [
        { provide: DataSource, useValue: mockDataSource },
        { provide: MeetingGroupsService, useValue: mockService },
        { provide: VerificationsService, useValue: mockVerificationService },
        { provide: TokenService, useValue: mockTokenService },
        { provide: ConfigService, useValue: mockConfigService },
      ],
    }).compile();

    controller = module.get<MeetingGroupsController>(MeetingGroupsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    it('should create a group owned by the requester', async () => {
      const dto = {
        after: '2026-01-01T00:00:00.000Z',
        before: '2026-01-02T00:00:00.000Z',
        timezone: 'UTC',
        duration: 30,
        summary: 'Sync',
      };
      const result = await controller.create(req, dto as any);
      expect(mockService.validateMeetingGroupConstraints).toHaveBeenCalled();
      expect(mockService.generateMagicLink).toHaveBeenCalledWith('g-1');
      const calledEntities = mockManager.getRepository.mock.calls.map(
        ([entity]: [Function]) => entity.name,
      );
      expect(calledEntities).toContain('MeetingParticipant');
      expect(result).toMatchObject({ id: 'g-1' });
    });
  });

  describe('findAll', () => {
    it('should return groups owned by the requester', async () => {
      const result = await controller.findAll(req);
      expect(mockService.findAllBy).toHaveBeenCalled();
      expect(result).toEqual([group]);
    });
  });

  describe('findOne', () => {
    it('should allow the group author', async () => {
      mockService.findOneBy.mockResolvedValue(group);
      const result = await controller.findOne(req, 'g-1');
      expect(result).toMatchObject({ id: 'g-1' });
    });

    it('should allow a group participant', async () => {
      mockService.findOneBy.mockResolvedValue({
        ...group,
        authorId: 'other',
        participants: [{ userId: 'user-123' }],
      });
      await expect(controller.findOne(req, 'g-1')).resolves.toMatchObject({
        id: 'g-1',
      });
    });

    it('should reject a stranger', async () => {
      mockService.findOneBy.mockResolvedValue({
        ...group,
        authorId: 'other',
        participants: [{ userId: 'other' }],
      });
      await expect(controller.findOne(req, 'g-1')).rejects.toBeInstanceOf(
        NotFoundException,
      );
    });

    it('should reject when the group has no participants listed', async () => {
      mockService.findOneBy.mockResolvedValue({
        ...group,
        authorId: 'other',
        participants: undefined,
      });
      await expect(controller.findOne(req, 'g-1')).rejects.toBeInstanceOf(
        NotFoundException,
      );
    });

    it('should reject when the group does not exist', async () => {
      mockService.findOneBy.mockResolvedValue(null);
      await expect(controller.findOne(req, 'g-missing')).rejects.toBeInstanceOf(
        NotFoundException,
      );
    });
  });

  describe('update', () => {
    it('should update a group owned by the requester', async () => {
      const dto = { summary: 'Renamed' };
      const result = await controller.update(req, 'g-1', dto as any);
      expect(mockService.update).toHaveBeenCalledWith('g-1', dto);
      expect(result).toMatchObject({ id: 'g-1' });
    });

    it('should reject when the group is not found', async () => {
      mockService.findOneBy.mockResolvedValue(null);
      await expect(
        controller.update(req, 'g-missing', {} as any),
      ).rejects.toBeInstanceOf(NotFoundException);
      expect(mockService.update).not.toHaveBeenCalled();
    });
  });

  describe('remove', () => {
    it('should remove a group owned by the requester', async () => {
      const result = await controller.remove(req, 'g-1');
      expect(mockService.remove).toHaveBeenCalledWith('g-1');
      expect(result).toMatchObject({ id: 'g-1' });
    });

    it('should reject when the group is not found', async () => {
      mockService.findOneBy.mockResolvedValue(null);
      await expect(controller.remove(req, 'g-missing')).rejects.toBeInstanceOf(
        NotFoundException,
      );
      expect(mockService.remove).not.toHaveBeenCalled();
    });

    it('should throw when nothing was deleted', async () => {
      mockService.remove.mockResolvedValue({ affected: 0 });
      await expect(controller.remove(req, 'g-1')).rejects.toThrow();
    });
  });

  describe('accept', () => {
    const verification = {
      identifier: 'tok-1',
      value: 'signed-jwt',
      expiresAt: new Date(Date.now() + 60_000),
    };

    it('should redirect when the invitation is valid', async () => {
      mockVerificationService.findOneBy.mockResolvedValue(verification);
      mockTokenService.verify.mockResolvedValue({
        type: VerificationType.MAGIC_LINK_INVITATION,
        id: 'g-1',
        to: '',
        after: '/invitation-accepted',
      });
      const res = { redirect: jest.fn() } as any;
      await controller.accept({} as any, 'g-1', 'tok-1', res);
      const calledEntities = mockManager.getRepository.mock.calls.map(
        ([entity]: [Function]) => entity.name,
      );
      expect(calledEntities).toContain('MeetingParticipant');
      expect(calledEntities).toContain('Verification');
      expect(res.redirect).toHaveBeenCalledWith(
        'https://veen.me//invitation-accepted?token=hash',
      );
    });

    it('should reject when the verification does not exist', async () => {
      mockVerificationService.findOneBy.mockResolvedValue(null);
      await expect(
        controller.accept({} as any, 'g-1', 'tok-1', {
          redirect: jest.fn(),
        } as any),
      ).rejects.toBeInstanceOf(BadRequestException);
    });

    it('should reject an expired verification', async () => {
      mockVerificationService.findOneBy.mockResolvedValue({
        ...verification,
        expiresAt: new Date(Date.now() - 1_000),
      });
      await expect(
        controller.accept({} as any, 'g-1', 'tok-1', {
          redirect: jest.fn(),
        } as any),
      ).rejects.toBeInstanceOf(BadRequestException);
    });

    it('should reject a mismatched group id', async () => {
      mockVerificationService.findOneBy.mockResolvedValue(verification);
      mockTokenService.verify.mockResolvedValue({
        type: VerificationType.MAGIC_LINK_INVITATION,
        id: 'other-group',
        to: '',
        after: '/invitation-accepted',
      });
      await expect(
        controller.accept({} as any, 'g-1', 'tok-1', {
          redirect: jest.fn(),
        } as any),
      ).rejects.toBeInstanceOf(BadRequestException);
    });
  });
});
