import { Test, TestingModule } from '@nestjs/testing';
import { HttpService } from '@nestjs/axios';
import { of } from 'rxjs';
import { GoogleTokenService } from './google-token.service';

describe('GoogleTokenService', () => {
  let service: GoogleTokenService;
  let httpService: HttpService;

  const mockHttpService = {
    post: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        GoogleTokenService,
        { provide: HttpService, useValue: mockHttpService },
      ],
    }).compile();

    service = module.get<GoogleTokenService>(GoogleTokenService);
    httpService = module.get<HttpService>(HttpService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('refreshAccessToken', () => {
    it('should refresh access token and return new token and expiry', async () => {
      const params = {
        clientId: 'mock-client-id',
        clientSecret: 'mock-client-secret',
        refreshToken: 'mock-refresh-token',
      };

      const expectedResponse = {
        data: {
          access_token: 'new-access-token',
          expires_in: 3600,
        },
      };

      mockHttpService.post.mockReturnValue(of(expectedResponse));

      const result = await service.refreshAccessToken(params);

      expect(mockHttpService.post).toHaveBeenCalledWith(
        'https://oauth2.googleapis.com/token',
        null,
        expect.objectContaining({
          params: {
            client_id: params.clientId,
            client_secret: params.clientSecret,
            refresh_token: params.refreshToken,
            grant_type: 'refresh_token',
          },
        }),
      );
      expect(result).toEqual({
        accessToken: 'new-access-token',
        expiresIn: 3600,
      });
    });

    it('should handle different expiry values', async () => {
      const params = {
        clientId: 'mock-client-id',
        clientSecret: 'mock-client-secret',
        refreshToken: 'mock-refresh-token',
      };

      const expectedResponse = {
        data: {
          access_token: 'another-access-token',
          expires_in: 7200,
        },
      };

      mockHttpService.post.mockReturnValue(of(expectedResponse));

      const result = await service.refreshAccessToken(params);

      expect(result.expiresIn).toBe(7200);
    });
  });
});
