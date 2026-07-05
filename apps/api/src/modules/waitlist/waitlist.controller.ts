import {
  Body,
  Controller,
  Logger,
  Post,
  UseInterceptors,
} from '@nestjs/common';
import { CreateWaitlistDto } from './dto/create-waitlist.dto';
import { WaitlistService } from './waitlist.service';
import { IdempotencyInterceptor } from '../../interceptors/idempotency.interceptor';

@Controller({ path: 'waitlist', version: '1' })
export class WaitlistController {
  private readonly logger: Logger = new Logger(WaitlistController.name);
  constructor(private readonly waitlistService: WaitlistService) {}

  @Post()
  @UseInterceptors(IdempotencyInterceptor)
  async create(@Body() createWaitlistDto: CreateWaitlistDto) {
    this.logger.debug('create invoked', {
      correlationId: '94021510-eeed-459a-a80d-1a7405d5f5bc',
      createWaitlistDto,
    });
    return await this.waitlistService.create(createWaitlistDto);
  }
}
