import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { CreateAvailabilityDto } from './dto/create-availability.dto';
import { UpdateAvailabilityDto } from './dto/update-availability.dto';
import { Availability } from './entities/availability.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, FindOptionsWhere, FindOptionsRelations } from 'typeorm';

@Injectable()
export class AvailabilitiesService {
  private readonly logger: Logger = new Logger(AvailabilitiesService.name);
  constructor(
    @InjectRepository(Availability)
    private readonly repository: Repository<Availability>,
  ) {}

  async upsert(
    createAvailabilityDto: CreateAvailabilityDto & {
      userId: string;
      createdBy: string;
    },
  ) {
    this.logger.debug('upsert invoked', {
      correlationId: '568bc2c9-2da1-4669-b4aa-2d8960888323',
      createAvailabilityDto,
    });
    await this.repository.upsert(createAvailabilityDto, {
      skipUpdateIfNoValuesChanged: true,
      conflictPaths: [
        'userId',
        'dayOfWeek',
        'startTime',
        'endTime',
        'isAvailable',
      ],
    });
    return await this.findOneBy({
      userId: createAvailabilityDto.userId,
      dayOfWeek: createAvailabilityDto.dayOfWeek,
    });
  }

  async create(
    createAvailabilityDto: CreateAvailabilityDto & {
      createdBy: string;
      userId: string;
    },
  ) {
    this.logger.debug('create invoked', {
      correlationId: 'c15ab7a3-75e2-49d3-8d7f-605698ae3fd2',
      createAvailabilityDto,
    });
    return await this.repository.save(
      this.repository.create(createAvailabilityDto),
    );
  }

  async findAll() {
    this.logger.debug('findAll invoked', {
      correlationId: 'f2948669-7683-406c-a9e7-c89eeada5182',
    });
    return await this.repository.find();
  }

  async findAllBy(
    where: FindOptionsWhere<Availability> | FindOptionsWhere<Availability>[],
    relations?: FindOptionsRelations<Availability>,
  ) {
    this.logger.debug('findAllBy invoked', {
      correlationId: '2a326d76-de29-4a81-b079-8d169acf37a0',
      where,
      relations,
    });
    return await this.repository.find({
      where,
      relations,
    });
  }

  async findOne(id: string, relations?: FindOptionsRelations<Availability>) {
    this.logger.debug('findOne invoked', {
      correlationId: '278e4e36-6ccf-4a93-b512-f088d48588c5',
      id,
      relations,
    });
    return await this.findOneBy({ id }, relations);
  }

  async findOneBy(
    where: FindOptionsWhere<Availability> | FindOptionsWhere<Availability>[],
    relations?: FindOptionsRelations<Availability>,
  ) {
    this.logger.debug('findOneBy invoked', {
      correlationId: '2b0f5e8f-e69d-41ea-9756-a3f1661b0d5d',
      where,
      relations,
    });
    return await this.repository.findOne({
      where,
      relations,
    });
  }

  async update(id: string, updateAvailabilityDto: UpdateAvailabilityDto) {
    this.logger.debug('update invoked', {
      correlationId: 'c225c524-6ea8-46cb-a548-0ea8e31bc495',
      id,
      updateAvailabilityDto,
    });
    const result = await this.repository.update(id, {
      ...updateAvailabilityDto,
    });
    if (!result.affected) {
      throw new NotFoundException();
    }
    return await this.findOne(id);
  }

  async remove(id: string) {
    this.logger.debug('remove invoked', {
      correlationId: 'e5ab12d3-3567-479e-9915-6f4758317b04',
      id,
    });
    const meeting = await this.findOne(id);
    if (!meeting) {
      throw new NotFoundException();
    }
    return await this.repository.delete(meeting.id);
  }
}
