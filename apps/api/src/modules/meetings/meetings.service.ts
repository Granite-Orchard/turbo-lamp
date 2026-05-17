import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { EventBus } from '@nestjs/cqrs';
import { InjectRepository } from '@nestjs/typeorm';
import { FindOptionsRelations, FindOptionsWhere, Repository } from 'typeorm';
import { CreateMeetingDto } from './dto/create-meeting.dto';
import { UpdateMeetingDto } from './dto/update-meeting.dto';
import { Meeting } from './entities/meeting.entity';
import { MeetingCreatedEvent } from './events/meeting-created.event';
import { MeetingStatus } from '../../libs/constants';
import { MeetingDeletedEvent } from './events/meeting-deleted.event';

const ALLOWED_MEETING_STATUS_TRANSITIONS: Record<
  MeetingStatus,
  MeetingStatus[]
> = {
  [MeetingStatus.SCHEDULED]: [MeetingStatus.CANCELLED],
  [MeetingStatus.CANCELLED]: [],
};

@Injectable()
export class MeetingsService {
  constructor(
    @InjectRepository(Meeting)
    private readonly repository: Repository<Meeting>,
    private eventBus: EventBus,
  ) {}

  private validateStatusTransition(
    current: MeetingStatus,
    next: MeetingStatus,
  ): void {
    const allowed = ALLOWED_MEETING_STATUS_TRANSITIONS[current] || [];
    if (!allowed.includes(next)) {
      throw new BadRequestException({
        message: `Invalid status transition from '${current}' to '${next}'`,
        code: 'INVALID_STATUS_TRANSITION',
        details: {
          current,
          next,
          allowed: allowed.length > 0 ? allowed : 'none',
        },
      });
    }
  }

  private validateMeetingTimes(start: Date, end: Date): void {
    if (end <= start) {
      throw new BadRequestException({
        message: 'Meeting end must be after start',
        code: 'INVALID_MEETING_TIME',
        details: { start, end },
      });
    }
  }

  async findAll() {
    return await this.repository.find();
  }

  async findAllBy(
    where?: FindOptionsWhere<Meeting>,
    relations?: FindOptionsRelations<Meeting>,
  ) {
    const defaultRelations: FindOptionsRelations<Meeting> = {
      attendees: true,
      meetingGroup: true,
    };

    const mergedRelations = { ...defaultRelations, ...relations };

    return await this.repository.find({
      where,
      relations: mergedRelations,
    });
  }

  async findOne(id: string, relations?: FindOptionsRelations<Meeting>) {
    return await this.findOneBy({ id }, relations);
  }

  async findOneBy(
    where: FindOptionsWhere<Meeting>,
    relations?: FindOptionsRelations<Meeting>,
  ) {
    return await this.repository.findOne({
      where,
      relations,
    });
  }

  async create(createMeetingDto: CreateMeetingDto) {
    this.validateMeetingTimes(createMeetingDto.start, createMeetingDto.end);

    const status = createMeetingDto.status as MeetingStatus | undefined;
    if (!status) {
      createMeetingDto.status = MeetingStatus.SCHEDULED;
    } else if (status !== MeetingStatus.SCHEDULED) {
      throw new BadRequestException({
        message: 'Meeting must be created with status SCHEDULED',
        code: 'INVALID_INITIAL_STATUS',
      });
    }

    const entity = this.repository.create(createMeetingDto);
    await this.repository.save(entity);
    await this.eventBus.publish(new MeetingCreatedEvent(entity));
    return entity;
  }

  async update(id: string, updateMeetingDto: UpdateMeetingDto) {
    const existing = await this.findOne(id);
    if (!existing) {
      throw new NotFoundException({
        message: 'Meeting not found',
        code: 'NOT_FOUND',
      });
    }

    if (updateMeetingDto.start || updateMeetingDto.end) {
      const start = updateMeetingDto.start ?? existing.start;
      const end = updateMeetingDto.end ?? existing.end;
      this.validateMeetingTimes(start, end);
    }

    if (updateMeetingDto.status) {
      this.validateStatusTransition(existing.status, updateMeetingDto.status);
    }

    const result = await this.repository.update(id, { ...updateMeetingDto });
    if (!result.affected) {
      throw new NotFoundException();
    }
    return await this.findOne(id);
  }

  async remove(id: string) {
    const meeting = await this.findOne(id, {
      meetingGroup: { calendar: { account: true } },
    });
    if (!meeting) {
      throw new NotFoundException();
    }
    const result = await this.repository.softDelete(meeting.id);
    if (result.affected) {
      await this.eventBus.publish(new MeetingDeletedEvent(meeting));
    }
    return result;
  }
}
