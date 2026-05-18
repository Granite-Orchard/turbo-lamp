import {
  Body,
  Controller,
  Delete,
  Get,
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
  constructor(private readonly accountsService: AccountsService) {}

  @Get()
  async findAll(@Req() req: Request & { user: Account }) {
    return await this.accountsService.findAllBy({ userId: req.user.id });
  }

  @Get(':id')
  async findOne(
    @Req() req: Request & { user: Account },
    @Param('id') id: string,
  ): Promise<AccountResponseDto> {
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
