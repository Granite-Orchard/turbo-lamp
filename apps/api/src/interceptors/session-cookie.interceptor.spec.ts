import { ExecutionContext, CallHandler } from '@nestjs/common';
import { of } from 'rxjs';
import { SessionCookieInterceptor } from './session-cookie.interceptor';
import { CookieService } from '../modules/auth/cookie.service';
import { CookieKey } from '../libs/constants';

describe('SessionCookieInterceptor', () => {
  let interceptor: SessionCookieInterceptor;
  let mockCookieService: jest.Mocked<Pick<CookieService, 'attachCookie'>>;
  let mockResponse: { cookie: jest.Mock };

  beforeEach(() => {
    mockResponse = { cookie: jest.fn() };
    mockCookieService = { attachCookie: jest.fn() };
    interceptor = new SessionCookieInterceptor(mockCookieService as unknown as CookieService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(interceptor).toBeDefined();
  });

  it('should attach cookie when data has token', (done) => {
    const mockContext = {
      switchToHttp: () => ({
        getResponse: () => mockResponse,
      }),
    } as ExecutionContext;

    const token = 'test-token';
    const mockCallHandler = {
      handle: () => of({ token }),
    } as CallHandler;

    interceptor.intercept(mockContext, mockCallHandler).subscribe({
      complete: () => {
        expect(mockCookieService.attachCookie).toHaveBeenCalledWith(
          mockResponse,
          CookieKey.SESSION,
          token,
        );
        done();
      },
    });
  });

  it('should not attach cookie when data has no token', (done) => {
    const mockContext = {
      switchToHttp: () => ({
        getResponse: () => mockResponse,
      }),
    } as ExecutionContext;

    const mockCallHandler = {
      handle: () => of({}),
    } as CallHandler;

    interceptor.intercept(mockContext, mockCallHandler).subscribe({
      complete: () => {
        expect(mockCookieService.attachCookie).not.toHaveBeenCalled();
        done();
      },
    });
  });
});
