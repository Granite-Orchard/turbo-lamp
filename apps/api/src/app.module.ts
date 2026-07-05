import KeyvRedis from '@keyv/redis';
import { ThrottlerStorageRedisService } from '@nest-lab/throttler-storage-redis';
import { BullModule } from '@nestjs/bullmq';
import { CacheModule } from '@nestjs/cache-manager';
import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { APP_GUARD, APP_INTERCEPTOR } from '@nestjs/core';
import { CqrsModule } from '@nestjs/cqrs';
import { JwtModule } from '@nestjs/jwt';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SentryModule } from '@sentry/nestjs/setup';
import { CacheableMemory } from 'cacheable';
import Redis from 'ioredis';
import Keyv from 'keyv';
import { UseCacheInterceptor } from './interceptors/cache.interceptor';
import {
  EnvironmentVariables,
  TOKEN_ALGORITHM,
  TOKEN_AUDIENCE,
  TOKEN_ISSUER,
} from './libs/constants';
import { AccountsModule } from './modules/accounts/accounts.module';
import { AuthModule } from './modules/auth/auth.module';
import { AvailabilitiesModule } from './modules/availabilities/availabilities.module';
import { AvailabilityOverridesModule } from './modules/availability-overrides/availability-overrides.module';
import { CalendarsModule } from './modules/calendars/calendars.module';
import { HealthModule } from './modules/health/health.module';
import { CustomHttpModule } from './modules/http/http.module';
import { MeetingAttendeesModule } from './modules/meeting-attendees/meeting-attendees.module';
import { MeetingGroupsModule } from './modules/meeting-groups/meeting-groups.module';
import { MeetingParticipantsModule } from './modules/meeting-participants/meeting-participants.module';
import { MeetingSlotsModule } from './modules/meeting-slots/meeting-slots.module';
import { MeetingsModule } from './modules/meetings/meetings.module';
import { NotificationsModule } from './modules/notifications/notifications.module';
import { SessionsModule } from './modules/sessions/sessions.module';
import { UsersModule } from './modules/users/users.module';
import { VerificationsModule } from './modules/verifications/verifications.module';
import { WaitlistModule } from './modules/waitlist/waitlist.module';
import { WaitlistModule } from './modules/waitlist/waitlist.module';

@Module({
  imports: [
    SentryModule.forRoot(),
    ConfigModule.forRoot({
      cache: true,
      isGlobal: true,
      expandVariables: true,
      ignoreEnvFile: process.env.NODE_ENV === 'production',
      envFilePath: ['.env.local', '.env'],
    }),
    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => {
        const isProduction =
          config.get(EnvironmentVariables.NODE_ENV) === 'production';
        return {
          type: 'postgres',
          url: config.get<string>(
            EnvironmentVariables.DATABASE_URL,
            'postgres://postgres:postgres@postgres:5432/core',
          ),
          synchronize: !isProduction,
          autoLoadEntities: !isProduction,
          entities: [__dirname + '/**/*.entity{.ts,.js}'],
          migrations: [__dirname + '/migrations/{*.ts,.js}'],
          migrationsRun: isProduction,
          retryAttempts: 10,
          retryDelay: 5000,
        };
      },
    }),
    JwtModule.registerAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => {
        const privateKey = config.get<string>(
          EnvironmentVariables.JWT_PRIVATE,
        )!;
        const publicKey = config.get<string>(EnvironmentVariables.JWT_PUBLIC)!;
        return {
          global: true,
          privateKey,
          publicKey,
          signOptions: {
            algorithm: TOKEN_ALGORITHM,
            issuer: TOKEN_ISSUER,
            audience: TOKEN_AUDIENCE,
          },
        };
      },
    }),
    CacheModule.registerAsync({
      isGlobal: true,
      inject: [ConfigService],
      useFactory: (config: ConfigService) => {
        const redisUrl = config.get<string>(
          EnvironmentVariables.REDIS_CACHE_URL,
        );
        if (!redisUrl) throw new Error('REDIS_CACHE_URL missing');
        return {
          stores: [
            new Keyv({
              store: new CacheableMemory({
                ttl: 10_000,
                lruSize: 5_000,
              }),
            }),
            new Keyv({
              store: new KeyvRedis(redisUrl),
              ttl: 10_000,
            }),
          ],
        };
      },
    }),
    ThrottlerModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => {
        const isProduction =
          config.get(EnvironmentVariables.NODE_ENV) === 'production';
        const redisUrl = config.get<string>(
          EnvironmentVariables.REDIS_THROTTLE_URL,
        )!;
        return {
          throttlers: [
            { name: 'short', ttl: 1_000, limit: isProduction ? 10 : 100 },
            { name: 'medium', ttl: 60_000, limit: isProduction ? 100 : 1000 },
            {
              name: 'long',
              ttl: 3_600_000,
              limit: isProduction ? 1000 : 10000,
            },
          ],
          storage: new ThrottlerStorageRedisService(
            new Redis(redisUrl, {
              connectTimeout: 5_000,
              commandTimeout: 2_000,
              maxRetriesPerRequest: 3,
            }),
          ),
        };
      },
    }),
    BullModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => {
        const url = config.get<string>(EnvironmentVariables.REDIS_QUEUE_URL);
        if (!url) throw new Error('REDIS_QUEUE_URL missing');

        return {
          connection: {
            url,
            maxRetriesPerRequest: null,
          },
          defaultJobOptions: {
            attempts: 5,
            backoff: {
              type: 'exponential',
              delay: 1000,
            },
            removeOnComplete: 1000,
            removeOnFail: 5000,
          },
        };
      },
    }),
    CqrsModule.forRoot(),
    CustomHttpModule,
    AuthModule,
    HealthModule,
    UsersModule,
    AccountsModule,
    SessionsModule,
    VerificationsModule,
    MeetingGroupsModule,
    MeetingParticipantsModule,
    MeetingSlotsModule,
    MeetingsModule,
    MeetingAttendeesModule,
    NotificationsModule,
    CalendarsModule,
    AvailabilityOverridesModule,
    AvailabilitiesModule,
    WaitlistModule,
  ],
  controllers: [],
  providers: [
    {
      provide: APP_INTERCEPTOR,
      useClass: UseCacheInterceptor,
    },
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
  ],
})
export class AppModule {}
