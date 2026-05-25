import {
  Injectable,
  NotFoundException,
  BadRequestException,
  Logger,
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
  private readonly logger: Logger = new Logger(MeetingsService.name);
  constructor(
    @InjectRepository(Meeting)
    private readonly repository: Repository<Meeting>,
    private eventBus: EventBus,
  ) {}

  private validateStatusTransition(
    current: MeetingStatus,
    next: MeetingStatus,
  ): void {
    this.logger.debug('validateStatusTransition invoked', {
      correlationId: '3e6c325d-40d3-4b14-9815-83c9d18cf48f',
      current,
      next,
    });
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
    this.logger.debug('validateMeetingTimes invoked', {
      correlationId: '8f110bf9-732e-407c-994f-cef614ce618a',
      start,
      end,
    });
    if (end <= start) {
      throw new BadRequestException({
        message: 'Meeting end must be after start',
        code: 'INVALID_MEETING_TIME',
        details: { start, end },
      });
    }
  }

  async findAll() {
    this.logger.debug('findAll invoked', {
      correlationId: '22191db0-66da-40dc-a897-40bc1483bbaf',
    });
    return await this.repository.find();
  }

  async findAllBy(
    where: FindOptionsWhere<Meeting> | FindOptionsWhere<Meeting>[],
    relations?: FindOptionsRelations<Meeting>,
  ) {
    this.logger.debug('findAllBy invoked', {
      correlationId: '516bf46b-60f8-4792-8833-6576479f429b',
      where,
      relations,
    });
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
    this.logger.debug('findOne invoked', {
      correlationId: 'b0edad41-e88a-4fcd-9140-f7ed37cbf819',
      id,
      relations,
    });
    return await this.findOneBy({ id }, relations);
  }

  async findOneBy(
    where: FindOptionsWhere<Meeting> | FindOptionsWhere<Meeting>[],
    relations?: FindOptionsRelations<Meeting>,
  ) {
    this.logger.debug('findOneBy invoked', {
      correlationId: '39b74f73-aab5-47db-a25f-7558daef36a1',
      where,
      relations,
    });
    return await this.repository.findOne({
      where,
      relations,
    });
  }

  async create(createMeetingDto: CreateMeetingDto) {
    this.logger.debug('create invoked', {
      correlationId: '5909e06a-b7c2-4598-9484-dfb94eff1d3a',
      createMeetingDto,
    });
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
    this.eventBus.publish(new MeetingCreatedEvent(entity));
    return entity;
  }

  async update(id: string, updateMeetingDto: UpdateMeetingDto) {
    this.logger.debug('update invoked', {
      correlationId: '48ab4177-7e18-463a-9638-7e2b250982af',
      id,
      updateMeetingDto,
    });
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
    this.logger.debug('remove invoked', {
      correlationId: '35605fc2-ceec-492b-867b-eece4ef67eb8',
      id,
    });
    const meeting = await this.findOne(id, {
      meetingGroup: { calendar: { account: true } },
    });
    if (!meeting) {
      throw new NotFoundException();
    }
    const result = await this.repository.softDelete(meeting.id);
    if (result.affected) {
      this.eventBus.publish(new MeetingDeletedEvent(meeting));
    }
    return result;
  }
}
