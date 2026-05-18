import { ConflictException, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Test, TestingModule } from '@nestjs/testing';
import { AccountProvider } from '../../libs/constants';
import { AccountsService } from '../accounts/accounts.service';
import { Account } from '../accounts/entities/account.entity';
import { Session } from '../sessions/entities/session.entity';
import { SessionsService } from '../sessions/sessions.service';
import { UsersService } from '../users/users.service';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { TokenService } from './token.service';
import { User } from '../users/entities/user.entity';
import { DataSource } from 'typeorm';

jest.mock('bcrypt', () => ({
  hash: jest.fn((pwd: string) => `hashed-${pwd}`),
  compare: jest.fn(() => true),
}));

describe('AuthService', () => {
  let service: AuthService;
  let tokenService: TokenService;
  let accountService: AccountsService;
  let userService: UsersService;
  let sessionService: SessionsService;

  const mockTokenService = {
    sign: jest.fn(),
  };

  const mockConfigService = {
    get: jest.fn().mockReturnValue(3600),
  };

  const mockUser: User = {
    id: '123e4567-e89b-12d3-a456-426614174000',
    name: 'Test User',
    email: 'test@example.com',
    emailVerified: true,
    timezone: 'America/New_York',
    accounts: [],
    availabilityOverrides: [],
    availabilities: [],
    calendars: [],
    participations: [],
    sessions: [],
    meetingGroups: [],
    attendances: [],
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockAccount: Account = {
    id: '123e4567-e89b-12d3-a456-426614174001',
    userId: mockUser.id,
    user: mockUser,
    accountId: '123e4567-e89b-12d3-a456-426614174001',
    providerId: AccountProvider.CREDENTIALS,
    password: 'hashed-password123',
    createdAt: new Date(),
    updatedAt: new Date(),
    deletedAt: undefined,
    createdBy: undefined,
    updatedBy: undefined,
    deletedBy: undefined,
    accessToken: undefined,
    refreshToken: undefined,
    accessTokenExpiresAt: undefined,
    refreshTokenExpiresAt: undefined,
    scope: undefined,
    idToken: undefined,
    calendars: [],
  };

  const mockSession: Session = {
    id: '123e4567-e89b-12d3-a456-426614174002',
    userId: mockUser.id,
    user: mockUser,
    token: 'mock-jwt-token',
    expiresAt: new Date(Date.now() + 3600000),
    ipAddress: '127.0.0.1',
    userAgent: 'Mozilla/5.0',
    createdAt: new Date(),
    updatedAt: new Date(),
    deletedAt: undefined,
    createdBy: undefined,
    updatedBy: undefined,
    deletedBy: undefined,
  };

  const mockAccountsService = {
    findOneBy: jest.fn((where) => {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      if (where.user?.email === 'nonexistent@example.com') return null;
      return mockAccount;
    }),
    create: jest.fn(),
  };

  const mockUsersService = {
    create: jest.fn(),
  };

  const mockSessionsService = {
    create: jest.fn(),
  };

  const mockManager = {
    getRepository: jest.fn(() => ({
      save: jest.fn(async (x) => ({
        ...x,
        id: x.id ?? 'generated-user-id',
      })),
    })),
  };

  const mockDataSource = {
    transaction: jest.fn(async (cb) => cb(mockManager)),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: DataSource, useValue: mockDataSource },
        { provide: TokenService, useValue: mockTokenService },
        { provide: ConfigService, useValue: mockConfigService },
        { provide: AccountsService, useValue: mockAccountsService },
        { provide: UsersService, useValue: mockUsersService },
        { provide: SessionsService, useValue: mockSessionsService },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    tokenService = module.get<TokenService>(TokenService);
    accountService = module.get<AccountsService>(AccountsService);
    userService = module.get<UsersService>(UsersService);
    sessionService = module.get<SessionsService>(SessionsService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('validateUser', () => {
    it('should return account when credentials are valid', async () => {
      const result = await service.validateUser(
        'test@example.com',
        AccountProvider.CREDENTIALS,
        'password123',
      );

      expect(mockAccountsService.findOneBy).toHaveBeenCalledWith(
        {
          providerId: AccountProvider.CREDENTIALS,
          user: { email: 'test@example.com' },
        },
        { user: true },
      );
      expect(result).toEqual(mockAccount);
    });

    it('should return account without password check for OAuth', async () => {
      const result = await service.validateUser(
        'test@example.com',
        AccountProvider.GOOGLE,
      );

      expect(mockAccountsService.findOneBy).toHaveBeenCalledWith(
        {
          providerId: AccountProvider.GOOGLE,
          user: { email: 'test@example.com' },
        },
        { user: true },
      );
      expect(result).toEqual(mockAccount);
    });

    it('should return null when account not found', async () => {
      mockAccountsService.findOneBy.mockResolvedValue(null);

      const result = await service.validateUser(
        'nonexistent@example.com',
        AccountProvider.CREDENTIALS,
        'password123',
      );

      expect(result).toBeNull();
    });

    it('should throw UnauthorizedException when password missing for credentials provider', async () => {
      await expect(
        service.validateUser('test@example.com', AccountProvider.CREDENTIALS),
      ).rejects.toThrow(UnauthorizedException);
    });
  });

  describe('register', () => {
    it('should create new user and return session', async () => {
      const registerDto: RegisterDto = {
        username: 'new@example.com',
        password: 'SecurePass123!',
        confirmPassword: 'SecurePass123!',
        timezone: 'America/New_York',
      };

      mockAccountsService.findOneBy.mockResolvedValueOnce(null);
      mockAccount.user = mockUser;
      mockTokenService.sign.mockReturnValue('mock-jwt-token');
      mockSessionsService.create.mockResolvedValue(mockSession);

      const result = await service.register(registerDto);

      expect(result).toEqual(mockSession);
    });

    it('should throw ConflictException when user already exists', async () => {
      const registerDto: RegisterDto = {
        username: 'test@example.com',
        password: 'SecurePass123!',
        confirmPassword: 'SecurePass123!',
        timezone: 'America/New_York',
      };

      mockAccountsService.findOneBy.mockResolvedValue(mockAccount);

      await expect(service.register(registerDto)).rejects.toThrow(
        ConflictException,
      );
    });
  });

  describe('login', () => {
    it('should create session and return it', async () => {
      mockTokenService.sign.mockReturnValue('mock-jwt-token');
      mockSessionsService.create.mockResolvedValue(mockSession);

      const result = await service.login(mockAccount, {
        userAgent: 'Mozilla/5.0',
        ip: '127.0.0.1',
      });

      expect(mockTokenService.sign).toHaveBeenCalled();
      expect(mockSessionsService.create).toHaveBeenCalledWith(
        expect.objectContaining({
          userId: mockAccount.user.id,
          token: 'mock-jwt-token',
        }),
      );
      expect(result).toEqual(mockSession);
    });

    it('should create session without metadata', async () => {
      mockTokenService.sign.mockReturnValue('mock-jwt-token');
      mockSessionsService.create.mockResolvedValue(mockSession);

      const result = await service.login(mockAccount);

      expect(mockSessionsService.create).toHaveBeenCalledWith(
        expect.objectContaining({
          userId: mockAccount.user.id,
          token: 'mock-jwt-token',
          ipAddress: undefined,
          userAgent: undefined,
        }),
      );
      expect(result).toEqual(mockSession);
    });
  });
});
