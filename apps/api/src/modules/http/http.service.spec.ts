import { firstValueFrom } from 'rxjs';
import { Test, TestingModule } from '@nestjs/testing';
import { HttpService } from '@nestjs/axios';
import { CustomHttpService } from './http.service';
import { of, throwError } from 'rxjs';
import { AxiosRequestHeaders, AxiosResponse } from 'axios';

const mockAxiosResponse = <T>(data: T): AxiosResponse<T> => ({
  data,
  status: 200,
  statusText: 'OK',
  headers: {},
  config: { headers: {} as AxiosRequestHeaders },
});

describe('CustomHttpService', () => {
  let service: CustomHttpService;
  let httpService: HttpService;

  const mockHttpService = {
    get: jest.fn(),
    post: jest.fn(),
    put: jest.fn(),
    patch: jest.fn(),
    delete: jest.fn(),
  };

  beforeEach(async () => {
    jest.clearAllMocks();
    jest.useFakeTimers();
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CustomHttpService,
        {
          provide: HttpService,
          useValue: mockHttpService,
        },
      ],
    }).compile();

    service = module.get(CustomHttpService);
    httpService = module.get(HttpService);
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('get', () => {
    it('should return data on success', async () => {
      mockHttpService.get.mockReturnValue(
        of(mockAxiosResponse({ value: 'UTC' })),
      );

      const result = await firstValueFrom(service.get('/timezone'));

      expect(result.data).toEqual({ value: 'UTC' });
      expect(mockHttpService.get).toHaveBeenCalledTimes(1);
    });

    it('should retry on failure and eventually throw', async () => {
      mockHttpService.get.mockReturnValue(
        throwError(() => new Error('Network error')),
      );

      const promise = firstValueFrom(service.get('/timezone', {}, 2));
      promise.catch(() => {});

      await jest.runAllTimersAsync();

      await expect(promise).rejects.toThrow('Request failed after all retries');
      expect(mockHttpService.get).toHaveBeenCalledTimes(3);
    });

    it('should succeed on the second attempt', async () => {
      mockHttpService.get
        .mockReturnValueOnce(throwError(() => new Error('Flaky')))
        .mockReturnValueOnce(of(mockAxiosResponse({ value: 'UTC' })));

      const promise = firstValueFrom(service.get('/timezone', {}, 1));
      await jest.runAllTimersAsync();

      const result = await promise;
      expect(result.data).toEqual({ value: 'UTC' });
      expect(mockHttpService.get).toHaveBeenCalledTimes(2);
    });
  });
});
