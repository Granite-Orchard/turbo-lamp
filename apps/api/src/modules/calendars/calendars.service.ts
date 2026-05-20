import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { FindOptionsRelations, FindOptionsWhere, Repository } from 'typeorm';
import { CreateCalendarDto } from './dto/create-calendar.dto';
import { UpdateCalendarDto } from './dto/update-calendar.dto';
import { Calendar } from './entities/calendar.entity';
import { EventBus } from '@nestjs/cqrs';
import { CalendarCreatedEvent } from './events/calendar-created.event';

@Injectable()
export class CalendarsService {
  private readonly logger: Logger = new Logger(CalendarsService.name);
  constructor(
    @InjectRepository(Calendar)
    private readonly repository: Repository<Calendar>,
    private eventBus: EventBus,
  ) {}

  async findAll() {
    return await this.repository.find();
  }

  async findAllBy(
    where: FindOptionsWhere<Calendar> | FindOptionsWhere<Calendar>[],
    relations?: FindOptionsRelations<Calendar>,
  ) {
    return await this.repository.find({
      where,
      relations,
    });
  }

  async findOne(id: string, relations?: FindOptionsRelations<Calendar>) {
    return await this.findOneBy({ id }, relations);
  }

  async findOneBy(
    where: FindOptionsWhere<Calendar> | FindOptionsWhere<Calendar>[],
    relations?: FindOptionsRelations<Calendar>,
  ) {
    return await this.repository.findOne({
      where,
      relations,
    });
  }

  async upsert(
    createCalendarDto: CreateCalendarDto & {
      accountId: string;
      createdBy: string;
    },
  ) {
    await this.repository.upsert(createCalendarDto, {
      skipUpdateIfNoValuesChanged: true,
      conflictPaths: ['userId', 'externalId', 'providerId'],
    });
    const result = await this.findOneBy({
      userId: createCalendarDto.userId,
      externalId: createCalendarDto.externalId,
      providerId: createCalendarDto.providerId,
    });
    if (result) this.eventBus.publish(new CalendarCreatedEvent(result));
    return result;
  }

  async create(
    createCalendarDto: CreateCalendarDto & {
      accountId: string;
      createdBy: string;
    },
  ) {
    const result = await this.repository.save(
      this.repository.create(createCalendarDto),
    );
    this.eventBus.publish(new CalendarCreatedEvent(result));
    return result;
  }

  async update(id: string, updateCalendarDto: UpdateCalendarDto) {
    const result = await this.repository.update(id, {
      ...updateCalendarDto,
    });
    if (!result.affected) {
      throw new NotFoundException();
    }
  }

  async remove(id: string) {
    const calendar = await this.findOne(id);
    if (!calendar) {
      throw new NotFoundException();
    }
    return await this.repository.softDelete(calendar.id);
  }
}
