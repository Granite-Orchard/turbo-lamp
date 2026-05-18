import { Test, TestingModule } from '@nestjs/testing';
import { ForbiddenException } from '@nestjs/common';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { JwtAuthGuard } from '../../guards/jwt-auth.guard';

describe('UsersController', () => {
  let controller: UsersController;
  let service: UsersService;

  const mockUsersService = {
    update: jest.fn().mockResolvedValue({ id: '123', name: 'Updated' }),
    remove: jest.fn().mockResolvedValue({ id: '123' }),
  };

  const mockJwtAuthGuard = {
    canActivate: jest.fn().mockReturnValue(true),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UsersController],
      providers: [{ provide: UsersService, useValue: mockUsersService }],
    })
      .overrideGuard(JwtAuthGuard)
      .useValue(mockJwtAuthGuard)
      .compile();

    controller = module.get<UsersController>(UsersController);
    service = module.get<UsersService>(UsersService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('profile', () => {
    it('should return user profile', async () => {
      const req = {
        user: { userId: '123', email: 'test@example.com', name: 'Test' },
      } as any;
      const result = controller.profile(req);
      expect(result).toHaveProperty('userId');
    });
  });

  describe('update', () => {
    it('should update own user', async () => {
      const req = { user: { userId: '123' } } as any;
      const result = await controller.update(req, '123', { name: 'New Name' });
      expect(result).toEqual({ id: '123', name: 'Updated' });
    });

    it('should throw when updating other user', async () => {
      const req = { user: { userId: '123' } } as any;
      await expect(
        controller.update(req, '456', { name: 'Hacker' }),
      ).rejects.toThrow(ForbiddenException);
    });
  });

  describe('remove', () => {
    it('should delete own user', async () => {
      const req = { user: { userId: '123' } } as any;
      const result = await controller.remove(req, '123');
      expect(result).toEqual({ id: '123' });
    });

    it('should throw when deleting other user', async () => {
      const req = { user: { userId: '123' } } as any;
      await expect(controller.remove(req, '456')).rejects.toThrow(
        ForbiddenException,
      );
    });
  });
});
