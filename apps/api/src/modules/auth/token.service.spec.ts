import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { TokenService, TokenSchema } from './token.service';
import { AccountProvider } from '../../libs/constants';

describe('TokenService', () => {
  let service: TokenService;
  let jwtService: JwtService;
  let configService: ConfigService;

  const mockJwtService = {
    sign: jest.fn(),
    verify: jest.fn(),
  };

  const mockConfigService = {
    get: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TokenService,
        {
          provide: JwtService,
          useValue: mockJwtService,
        },
        {
          provide: ConfigService,
          useValue: mockConfigService,
        },
      ],
    }).compile();

    service = module.get<TokenService>(TokenService);
    jwtService = module.get<JwtService>(JwtService);
    configService = module.get<ConfigService>(ConfigService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('randomHash', () => {
    it('should return a random base64url string', () => {
      const result = service.randomHash();

      expect(typeof result).toBe('string');
      expect(result.length).toBeGreaterThan(0);
    });

    it('should return different values on subsequent calls', () => {
      const result1 = service.randomHash();
      const result2 = service.randomHash();

      expect(result1).not.toEqual(result2);
    });
  });

  describe('sign', () => {
    it('should sign a payload and return a token', () => {
      const payload: TokenSchema = {
        sub: '123e4567-e89b-12d3-a456-426614174000',
        username: 'test@example.com',
        provider: AccountProvider.CREDENTIALS,
      };
      const signedToken = 'mock-signed-token';

      mockConfigService.get.mockReturnValue('mock-private-key');
      mockJwtService.sign.mockReturnValue(signedToken);

      const result = service.sign(payload);

      expect(mockConfigService.get).toHaveBeenCalledWith('JWT_PRIVATE');
      expect(mockJwtService.sign).toHaveBeenCalledWith(
        payload,
        expect.any(Object),
      );
      expect(result).toEqual(signedToken);
    });

    it('should sign payload with custom options', () => {
      const payload: TokenSchema = {
        sub: '123e4567-e89b-12d3-a456-426614174000',
        username: 'test@example.com',
        provider: AccountProvider.CREDENTIALS,
      };
      const signedToken = 'mock-signed-token';
      const customOptions = { expiresIn: 3600 };

      mockConfigService.get.mockReturnValue('mock-private-key');
      mockJwtService.sign.mockReturnValue(signedToken);

      const result = service.sign(payload, customOptions);

      expect(mockJwtService.sign).toHaveBeenCalledWith(
        payload,
        expect.objectContaining(customOptions),
      );
      expect(result).toEqual(signedToken);
    });
  });

  describe('verify', () => {
    it('should verify and decode a token', () => {
      const token = 'mock-valid-token';
      const decodedPayload: TokenSchema = {
        sub: '123e4567-e89b-12d3-a456-426614174000',
        username: 'test@example.com',
        provider: AccountProvider.CREDENTIALS,
      };

      mockConfigService.get.mockReturnValue('mock-public-key');
      mockJwtService.verify.mockReturnValue(decodedPayload);

      const result = service.verify<TokenSchema>(token);

      expect(mockConfigService.get).toHaveBeenCalledWith('JWT_PUBLIC');
      expect(mockJwtService.verify).toHaveBeenCalledWith(
        token,
        expect.objectContaining({
          publicKey: 'mock-public-key',
          algorithms: expect.any(Array),
          issuer: expect.any(String),
          audience: expect.any(String),
        }),
      );
      expect(result).toEqual(decodedPayload);
    });

    it('should verify token with custom options', () => {
      const token = 'mock-valid-token';
      const decodedPayload: TokenSchema = {
        sub: '123e4567-e89b-12d3-a456-426614174000',
        username: 'test@example.com',
        provider: AccountProvider.CREDENTIALS,
      };
      const customOptions = { complete: true };

      mockConfigService.get.mockReturnValue('mock-public-key');
      mockJwtService.verify.mockReturnValue(decodedPayload);

      const result = service.verify<TokenSchema>(token, customOptions);

      expect(mockJwtService.verify).toHaveBeenCalledWith(
        token,
        expect.objectContaining(customOptions),
      );
      expect(result).toEqual(decodedPayload);
    });
  });
});
