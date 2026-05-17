import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CalendarsModule } from '../calendars/calendars.module';
import { Meeting } from './entities/meeting.entity';
import { MeetingDeletedHandler } from './handlers/meeting-deleted.handler';
import { MeetingsController } from './meetings.controller';
import { MeetingsService } from './meetings.service';

@Module({
  imports: [TypeOrmModule.forFeature([Meeting]), CalendarsModule],
  controllers: [MeetingsController],
  providers: [MeetingsService, MeetingDeletedHandler],
  exports: [MeetingsService],
})
export class MeetingsModule {}
