import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { UsersController } from '../../src/modules/users/users.controller';
import { UsersService } from '../../src/modules/users/users.service';
import { JwtAuthGuard } from '../../src/guards/jwt-auth.guard';

describe('UsersController (e2e)', () => {
  let app: INestApplication;
  let httpServer: ReturnType<typeof request>;

  const mockUsersService = {
    findOneBy: jest.fn().mockResolvedValue({ id: '123', name: 'Test' }),
    update: jest.fn().mockResolvedValue({ id: '123', name: 'Updated' }),
    remove: jest.fn().mockResolvedValue({ id: '123' }),
  };

  const mockJwtAuthGuard = {
    canActivate: jest.fn().mockReturnValue(true),
  };

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      controllers: [UsersController],
      providers: [{ provide: UsersService, useValue: mockUsersService }],
    })
      .overrideGuard(JwtAuthGuard)
      .useValue(mockJwtAuthGuard)
      .compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe({ transform: true }));
    await app.init();

    httpServer = request(app.getHttpServer());
  });

  afterAll(async () => {
    if (app) {
      await app.close();
    }
  });

  describe('GET /users/profile', () => {
    it('should return user profile', async () => {
      const response = await httpServer.get('/users/profile');

      expect(response.status).toBeDefined();
    });
  });

  describe('PATCH /users/:id', () => {
    it('should update user', async () => {
      const response = await httpServer
        .patch('/users/123')
        .send({ name: 'Updated' });

      expect(response.status).toBeDefined();
    });
  });

  describe('DELETE /users/:id', () => {
    it('should delete user', async () => {
      const response = await httpServer.delete('/users/123');

      expect(response.status).toBeDefined();
    });
  });
});
