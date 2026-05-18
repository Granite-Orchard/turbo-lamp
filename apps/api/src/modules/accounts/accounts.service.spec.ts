import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { NotFoundException } from '@nestjs/common';
import { AccountsService } from './accounts.service';
import { Account } from './entities/account.entity';
import { CreateAccountDto } from './dto/create-account.dto';
import { UpdateAccountDto } from './dto/update-account.dto';
import { AccountProvider } from '../../libs/constants';

describe('AccountsService', () => {
  let service: AccountsService;
  let repository: Repository<Account>;

  const mockAccount: Account = {
    id: '123e4567-e89b-12d3-a456-426614174000',
    userId: '123e4567-e89b-12d3-a456-426614174001',
    user: {} as any,
    accountId: '123e4567-e89b-12d3-a456-426614174001',
    providerId: AccountProvider.CREDENTIALS,
    accessToken: 'mock-access-token',
    refreshToken: 'mock-refresh-token',
    accessTokenExpiresAt: new Date(),
    refreshTokenExpiresAt: new Date(),
    scope: 'openid profile email',
    idToken: 'mock-id-token',
    password: 'hashed-password',
    createdAt: new Date(),
    updatedAt: new Date(),
    deletedAt: undefined,
    createdBy: undefined,
    updatedBy: undefined,
    deletedBy: undefined,
    calendars: [],
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

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AccountsService,
        {
          provide: getRepositoryToken(Account),
          useValue: mockRepository,
        },
      ],
    }).compile();

    service = module.get<AccountsService>(AccountsService);
    repository = module.get<Repository<Account>>(getRepositoryToken(Account));
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('findAllBy', () => {
    it('should return accounts matching the where clause', async () => {
      const where = { userId: mockAccount.userId };
      mockRepository.find.mockResolvedValue([mockAccount]);

      const result = await service.findAllBy(where);

      expect(mockRepository.find).toHaveBeenCalledWith({
        where,
        relations: undefined,
      });
      expect(result).toEqual([mockAccount]);
    });

    it('should return accounts with relations', async () => {
      const where = { userId: mockAccount.userId };
      const relations = { user: true };
      mockRepository.find.mockResolvedValue([mockAccount]);

      const result = await service.findAllBy(where, relations);

      expect(mockRepository.find).toHaveBeenCalledWith({ where, relations });
      expect(result).toEqual([mockAccount]);
    });
  });

  describe('findOne', () => {
    it('should return an account by id', async () => {
      mockRepository.findOne.mockResolvedValue(mockAccount);

      const result = await service.findOne(mockAccount.id);

      expect(mockRepository.findOne).toHaveBeenCalledWith({
        where: { id: mockAccount.id },
        relations: undefined,
      });
      expect(result).toEqual(mockAccount);
    });

    it('should return an account with relations', async () => {
      const relations = { user: true };
      mockRepository.findOne.mockResolvedValue(mockAccount);

      const result = await service.findOne(mockAccount.id, relations);

      expect(mockRepository.findOne).toHaveBeenCalledWith({
        where: { id: mockAccount.id },
        relations,
      });
      expect(result).toEqual(mockAccount);
    });

    it('should return null when account not found', async () => {
      mockRepository.findOne.mockResolvedValue(null);

      const result = await service.findOne('non-existent-id');

      expect(result).toBeNull();
    });
  });

  describe('findOneBy', () => {
    it('should return an account by custom where clause', async () => {
      const where = {
        userId: mockAccount.userId,
        providerId: AccountProvider.CREDENTIALS,
      };
      mockRepository.findOne.mockResolvedValue(mockAccount);

      const result = await service.findOneBy(where);

      expect(mockRepository.findOne).toHaveBeenCalledWith({
        where,
        relations: undefined,
      });
      expect(result).toEqual(mockAccount);
    });

    it('should return null when account not found', async () => {
      const where = { userId: 'non-existent-id' };
      mockRepository.findOne.mockResolvedValue(null);

      const result = await service.findOneBy(where);

      expect(result).toBeNull();
    });
  });

  describe('create', () => {
    it('should create a new account', async () => {
      const createAccountDto: CreateAccountDto = {
        userId: mockAccount.userId,
        accountId: mockAccount.accountId,
        providerId: mockAccount.providerId,
        accessToken: mockAccount.accessToken,
        refreshToken: mockAccount.refreshToken,
      };

      mockRepository.create.mockReturnValue(mockAccount);
      mockRepository.save.mockResolvedValue(mockAccount);

      const result = await service.create(createAccountDto);

      expect(mockRepository.create).toHaveBeenCalledWith(createAccountDto);
      expect(mockRepository.save).toHaveBeenCalledWith(mockAccount);
      expect(result).toEqual(mockAccount);
    });
  });

  describe('update', () => {
    it('should update an account', async () => {
      const updateAccountDto: UpdateAccountDto = {
        accessToken: 'updated-access-token',
      };

      mockRepository.update.mockResolvedValue({ affected: 1 });
      mockRepository.findOne.mockResolvedValue({
        ...mockAccount,
        ...updateAccountDto,
      });

      const result = await service.update(mockAccount.id, updateAccountDto);

      expect(mockRepository.update).toHaveBeenCalledWith(
        mockAccount.id,
        updateAccountDto,
      );
      expect(result).toEqual({ ...mockAccount, ...updateAccountDto });
    });

    it('should throw NotFoundException when account not found', async () => {
      const updateAccountDto: UpdateAccountDto = {
        accessToken: 'updated-access-token',
      };

      mockRepository.update.mockResolvedValue({ affected: 0 });

      await expect(
        service.update('non-existent-id', updateAccountDto),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('remove', () => {
    it('should soft delete an account', async () => {
      mockRepository.findOne.mockResolvedValue(mockAccount);
      mockRepository.softDelete.mockResolvedValue({ affected: 1 });

      const result = await service.remove(mockAccount.id);

      expect(mockRepository.findOne).toHaveBeenCalled();
      expect(mockRepository.softDelete).toHaveBeenCalledWith(mockAccount.id);
      expect(result).toEqual(mockAccount);
    });

    it('should throw NotFoundException when account not found', async () => {
      mockRepository.findOne.mockResolvedValue(null);

      await expect(service.remove('non-existent-id')).rejects.toThrow(
        NotFoundException,
      );
    });
  });
});
