import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { TokenService } from './token.service';
import { CookieService } from './cookie.service';
import { VerificationsService } from '../verifications/verifications.service';
import { InvitationsService } from '../invitations/invitations.service';
import { SessionCookieInterceptor } from '../../interceptors/session-cookie.interceptor';
import { ConfigService } from '@nestjs/config';
import { RegisterDto } from './dto/register.dto';

describe('AuthController', () => {
  let controller: AuthController;

  const mockAuthService = {
    register: jest.fn().mockResolvedValue({
      user: { id: '123', name: 'Test User' },
      sessionToken: 'token-123',
    }),
    validateUser: jest.fn().mockResolvedValue({ id: '123' }),
  };

  const mockTokenService = {
    generateSessionToken: jest.fn().mockReturnValue('token'),
  };

  const mockCookieService = {
    setSessionCookie: jest.fn(),
  };

  const mockConfigService = {
    get: jest.fn().mockReturnValue('mock-value'),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        { provide: AuthService, useValue: mockAuthService },
        { provide: TokenService, useValue: mockTokenService },
        { provide: CookieService, useValue: mockCookieService },
        { provide: VerificationsService, useValue: {} },
        { provide: InvitationsService, useValue: {} },
        { provide: ConfigService, useValue: mockConfigService },
      ],
    })
      .overrideInterceptor(SessionCookieInterceptor)
      .useValue({ intercept: jest.fn().mockReturnValue({}) })
      .compile();

    controller = module.get<AuthController>(AuthController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('register', () => {
    it('should register user', async () => {
      const result = await controller.register(
        { headers: {}, ip: '127.0.0.1' } as any,
        '127.0.0.1',
        {
          username: 'test@test.com',
          password: 'Pass123!',
          confirmPassword: 'Pass123!',
        } as RegisterDto,
      );
      expect(result).toHaveProperty('token');
    });
  });
});

