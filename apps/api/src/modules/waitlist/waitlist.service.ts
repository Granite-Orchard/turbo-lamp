import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateWaitlistDto } from './dto/create-waitlist.dto';
import { Waitlist } from './entities/waitlist.entity';

@Injectable()
export class WaitlistService {
  private readonly logger: Logger = new Logger(WaitlistService.name);
  constructor(
    @InjectRepository(Waitlist)
    private readonly repository: Repository<Waitlist>,
  ) {}
  async create(createWaitlistDto: CreateWaitlistDto) {
    this.logger.debug('create invoked', {
      correlationId: 'ff452640-0038-4da0-9e26-604c4748b60a',
      createWaitlistDto,
    });

    return await this.repository.save(
      this.repository.create(createWaitlistDto),
    );
  }
}
