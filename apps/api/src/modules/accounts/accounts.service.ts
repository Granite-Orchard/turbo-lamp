import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateAccountDto } from './dto/create-account.dto';
import { UpdateAccountDto } from './dto/update-account.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { FindOptionsRelations, FindOptionsWhere, Repository } from 'typeorm';
import { Account } from './entities/account.entity';

@Injectable()
export class AccountsService {
  constructor(
    @InjectRepository(Account)
    private readonly repository: Repository<Account>,
  ) {}

  async findAllBy(
    where: FindOptionsWhere<Account>,
    relations?: FindOptionsRelations<Account>,
  ) {
    return await this.repository.find({ where, relations });
  }

  async findOne(id: string, relations?: FindOptionsRelations<Account>) {
    return await this.findOneBy({ id }, relations);
  }

  async findOneBy(
    where: FindOptionsWhere<Account>,
    relations?: FindOptionsRelations<Account>,
  ) {
    return await this.repository.findOne({
      where,
      relations,
    });
  }

  async create(createAccountDto: CreateAccountDto) {
    return await this.repository.save(this.repository.create(createAccountDto));
  }

  async update(id: string, updateAccountDto: UpdateAccountDto) {
    const result = await this.repository.update(id, {
      ...updateAccountDto,
    });
    if (!result.affected) {
      throw new NotFoundException();
    }
    return await this.findOne(id);
  }

  async remove(id: string) {
    const account = await this.findOne(id);
    if (!account) {
      throw new NotFoundException();
    }
    await this.repository.softDelete(account.id);
    return account;
  }
}
