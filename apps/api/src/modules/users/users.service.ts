import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { FindOptionsRelations, FindOptionsWhere, Repository } from 'typeorm';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { User } from './entities/user.entity';

@Injectable()
export class UsersService {
  private readonly logger: Logger = new Logger(UsersService.name);
  constructor(
    @InjectRepository(User)
    private readonly repository: Repository<User>,
  ) {}
  async create(createUserDto: CreateUserDto) {
    this.logger.debug('create invoked', {
      correlationId: 'de1eb977-6cc9-4e4c-8dab-7cac229791ed',
      createUserDto,
    });
    return await this.repository.save(this.repository.create(createUserDto));
  }

  async findOne(id: string, relations?: FindOptionsRelations<User>) {
    this.logger.debug('findOne invoked', {
      correlationId: 'b89ae60e-9410-4e05-8138-fd1a01c83ad6',
      id,
      relations,
    });
    return await this.findOneBy({ id }, relations);
  }

  async findOneBy(
    where: FindOptionsWhere<User>,
    relations?: FindOptionsRelations<User>,
  ) {
    this.logger.debug('findOneBy invoked', {
      correlationId: 'ba2aafe0-5f73-4c00-bb76-77a596ecd806',
      where,
      relations,
    });
    return await this.repository.findOne({
      where,
      relations,
    });
  }

  async update(id: string, updateUserDto: UpdateUserDto) {
    this.logger.debug('update invoked', {
      correlationId: 'c9ec6b8b-8f15-4706-883e-43770991d7e6',
      id,
      updateUserDto,
    });
    const result = await this.repository.update(id, {
      ...updateUserDto,
    });
    if (!result.affected) {
      throw new NotFoundException();
    }
    return await this.findOne(id);
  }

  async remove(id: string) {
    this.logger.debug('remove invoked', {
      correlationId: '6e4e7ef5-b06d-4e7a-a48f-14d722f57a7c',
      id,
    });
    const user = await this.findOne(id);
    if (!user) {
      throw new NotFoundException();
    }
    return await this.repository.softDelete(user.id);
  }
}
