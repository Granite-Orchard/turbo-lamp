import { Test, TestingModule } from '@nestjs/testing';
import { AvailabilitiesController } from './availabilities.controller';
import { AvailabilitiesService } from './availabilities.service';
import { JwtAuthGuard } from '../../guards/jwt-auth.guard';

describe('AvailabilitiesController', () => {
  let controller: AvailabilitiesController;

  const mockAvailabilitiesService = {
    findAllBy: jest.fn().mockResolvedValue([]),
    create: jest.fn().mockResolvedValue({ id: 'avail-1' }),
    update: jest.fn().mockResolvedValue({ id: 'avail-1' }),
    remove: jest.fn().mockResolvedValue({ id: 'avail-1' }),
  };

  const mockJwtAuthGuard = {
    canActivate: jest.fn().mockReturnValue(true),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AvailabilitiesController],
      providers: [
        { provide: AvailabilitiesService, useValue: mockAvailabilitiesService },
      ],
    })
      .overrideGuard(JwtAuthGuard)
      .useValue(mockJwtAuthGuard)
      .compile();

    controller = module.get<AvailabilitiesController>(AvailabilitiesController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('findAll', () => {
    it('should return availabilities', async () => {
      const req = { user: { userId: 'user-123' } } as any;
      const result = await controller.findAll(req);
      expect(result).toEqual([]);
    });
  });

  describe('create', () => {
    it('should create availability', async () => {
      const req = { user: { userId: 'user-123' } } as any;
      const result = await controller.create(req, {} as any);
      expect(result).toHaveProperty('id');
    });
  });
});