import { ExecutionContext, CallHandler } from '@nestjs/common';
import { SessionCookieInterceptor } from './session-cookie.interceptor';

describe('SessionCookieInterceptor', () => {
  let interceptor: SessionCookieInterceptor;

  beforeEach(() => {
    interceptor = new SessionCookieInterceptor({} as any);
  });

  it('should be defined', () => {
    expect(interceptor).toBeDefined();
  });
});
