import {
  ClassSerializerInterceptor,
  ValidationPipe,
  VersioningType,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NestFactory, Reflector } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import 'class-transformer';
import 'class-validator';
import compression from 'compression';
import cookieParser from 'cookie-parser';
import helmet from 'helmet';
import { AppModule } from './app.module';
import { EnvironmentVariables } from './libs/constants';
import { GlobalExceptionFilter } from './filters/global-exception.filter';
import { json, urlencoded } from 'express';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  const configService = app.get<ConfigService>(ConfigService);
  app.enableVersioning({
    type: VersioningType.URI,
  });
  app.setGlobalPrefix('api/core');
  app.useGlobalInterceptors(
    new ClassSerializerInterceptor(app.get(Reflector), {
      strategy: 'excludeAll',
    }),
  );
  app.use(compression());
  app.use(helmet());
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );
  app.useGlobalFilters(new GlobalExceptionFilter());

  app.use(json({ limit: '100kb' }));
  app.use(urlencoded({ extended: true, limit: '100kb' }));

  const origin = configService.get<string>(
    EnvironmentVariables.ALLOWED_ORIGINS,
  );
  if (!origin) {
    throw new Error('ALLOWED_ORIGINS environment variable is required');
  }
  app.enableCors({
    origin: origin.split(',').map((o) => o.trim()),
    credentials: true,
  });
  app.set('trust proxy', true);
  app.use(cookieParser());

  if (process.env.NODE_ENV !== 'production') {
    const config = new DocumentBuilder()
      .setTitle('Core API')
      .setDescription('The Core API.')
      .setVersion('1.0')
      .addTag('core')
      .addBearerAuth()
      .build();
    const documentFactory = () => SwaggerModule.createDocument(app, config);
    SwaggerModule.setup('api', app, documentFactory);
  }

  await app.listen(process.env.PORT ?? 3001);
}
void bootstrap();
