import { Test, TestingModule } from '@nestjs/testing';
import {
  INestApplication,
  Controller,
  Get,
  UseInterceptors,
} from '@nestjs/common';
import request from 'supertest';
import cookieParser from 'cookie-parser';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { TokenRefreshInterceptor } from '../../src/interceptors/token-refresh.interceptor';
import { TokenService } from '../../src/modules/auth/token.service';
import { CookieService } from '../../src/modules/auth/cookie.service';
import { SessionsService } from '../../src/modules/sessions/sessions.service';

@Controller('test')
class TestController {
  @Get('protected')
  @UseInterceptors(TokenRefreshInterceptor)
  protectedEndpoint() {
    return { data: 'ok' };
  }

  @Get('public')
  publicEndpoint() {
    return { data: 'ok' };
  }
}

describe('TokenRefreshInterceptor (e2e)', () => {
  let app: INestApplication;
  let httpServer: ReturnType<typeof request>;

  const mockToken = 'mock-jwt-token';
  const mockNewToken = 'mock-new-jwt-token';
  const mockUserId = '123e4567-e89b-12d3-a456-426614174000';
  const mockUserEmail = 'test@example.com';

  const mockJwtService = {
    decode: jest.fn(),
  };

  const mockTokenService = {
    sign: jest.fn().mockReturnValue(mockNewToken),
  };

  const mockCookieService = {
    attachCookie: jest.fn(),
  };

  const mockSessionService = {
    findOneBy: jest
      .fn()
      .mockResolvedValue({ id: 'session-id', token: mockToken }),
    update: jest.fn().mockResolvedValue({}),
  };

  const mockConfigService = {
    get: jest.fn().mockReturnValue(3600),
  };

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      controllers: [TestController],
      providers: [
        { provide: JwtService, useValue: mockJwtService },
        { provide: TokenService, useValue: mockTokenService },
        { provide: CookieService, useValue: mockCookieService },
        { provide: SessionsService, useValue: mockSessionService },
        { provide: ConfigService, useValue: mockConfigService },
      ],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.use(cookieParser());
    await app.init();

    httpServer = request(app.getHttpServer());
  });

  beforeEach(() => {
    jest.clearAllMocks();
    mockConfigService.get.mockReturnValue(3600);
    mockTokenService.sign.mockReturnValue(mockNewToken);
    mockSessionService.findOneBy.mockResolvedValue({
      id: 'session-id',
      token: mockToken,
    });
    mockSessionService.update.mockResolvedValue({});
  });

  afterAll(async () => {
    if (app) {
      await app.close();
    }
  });

  describe('GET /test/protected', () => {
    it('should return 200 and not refresh when token has more than 15 minutes remaining', async () => {
      const futureExp = Math.floor(Date.now() / 1000) + 3600;
      mockJwtService.decode.mockReturnValue({
        sub: mockUserId,
        username: mockUserEmail,
        provider: 'credentials',
        exp: futureExp,
      });

      const response = await httpServer
        .get('/test/protected')
        .set('Authorization', `Bearer ${mockToken}`);

      expect(response.status).toBe(200);
      expect(response.body).toEqual({ data: 'ok' });
      expect(mockTokenService.sign).not.toHaveBeenCalled();
      expect(mockCookieService.attachCookie).not.toHaveBeenCalled();
      expect(mockSessionService.update).not.toHaveBeenCalled();
    });

    it('should return 200 and set new cookie when token is near expiry', async () => {
      const nearExpiry = Math.floor(Date.now() / 1000) + 600;
      mockJwtService.decode.mockReturnValue({
        sub: mockUserId,
        username: mockUserEmail,
        provider: 'credentials',
        exp: nearExpiry,
      });

      const response = await httpServer
        .get('/test/protected')
        .set('Authorization', `Bearer ${mockToken}`);

      expect(response.status).toBe(200);
      expect(mockTokenService.sign).toHaveBeenCalledWith(
        {
          sub: mockUserId,
          username: mockUserEmail,
          provider: 'credentials',
        },
        { expiresIn: 3600000 },
      );
      expect(mockCookieService.attachCookie).toHaveBeenCalled();
      expect(mockSessionService.findOneBy).toHaveBeenCalledWith({
        token: mockToken,
      });
      expect(mockSessionService.update).toHaveBeenCalledWith('session-id', {
        token: mockNewToken,
        expiresAt: expect.any(Date),
      });
    });

    it('should return 200 and not refresh when no token is provided', async () => {
      const response = await httpServer.get('/test/protected');

      expect(response.status).toBe(200);
      expect(mockJwtService.decode).not.toHaveBeenCalled();
      expect(mockTokenService.sign).not.toHaveBeenCalled();
    });

    it('should extract token from cookie when no Authorization header', async () => {
      const nearExpiry = Math.floor(Date.now() / 1000) + 600;
      mockJwtService.decode.mockReturnValue({
        sub: mockUserId,
        username: mockUserEmail,
        provider: 'credentials',
        exp: nearExpiry,
      });

      const response = await httpServer
        .get('/test/protected')
        .set('Cookie', `session=${mockToken}`);

      expect(response.status).toBe(200);
      expect(mockJwtService.decode).toHaveBeenCalledWith(mockToken);
      expect(mockTokenService.sign).toHaveBeenCalled();
    });
  });

  describe('GET /test/public', () => {
    it('should return 200 without interceptor', async () => {
      const response = await httpServer.get('/test/public');

      expect(response.status).toBe(200);
      expect(response.body).toEqual({ data: 'ok' });
      expect(mockJwtService.decode).not.toHaveBeenCalled();
    });
  });
});
