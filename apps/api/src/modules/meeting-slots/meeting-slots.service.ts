import { Inject, Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { FindOptionsRelations, FindOptionsWhere, Repository } from 'typeorm';
import {
  AccountProvider,
  CalendarProvider,
  ParticipantAuthState,
} from '../../libs/constants';
import {
  CalendarEvent,
  ExternalCalendarService,
} from '../calendars/external-calendar.service';
import { Availability } from '../availabilities/entities/availability.entity';
import { AvailabilityOverride } from '../availability-overrides/entities/availability-override.entity';
import { MeetingGroupsService } from '../meeting-groups/meeting-groups.service';
import { CreateMeetingSlotDto } from './dto/create-meeting-slot.dto';
import { UpdateMeetingSlotDto } from './dto/update-meeting-slot.dto';
import { MeetingSlot } from './entities/meeting-slot.entity';
import { convertDateToTimezone } from '../../utils/helpers/datetimes';

@Injectable()
export class MeetingSlotsService {
  private readonly logger: Logger = new Logger(MeetingSlotsService.name);
  constructor(
    @InjectRepository(MeetingSlot)
    private readonly repository: Repository<MeetingSlot>,
    @Inject(MeetingGroupsService)
    private readonly meetingGroupService: MeetingGroupsService,
    @Inject(ExternalCalendarService)
    private readonly externalCalendarService: ExternalCalendarService,
  ) {}

  async calculate(meetingGroupId: string, authorId: string) {
    const meetingGroup = await this.meetingGroupService.findOneBy(
      {
        authorId,
        id: meetingGroupId,
        participants: {
          authState: ParticipantAuthState.AUTHORIZED,
        },
      },
      {
        participants: {
          user: {
            accounts: true,
            calendars: true,
            availabilities: true,
            availabilityOverrides: true,
          },
        },
      },
    );
    if (!meetingGroup) throw new NotFoundException();
    if (!meetingGroup.participants) throw new NotFoundException();

    const nonAuthorParticipants = meetingGroup.participants.filter(
      (g) => g.userId && g.userId !== authorId,
    );
    if (nonAuthorParticipants.length === 0) {
      return [];
    }

    const allParticipants = meetingGroup.participants;

    const allParticipantAvailabilityWindows = allParticipants.map(
      (participant) => ({
        availabilities: participant.user.availabilities,
        overrides: participant.user.availabilityOverrides,
        timezone: participant.user.calendars[0]?.timezone || 'UTC',
      }),
    );

    const flattenedCalendarEvents = await Promise.all(
      allParticipants.flatMap((participant) => {
        const account = participant.user.accounts.find(
          (account) => account.providerId === AccountProvider.GOOGLE,
        )!;
        return participant.user.calendars
          .filter((c) => c.enabled && c.providerId === CalendarProvider.GOOGLE)
          .map((calendar) =>
            this.externalCalendarService.listEvents(
              calendar.providerId as 'google',
              {
                account,
                calendarId: calendar.externalId,
                timeMin: meetingGroup.after.toISOString(),
                timeMax: meetingGroup.before.toISOString(),
              },
            ),
          );
      }),
    );

    const baseAvailableWindows = this.intersectParticipantAvailabilityWindows(
      allParticipantAvailabilityWindows,
      meetingGroup.after,
      meetingGroup.before,
    );

    const availabletimeSlots = this.getAvailableSlots(
      flattenedCalendarEvents,
      baseAvailableWindows,
      meetingGroup.duration,
      5,
    );

    const createdMeetingSlots: Promise<MeetingSlot | null>[] = [];
    for (const [idx, slot] of availabletimeSlots.entries()) {
      createdMeetingSlots.push(
        this.upsert({
          meetingGroupId: meetingGroup.id,
          start: slot.start,
          end: slot.end,
          rank: idx,
        }),
      );
    }

    return await Promise.all(createdMeetingSlots);
  }

  async findAll() {
    return await this.repository.find();
  }

  async findAllBy(
    where: FindOptionsWhere<MeetingSlot> | FindOptionsWhere<MeetingSlot>[],
    relations?: FindOptionsRelations<MeetingSlot>,
  ) {
    return await this.repository.find({
      where,
      relations,
    });
  }

  async findOne(id: string, relations?: FindOptionsRelations<MeetingSlot>) {
    return await this.findOneBy({ id }, relations);
  }

  async findOneBy(
    where: FindOptionsWhere<MeetingSlot> | FindOptionsWhere<MeetingSlot>[],
    relations?: FindOptionsRelations<MeetingSlot>,
  ) {
    return await this.repository.findOne({
      where,
      relations,
    });
  }

  async upsert(createMeetingSlotDto: CreateMeetingSlotDto) {
    await this.repository.upsert(createMeetingSlotDto, {
      skipUpdateIfNoValuesChanged: true,
      conflictPaths: ['meetingGroupId', 'start', 'end'],
    });
    return this.findOneBy({
      meetingGroupId: createMeetingSlotDto.meetingGroupId,
      start: createMeetingSlotDto.start,
      end: createMeetingSlotDto.end,
    });
  }

  async create(
    createMeetingSlotDto: CreateMeetingSlotDto & { createdBy: string },
  ) {
    return await this.repository.save(
      this.repository.create(createMeetingSlotDto),
    );
  }

  async update(id: string, updateMeetingSlotDto: UpdateMeetingSlotDto) {
    const result = await this.repository.update(id, {
      ...updateMeetingSlotDto,
    });
    if (!result.affected) {
      throw new NotFoundException();
    }
    return await this.findOne(id);
  }

  async remove(id: string) {
    const meeting = await this.findOne(id);
    if (!meeting) {
      throw new NotFoundException();
    }
    return await this.repository.softDelete(meeting.id);
  }

  private getAvailableSlots(
    calendars: CalendarEvent[][],
    baseAvailableWindows: { start: number; end: number }[],
    slotMinutes: number,
    limit: number,
  ) {
    const windowStartMs = baseAvailableWindows[0].start;
    const windowEndMs =
      baseAvailableWindows[baseAvailableWindows.length - 1].end;
    const slotMs = slotMinutes * 60 * 1000;

    const allEvents = calendars
      .flat()
      .map((e) => {
        const start = new Date(e.start.dateTime).getTime();
        const end = new Date(e.end.dateTime).getTime();

        return {
          start: Math.max(start, windowStartMs),
          end: Math.min(end, windowEndMs),
        };
      })
      .filter((e) => e.start < e.end);

    allEvents.sort((a, b) => a.start - b.start);

    const merged: { start: number; end: number }[] = [];
    for (const event of allEvents) {
      if (!merged.length) {
        merged.push({ ...event });
        continue;
      }

      const last = merged[merged.length - 1];

      if (event.start <= last.end) {
        last.end = Math.max(last.end, event.end);
      } else {
        merged.push({ ...event });
      }
    }

    const free: { start: number; end: number }[] = [];

    for (const window of baseAvailableWindows) {
      let cursor = window.start;

      for (const busy of merged) {
        if (busy.start > window.end) break;
        if (busy.end <= cursor) continue;

        const busyStart = Math.max(busy.start, window.start);
        const busyEnd = Math.min(busy.end, window.end);

        if (busyStart > cursor) {
          free.push({ start: cursor, end: busyStart });
        }
        cursor = Math.max(cursor, busyEnd);
      }

      if (cursor < window.end) {
        free.push({ start: cursor, end: window.end });
      }
    }

    const slots: { start: Date; end: Date }[] = [];

    for (const interval of free) {
      let t = interval.start;

      while (t + slotMs <= interval.end) {
        slots.push({
          start: new Date(t),
          end: new Date(t + slotMs),
        });
        t += slotMs;
      }
    }

    return slots.slice(0, limit);
  }

  private intersectParticipantAvailabilityWindows(
    participantData: {
      availabilities: Availability[];
      overrides: AvailabilityOverride[];
      timezone: string;
    }[],
    windowStart: Date,
    windowEnd: Date,
  ): { start: number; end: number }[] {
    if (participantData.length === 0) {
      return [{ start: windowStart.getTime(), end: windowEnd.getTime() }];
    }

    const current = new Date(windowStart);
    current.setUTCHours(0, 0, 0, 0);
    const end = new Date(windowEnd);
    end.setUTCHours(23, 59, 59, 999);

    const intersected: { start: number; end: number }[] = [];

    while (current < end) {
      const dayOfWeek = current.getUTCDay();
      const dayStart = current.getTime();
      current.setUTCHours(23, 59, 59, 999);
      const dayEnd = current.getTime() + 1;
      current.setUTCHours(0, 0, 0, 0);

      const dayAvailable = this.intersectRangesForDay(
        participantData,
        dayOfWeek,
        dayStart,
        dayEnd,
      );

      for (const avail of dayAvailable) {
        if (intersected.length === 0) {
          intersected.push({ ...avail });
          continue;
        }

        const last = intersected[intersected.length - 1];
        if (avail.start <= last.end) {
          last.end = Math.max(last.end, avail.end);
        } else {
          intersected.push({ ...avail });
        }
      }

      current.setDate(current.getDate() + 1);
    }

    return intersected;
  }

  private intersectRangesForDay(
    participantData: {
      availabilities: Availability[];
      overrides: AvailabilityOverride[];
      timezone: string;
    }[],
    dayOfWeek: number,
    dayStart: number,
    dayEnd: number,
  ): { start: number; end: number }[] {
    const participantRanges = participantData.map((participant) =>
      this.buildParticipantDayAvailability(
        participant.availabilities,
        participant.overrides,
        participant.timezone,
        dayOfWeek,
        dayStart,
        dayEnd,
      ),
    );

    if (participantRanges.length === 0) {
      return [{ start: dayStart, end: dayEnd }];
    }

    let result = participantRanges[0];

    for (let i = 1; i < participantRanges.length; i++) {
      result = this.intersectTwoRanges(result, participantRanges[i]);
    }

    return result;
  }

  private buildParticipantDayAvailability(
    availabilities: Availability[],
    overrides: AvailabilityOverride[],
    timezone: string,
    dayOfWeek: number,
    dayStart: number,
    dayEnd: number,
  ): { start: number; end: number }[] {
    const override = overrides.find(
      (o) =>
        new Date(o.date).toISOString().slice(0, 16) ===
        new Date(dayStart).toISOString().slice(0, 16),
    );

    if (override) {
      const availabilityStart = this.convertLocalTimeToUtc(
        dayStart,
        override.startTime,
        timezone,
      );
      const availabilityEnd = this.convertLocalTimeToUtc(
        dayStart,
        override.endTime,
        timezone,
      );

      if (override.isAvailable) {
        return [{ start: availabilityStart, end: availabilityEnd }];
      }
      return [];
    }

    const dayAvailabilities = availabilities.filter(
      (a) => a.dayOfWeek === dayOfWeek,
    );

    if (dayAvailabilities.length === 0) {
      return [{ start: dayStart, end: dayEnd }];
    }

    const available: { start: number; end: number }[] = [];
    const blocked: { start: number; end: number }[] = [];

    for (const avail of dayAvailabilities) {
      const availabilityStart = this.convertLocalTimeToUtc(
        dayStart,
        avail.startTime,
        timezone,
      );
      const availabilityEnd = this.convertLocalTimeToUtc(
        dayStart,
        avail.endTime,
        timezone,
      );

      if (avail.isAvailable) {
        available.push({ start: availabilityStart, end: availabilityEnd });
      } else {
        blocked.push({ start: availabilityStart, end: availabilityEnd });
      }
    }

    available.sort((a, b) => a.start - b.start);

    const mergedAvailable: { start: number; end: number }[] = [];
    for (const avail of available) {
      if (mergedAvailable.length === 0) {
        mergedAvailable.push({ ...avail });
        continue;
      }
      const last = mergedAvailable[mergedAvailable.length - 1];
      if (avail.start <= last.end) {
        last.end = Math.max(last.end, avail.end);
      } else {
        mergedAvailable.push({ ...avail });
      }
    }

    let result = mergedAvailable;
    for (const block of blocked) {
      result = this.subtractRange(result, block);
    }

    return result;
  }

  private intersectTwoRanges(
    a: { start: number; end: number }[],
    b: { start: number; end: number }[],
  ): { start: number; end: number }[] {
    if (a.length === 0 || b.length === 0) return [];

    const result: { start: number; end: number }[] = [];

    for (const rangeA of a) {
      for (const rangeB of b) {
        const start = Math.max(rangeA.start, rangeB.start);
        const end = Math.min(rangeA.end, rangeB.end);

        if (start < end) {
          result.push({ start, end });
        }
      }
    }

    result.sort((x, y) => x.start - y.start);

    const merged: { start: number; end: number }[] = [];
    for (const range of result) {
      if (merged.length === 0) {
        merged.push({ ...range });
        continue;
      }
      const last = merged[merged.length - 1];
      if (range.start <= last.end) {
        last.end = Math.max(last.end, range.end);
      } else {
        merged.push({ ...range });
      }
    }

    return merged;
  }

  private subtractRange(
    ranges: { start: number; end: number }[],
    subtract: { start: number; end: number },
  ): { start: number; end: number }[] {
    const result: { start: number; end: number }[] = [];

    for (const range of ranges) {
      if (subtract.start <= range.start) {
        if (subtract.end <= range.start) {
          result.push({ ...range });
        } else if (subtract.end < range.end) {
          result.push({ start: subtract.end, end: range.end });
        }
      } else if (subtract.start < range.end) {
        if (subtract.end >= range.end) {
          continue;
        }
        result.push({ start: range.start, end: subtract.start });
        if (subtract.end < range.end) {
          result.push({ start: subtract.end, end: range.end });
        }
      } else {
        result.push({ ...range });
      }
    }

    return result;
  }

  private convertLocalTimeToUtc(
    dayStart: number,
    time: string,
    timezone: string,
  ): number {
    const [hours, minutes] = time.split(':').map(Number);
    const testDate = new Date(dayStart);
    testDate.setUTCHours(hours, minutes, 0, 0);

    const dateInZone = convertDateToTimezone(testDate, timezone);
    const zoneOffsetMinutes =
      dateInZone.getHours() * 60 +
      dateInZone.getMinutes() -
      (hours * 60 + minutes);

    return testDate.getTime() - zoneOffsetMinutes * 60000;
  }
}
