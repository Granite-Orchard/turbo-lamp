import { Test, TestingModule } from '@nestjs/testing';
import { MeetingsController } from './meetings.controller';
import { MeetingsService } from './meetings.service';
import { JwtAuthGuard } from '../../guards/jwt-auth.guard';
import { IdempotencyInterceptor } from '../../interceptors/idempotency.interceptor';

describe('MeetingsController', () => {
  let controller: MeetingsController;
  let service: MeetingsService;

  const mockMeetingsService = {
    findAllBy: jest.fn().mockResolvedValue([{ id: '1', title: 'Meeting 1' }]),
    findOneBy: jest.fn().mockResolvedValue({ id: '1', title: 'Meeting 1' }),
    create: jest.fn().mockResolvedValue({ id: 'new', title: 'New Meeting' }),
    update: jest.fn().mockResolvedValue({ id: '1', title: 'Updated' }),
    remove: jest.fn().mockResolvedValue({ id: '1' }),
  };

  const mockJwtAuthGuard = {
    canActivate: jest.fn().mockReturnValue(true),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [MeetingsController],
      providers: [{ provide: MeetingsService, useValue: mockMeetingsService }],
    })
      .overrideGuard(JwtAuthGuard)
      .useValue(mockJwtAuthGuard)
      .overrideInterceptor(IdempotencyInterceptor)
      .useValue({ intercept: jest.fn().mockReturnValue({}) })
      .compile();

    controller = module.get<MeetingsController>(MeetingsController);
    service = module.get<MeetingsService>(MeetingsService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('findAll', () => {
    it('should return meetings array', async () => {
      const req = { user: { userId: 'user-123' } } as any;
      const result = await controller.findAll(req);
      expect(result).toHaveLength(1);
    });
  });

  describe('findOne', () => {
    it('should return single meeting', async () => {
      const req = { user: { userId: 'user-123' } } as any;
      const result = await controller.findOne(req, '1');
      expect(result).toHaveProperty('id');
    });
  });

  describe('create', () => {
    it('should create meeting', async () => {
      const req = { user: { userId: 'user-123' } } as any;
      const dto = { title: 'New Meeting' };
      const result = await controller.create(req, dto);
      expect(result).toHaveProperty('id');
    });
  });

  describe('update', () => {
    it('should update meeting', async () => {
      const req = { user: { userId: 'user-123' } } as any;
      const result = await controller.update(req, '1', { title: 'Updated' });
      expect(result).toHaveProperty('id');
    });
  });

  describe('remove', () => {
    it('should delete meeting', async () => {
      const req = { user: { userId: 'user-123' } } as any;
      const result = await controller.remove(req, '1');
      expect(result).toHaveProperty('id');
    });
  });
});
