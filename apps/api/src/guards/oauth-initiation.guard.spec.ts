import { Test, TestingModule } from '@nestjs/testing';
import { OAuthInitiationGuard } from './oauth-initiation.guard';
import { TokenService } from '../modules/auth/token.service';
import { VerificationsService } from '../modules/verifications/verifications.service';

describe('OAuthInitiationGuard', () => {
  let guard: OAuthInitiationGuard;

  const mockTokenService = {
    verify: jest.fn(),
  };

  const mockVerificationsService = {
    findOneBy: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        OAuthInitiationGuard,
        { provide: TokenService, useValue: mockTokenService },
        { provide: VerificationsService, useValue: mockVerificationsService },
      ],
    }).compile();

    guard = module.get<OAuthInitiationGuard>(OAuthInitiationGuard);
  });

  it('should be defined', () => {
    expect(guard).toBeDefined();
  });
});