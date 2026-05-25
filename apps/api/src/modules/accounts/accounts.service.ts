import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { CreateAccountDto } from './dto/create-account.dto';
import { UpdateAccountDto } from './dto/update-account.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { FindOptionsRelations, FindOptionsWhere, Repository } from 'typeorm';
import { Account } from './entities/account.entity';

@Injectable()
export class AccountsService {
  private readonly logger: Logger = new Logger(AccountsService.name);
  constructor(
    @InjectRepository(Account)
    private readonly repository: Repository<Account>,
  ) {}

  async findAllBy(
    where: FindOptionsWhere<Account>,
    relations?: FindOptionsRelations<Account>,
  ) {
    this.logger.debug('findAllBy invoked', {
      correlationId: '449ece92-7b31-4933-8d9c-11a344b7fabf',
      where,
      relations,
    });
    return await this.repository.find({ where, relations });
  }

  async findOne(id: string, relations?: FindOptionsRelations<Account>) {
    this.logger.debug('findOne invoked', {
      correlationId: '0f7d21cd-8db7-4bc5-8f50-9c19a8c245b1',
      id,
      relations,
    });
    return await this.findOneBy({ id }, relations);
  }

  async findOneBy(
    where: FindOptionsWhere<Account>,
    relations?: FindOptionsRelations<Account>,
  ) {
    this.logger.debug('findOneBy invoked', {
      correlationId: 'add44f69-f758-4367-9eea-33e259b6dfb8',
      where,
      relations,
    });
    return await this.repository.findOne({
      where,
      relations,
    });
  }

  async create(createAccountDto: CreateAccountDto) {
    this.logger.debug('create invoked', {
      correlationId: '397aaf88-8fe6-4d08-b9cd-6a2cedd09dd1',
      createAccountDto,
    });
    return await this.repository.save(this.repository.create(createAccountDto));
  }

  async update(id: string, updateAccountDto: UpdateAccountDto) {
    this.logger.debug('update invoked', {
      correlationId: '39696f30-fb5c-462b-aa0e-923dcfba4b91',
      id,
      updateAccountDto,
    });
    const result = await this.repository.update(id, {
      ...updateAccountDto,
    });
    if (!result.affected) {
      throw new NotFoundException();
    }
    return await this.findOne(id);
  }

  async remove(id: string) {
    this.logger.debug('remove invoked', {
      correlationId: '0c9ff514-77c7-4553-9bb9-b5baedbb4f49',
      id,
    });
    const account = await this.findOne(id);
    if (!account) {
      throw new NotFoundException();
    }
    await this.repository.softDelete(account.id);
    return account;
  }
}
