import {
  Body,
  Controller,
  Delete,
  Get,
  Logger,
  NotFoundException,
  Param,
  Patch,
  Req,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../../guards/jwt-auth.guard';
import { AccountsService } from './accounts.service';
import { UpdateAccountDto } from './dto/update-account.dto';
import { Account } from './entities/account.entity';
import { plainToInstance } from 'class-transformer';
import { AccountResponseDto } from './dto/account.response.dto';

@UseGuards(JwtAuthGuard)
@Controller({ path: 'accounts', version: '1' })
export class AccountsController {
  private readonly logger: Logger = new Logger(AccountsController.name);
  constructor(private readonly accountsService: AccountsService) {}

  @Get()
  async findAll(@Req() req: Request & { user: Account }) {
    this.logger.debug('findAll invoked', {
      correlationId: '5e16b6fb-8661-4a58-a7cd-529d0e16fa81',
      userId: req.user.id,
    });
    return await this.accountsService.findAllBy({ userId: req.user.id });
  }

  @Get(':id')
  async findOne(
    @Req() req: Request & { user: Account },
    @Param('id') id: string,
  ): Promise<AccountResponseDto> {
    this.logger.debug('findOne invoked', {
      correlationId: '35c5e445-28a3-469e-9620-58c0fb8b409d',
      userId: req.user.id,
      id,
    });
    const result = await this.accountsService.findOneBy({
      id,
      userId: req.user.id,
    });
    return plainToInstance(AccountResponseDto, result, {
      excludeExtraneousValues: true,
    });
  }

  @Patch(':id')
  async update(
    @Req() req: Request & { user: Account },
    @Param('id') id: string,
    @Body() updateAccountDto: UpdateAccountDto,
  ): Promise<AccountResponseDto> {
    this.logger.debug('update invoked', {
      correlationId: '10d4a388-b8a0-4534-89c5-0c24fb0981d7',
      userId: req.user.id,
      id,
      body: updateAccountDto,
    });
    const found = await this.accountsService.findOneBy({
      id,
      userId: req.user.id,
    });
    if (!found) {
      throw new NotFoundException();
    }
    const result = await this.accountsService.update(id, updateAccountDto);
    return plainToInstance(AccountResponseDto, result, {
      excludeExtraneousValues: true,
    });
  }

  @Delete(':id')
  async remove(
    @Req() req: Request & { user: Account },
    @Param('id') id: string,
  ): Promise<AccountResponseDto> {
    this.logger.debug('delete invoked', {
      correlationId: '6b7ee5bf-94ae-4448-b931-aee6119e8a24',
      userId: req.user.id,
      id,
    });
    const found = await this.accountsService.findOneBy({
      id,
      userId: req.user.id,
    });
    if (!found) {
      throw new NotFoundException();
    }
    const result = await this.accountsService.remove(id);
    return plainToInstance(AccountResponseDto, result, {
      excludeExtraneousValues: true,
    });
  }
}
