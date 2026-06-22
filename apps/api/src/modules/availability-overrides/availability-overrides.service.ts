import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { CreateAvailabilityOverrideDto } from './dto/create-availability-override.dto';
import { UpdateAvailabilityOverrideDto } from './dto/update-availability-override.dto';
import { AvailabilityOverride } from './entities/availability-override.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, FindOptionsWhere, FindOptionsRelations } from 'typeorm';

@Injectable()
export class AvailabilityOverridesService {
  private readonly logger: Logger = new Logger(
    AvailabilityOverridesService.name,
  );
  constructor(
    @InjectRepository(AvailabilityOverride)
    private readonly repository: Repository<AvailabilityOverride>,
  ) {}

  async upsert(
    createAvailabilityOverrideDto: CreateAvailabilityOverrideDto & {
      createdBy: string;
      userId: string;
    },
  ) {
    this.logger.debug('upsert invoked', {
      correlationId: '3cbd807d-c476-4015-81e8-d5151b24615a',
      createAvailabilityOverrideDto,
    });
    await this.repository.upsert(createAvailabilityOverrideDto, {
      skipUpdateIfNoValuesChanged: true,
      conflictPaths: ['userId', 'date', 'startTime', 'endTime'],
    });
    return this.findOneBy({
      userId: createAvailabilityOverrideDto.userId,
      date: createAvailabilityOverrideDto.date,
      startTime: createAvailabilityOverrideDto.startTime,
      endTime: createAvailabilityOverrideDto.endTime,
    });
  }

  async create(
    createAvailabilityOverrideDto: CreateAvailabilityOverrideDto & {
      createdBy: string;
      userId: string;
    },
  ) {
    this.logger.debug('create invoked', {
      correlationId: 'ae9647fa-9917-4623-8dcc-fdc98f734d6d',
      createAvailabilityOverrideDto,
    });
    return await this.repository.save(
      this.repository.create(createAvailabilityOverrideDto),
    );
  }

  async findAll() {
    this.logger.debug('findAll invoked', {
      correlationId: 'f213dce1-1fa6-4f37-93e8-ff04fdaaefc9',
    });
    return await this.repository.find();
  }

  async findAllBy(
    where:
      | FindOptionsWhere<AvailabilityOverride>
      | FindOptionsWhere<AvailabilityOverride>[],
    relations?: FindOptionsRelations<AvailabilityOverride>,
  ) {
    this.logger.debug('findAllBy invoked', {
      correlationId: 'f1fbd6f4-ac82-4aee-802a-bc5c472f1397',
      where,
      relations,
    });
    const result = await this.repository.find({
      where,
      relations,
    });
    return result;
  }

  async findOne(
    id: string,
    relations?: FindOptionsRelations<AvailabilityOverride>,
  ) {
    this.logger.debug('findOne invoked', {
      correlationId: '26aabc98-95fb-4fde-95f3-cde5c8638627',
      id,
      relations,
    });
    return await this.findOneBy({ id }, relations);
  }

  async findOneBy(
    where:
      | FindOptionsWhere<AvailabilityOverride>
      | FindOptionsWhere<AvailabilityOverride>[],
    relations?: FindOptionsRelations<AvailabilityOverride>,
  ) {
    this.logger.debug('findOneBy invoked', {
      correlationId: 'c77435d8-8159-4e28-beef-d35b23f6d261',
      where,
      relations,
    });
    return await this.repository.findOne({
      where,
      relations,
    });
  }

  async update(
    id: string,
    updateAvailabilityOverrideDto: UpdateAvailabilityOverrideDto,
  ) {
    this.logger.debug('update invoked', {
      correlationId: '4640a816-5bbe-4e6c-ad9b-a7175751240d',
      id,
      updateAvailabilityOverrideDto,
    });
    const result = await this.repository.update(id, {
      ...updateAvailabilityOverrideDto,
    });
    if (!result.affected) {
      throw new NotFoundException();
    }
    return await this.findOne(id);
  }

  async remove(id: string) {
    this.logger.debug('remove invoked', {
      correlationId: 'cd672275-844f-4e21-a2eb-4ef496ed54ae',
      id,
    });
    const meeting = await this.findOne(id);
    if (!meeting) {
      throw new NotFoundException();
    }
    return await this.repository.delete(meeting.id);
  }
}
