import { ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { OAuthGuard } from './oauth-auth.guard';

describe('OAuthGuard', () => {
  let guard: OAuthGuard;

  beforeEach(() => {
    guard = new OAuthGuard();
  });

  it('should be defined', () => {
    expect(guard).toBeDefined();
  });

  it('should throw UnauthorizedException for invalid provider', async () => {
    const mockContext = {
      switchToHttp: () => ({
        getRequest: () => ({
          params: { provider: 'invalid-provider' },
        }),
      }),
    } as unknown as ExecutionContext;

    await expect(guard.canActivate(mockContext)).rejects.toThrow(
      UnauthorizedException,
    );
  });
});
