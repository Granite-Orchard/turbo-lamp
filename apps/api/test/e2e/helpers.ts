import * as request from 'supertest';
import { DataSource } from 'typeorm';
import { NestFactory } from '@nestjs/core';
import { AppModule } from '../../src/app.module';

jest.setTimeout(60000);

export interface TestApp {
  app: any;
  httpServer: any;
  dataSource: DataSource;
}

export async function bootstrapTestApp(): Promise<TestApp> {
  process.env.DATABASE_URL = 'postgresql://postgres:postgres@127.0.0.1:5432/core';
  process.env.REDIS_CACHE_URL = 'redis://default@127.0.0.1:6379/0';
  process.env.REDIS_QUEUE_URL = 'redis://default@127.0.0.1:6379/1';
  process.env.REDIS_THROTTLE_URL = 'redis://default@127.0.0.1:6379/2';
  
  const app = await NestFactory.create(AppModule, {
    logger: false,
  });

  const httpServer = app.getHttpServer();
  
  const dataSource = app.get<DataSource>('DataSource');

  return { app, httpServer, dataSource };
}

export async function cleanupTestApp(testApp: TestApp): Promise<void> {
  if (testApp.app) {
    await testApp.app.close();
  }
  if (testApp.dataSource && testApp.dataSource.isInitialized) {
    await testApp.dataSource.destroy();
  }
}

export const createUserPayload = {
  username: `test-${Date.now()}@example.com`,
  password: 'SecurePass123!',
  confirmPassword: 'SecurePass123!',
  timezone: 'America/New_York',
};