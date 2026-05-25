import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { FindOptionsRelations, FindOptionsWhere, Repository } from 'typeorm';
import { Session } from './entities/session.entity';
import { CreateSessionDto } from './dto/create-session.dto';
import { UpdateSessionDto } from './dto/update-session.dto';

@Injectable()
export class SessionsService {
  private readonly logger: Logger = new Logger(SessionsService.name);
  constructor(
    @InjectRepository(Session)
    private readonly repository: Repository<Session>,
  ) {}

  async findAll() {
    this.logger.debug('findAll invoked', {
      correlationId: 'f674dad6-21f3-4d0b-9263-8c0a778de850',
    });
    return await this.repository.find();
  }

  async findAllBy(
    where: FindOptionsWhere<Session>,
    relations?: FindOptionsRelations<Session>,
  ) {
    this.logger.debug('findAllBy invoked', {
      correlationId: 'eccca5d3-b23f-4145-8cea-693ec3d29176',
      where,
      relations,
    });
    return await this.repository.find({
      where,
      relations,
    });
  }

  async findOne(id: string, relations?: FindOptionsRelations<Session>) {
    this.logger.debug('findOne invoked', {
      correlationId: '2bc3dd55-071c-4f15-bcfc-d1fbd218b7c6',
      id,
      relations,
    });
    return await this.findOneBy({ id }, relations);
  }

  async findOneBy(
    where: FindOptionsWhere<Session>,
    relations?: FindOptionsRelations<Session>,
  ) {
    this.logger.debug('findOneBy invoked', {
      correlationId: '475b05b7-fd32-4ad8-b466-f63325f8e8cb',
      where,
      relations,
    });
    return await this.repository.findOne({
      where,
      relations,
    });
  }

  async create(createSessionDto: CreateSessionDto) {
    this.logger.debug('create invoked', {
      correlationId: '7a98e681-6221-48c5-a2fc-9372dfc03052',
      createSessionDto,
    });
    return await this.repository.save(this.repository.create(createSessionDto));
  }

  async update(id: string, updateSessionDto: UpdateSessionDto) {
    this.logger.debug('update invoked', {
      correlationId: '340543ba-e664-40c8-a0bb-3763f061ca6f',
      id,
      updateSessionDto,
    });
    const result = await this.repository.update(id, {
      ...updateSessionDto,
    });
    if (!result.affected) {
      throw new NotFoundException();
    }
    return await this.findOne(id);
  }

  async remove(id: string) {
    this.logger.debug('remove invoked', {
      correlationId: '4df1b772-dbd7-4c98-80b6-dfc128e12e89',
      id,
    });
    const session = await this.findOne(id);
    if (!session) {
      throw new NotFoundException();
    }
    return await this.repository.softDelete(session.id);
  }
}
