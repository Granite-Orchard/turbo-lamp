import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { CookieService } from './cookie.service';

describe('CookieService', () => {
  let service: CookieService;
  let mockResponse: { cookie: jest.Func };

  const mockConfigService = {
    get: jest.fn(),
  };

  beforeEach(async () => {
    mockResponse = {
      cookie: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CookieService,
        { provide: ConfigService, useValue: mockConfigService },
      ],
    }).compile();

    service = module.get<CookieService>(CookieService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('attachCookie', () => {
    it('should attach a cookie to the response', () => {
      service.attachCookie(mockResponse, 'session_token', 'abc123');

      expect(mockResponse.cookie).toHaveBeenCalledWith(
        'session_token',
        'abc123',
        expect.objectContaining({
          httpOnly: true,
          sameSite: 'lax',
          secure: false,
          domain: 'localhost',
          path: '/',
        }),
      );
    });

    it('should attach cookie with custom options', () => {
      const customOptions = {
        httpOnly: false,
        secure: true,
        sameSite: 'strict' as const,
        maxAge: 86400000,
      };

      service.attachCookie(mockResponse, 'token', 'value', customOptions);

      expect(mockResponse.cookie).toHaveBeenCalledWith(
        'token',
        'value',
        expect.objectContaining({
          httpOnly: true,
          sameSite: 'lax',
          secure: false,
          domain: 'localhost',
          path: '/',
          maxAge: 86400000,
        }),
      );
    });

    it('should merge custom options with defaults', () => {
      service.attachCookie(mockResponse, 'token', 'value', { maxAge: 3600 });

      expect(mockResponse.cookie).toHaveBeenCalledWith(
        'token',
        'value',
        expect.objectContaining({
          httpOnly: true,
          sameSite: 'lax',
          secure: false,
          domain: 'localhost',
          path: '/',
          maxAge: 3600,
        }),
      );
    });
  });
});
