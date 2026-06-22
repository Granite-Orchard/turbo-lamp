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
    this.logger.debug('findAll invoked', {
      correlationId: '1a7ed198-c0d5-4572-b3a8-742fcad15e8f',
    });
    return await this.repository.find();
  }

  async findAllBy(
    where: FindOptionsWhere<Calendar> | FindOptionsWhere<Calendar>[],
    relations?: FindOptionsRelations<Calendar>,
  ) {
    this.logger.debug('findAllBy invoked', {
      correlationId: 'cbff54e4-02ee-476a-8fb7-afd3afa2523b',
      where,
      relations,
    });
    return await this.repository.find({
      where,
      relations,
    });
  }

  async findOne(id: string, relations?: FindOptionsRelations<Calendar>) {
    this.logger.debug('findOne invoked', {
      correlationId: 'd691b65a-29ab-4d50-8f6d-e2296f4d09bf',
      id,
      relations,
    });
    return await this.findOneBy({ id }, relations);
  }

  async findOneBy(
    where: FindOptionsWhere<Calendar> | FindOptionsWhere<Calendar>[],
    relations?: FindOptionsRelations<Calendar>,
  ) {
    this.logger.debug('findOneBy invoked', {
      correlationId: 'e86a7e26-cc90-46f2-84d7-7a385431d118',
      where,
      relations,
    });
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
    this.logger.debug('upsert invoked', {
      correlationId: '03616b02-1925-45f4-b998-89098a27932d',
      createCalendarDto,
    });
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
    this.logger.debug('create invoked', {
      correlationId: '1dd56509-77d7-462f-a1e5-945c422e3db9',
      createCalendarDto,
    });
    const result = await this.repository.save(
      this.repository.create(createCalendarDto),
    );
    this.eventBus.publish(new CalendarCreatedEvent(result));
    return result;
  }

  async update(id: string, updateCalendarDto: UpdateCalendarDto) {
    this.logger.debug('update invoked', {
      correlationId: 'd71839a9-1c85-40f0-9060-f13023da9141',
      id,
      updateCalendarDto,
    });
    const result = await this.repository.update(id, {
      ...updateCalendarDto,
    });
    if (!result.affected) {
      throw new NotFoundException();
    }
  }

  async remove(id: string) {
    this.logger.debug('remove invoked', {
      correlationId: '755ed60a-ea45-4dc9-83c8-eb0f6c4823a8',
      id,
    });
    const calendar = await this.findOne(id);
    if (!calendar) {
      throw new NotFoundException();
    }
    return await this.repository.delete(calendar.id);
  }
}
