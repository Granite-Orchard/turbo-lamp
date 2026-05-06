import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { EventBus } from '@nestjs/cqrs';
import { InjectRepository } from '@nestjs/typeorm';
import {
  DataSource,
  FindOptionsRelations,
  FindOptionsWhere,
  Repository,
} from 'typeorm';
import { VerificationType, VerificationValue } from '../../libs/constants';
import { TokenService } from '../auth/token.service';
import { CreateVerificationDto } from './dto/create-verification.dto';
import { UpdateVerificationDto } from './dto/update-verification.dto';
import { Verification } from './entities/verification.entity';
import { InvitationCreatedEvent } from './events/invitation-created.event';

@Injectable()
export class VerificationsService {
  constructor(
    private readonly dataSource: DataSource,
    @InjectRepository(Verification)
    private readonly repository: Repository<Verification>,
    @Inject(TokenService)
    private readonly tokenService: TokenService,
    private readonly eventBus: EventBus,
  ) {}

  async findAll() {
    return await this.repository.find();
  }

  async findAllBy(
    where: FindOptionsWhere<Verification>,
    relations?: FindOptionsRelations<Verification>,
  ) {
    return await this.repository.find({
      where,
      relations,
    });
  }

  async findOne(id: string, relations?: FindOptionsRelations<Verification>) {
    return await this.findOneBy({ id }, relations);
  }

  async findOneBy(
    where: FindOptionsWhere<Verification>,
    relations?: FindOptionsRelations<Verification>,
  ) {
    return await this.repository.findOne({
      where,
      relations,
    });
  }

  async consume(identifier: string): Promise<Verification | null> {
    return this.dataSource.transaction(async (manager) => {
      const repo = manager.getRepository(Verification);
      const record = await repo.findOne({
        where: { identifier },
        lock: { mode: 'pessimistic_write' },
      });
      if (!record) return null;
      return await repo.remove(record);
    });
  }

  async create(createVerificationDto: CreateVerificationDto) {
    const verification = await this.repository.save(
      this.repository.create(createVerificationDto),
    );
    if (createVerificationDto.value === '') {
      return verification;
    }
    const payload: VerificationValue = await this.tokenService.verify(
      createVerificationDto.value,
    );
    if (payload.type === VerificationType.EMAIL_INVITATION) {
      await this.eventBus.publish(new InvitationCreatedEvent(verification));
    }
    return verification;
  }

  async update(id: string, updateVerificationDto: UpdateVerificationDto) {
    const result = await this.repository.update(id, {
      ...updateVerificationDto,
    });
    if (!result.affected) {
      throw new NotFoundException();
    }
    return await this.findOne(id);
  }

  async remove(id: string) {
    const verification = await this.findOne(id);
    if (!verification) {
      throw new NotFoundException();
    }
    return await this.repository.softDelete(verification.id);
  }
}
