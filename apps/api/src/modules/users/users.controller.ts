import {
  Body,
  Controller,
  Delete,
  ForbiddenException,
  Get,
  Logger,
  Param,
  Patch,
  Req,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth } from '@nestjs/swagger';
import { plainToInstance } from 'class-transformer';
import { JwtAuthGuard } from '../../guards/jwt-auth.guard';
import { Account } from '../accounts/entities/account.entity';
import { UserResponseDto } from './dto/user.response.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UsersService } from './users.service';
import { ProfileResponseDto } from '../auth/dto/profile.response.dto';

@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller({ path: 'users', version: '1' })
export class UsersController {
  private readonly logger: Logger = new Logger(UsersController.name);
  constructor(private readonly usersService: UsersService) {}

  @Get('profile')
  profile(@Req() req: Request & { user: Account }): ProfileResponseDto {
    this.logger.debug('profile invoked', {
      correlationId: '708042d4-df0b-4469-9241-27297e3dd913',
      userId: req.user.userId,
    });
    return plainToInstance(ProfileResponseDto, req.user, {
      excludeExtraneousValues: true,
    });
  }

  @Patch(':id')
  async update(
    @Req() req: Request & { user: Account },
    @Param('id') id: string,
    @Body() updateUserDto: UpdateUserDto,
  ): Promise<UserResponseDto> {
    this.logger.debug('update invoked', {
      correlationId: 'f3cd7373-a163-400b-abe2-497134db58d9',
      userId: req.user.userId,
      id,
      updateUserDto,
    });
    if (id !== req.user.userId) {
      throw new ForbiddenException('Cannot update other user');
    }

    const result = await this.usersService.update(id, updateUserDto);
    return plainToInstance(UserResponseDto, result, {
      excludeExtraneousValues: true,
    });
  }

  @Delete(':id')
  async remove(
    @Req() req: Request & { user: Account },
    @Param('id') id: string,
  ) {
    this.logger.debug('remove invoked', {
      correlationId: '49376f1e-65a5-4a38-af71-b17397a9a268',
      userId: req.user.userId,
      id,
    });
    if (id !== req.user.userId) {
      throw new ForbiddenException('Cannot delete other user');
    }
    return await this.usersService.remove(id);
  }
}
