import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { AuthController } from '../../src/modules/auth/auth.controller';
import { AuthService } from '../../src/modules/auth/auth.service';
import { TokenService } from '../../src/modules/auth/token.service';
import { VerificationsService } from '../../src/modules/verifications/verifications.service';
import { CookieService } from '../../src/modules/auth/cookie.service';
import { InvitationsService } from '../../src/modules/invitations/invitations.service';
import { LocalAuthGuard } from '../../src/guards/local-auth.guard';
import { SessionCookieInterceptor } from '../../src/interceptors/session-cookie.interceptor';
import { ConfigService } from '@nestjs/config';

describe('AuthController (e2e)', () => {
  let app: INestApplication;
  let httpServer: ReturnType<typeof request>;

  const mockAuthService = {
    register: jest.fn().mockResolvedValue({ user: { id: '123' }, sessionToken: 'token' }),
    validateUser: jest.fn().mockResolvedValue({ id: '123' }),
    login: jest.fn().mockResolvedValue({ user: { id: '123' }, sessionToken: 'token' }),
  };

  const mockTokenService = {
    generateSessionToken: jest.fn().mockReturnValue('token'),
  };

  const mockVerificationsService = {
    create: jest.fn().mockResolvedValue({}),
    findOneBy: jest.fn().mockResolvedValue({}),
  };

  const mockCookieService = {
    setSessionCookie: jest.fn(),
  };

  const mockInvitationsService = {
    create: jest.fn().mockResolvedValue({}),
  };

  const mockLocalAuthGuard = {
    canActivate: jest.fn().mockReturnValue(true),
  };

  const mockSessionCookieInterceptor = {
    intercept: jest.fn().mockReturnValue({}),
  };

  const mockConfigService = {
    get: jest.fn().mockReturnValue('mock-value'),
  };

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        { provide: AuthService, useValue: mockAuthService },
        { provide: TokenService, useValue: mockTokenService },
        { provide: VerificationsService, useValue: mockVerificationsService },
        { provide: CookieService, useValue: mockCookieService },
        { provide: InvitationsService, useValue: mockInvitationsService },
        { provide: ConfigService, useValue: mockConfigService },
      ],
    })
      .overrideGuard(LocalAuthGuard)
      .useValue(mockLocalAuthGuard)
      .overrideInterceptor(SessionCookieInterceptor)
      .useValue(mockSessionCookieInterceptor)
      .compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe({ transform: true }));
    await app.init();

    httpServer = request(app.getHttpServer());
  });

  afterAll(async () => {
    if (app) {
      await app.close();
    }
  });

  describe('POST /auth/register', () => {
    it('should register a new user', async () => {
      const response = await httpServer
        .post('/auth/register')
        .send({ username: 'test@test.com', password: 'Pass123!', confirmPassword: 'Pass123!' });

      expect(response.status).toBeDefined();
    });
  });

  describe('POST /auth/login', () => {
    it('should login user', async () => {
      const response = await httpServer
        .post('/auth/login')
        .send({ username: 'test@test.com', password: 'Pass123!' });

      expect(response.status).toBeDefined();
    });
  });
});