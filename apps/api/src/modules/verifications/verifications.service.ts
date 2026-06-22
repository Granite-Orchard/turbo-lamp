import { Inject, Injectable, Logger, NotFoundException } from '@nestjs/common';
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
  private readonly logger: Logger = new Logger(VerificationsService.name);
  constructor(
    private readonly dataSource: DataSource,
    @InjectRepository(Verification)
    private readonly repository: Repository<Verification>,
    @Inject(TokenService)
    private readonly tokenService: TokenService,
    private readonly eventBus: EventBus,
  ) {}

  async findAll() {
    this.logger.debug('findAll invoked', {
      correlationId: 'a28378bc-42ad-47df-b334-90afd6e2b39c',
    });
    return await this.repository.find();
  }

  async findAllBy(
    where: FindOptionsWhere<Verification>,
    relations?: FindOptionsRelations<Verification>,
  ) {
    this.logger.debug('findAllBy invoked', {
      correlationId: 'c7342450-9e5f-4abc-858d-548107a91e30',
      where,
      relations,
    });
    return await this.repository.find({
      where,
      relations,
    });
  }

  async findOne(id: string, relations?: FindOptionsRelations<Verification>) {
    this.logger.debug('findOne invoked', {
      correlationId: '341a1fb2-61eb-44d2-85ed-a2acd1a1756a',
      id,
      relations,
    });
    return await this.findOneBy({ id }, relations);
  }

  async findOneBy(
    where: FindOptionsWhere<Verification>,
    relations?: FindOptionsRelations<Verification>,
  ) {
    this.logger.debug('findOneBy invoked', {
      correlationId: '92cbc788-495c-4875-a646-5832713a2e80',
      where,
      relations,
    });
    return await this.repository.findOne({
      where,
      relations,
    });
  }

  async consume(identifier: string): Promise<Verification | null> {
    this.logger.debug('consume invoked', {
      correlationId: '99e5e9c9-955a-4e5d-bd28-a6019fe48063',
      identifier,
    });
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
    this.logger.debug('create invoked', {
      correlationId: 'd4d478cd-bafc-468a-943e-e6dda73c7012',
      createVerificationDto,
    });
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
      this.eventBus.publish(new InvitationCreatedEvent(verification));
    }
    return verification;
  }

  async update(id: string, updateVerificationDto: UpdateVerificationDto) {
    this.logger.debug('update invoked', {
      correlationId: 'dee41529-47a7-4e7c-a5f7-3c770b7540b1',
      id,
      updateVerificationDto,
    });
    const result = await this.repository.update(id, {
      ...updateVerificationDto,
    });
    if (!result.affected) {
      throw new NotFoundException();
    }
    return await this.findOne(id);
  }

  async remove(id: string) {
    this.logger.debug('remove invoked', {
      correlationId: '08f3c637-62b2-4bf3-a3fe-9db0b07ef919',
      id,
    });
    const verification = await this.findOne(id);
    if (!verification) {
      throw new NotFoundException();
    }
    return await this.repository.delete(verification.id);
  }
}
