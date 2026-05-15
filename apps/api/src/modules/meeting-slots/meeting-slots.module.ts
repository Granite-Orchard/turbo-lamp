import { forwardRef, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AvailabilitiesModule } from '../availabilities/availabilities.module';
import { CalendarsModule } from '../calendars/calendars.module';
import { MeetingGroupsModule } from '../meeting-groups/meeting-groups.module';
import { MeetingSlot } from './entities/meeting-slot.entity';
import { MeetingParticipantAuthorizedHandler } from './handlers/meeting-participant-authorized.handler';
import { MeetingSlotsController } from './meeting-slots.controller';
import { MeetingSlotsService } from './meeting-slots.service';
import { MeetingsModule } from '../meetings/meetings.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([MeetingSlot]),
    forwardRef(() => MeetingGroupsModule),
    AvailabilitiesModule,
    CalendarsModule,
    MeetingsModule,
  ],
  controllers: [MeetingSlotsController],
  providers: [MeetingSlotsService, MeetingParticipantAuthorizedHandler],
  exports: [MeetingSlotsService],
})
export class MeetingSlotsModule {}
