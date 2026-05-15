import { Test, TestingModule } from '@nestjs/testing';
import { OAuthRegisterInitiationGuard } from './oauth-register-initiation.guard';
import { TokenService } from '../modules/auth/token.service';
import { VerificationsService } from '../modules/verifications/verifications.service';

describe('OAuthRegisterInitiationGuard', () => {
  let guard: OAuthRegisterInitiationGuard;

  const mockTokenService = {
    verify: jest.fn(),
  };

  const mockVerificationsService = {
    findOneBy: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        OAuthRegisterInitiationGuard,
        { provide: TokenService, useValue: mockTokenService },
        { provide: VerificationsService, useValue: mockVerificationsService },
      ],
    }).compile();

    guard = module.get<OAuthRegisterInitiationGuard>(
      OAuthRegisterInitiationGuard,
    );
  });

  it('should be defined', () => {
    expect(guard).toBeDefined();
  });
});
