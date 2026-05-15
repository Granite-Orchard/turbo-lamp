import { Test, TestingModule } from '@nestjs/testing';
import { AccountsController } from './accounts.controller';
import { AccountsService } from './accounts.service';
import { JwtAuthGuard } from '../../guards/jwt-auth.guard';

describe('AccountsController', () => {
  let controller: AccountsController;
  let service: AccountsService;

  const mockAccountsService = {
    findAllBy: jest.fn().mockResolvedValue([]),
    findOneBy: jest.fn().mockResolvedValue({ id: '123', providerId: 'google' }),
    update: jest.fn().mockResolvedValue({ id: '123', providerId: 'google' }),
    remove: jest.fn().mockResolvedValue({ id: '123' }),
  };

  const mockJwtAuthGuard = {
    canActivate: jest.fn().mockReturnValue(true),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AccountsController],
      providers: [{ provide: AccountsService, useValue: mockAccountsService }],
    })
      .overrideGuard(JwtAuthGuard)
      .useValue(mockJwtAuthGuard)
      .compile();

    controller = module.get<AccountsController>(AccountsController);
    service = module.get<AccountsService>(AccountsService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('findAll', () => {
    it('should return accounts array', async () => {
      const req = { user: { id: 'user-123' } } as Request & { user: any };
      const result = await controller.findAll(req);
      expect(result).toEqual([]);
      expect(mockAccountsService.findAllBy).toHaveBeenCalledWith({
        userId: 'user-123',
      });
    });
  });

  describe('findOne', () => {
    it('should return single account', async () => {
      const req = { user: { id: 'user-123' } } as Request & { user: any };
      const result = await controller.findOne(req, 'acc-123');
      expect(result).toEqual({ id: '123', providerId: 'google' });
    });
  });

  describe('update', () => {
    it('should update account', async () => {
      const req = { user: { id: 'user-123' } } as Request & { user: any };
      const dto = { accessToken: 'new-token' };
      const result = await controller.update(req, 'acc-123', dto);
      expect(result).toEqual({ id: '123', providerId: 'google' });
    });
  });

  describe('remove', () => {
    it('should delete account', async () => {
      const req = { user: { id: 'user-123' } } as Request & { user: any };
      const result = await controller.remove(req, 'acc-123');
      expect(result).toEqual({ id: '123' });
    });
  });
});
