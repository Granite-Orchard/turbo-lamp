import { ExecutionContext, CallHandler } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { of } from 'rxjs';
import { TokenRefreshInterceptor } from './token-refresh.interceptor';
import { CookieService } from '../modules/auth/cookie.service';
import { TokenService } from '../modules/auth/token.service';
import { SessionsService } from '../modules/sessions/sessions.service';
import { CookieKey } from '../libs/constants';

describe('TokenRefreshInterceptor', () => {
  let interceptor: TokenRefreshInterceptor;
  let mockJwtService: jest.Mocked<Pick<JwtService, 'decode'>>;
  let mockTokenService: jest.Mocked<Pick<TokenService, 'sign'>>;
  let mockCookieService: jest.Mocked<Pick<CookieService, 'attachCookie'>>;
  let mockSessionService: jest.Mocked<
    Pick<SessionsService, 'findOneBy' | 'update'>
  >;
  let mockConfigService: jest.Mocked<Pick<ConfigService, 'get'>>;
  let mockResponse: { cookie: jest.Mock };

  const mockToken = 'mock-jwt-token';
  const mockNewToken = 'mock-new-jwt-token';
  const mockUserId = '123e4567-e89b-12d3-a456-426614174000';
  const mockUserEmail = 'test@example.com';

  beforeEach(() => {
    mockResponse = { cookie: jest.fn() };
    mockJwtService = { decode: jest.fn() };
    mockTokenService = { sign: jest.fn() };
    mockCookieService = { attachCookie: jest.fn() };
    mockSessionService = { findOneBy: jest.fn(), update: jest.fn() };
    mockConfigService = { get: jest.fn() };

    mockConfigService.get.mockReturnValue(3600);
    mockTokenService.sign.mockReturnValue(mockNewToken);
    mockSessionService.findOneBy.mockResolvedValue({
      id: 'session-id',
      token: mockToken,
    } as any);
    mockSessionService.update.mockResolvedValue({} as any);

    interceptor = new TokenRefreshInterceptor(
      mockJwtService as unknown as JwtService,
      mockTokenService as unknown as TokenService,
      mockCookieService as unknown as CookieService,
      mockSessionService as unknown as SessionsService,
      mockConfigService as unknown as ConfigService,
    );
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(interceptor).toBeDefined();
  });

  it('should not refresh when token has more than 15 minutes remaining', (done) => {
    const futureExp = Math.floor(Date.now() / 1000) + 3600;
    mockJwtService.decode.mockReturnValue({
      sub: mockUserId,
      username: mockUserEmail,
      provider: 'credentials',
      exp: futureExp,
    });

    const mockContext = {
      switchToHttp: () => ({
        getRequest: () => ({
          headers: { authorization: `Bearer ${mockToken}` },
          cookies: {},
        }),
        getResponse: () => mockResponse,
      }),
    } as ExecutionContext;

    const mockCallHandler = {
      handle: () => of({ data: 'test' }),
    } as CallHandler;

    interceptor.intercept(mockContext, mockCallHandler).subscribe({
      complete: () => {
        setTimeout(() => {
          expect(mockTokenService.sign).not.toHaveBeenCalled();
          expect(mockCookieService.attachCookie).not.toHaveBeenCalled();
          expect(mockSessionService.update).not.toHaveBeenCalled();
          done();
        }, 0);
      },
    });
  });

  it('should refresh when token has less than 15 minutes remaining', (done) => {
    const nearExpiry = Math.floor(Date.now() / 1000) + 600;
    mockJwtService.decode.mockReturnValue({
      sub: mockUserId,
      username: mockUserEmail,
      provider: 'credentials',
      exp: nearExpiry,
    });

    const mockContext = {
      switchToHttp: () => ({
        getRequest: () => ({
          headers: { authorization: `Bearer ${mockToken}` },
          cookies: {},
        }),
        getResponse: () => mockResponse,
      }),
    } as ExecutionContext;

    const mockCallHandler = {
      handle: () => of({ data: 'test' }),
    } as CallHandler;

    interceptor.intercept(mockContext, mockCallHandler).subscribe({
      complete: () => {
        setTimeout(() => {
          expect(mockTokenService.sign).toHaveBeenCalledWith(
            {
              sub: mockUserId,
              username: mockUserEmail,
              provider: 'credentials',
            },
            { expiresIn: 3600000 },
          );
          expect(mockCookieService.attachCookie).toHaveBeenCalledWith(
            mockResponse,
            CookieKey.SESSION,
            mockNewToken,
          );
          expect(mockSessionService.findOneBy).toHaveBeenCalledWith({
            token: mockToken,
          });
          expect(mockSessionService.update).toHaveBeenCalledWith('session-id', {
            token: mockNewToken,
            expiresAt: expect.any(Date),
          });
          done();
        }, 0);
      },
    });
  });

  it('should not throw when session not found by old token', (done) => {
    const nearExpiry = Math.floor(Date.now() / 1000) + 600;
    mockJwtService.decode.mockReturnValue({
      sub: mockUserId,
      username: mockUserEmail,
      provider: 'credentials',
      exp: nearExpiry,
    });
    mockSessionService.findOneBy.mockResolvedValue(null);

    const mockContext = {
      switchToHttp: () => ({
        getRequest: () => ({
          headers: { authorization: `Bearer ${mockToken}` },
          cookies: {},
        }),
        getResponse: () => mockResponse,
      }),
    } as ExecutionContext;

    const mockCallHandler = {
      handle: () => of({ data: 'test' }),
    } as CallHandler;

    interceptor.intercept(mockContext, mockCallHandler).subscribe({
      complete: () => {
        setTimeout(() => {
          expect(mockCookieService.attachCookie).toHaveBeenCalled();
          expect(mockSessionService.update).not.toHaveBeenCalled();
          done();
        }, 0);
      },
    });
  });

  it('should handle missing token gracefully', (done) => {
    const mockContext = {
      switchToHttp: () => ({
        getRequest: () => ({
          headers: {},
          cookies: {},
        }),
        getResponse: () => mockResponse,
      }),
    } as ExecutionContext;

    const mockCallHandler = {
      handle: () => of({ data: 'test' }),
    } as CallHandler;

    interceptor.intercept(mockContext, mockCallHandler).subscribe({
      complete: () => {
        setTimeout(() => {
          expect(mockJwtService.decode).not.toHaveBeenCalled();
          expect(mockTokenService.sign).not.toHaveBeenCalled();
          done();
        }, 0);
      },
    });
  });

  it('should extract token from cookie when no Authorization header', (done) => {
    const nearExpiry = Math.floor(Date.now() / 1000) + 600;
    mockJwtService.decode.mockReturnValue({
      sub: mockUserId,
      username: mockUserEmail,
      provider: 'credentials',
      exp: nearExpiry,
    });

    const mockContext = {
      switchToHttp: () => ({
        getRequest: () => ({
          headers: {},
          cookies: { session: mockToken },
        }),
        getResponse: () => mockResponse,
      }),
    } as ExecutionContext;

    const mockCallHandler = {
      handle: () => of({ data: 'test' }),
    } as CallHandler;

    interceptor.intercept(mockContext, mockCallHandler).subscribe({
      complete: () => {
        setTimeout(() => {
          expect(mockJwtService.decode).toHaveBeenCalledWith(mockToken);
          expect(mockTokenService.sign).toHaveBeenCalled();
          done();
        }, 0);
      },
    });
  });

  it('should prefer Authorization header over cookie', (done) => {
    const nearExpiry = Math.floor(Date.now() / 1000) + 600;
    mockJwtService.decode.mockReturnValue({
      sub: mockUserId,
      username: mockUserEmail,
      provider: 'credentials',
      exp: nearExpiry,
    });

    const headerToken = 'header-token';
    const mockContext = {
      switchToHttp: () => ({
        getRequest: () => ({
          headers: { authorization: `Bearer ${headerToken}` },
          cookies: { session: mockToken },
        }),
        getResponse: () => mockResponse,
      }),
    } as ExecutionContext;

    const mockCallHandler = {
      handle: () => of({ data: 'test' }),
    } as CallHandler;

    interceptor.intercept(mockContext, mockCallHandler).subscribe({
      complete: () => {
        setTimeout(() => {
          expect(mockJwtService.decode).toHaveBeenCalledWith(headerToken);
          expect(mockSessionService.findOneBy).toHaveBeenCalledWith({
            token: headerToken,
          });
          done();
        }, 0);
      },
    });
  });

  it('should not refresh when decoded token has no exp', (done) => {
    mockJwtService.decode.mockReturnValue({
      sub: mockUserId,
      username: mockUserEmail,
      provider: 'credentials',
    });

    const mockContext = {
      switchToHttp: () => ({
        getRequest: () => ({
          headers: { authorization: `Bearer ${mockToken}` },
          cookies: {},
        }),
        getResponse: () => mockResponse,
      }),
    } as ExecutionContext;

    const mockCallHandler = {
      handle: () => of({ data: 'test' }),
    } as CallHandler;

    interceptor.intercept(mockContext, mockCallHandler).subscribe({
      complete: () => {
        setTimeout(() => {
          expect(mockTokenService.sign).not.toHaveBeenCalled();
          done();
        }, 0);
      },
    });
  });

  it('should handle refresh failure without throwing', (done) => {
    const nearExpiry = Math.floor(Date.now() / 1000) + 600;
    mockJwtService.decode.mockReturnValue({
      sub: mockUserId,
      username: mockUserEmail,
      provider: 'credentials',
      exp: nearExpiry,
    });
    mockSessionService.update.mockRejectedValue(new Error('DB error'));

    const mockContext = {
      switchToHttp: () => ({
        getRequest: () => ({
          headers: { authorization: `Bearer ${mockToken}` },
          cookies: {},
        }),
        getResponse: () => mockResponse,
      }),
    } as ExecutionContext;

    const mockCallHandler = {
      handle: () => of({ data: 'test' }),
    } as CallHandler;

    let errorSpy: jest.SpyInstance;
    errorSpy = jest.spyOn(console, 'warn').mockImplementation(() => {});

    interceptor.intercept(mockContext, mockCallHandler).subscribe({
      complete: () => {
        setTimeout(() => {
          expect(mockCookieService.attachCookie).toHaveBeenCalled();
          errorSpy.mockRestore();
          done();
        }, 0);
      },
    });
  });
});
