import { ExecutionContext } from '@nestjs/common';
import { UseCacheInterceptor } from './cache.interceptor';

describe('UseCacheInterceptor', () => {
  let interceptor: UseCacheInterceptor;

  beforeEach(() => {
    interceptor = new UseCacheInterceptor();
  });

  it('should be defined', () => {
    expect(interceptor).toBeDefined();
  });

  it('should track by user and url', () => {
    const mockContext = {
      switchToHttp: () => ({
        getRequest: () => ({
          user: { id: 'user-123' },
          url: '/api/users',
          method: 'GET',
        }),
      }),
    } as unknown as ExecutionContext;

    const result = interceptor.trackBy(mockContext);
    expect(result).toBe('user-123:GET:/api/users');
  });

  it('should track by url when no user', () => {
    const mockContext = {
      switchToHttp: () => ({
        getRequest: () => ({
          user: undefined,
          url: '/api/users',
          method: 'GET',
        }),
      }),
    } as unknown as ExecutionContext;

    const result = interceptor.trackBy(mockContext);
    expect(result).toBe('/api/users');
  });
});