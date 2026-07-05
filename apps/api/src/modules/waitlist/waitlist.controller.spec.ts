import { Test, TestingModule } from '@nestjs/testing';
import { WaitlistController } from './waitlist.controller';
import { WaitlistService } from './waitlist.service';
import { IdempotencyInterceptor } from '../../interceptors/idempotency.interceptor';

describe('WaitlistController', () => {
  let controller: WaitlistController;
  let service: WaitlistService;

  const mockService = {
    create: jest
      .fn()
      .mockResolvedValue({ id: 'new', title: 'New Waitlist email' }),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [WaitlistController],
      providers: [{ provide: WaitlistService, useValue: mockService }],
    })
      .overrideInterceptor(IdempotencyInterceptor)
      .useValue({ intercept: jest.fn().mockReturnValue({}) })
      .compile();

    controller = module.get<WaitlistController>(WaitlistController);
    service = module.get<WaitlistService>(WaitlistService);

    controller = module.get<WaitlistController>(WaitlistController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
