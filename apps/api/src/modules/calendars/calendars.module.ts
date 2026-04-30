import { HttpModule } from '@nestjs/axios';
import { forwardRef, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AccountsModule } from '../accounts/accounts.module';
import { AuthModule } from '../auth/auth.module';
import { CalendarsController } from './calendars.controller';
import { CalendarsService } from './calendars.service';
import { Calendar } from './entities/calendar.entity';
import { ExternalCalendarService } from './external-calendar.service';
import { GoogleCalendarProvider } from './providers/google-calendar.provider';

@Module({
  imports: [
    TypeOrmModule.forFeature([Calendar]),
    forwardRef(() => AuthModule),
    AccountsModule,
    HttpModule,
  ],
  controllers: [CalendarsController],
  providers: [
    GoogleCalendarProvider,
    ExternalCalendarService,
    CalendarsService,
  ],
  exports: [ExternalCalendarService, CalendarsService],
})
export class CalendarsModule {}
