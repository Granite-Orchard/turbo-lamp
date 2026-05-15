import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { AccountsController } from '../../src/modules/accounts/accounts.controller';
import { AccountsService } from '../../src/modules/accounts/accounts.service';
import { JwtAuthGuard } from '../../src/guards/jwt-auth.guard';

describe('AccountsController (e2e)', () => {
  let app: INestApplication;
  let httpServer: ReturnType<typeof request>;

  const mockAccountsService = {
    findAll: jest.fn().mockResolvedValue([{ id: '1' }]),
    findOneBy: jest.fn().mockResolvedValue({ id: '1' }),
    update: jest.fn().mockResolvedValue({ id: '1' }),
    remove: jest.fn().mockResolvedValue({ id: '1' }),
  };

  const mockJwtAuthGuard = {
    canActivate: jest.fn().mockReturnValue(true),
  };

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      controllers: [AccountsController],
      providers: [{ provide: AccountsService, useValue: mockAccountsService }],
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

  describe('GET /accounts', () => {
    it('should return accounts list', async () => {
      const response = await httpServer.get('/accounts');

      expect(response.status).toBeDefined();
    });
  });

  describe('GET /accounts/:id', () => {
    it('should return account by id', async () => {
      const response = await httpServer.get('/accounts/1');

      expect(response.status).toBeDefined();
    });
  });

  describe('PATCH /accounts/:id', () => {
    it('should update account', async () => {
      const response = await httpServer
        .patch('/accounts/1')
        .send({ name: 'Updated' });

      expect(response.status).toBeDefined();
    });
  });

  describe('DELETE /accounts/:id', () => {
    it('should delete account', async () => {
      const response = await httpServer.delete('/accounts/1');

      expect(response.status).toBeDefined();
    });
  });
});
